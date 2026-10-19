let bookCoverBase64Temp = null;
let currentBookSort = "time";
let currentBookSearch = "";

let isSelectionMode = false;
let selectedBooks = new Set(); 
let pressTimer = null; 
let isLongPressTriggered = false; 

// 监听封面上传
document.getElementById("bookCoverInput")?.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  bookCoverBase64Temp = await compressImage(file, 400);
  const preview = document.getElementById("bookCoverPreview");
  preview.src = bookCoverBase64Temp;
  preview.style.display = "block";
});

// 搜索与排序
document.getElementById("bookSearchInput")?.addEventListener("input", (e) => {
  currentBookSearch = e.target.value.trim().toLowerCase();
  renderBookView();
});
document.getElementById("bookSortSelect")?.addEventListener("change", (e) => {
  currentBookSort = e.target.value;
  renderBookView();
});

// === 渲染书架 ===
async function renderBookView() {
  const container = document.getElementById("bookList");
  
  let filteredBooks = books.filter(book => {
    const titleMatch = book.title.toLowerCase().includes(currentBookSearch);
    const authorMatch = (book.author || "").toLowerCase().includes(currentBookSearch);
    return titleMatch || authorMatch;
  });

  if (currentBookSort === "title") {
    filteredBooks.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
  } else if (currentBookSort === "author") {
    filteredBooks.sort((a, b) => (a.author || "").localeCompare(b.author || "", 'zh-CN'));
  } else {
    filteredBooks.sort((a, b) => b.id.localeCompare(a.id));
  }

  if (filteredBooks.length === 0) {
    container.innerHTML = '<div class="empty">📚 没找到相关的书<br>换个关键词试试吧</div>';
    return;
  }

  const bookCardsHtml = await Promise.all(filteredBooks.map(async (book) => {
    let coverHtml = "";
    if (book.coverId) {
      const base64 = await imageDB.get(book.coverId);
      if (base64) {
        coverHtml = `<div class="book-cover-wrapper"><img src="${base64}" alt="封面"></div>`;
      }
    }
    if (!coverHtml) {
      coverHtml = `<div class="book-cover-wrapper no-cover"></div>`;
    }

    const isSelected = selectedBooks.has(book.id);
    const selectedClass = isSelected ? "selected" : "";
    const readClass = book.status === "read" ? "is-read" : "";

    // 状态角标
    let badgeHtml = "";
    if (book.status === "want") badgeHtml = `<span class="status-badge want">想读</span>`;
    else if (book.status === "reading") badgeHtml = `<span class="status-badge reading">在读</span>`;
    else if (book.status === "read") badgeHtml = `<span class="status-badge read">已读</span>`;

    return `
      <div class="book-card ${isSelectionMode ? 'selection-mode' : ''} ${selectedClass} ${readClass}" 
           data-id="${book.id}"
           onmousedown="handlePressStart(event, '${book.id}')" 
           onmouseup="handlePressEnd(event)"
           onmouseleave="handlePressCancel(event)"
           ontouchstart="handlePressStart(event, '${book.id}')"
           ontouchend="handlePressEnd(event)"
           ontouchmove="handlePressCancel(event)"
           onclick="handleBookClick(event, '${book.id}')">
        <div class="book-checkbox"></div>
        ${coverHtml}
        <div class="book-info">
          <h3 class="book-title">${escapeHtml(book.title)}</h3>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
            <p class="book-author">${escapeHtml(book.author || '未知')}</p>
            ${badgeHtml}
          </div>
        </div>
        ${book.quote ? `<div class="book-quote">“${escapeHtml(book.quote)}”</div>` : ''}
      </div>
    `;
  }));

  container.innerHTML = bookCardsHtml.join("");
  updateSelectionBar();
}

// === 长按与点击逻辑 ===
function handlePressStart(event, id) {
  isLongPressTriggered = false;
  pressTimer = setTimeout(() => {
    isLongPressTriggered = true;
    enterSelectionMode(id);
  }, 500);
}
function handlePressCancel() { if (pressTimer) clearTimeout(pressTimer); }
function handlePressEnd(event) {
  if (pressTimer) clearTimeout(pressTimer);
  if (isLongPressTriggered) event.preventDefault();
}
function handleBookClick(event, id) {
  if (isLongPressTriggered) { isLongPressTriggered = false; return; }
  if (isSelectionMode) toggleBookSelection(id);
  else openBookDetail(id);
}
function enterSelectionMode(initialId) {
  isSelectionMode = true;
  selectedBooks.add(initialId);
  if (navigator.vibrate) navigator.vibrate(50);
  renderBookView();
}
function toggleBookSelection(id) {
  if (selectedBooks.has(id)) selectedBooks.delete(id);
  else selectedBooks.add(id);
  renderBookView();
}
function exitSelectionMode() {
  isSelectionMode = false;
  selectedBooks.clear();
  renderBookView();
}
function updateSelectionBar() {
  const bar = document.getElementById("bookSelectionBar");
  const countText = document.getElementById("selectedCountText");
  if (isSelectionMode) {
    bar.hidden = false;
    countText.innerText = `已选择 ${selectedBooks.size} 本书`;
    document.getElementById("addBookBtn").style.display = "none";
  } else {
    bar.hidden = true;
    document.getElementById("addBookBtn").style.display = "flex";
  }
}
async function batchDeleteBooks() {
  if (selectedBooks.size === 0) { showToast("请先选择要删除的书籍"); return; }
  if (!confirm(`确定要将选中的 ${selectedBooks.size} 本书全部下架吗？\n（对应的封面也会被清理）`)) return;
  for (const id of selectedBooks) {
    const book = books.find(b => b.id === id);
    if (book && book.coverId) await imageDB.delete(book.coverId);
  }
  books = books.filter(b => !selectedBooks.has(b.id));
  saveBooks();
  exitSelectionMode();
  showToast("已批量下架");
}

