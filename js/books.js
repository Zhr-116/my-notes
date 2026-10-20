let bookCoverBase64Temp = null;
let currentBookSort = "time";
let currentBookSearch = "";

let isSelectionMode = false;
let selectedBooks = new Set(); 
let pressTimer = null; 
let isLongPressTriggered = false; 

document.getElementById("bookCoverInput")?.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  bookCoverBase64Temp = await compressImage(file, 400);
  const preview = document.getElementById("bookCoverPreview");
  preview.src = bookCoverBase64Temp;
  preview.style.display = "block";
});

document.getElementById("bookSearchInput")?.addEventListener("input", (e) => {
  currentBookSearch = e.target.value.trim().toLowerCase();
  renderBookView();
});
document.getElementById("bookSortSelect")?.addEventListener("change", (e) => {
  currentBookSort = e.target.value;
  renderBookView();
});

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
    const emptyText = books.length === 0 ? "书架空空如也<br>点击右下角 + 上架一本新书吧" : "没找到相关的书<br>换个关键词试试吧";
    
    const emptyIllustration = `
      <div style="width: 260px; max-width: 85%; margin-bottom: 10px;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 500">
          <style>
            .glasses-anim { animation: 1.2s 1 forwards cubic-bezier(.36,-0.01,.5,1.38) slideLeft; }
            @keyframes slideLeft { 
              0% { opacity: 0; transform: translateX(-50px); } 
              100% { opacity: 1; transform: translateX(0); } 
            }
          </style>
          <!-- 背景文件与桌子 -->
          <g>
            <rect x="263.35" y="194.71" width="160.71" height="52.27" fill="#c7c7c7" />
            <polygon points="424.06 194.71 424.06 246.98 674.57 246.98 674.57 241.88 669.17 241.88 669.17 199.81 674.57 199.81 674.57 194.71 424.06 194.71" fill="#a6a6a6" />
            <rect x="430.63" y="200.13" width="238.81" height="41.42" fill="#ffffff" />
            <path d="M55.46,247c204.72-.61,434.36-.62,639.08,0-204.72.62-434.36.61-639.08,0Z" fill="#263238" />
            <polygon points="467.45 388.57 566.76 364.16 692.94 381.74 589.34 407.96 467.45 388.57" fill="#dbdbdb" />
            <polygon points="57.06 286.06 194.86 259.98 327.83 298.83 190.72 325.85 57.06 286.06" fill="#ebebeb" />
            <polygon points="258.98 419.2 434.1 386.06 603.06 435.43 428.83 469.76 258.98 419.2" fill="#ebebeb" />
          </g>
          <!-- 书本 -->
          <g>
            <path d="M686.9,335.21,362.68,424.79V360.22L686.9,270.64C704.08,302.32,686.9,335.21,686.9,335.21Z" fill="#37474f" />
            <polygon points="46.3 380 362.68 424.79 362.68 408.42 75.23 373.26 46.3 375 46.3 380" fill="#455a64" />
            <path d="M362.69,360.52c11.82,28.45,0,64.27,0,64.27L61.56,377.23V321.42Z" fill="#455a64" />
            <path d="M355.24,359.56c11.51,28.34.95,58.86.95,58.86L61.56,377v-55.6Z" fill="#ffffff" />
            <polygon points="362.69 360.52 686.9 270.64 359.28 255.8 46.3 313.84 46.3 319.44 362.69 360.52" fill="#455a64" />
            <path d="M371,350.64c40.22-12.19,81.53-23.2,122.8-32.71-40.21,12.2-81.52,23.19-122.8,32.71Z" fill="#37474f" />
          </g>
          <!-- 眼镜（带入场动画） -->
          <g class="glasses-anim">
            <path d="M406.28,257.81c-4.21.82-20.33,1.75-20.69-2-.53-5.64,40.94-45.64,55.81-53.16,14.15-7.16,67.15-22.78,78.41-23.12l.1,35.92c-6.37,1.62-64.52-3.33-75.18,2.33-4.63,2.46-12,12.66-24.46,28.86C415.89,252.35,408.76,257.32,406.28,257.81Z" fill="#FFC100" />
            <path d="M563.78,305.47c3.62,1.52,17.86,2.29,20.3-.78,3.68-4.65-40.89-69.45-67.26-80.93C492.14,213.11,149.77,147,142.59,145.92L136.32,174c48.49,7.58,356.17,56.6,375.2,64.89,12.41,5.39,28.22,33.83,39.58,53.48C555.69,300.35,559.58,303.71,563.78,305.47Z" fill="#FFC100" />
            <path d="M203.81,320.18c-36.27-1.75-63.86-42.82-61.52-91.54,1.11-23.25,8.8-44.87,21.64-60.88,13.27-16.54,30.4-25.22,48.4-24.31s34.22,11.11,45.83,28.86c11.25,17.14,16.83,39.41,15.7,62.68-2.22,46.1-30.48,82.8-64.25,85.13A51,51,0,0,1,203.81,320.18Zm-30.65-145c-11.29,14.07-18.06,33.27-19.06,54.06-2,42.2,20.52,77.71,50.28,79.14s55.63-31.74,57.68-74c1-20.79-3.91-40.54-13.78-55.63-9.5-14.49-22.48-22.84-36.52-23.51a37.32,37.32,0,0,0-4.49,0C194.81,156.17,182.84,163.1,173.16,175.16Zm-30.82,59.65c-1.83-35.64,2.16-41.22.54-51.73-.77-5-7.81-9.8-7.81-9.8l6.43-28.52s19.49,3.45,23.9,3.51c7.86.12,24.24-4.27,39-4.6,0,0-32.13,14.44-42.46,32.85S142.34,234.81,142.34,234.81Z" fill="#FFC100" />
            <path d="M390.39,329.71A88.58,88.58,0,0,1,319.24,226.8h0a88.55,88.55,0,1,1,71.15,102.92ZM330.88,228.92A76.61,76.61,0,1,0,401,166.22,76.74,76.74,0,0,0,330.88,228.92Z" fill="#FFC100" />
            <path d="M485.08,204.88c-6.09-20.22-41.56-42.45-41.56-42.45,14.36,3.53,30.2,10.71,37.9,12.31,4.32.89,30.52,3.57,30.52,3.57l.1,32.89s-7.2,2.18-9,6.88c-3.87,9.91-1.92,13.57-11.44,48C491.57,266,491.17,225.09,485.08,204.88Z" fill="#FFC100" />
          </g>
        </svg>
      </div>
    `;

    container.innerHTML = `
      <div class="empty" style="display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%;">
        ${emptyIllustration}
        <span style="text-align:center;">${emptyText}</span>
      </div>
    `;
    return;
  }

  const bookCardsHtml = await Promise.all(filteredBooks.map(async (book) => {
    let coverHtml = "";
    if (book.coverId) {
      const base64 = await imageDB.get(book.coverId);
      if (base64) coverHtml = `<div class="book-cover-wrapper"><img src="${base64}" alt="封面"></div>`;
    }
    if (!coverHtml) {
      coverHtml = `<div class="book-cover-wrapper no-cover" style="display:flex; align-items:center; justify-content:center; color:#d1c7b8;">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v16"/><path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z"/></svg>
      </div>`;
    }

    const isSelected = selectedBooks.has(book.id);
    const selectedClass = isSelected ? "selected" : "";
    const readClass = book.status === "read" ? "is-read" : "";

    let badgeHtml = "";
    if (book.status === "want") badgeHtml = `<span class="status-badge want">想读</span>`;
    else if (book.status === "reading") badgeHtml = `<span class="status-badge reading">在读</span>`;
    else if (book.status === "read") badgeHtml = `<span class="status-badge read">已读</span>`;

    return `
      <div class="book-card ${isSelectionMode ? 'selection-mode' : ''} ${selectedClass} ${readClass}" 
           data-id="${book.id}" onmousedown="handlePressStart(event, '${book.id}')" onmouseup="handlePressEnd(event)" onmouseleave="handlePressCancel(event)"
           ontouchstart="handlePressStart(event, '${book.id}')" ontouchend="handlePressEnd(event)" ontouchmove="handlePressCancel(event)" onclick="handleBookClick(event, '${book.id}')">
        <div class="book-checkbox"></div>
        ${coverHtml}
        <div class="book-info">
          <h3 class="book-title">${escapeHtml(book.title)}</h3>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
            <p class="book-author">${escapeHtml(book.author || '未知')}</p>
            ${badgeHtml}
          </div>
        </div>
      </div>
    `;
  }));

  container.innerHTML = bookCardsHtml.join("");
  updateSelectionBar();
}

