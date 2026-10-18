document.getElementById("saveBtn").onclick = addEntry;

contentInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    addEntry();
  }
});

searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value;
  render();
});

tagBar.addEventListener("click", (e) => {
  const chip = e.target.closest(".tag-chip");
  if (!chip) return;
  const tag = chip.dataset.tag;
  activeTag = activeTag === tag ? "" : tag;
  render();
});

document.querySelectorAll(".tabs button").forEach((btn) => {
  btn.onclick = () => {
    currentView = btn.dataset.view;
    render();
  };
});

document.getElementById("exportMdBtn").onclick = exportMarkdown;
document.getElementById("exportJsonBtn").onclick = exportJson;

// === 左滑手势逻辑（修复点击按钮不灵敏问题） ===
let startX = 0;
let startY = 0;
let currentSwipeEl = null;
let isSwiping = false;
const SWIPE_WIDTH = 120;

function resetSwipe() {
  if (currentSwipeEl) {
    currentSwipeEl.style.transition = "transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    currentSwipeEl.style.transform = "";
    currentSwipeEl.classList.remove("active");
    currentSwipeEl = null;
    isSwiping = false;
  }
}

function handleStart(e) {
  // 核心修复1：如果手指点到的是“置顶”或“删除”按钮，直接放弃滑动逻辑！
  if (e.target.closest(".swipe-btn")) {
    currentSwipeEl = null;
    return;
  }

  const content = e.target.closest(".swipe-content");
  if (!content) return;
  
  if (currentSwipeEl && currentSwipeEl !== content) resetSwipe();

  startX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
  startY = e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;
  currentSwipeEl = content;
  isSwiping = false;
  currentSwipeEl.style.transition = "none"; 
}

function handleMove(e) {
  if (!currentSwipeEl) return;
  
  const clientX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
  const clientY = e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;
  
  const deltaX = clientX - startX;
  const deltaY = clientY - startY;

  if (!isSwiping && Math.abs(deltaY) > Math.abs(deltaX)) {
    currentSwipeEl.style.transition = "";
    currentSwipeEl.style.transform = "";
    currentSwipeEl = null;
    return;
  }

  // 核心修复2：把触发的阈值从 10 提高到 15，防手抖
  if (Math.abs(deltaX) > 15) {
    isSwiping = true;
    if (e.cancelable && e.type.includes("touch")) e.preventDefault(); 
  }

  if (isSwiping) {
    let moveX = deltaX < 0 ? Math.max(deltaX, -SWIPE_WIDTH) : 0;
    if (currentSwipeEl.classList.contains("active")) {
      moveX = Math.max(deltaX - SWIPE_WIDTH, -SWIPE_WIDTH);
    }
    currentSwipeEl.style.transform = `translateX(${moveX}px)`;
  }
}

function handleEnd(e) {
  if (!currentSwipeEl) return;
  
  currentSwipeEl.style.transition = "transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

  if (isSwiping) {
    const clientX = e.type.includes("mouse") ? e.clientX : (e.changedTouches ? e.changedTouches[0].clientX : 0);
    const deltaX = clientX - startX;

    if (deltaX < -SWIPE_WIDTH / 3) {
      currentSwipeEl.classList.add("active");
      currentSwipeEl.style.transform = `translateX(-${SWIPE_WIDTH}px)`;
    } else {
      currentSwipeEl.classList.remove("active");
      currentSwipeEl.style.transform = "";
      currentSwipeEl = null;
    }
  } else {
    currentSwipeEl.style.transform = currentSwipeEl.classList.contains("active") ? `translateX(-${SWIPE_WIDTH}px)` : "";
  }
  
  // 延迟释放状态，防止立刻触发的 click 被吃掉
  setTimeout(() => { isSwiping = false; }, 50);
}

document.addEventListener("touchstart", handleStart, { passive: true });
document.addEventListener("touchmove", handleMove, { passive: false });
document.addEventListener("touchend", handleEnd, { passive: true });

document.addEventListener("mousedown", handleStart);
document.addEventListener("mousemove", handleMove);
document.addEventListener("mouseup", handleEnd);

// 核心修复3：删掉原来那个带 true 捕获阶段的拦截器，改成最简单的
document.addEventListener("click", (e) => {
  if (!e.target.closest(".swipe-content") && !e.target.closest(".swipe-btn")) {
    resetSwipe();
  }
});

// === 草稿自动保存 ===
const saveDraft = debounce(() => {
  const data = {
    content: contentInput.value,
    date: dateInput.value,
    tags: tagsInput.value,
  };
  if (data.content.trim() || data.tags.trim()) {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } else {
    localStorage.removeItem(DRAFT_KEY);
  }
}, 400);

contentInput.addEventListener("input", saveDraft);
tagsInput.addEventListener("input", saveDraft);
dateInput.addEventListener("change", saveDraft);

// 恢复草稿
let draftDate = "";
try {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (raw) {
    const data = JSON.parse(raw);
    if (data.content) contentInput.value = data.content;
    if (data.tags) tagsInput.value = data.tags;
    if (data.date) draftDate = data.date;
  }
} catch (e) {}

dateInput.value = draftDate || todayStr();

render();

// 初始化 IndexedDB
imageDB.init().then(() => console.log("图片数据库已就绪"));

// 图片选择与预览（限制最多 5 张）
document.getElementById("imageInput").addEventListener("change", async (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  // 判断总数量
  const currentTotal = currentEditImages.length + currentEditFiles.length;
  const remainCount = 5 - currentTotal;

  if (remainCount <= 0) {
    alert("最多只能添加 5 张图片哦！");
    e.target.value = "";
    return;
  }

  if (files.length > remainCount) {
    alert(`你还能添加 ${remainCount} 张图片，多出的已自动忽略。`);
  }

  // 截取允许添加的数量
  const filesToAdd = files.slice(0, remainCount);

  for (const file of filesToAdd) {
    currentEditFiles.push(file);
  }
  
  // 重新渲染编辑区
  renderEditImages();
  
  e.target.value = ""; // 清空 input
});

// 生成并下载卡片
document.getElementById("downloadCardBtn")?.addEventListener("click", async () => {
  const cardArea = document.getElementById("cardPreviewArea");
  const btn = document.getElementById("downloadCardBtn");
  
  btn.innerText = "生成中...";
  btn.disabled = true;

  try {
    // 稍微延迟 100ms，确保 CSS 渲染跟上
    await new Promise(r => setTimeout(r, 100));

    const dataUrl = await htmlToImage.toPng(cardArea, {
      quality: 1,
      pixelRatio: 2,
      // 删掉 backgroundColor: "#fcfcfc"，
      // 改为使用卡片自身的背景，如果透明就用白色兜底
      backgroundColor: document.getElementById("cardPreviewArea").classList.contains("theme-film") ? "#2a2a2a" : "#ffffff",
      skipFonts: true
    });

    const link = document.createElement("a");
    link.download = `记录卡片-${todayStr()}.png`;
    link.href = dataUrl;
    link.click();
    
    showToast("已保存到相册/下载");
  } catch (error) {
    console.error("生成失败", error);
    alert("生成卡片失败，请重试");
  } finally {
    btn.innerText = "保存图片到相册";
    btn.disabled = false;
  }
});