// === 书籍详情页 ===
let currentBookId = null;

async function openBookDetail(id) {
  const book = books.find(b => b.id === id);
  if (!book) return;

  currentBookId = id;
  
  document.getElementById("brTitle").innerText = book.title;
  document.getElementById("brAuthor").innerText = book.author || "未知作者";
  
  // 渲染状态
  renderBookStatus(book);

  const quoteEl = document.getElementById("brQuote");
  if (book.quote) {
    quoteEl.innerText = `“${book.quote}”`;
    quoteEl.style.display = "block";
  } else {
    quoteEl.style.display = "none";
  }

  const coverEl = document.getElementById("brCover");
  coverEl.innerHTML = "";
  coverEl.classList.remove("no-cover");
  if (book.coverId) {
    const base64 = await imageDB.get(book.coverId);
    if (base64) coverEl.innerHTML = `<img src="${base64}" alt="封面">`;
    else coverEl.classList.add("no-cover");
  } else {
    coverEl.classList.add("no-cover");
  }

  document.getElementById("brTextView").innerText = book.detail || "（还没有写下感悟）";
  document.getElementById("brTextView").style.color = book.detail ? "#333" : "#b0a696";
  document.getElementById("brTextView").style.fontStyle = book.detail ? "normal" : "italic";
  document.getElementById("brDetailInput").value = book.detail || "";
  
  document.getElementById("brTextView").hidden = false;
  document.getElementById("brEditArea").hidden = true;
  
  document.getElementById("brHeaderActions").innerHTML = `
    <button class="page-btn-edit" onclick="openBookCardModal()">分享</button>
    <button id="brEditBtn" class="page-btn-edit" onclick="startEditBookDetail()">编辑</button>
  `;

  const readView = document.getElementById("bookReadView");
  const pageContent = document.getElementById("bookPageContent");
  readView.hidden = false;
  document.body.style.overflow = "hidden";
  
  pageContent.style.animation = "none";
  pageContent.offsetHeight; 
  pageContent.style.animation = "slideInPage 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards";
}

// 辅助渲染状态
function renderBookStatus(book) {
  const badge = document.getElementById("brStatusBadge");
  const btn = document.getElementById("brMarkReadBtn");
  
  if (book.status === "want") {
    badge.className = "status-badge want"; badge.innerText = "想读";
    btn.style.display = "inline-block"; btn.innerText = "标记为在读";
    btn.onclick = () => updateBookStatus(book.id, "reading");
  } else if (book.status === "reading") {
    badge.className = "status-badge reading"; badge.innerText = "在读";
    btn.style.display = "inline-block"; btn.innerText = "标记为已读完";
    btn.onclick = () => updateBookStatus(book.id, "read");
  } else {
    badge.className = "status-badge read"; badge.innerText = "已读";
    btn.style.display = "none"; 
  }
}

// === 核心魔法：更新状态并联动记录页 ===
async function updateBookStatus(bookId, newStatus) {
  const book = books.find(b => b.id === bookId);
  if (!book) return;
  
  book.status = newStatus;
  saveBooks();
  renderBookStatus(book); 
  
  renderBookView(); 

  // 如果标记为已读完，触发记录！
  if (newStatus === "read") {
    const dateStr = todayStr();
    const newEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      content: `📚 读完了《${book.title}》`,
      date: dateStr,
      tags: ["读书"],
      
      // 【关键修改】：改为 false，默认作为小事记入
      isMilestone: false, 
      
      isPinned: false,
      detail: book.detail ? `读后感摘要：\n${book.detail}` : "",
      createdAt: new Date().toISOString()
    };
    
    entries.push(newEntry);
    saveEntries();
    
    // 【修改提示语】
    showToast("已标记为已读，并作为小事同步到记录页！");
  } else {
    showToast("状态已更新");
  }
}

function closeBookRead() {
  document.getElementById("bookReadView").hidden = true;
  currentBookId = null;
  document.body.style.overflow = "";
}