// === 交互逻辑 ===
function handlePressStart(event, id) { isLongPressTriggered = false; pressTimer = setTimeout(() => { isLongPressTriggered = true; enterSelectionMode(id); }, 500); }
function handlePressCancel() { if (pressTimer) clearTimeout(pressTimer); }
function handlePressEnd(event) { if (pressTimer) clearTimeout(pressTimer); if (isLongPressTriggered) event.preventDefault(); }
function handleBookClick(event, id) { if (isLongPressTriggered) { isLongPressTriggered = false; return; } if (isSelectionMode) toggleBookSelection(id); else openBookDetail(id); }
function enterSelectionMode(initialId) { isSelectionMode = true; selectedBooks.add(initialId); if (navigator.vibrate) navigator.vibrate(50); renderBookView(); }
function toggleBookSelection(id) { if (selectedBooks.has(id)) selectedBooks.delete(id); else selectedBooks.add(id); renderBookView(); }
function exitSelectionMode() { isSelectionMode = false; selectedBooks.clear(); renderBookView(); }
function updateSelectionBar() {
  const bar = document.getElementById("bookSelectionBar");
  const countText = document.getElementById("selectedCountText");
  if (isSelectionMode) { bar.hidden = false; countText.innerText = `已选择 ${selectedBooks.size} 本书`; document.getElementById("addBookBtn").style.display = "none"; }
  else { bar.hidden = true; document.getElementById("addBookBtn").style.display = "flex"; }
}
async function batchDeleteBooks() {
  if (selectedBooks.size === 0) { showToast("请先选择要删除的书籍"); return; }
  if (!confirm(`确定要将选中的 ${selectedBooks.size} 本书全部下架吗？`)) return;
  for (const id of selectedBooks) { const book = books.find(b => b.id === id); if (book && book.coverId) await imageDB.delete(book.coverId); }
  books = books.filter(b => !selectedBooks.has(b.id)); saveBooks(); exitSelectionMode(); showToast("已批量下架");
}