function startEditBookDetail() {
  document.getElementById("brTextView").hidden = true;
  document.getElementById("brEditArea").hidden = false;
  document.getElementById("brDetailInput").focus();
  document.getElementById("brHeaderActions").innerHTML = `
    <button class="page-btn-cancel" onclick="cancelEditBookDetail()">取消</button>
    <button class="page-btn-save" onclick="saveBookDetail()">保存</button>
  `;
}

function cancelEditBookDetail() {
  const book = books.find(b => b.id === currentBookId);
  if (!book) return;
  document.getElementById("brDetailInput").value = book.detail || "";
  document.getElementById("brTextView").hidden = false;
  document.getElementById("brEditArea").hidden = true;
  document.getElementById("brHeaderActions").innerHTML = `
    <button class="page-btn-edit" onclick="openBookCardModal()">分享</button>
    <button id="brEditBtn" class="page-btn-edit" onclick="startEditBookDetail()">编辑</button>
  `;
}

function saveBookDetail() {
  if (!currentBookId) return;
  const book = books.find(b => b.id === currentBookId);
  if (!book) return;
  const newDetail = document.getElementById("brDetailInput").value;
  book.detail = newDetail;
  saveBooks();
  const textView = document.getElementById("brTextView");
  textView.innerText = newDetail || "（还没有写下感悟）";
  textView.style.color = newDetail ? "#333" : "#b0a696";
  textView.style.fontStyle = newDetail ? "normal" : "italic";
  cancelEditBookDetail();
  showToast("书评已保存");
}

function openBookModal() {
  document.getElementById("bookModal").hidden = false;
  bookCoverBase64Temp = null;
  document.getElementById("bookCoverPreview").style.display = "none";
  document.getElementById("bookCoverPreview").src = "";
  document.getElementById("bookStatusInput").value = "reading"; // 默认在读
}

function closeBookModal() {
  document.getElementById("bookModal").hidden = true;
  document.getElementById("bookTitleInput").value = "";
  document.getElementById("bookAuthorInput").value = "";
  document.getElementById("bookQuoteInput").value = "";
}

async function saveBook() {
  const title = document.getElementById("bookTitleInput").value.trim();
  const author = document.getElementById("bookAuthorInput").value.trim();
  const quote = document.getElementById("bookQuoteInput").value.trim();
  const status = document.getElementById("bookStatusInput").value;

  if (!title) { alert("书名不能为空哦！"); return; }

  let coverId = null;
  if (bookCoverBase64Temp) {
    coverId = "cover_" + Date.now().toString();
    await imageDB.save(coverId, bookCoverBase64Temp);
  }

  books.unshift({
    id: Date.now().toString(),
    title,
    author,
    quote,
    coverId,
    status // 存入状态
  });

  saveBooks();
  closeBookModal();
  renderBookView();
  showToast("上架成功");
}

// === 读书卡片生成 ===
async function openBookCardModal() {
  const book = books.find(b => b.id === currentBookId);
  if (!book) return;

  document.getElementById("bcardTitle").innerText = book.title;
  document.getElementById("bcardAuthor").innerText = book.author || "未知作者";
  
  const quoteEl = document.getElementById("bcardQuote");
  if (book.quote) {
    quoteEl.innerText = `“${book.quote}”`;
    quoteEl.style.display = "block";
  } else {
    quoteEl.style.display = "none";
  }

  const reviewEl = document.getElementById("bcardReview");
  if (book.detail && book.detail.trim()) {
    reviewEl.innerText = book.detail;
    reviewEl.style.display = "block";
  } else {
    reviewEl.style.display = "none";
  }

  const coverEl = document.getElementById("bcardCover");
  coverEl.innerHTML = "";
  coverEl.classList.remove("no-cover");
  if (book.coverId) {
    const base64 = await imageDB.get(book.coverId);
    if (base64) coverEl.innerHTML = `<img src="${base64}" alt="封面">`;
    else coverEl.classList.add("no-cover");
  } else {
    coverEl.classList.add("no-cover");
  }

  document.getElementById("bookCardModal").hidden = false;
}

function closeBookCardModal() {
  document.getElementById("bookCardModal").hidden = true;
}

document.getElementById("downloadBookCardBtn")?.addEventListener("click", async () => {
  const cardArea = document.getElementById("bookCardPreview");
  const btn = document.getElementById("downloadBookCardBtn");
  
  btn.innerText = "生成中...";
  btn.disabled = true;

  try {
    await new Promise(r => setTimeout(r, 100));
    const dataUrl = await htmlToImage.toPng(cardArea, {
      quality: 1, pixelRatio: 2, backgroundColor: "#ffffff", skipFonts: true
    });
    const link = document.createElement("a");
    link.download = `读书卡片-${todayStr()}.png`;
    link.href = dataUrl;
    link.click();
    showToast("已保存到相册");
  } catch (error) {
    console.error("生成失败", error);
    alert("生成失败，请重试");
  } finally {
    btn.innerText = "保存图片到相册";
    btn.disabled = false;
  }
});