// === 书籍详情页 ===
let currentBookId = null;

async function openBookDetail(id) {
  const book = books.find(b => b.id === id);
  if (!book) return;
  currentBookId = id;
  
  document.getElementById("brTitle").innerText = book.title;
  document.getElementById("brAuthor").innerText = book.author || "未知作者";
  renderBookStatus(book);

  const quoteEl = document.getElementById("brQuote");
  if (book.quote) { quoteEl.innerText = `“${book.quote}”`; quoteEl.style.display = "block"; } 
  else { quoteEl.style.display = "none"; }

  const coverEl = document.getElementById("brCover");
  coverEl.innerHTML = ""; coverEl.classList.remove("no-cover");
  if (book.coverId) {
    const base64 = await imageDB.get(book.coverId);
    if (base64) coverEl.innerHTML = `<img src="${base64}" alt="封面">`;
    else coverEl.classList.add("no-cover");
  } else { 
      coverEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.3; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);"><path d="M12 5v16"/><path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z"/></svg>`;
      coverEl.style.position = "relative"; 
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
  pageContent.style.animation = "none"; pageContent.offsetHeight; 
  pageContent.style.animation = "slideInPage 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards";
}

function renderBookStatus(book) {
  const badge = document.getElementById("brStatusBadge");
  const btn = document.getElementById("brMarkReadBtn");
  if (book.status === "want") { badge.className = "status-badge want"; badge.innerText = "想读"; btn.style.display = "inline-block"; btn.innerText = "标记为在读"; btn.onclick = () => updateBookStatus(book.id, "reading"); } 
  else if (book.status === "reading") { badge.className = "status-badge reading"; badge.innerText = "在读"; btn.style.display = "inline-block"; btn.innerText = "标记为已读完"; btn.onclick = () => updateBookStatus(book.id, "read"); } 
  else { badge.className = "status-badge read"; badge.innerText = "已读"; btn.style.display = "none"; }
}

async function updateBookStatus(bookId, newStatus) {
  const book = books.find(b => b.id === bookId);
  if (!book) return;
  book.status = newStatus;
  saveBooks(); renderBookStatus(book); renderBookView(); 
  
  if (newStatus === "read") {
    createReadEntry(book);
    showToast("已读，并同步到记录页！");
  } else { showToast("状态已更新"); }
}

// 封装生成小事
function createReadEntry(book) {
  const newEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    content: `📚 读完了《${book.title}》`,
    date: todayStr(),
    tags: ["读书"],
    isMilestone: false, isPinned: false,
    detail: book.detail ? `读后感摘要：\n${book.detail}` : "",
    createdAt: new Date().toISOString()
  };
  entries.push(newEntry);
  saveEntries();
}

function closeBookRead() {
  document.getElementById("bookReadView").hidden = true;
  currentBookId = null; document.body.style.overflow = ""; renderBookView(); 
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
  book.detail = document.getElementById("brDetailInput").value;
  saveBooks();
  
  const textView = document.getElementById("brTextView");
  textView.innerText = book.detail || "（还没有写下感悟）";
  textView.style.color = book.detail ? "#333" : "#b0a696";
  textView.style.fontStyle = book.detail ? "normal" : "italic";
  cancelEditBookDetail();
  showToast("书评已保存");
}

function openBookModal() {
  document.getElementById("bookModal").hidden = false;
  bookCoverBase64Temp = null;
  document.getElementById("bookCoverPreview").style.display = "none";
  document.getElementById("bookCoverPreview").src = "";
  document.getElementById("bookStatusInput").value = "reading";
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
  
  // 限制金句只能 50 字
  let quote = document.getElementById("bookQuoteInput").value.trim();
  if (quote.length > 50) quote = quote.substring(0, 50);

  const status = document.getElementById("bookStatusInput").value;

  if (!title) { alert("书名不能为空哦！"); return; }

  let coverId = null;
  if (bookCoverBase64Temp) {
    coverId = "cover_" + Date.now().toString();
    await imageDB.save(coverId, bookCoverBase64Temp);
  }

  const newBook = {
    id: Date.now().toString(),
    title, author, quote, coverId, status 
  };

  books.unshift(newBook);
  saveBooks();
  closeBookModal();
  renderBookView();
  
  // 如果添加时直接选了“已读”，立刻触发
  if (status === "read") {
    createReadEntry(newBook);
    showToast("已上架，并作为小事同步到记录页！");
  } else {
    showToast("上架成功");
  }
}

// === 整书分享卡片逻辑（金句继承，书评可编辑） ===
async function openBookCardModal() {
  const book = books.find(b => b.id === currentBookId);
  if (!book) return;

  document.getElementById("bcardTitle").innerText = book.title;
  document.getElementById("bcardAuthor").innerText = book.author || "未知作者";
  
  // 金句直接继承，不可编辑
  const quoteEl = document.getElementById("bcardQuote");
  if (book.quote) {
    quoteEl.innerText = `“${book.quote}”`;
    quoteEl.style.display = "block";
  } else {
    quoteEl.style.display = "none";
  }

  // 书评自动截取前 80 字放入输入框
  const reviewInput = document.getElementById("bcardReviewInput");
  reviewInput.value = book.detail ? book.detail.substring(0, 80) + (book.detail.length > 80 ? "..." : "") : "";
  
  // 更新书评预览
  updateBcardPreview();

  const coverEl = document.getElementById("bcardCover");
  coverEl.innerHTML = ""; coverEl.classList.remove("no-cover");
  if (book.coverId) {
    const base64 = await imageDB.get(book.coverId);
    if (base64) coverEl.innerHTML = `<img src="${base64}" alt="封面">`;
    else coverEl.classList.add("no-cover");
  } else { 
      coverEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.3; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);"><path d="M12 5v16"/><path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z"/></svg>`;
      coverEl.style.position = "relative"; 
    }

  document.getElementById("bookCardModal").hidden = false;
}

function closeBookCardModal() {
  document.getElementById("bookCardModal").hidden = true;
}

// 只监听书评输入框的实时变动
document.getElementById("bcardReviewInput")?.addEventListener("input", updateBcardPreview);

function updateBcardPreview() {
  const rText = document.getElementById("bcardReviewInput").value.trim();
  const rEl = document.getElementById("bcardReview");
  if (rText) { rEl.innerText = rText; rEl.style.display = "block"; } 
  else { rEl.style.display = "none"; }
}

document.getElementById("downloadBookCardBtn")?.addEventListener("click", async () => {
  const cardArea = document.getElementById("bookCardPreview");
  const btn = document.getElementById("downloadBookCardBtn");
  btn.innerText = "生成中..."; btn.disabled = true;
  try {
    await new Promise(r => setTimeout(r, 100));
    const dataUrl = await htmlToImage.toPng(cardArea, { quality: 1, pixelRatio: 2, backgroundColor: "#ffffff", skipFonts: true });
    const link = document.createElement("a");
    link.download = `读书卡片-${todayStr()}.png`; link.href = dataUrl; link.click();
    showToast("已保存到相册");
  } catch (error) { alert("生成失败"); } finally { btn.innerText = "保存图片到相册"; btn.disabled = false; }
});