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
  
  // 设置当前查看的标签，并切到标签聚合页
  currentTagDetail = tag;
  switchView("tagDetail");
});

document.querySelectorAll(".tabs button").forEach((btn) => {
  btn.onclick = () => {
    currentView = btn.dataset.view;
    render();
  };
});


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

// === 导入备份逻辑 ===
const importFile = document.getElementById("importFile");

importFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const importedData = JSON.parse(event.target.result);
      if (!Array.isArray(importedData)) {
        alert("格式错误：文件内容不是有效的记录数组。");
        return;
      }

      let addedCount = 0;
      let replacedCount = 0;
      let skippedCount = 0;

      importedData.forEach(importedEntry => {
        // 寻找是否有重复（根据 ID 或者 日期+内容 判断）
        const existingIndex = entries.findIndex(ex => 
          ex.id === importedEntry.id || 
          (ex.date === importedEntry.date && ex.content === importedEntry.content)
        );

        if (existingIndex === -1) {
          // 没有重复，直接添加
          entries.push(importedEntry);
          addedCount++;
        } else {
          // 出现重复项：询问用户
          const choice = confirm(
            `发现重复记录：\n【日期】${importedEntry.date}\n【内容】${importedEntry.content}\n\n点击“确定”使用【导入的新数据】覆盖。\n点击“取消”保留【本地旧数据】。`
          );
          
          if (choice) {
            entries[existingIndex] = importedEntry; // 覆盖
            replacedCount++;
          } else {
            skippedCount++; // 保留旧数据
          }
        }
      });

      // 保存并刷新
      saveEntries();
      render();
      showToast(`导入完成：新增 ${addedCount} 条，替换 ${replacedCount} 条，保留 ${skippedCount} 条`);
      
    } catch (err) {
      console.error(err);
      alert("读取文件失败，请确保是软件导出的 JSON 备份文件。");
    }
    importFile.value = ""; // 清空 Input 允许下次再选
  };
  reader.readAsText(file);
});

// 读取默认首页
const savedDefaultView = localStorage.getItem("mini-default-view");
if (savedDefaultView) {
  currentView = savedDefaultView;
  // 顺便把下拉框选中
  const select = document.getElementById("defaultViewSelect");
  if(select) select.value = savedDefaultView;
}

// 初始化时检查主题
const savedTheme = localStorage.getItem("mini-theme") || "default";
if (savedTheme !== "default") {
  document.documentElement.setAttribute("data-theme", savedTheme);
}

// 检查时间胶囊是否到期
if (typeof checkCapsuleTrigger === 'function') {
  checkCapsuleTrigger();
}

// 最后再执行初始化渲染
dateInput.value = todayStr();
render();

initCheckin(); 

// === 移动端键盘弹出时，隐藏底部导航栏 ===
window.isKeyboardOpen = false;
document.addEventListener('focusin', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    window.isKeyboardOpen = true;
    const nav = document.querySelector('.bottom-nav');
    if (nav) nav.classList.add('keyboard-open');

    // 【新增】如果是书页编辑框，延迟一小会儿后滚动到可视区域
    if (e.target.id === 'brDetailInput') {
      setTimeout(() => {
        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }
});
document.addEventListener('focusout', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    window.isKeyboardOpen = false;
    const nav = document.querySelector('.bottom-nav');
    if (nav) nav.classList.remove('keyboard-open');
  }
});

// === 个人资料编辑逻辑 ===
let tempAvatarId = null;
let tempFrameId = "none"; // 新增：临时记录正在试穿的头像框

// === 在文件顶部变量区，加上 ===
let tempTitle = "";

// === 修改 openProfileModal 函数 ===
async function openProfileModal() {
  document.getElementById("profileModal").hidden = false;
  document.getElementById("profileNameInput").value = userProfile.nickname;
  document.getElementById("profileSignInput").value = userProfile.signature;
  
  // 初始化 tempTitle 和预览
  tempTitle = userProfile.title || "拾光萌新";
  updateProfileTitlePreview();
  
  const preview = document.getElementById("profileAvatarPreview");
  tempAvatarId = userProfile.avatarId || null;
  
  if (tempAvatarId) {
    if (!imageDB.db) await imageDB.init();
    const base64 = await imageDB.get(tempAvatarId);
    preview.src = base64 || "./assets/girl-color.png";
  } else {
    preview.src = "./assets/girl-color.png";
  }
  
  updateProfileFramePreview();
}

// === 新增：更新资料弹窗里的称号预览 ===
function updateProfileTitlePreview() {
  const titlePreview = document.getElementById("profileTitlePreview");
  if (!titlePreview) return;
  // 【核心修复】合并两个池子去找颜色
  const allTitles = [...TITLE_POOL, ...MONTH_TITLES];
  const titleData = allTitles.find(t => t.name === tempTitle) || TITLE_POOL[0];
  titlePreview.innerText = tempTitle;
  titlePreview.style.setProperty('--title-color', titleData.color);
  // 为了确保预览效果，也可以直接加背景色
  titlePreview.style.background = titleData.color; 
}

// === 新增：打开称号衣橱并渲染 ===
function openTitleModal() {
  document.getElementById("titleModal").hidden = false;
  const grid = document.getElementById("titleGrid");
  
  // 【核心修复】把两个称号池合并起来
  const allTitles = [...TITLE_POOL, ...MONTH_TITLES];
  
  grid.innerHTML = allTitles.map(title => {
    const isUnlocked = unlockedTitles.includes(title.name);
    const isSelected = tempTitle === title.name;
    
    // 如果没解锁，用极简的灰色虚线和底纹
    const bgColor = isUnlocked ? title.color : "transparent";
    const textColor = isUnlocked ? "#333" : "var(--text-tertiary)";
    const borderStyle = isUnlocked ? "none" : "1px dashed var(--border)";
    
    return `
      <div onclick="${isUnlocked ? `selectTitle('${title.name}')` : ''}" 
           style="position: relative; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-family: 'Kaiti', serif; font-weight: 800; 
                  background: ${bgColor}; color: ${textColor}; 
                  border: ${isSelected ? '2px solid var(--text-primary)' : borderStyle};
                  cursor: ${isUnlocked ? 'pointer' : 'not-allowed'};
                  opacity: ${isUnlocked ? '1' : '0.4'};
                  transition: all 0.2s;">
        ${title.name}
      </div>
    `;
  }).join("");
}

// === 新增：在衣橱里选中称号 ===
function selectTitle(titleName) {
  tempTitle = titleName;
  document.getElementById("titleModal").hidden = true;
  updateProfileTitlePreview(); // 同步回资料弹窗预览
}

// === 修改 saveProfileData 函数 ===
function saveProfileData() {
  const nickname = document.getElementById("profileNameInput").value.trim() || "拾迹";
  const signature = document.getElementById("profileSignInput").value.trim() || "收集时间的痕迹";
  
  userProfile.nickname = nickname;
  userProfile.signature = signature;
  userProfile.frameId = tempFrameId;
  userProfile.title = tempTitle; // 【核心保存】把选中的称号真正写进去
  
  if (tempAvatarId) userProfile.avatarId = tempAvatarId;
  
  saveProfile();
  closeProfileModal();
  
  document.getElementById("myNickname").innerText = userProfile.nickname;
  document.getElementById("mySignature").innerText = userProfile.signature;
  
  renderMineView(); // 此时主页的荧光笔称号会瞬间变化！
  showToast("资料已更新");
}

// 新增辅助函数：专门更新资料弹窗里的头像框
function updateProfileFramePreview() {
  const frameEl = document.getElementById("profileAvatarFramePreview");
  if (!frameEl) return;
  const currentFrame = FRAME_POOL.find(f => f.id === tempFrameId);
  
  if (currentFrame) {
    const scaleVal = currentFrame.scale || 1;
    if (currentFrame.svg) {
      frameEl.innerHTML = `<div style="width: 100%; height: 100%; transform: scale(${scaleVal});">${currentFrame.svg}</div>`;
      frameEl.style.display = "block";
    } else if (currentFrame.img) {
      frameEl.innerHTML = `<img src="${currentFrame.img}" style="width: 100%; height: 100%; object-fit: contain; transform: scale(${scaleVal});">`;
      frameEl.style.display = "block";
    } else {
      frameEl.innerHTML = "";
      frameEl.style.display = "none";
    }
  } else {
    frameEl.innerHTML = "";
    frameEl.style.display = "none";
  }
}

function closeProfileModal() {
  document.getElementById("profileModal").hidden = true;
}

// 处理头像上传
document.getElementById("profileAvatarInput")?.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  if (!imageDB.db) await imageDB.init(); 
  
  const base64 = await compressImage(file, 200); 
  const newAvatarId = "avatar_" + Date.now().toString();
  await imageDB.save(newAvatarId, base64);
  
  tempAvatarId = newAvatarId;
  document.getElementById("profileAvatarPreview").src = base64;
  e.target.value = ""; 
});


// ================= 完整数据 ZIP 打包备份 =================

async function backupZip() {
  const btn = document.getElementById("zipBackupBtn");
  btn.innerText = "打包中...";
  btn.disabled = true;

  try {
    const zip = new JSZip();

    // 1. 收集 LocalStorage
    const dataToBackup = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("mini-")) {
        dataToBackup[key] = localStorage.getItem(key);
      }
    }
    zip.file("data.json", JSON.stringify(dataToBackup, null, 2));

    // 2. 收集图片并转换为真实图片格式
    if (!imageDB.db) await imageDB.init();
    
    const imgFolder = zip.folder("images");
    const tx = imageDB.db.transaction("images", "readonly");
    const store = tx.objectStore("images");
    const request = store.getAll();

    await new Promise((resolve, reject) => {
      request.onsuccess = async () => {
        const images = request.result;
        for (let img of images) {
          // img.base64 格式为 "data:image/jpeg;base64,/9j/4AAQSk..."
          const match = img.base64.match(/^data:(image\/\w+);base64,(.+)$/);
          if (match) {
            const mimeType = match[1]; 
            const base64Data = match[2]; // 纯数据部分
            
            // 判断文件后缀
            let ext = "jpg";
            if (mimeType.includes("png")) ext = "png";
            else if (mimeType.includes("svg")) ext = "svg";
            else if (mimeType.includes("gif")) ext = "gif";
            else if (mimeType.includes("webp")) ext = "webp";
            
            // 【核心修复】加上 {base64: true}，JSZip 会自动将其解码为二进制真实图片
            imgFolder.file(`${img.id}.${ext}`, base64Data, {base64: true});
          }
        }
        resolve();
      };
      request.onerror = reject;
    });

    // 3. 生成并下载
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `拾迹完整备份_${todayStr()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast("完整数据已打包下载！");
  } catch (error) {
    console.error(error);
    alert("打包失败：" + error.message);
  } finally {
    btn.innerText = "打包导出";
    btn.disabled = false;
  }
}

// ================= 导入 ZIP 备份 =================
document.getElementById("importZipFile")?.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  if (!confirm("⚠️ 警告：导入备份将【完全覆盖】你当前的所有记录、图片和设置。确定继续吗？")) {
    e.target.value = "";
    return;
  }

  showToast("正在解压恢复，请稍候...");

  try {
    const zip = await JSZip.loadAsync(file);

    // 1. 恢复 LocalStorage
    const dataFile = zip.file("data.json");
    if (dataFile) {
      const dataText = await dataFile.async("text");
      const parsedData = JSON.parse(dataText);
      
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key.startsWith("mini-")) localStorage.removeItem(key);
      }
      for (let key in parsedData) {
        localStorage.setItem(key, parsedData[key]);
      }
    }

    // 2. 恢复图片
    if (!imageDB.db) await imageDB.init();
    
    // 过滤出所有图片文件（排除文件夹本身）
    const imgFiles = Object.keys(zip.files).filter(name => name.startsWith("images/") && !zip.files[name].dir);
    
    for (let filename of imgFiles) {
      const fileObj = zip.file(filename);
      // 【核心修复】将图片文件读为 base64
      const base64Data = await fileObj.async("base64");
      
      const ext = filename.split('.').pop().toLowerCase();
      let mimeType = `image/${ext}`;
      if (ext === "jpg") mimeType = "image/jpeg";

      const imgId = filename.replace("images/", "").split(".")[0];
      const fullBase64 = `data:${mimeType};base64,${base64Data}`;
      
      await imageDB.save(imgId, fullBase64);
    }

    showToast("恢复成功！即将刷新页面...");
    setTimeout(() => {
      window.location.reload();
    }, 1500);

  } catch (error) {
    console.error(error);
    alert("导入失败，文件可能损坏或格式不正确。");
  } finally {
    e.target.value = "";
  }
});

function toggleFeature(key, isChecked) {
  appFeatures[key] = isChecked;
  saveFeatures(); // 存入 localStorage
  render();       // 立刻重新渲染
}

// ================= 拾迹树洞逻辑 =================
function openTreeHole() {
  const overlay = document.getElementById("treeHoleOverlay");
  const textarea = document.getElementById("treeHoleText");
  const p = document.querySelector("#treeHoleInputArea p");
  const btn = document.querySelector("#treeHoleInputArea button");

  // 【核心修复】打开时，重置所有状态，防止上次关闭的残留
  textarea.value = "";
  textarea.classList.remove("treehole-fade-out");
  p.style.opacity = "1";
  btn.style.opacity = "1";
  btn.disabled = false;
  
  overlay.style.display = "flex";
  overlay.offsetHeight; // 强制重绘
  overlay.classList.add("show");
  
  setTimeout(() => textarea.focus(), 300);
}

function closeTreeHole() {
  const overlay = document.getElementById("treeHoleOverlay");
  overlay.classList.remove("show");
  setTimeout(() => overlay.style.display = "none", 400);
}

function blowAway() {
  const textarea = document.getElementById("treeHoleText");
  
  if (!textarea.value.trim()) {
    closeTreeHole();
    return;
  }

  const p = document.querySelector("#treeHoleInputArea p");
  const btn = document.querySelector("#treeHoleInputArea button");

  // 1. 隐藏提示语和按钮
  p.style.opacity = "0";
  btn.style.opacity = "0";
  btn.disabled = true;

  // 2. 开始原地模糊动画
  textarea.classList.add("treehole-fade-out");

  // 3. 等待 1.8 秒，文字彻底模糊
  setTimeout(() => {
    // 4. 触发遮罩层的淡出（此时按钮已经被隐藏了，绝对不会闪现）
    closeTreeHole();
    
    // 5. 清空文字内容
    textarea.value = "";

    // 6. 等遮罩层彻底看不见了（400ms后），再弹出那句温柔的提示
    setTimeout(() => {
      showToast("已随风散去", 3000);
    }, 400);

  }, 1800);
}

// ================= 拾光摘录逻辑 =================
function openQuoteModal() {
  document.getElementById("quoteModal").hidden = false;
  document.getElementById("quoteContentInput").value = "";
  document.getElementById("quoteSourceInput").value = "";
  setTimeout(() => document.getElementById("quoteContentInput").focus(), 300);
}

function closeQuoteModal() {
  document.getElementById("quoteModal").hidden = true;
}

function saveQuote() {
  const content = document.getElementById("quoteContentInput").value.trim();
  const source = document.getElementById("quoteSourceInput").value.trim();
  
  if (!content) {
    alert("写点什么再收下吧~");
    return;
  }
  
  quotes.unshift({
    id: Date.now().toString(),
    content: content,
    source: source,
    date: todayStr()
  });
  
  saveQuotes();
  closeQuoteModal();
  renderQuotesView(); // 刷新列表
  showToast("已收入摘录本");
}

function deleteQuote(id, event) {
  event.stopPropagation(); // 阻止触发卡片的点击事件
  if (confirm("确定要把这句话丢掉吗？")) {
    quotes = quotes.filter(q => q.id !== id);
    saveQuotes();
    renderQuotesView();
  }
}

function randomQuote() {
  if (quotes.length === 0) {
    showToast("摘录本还是空的，快去收集几句吧！");
    return;
  }
  
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  const overlay = document.getElementById("quoteRandomOverlay");
  const card = document.getElementById("randomQuoteCard");
  
  card.innerHTML = `
    <div style="font-family: 'Kaiti', serif; font-size: 22px; color: #333; line-height: 1.8; margin-bottom: 20px;">“ ${random.content} ”</div>
    <div style="font-size: 14px; color: #8c8273; font-style: italic;">—— ${random.source || '未知出处'}</div>
    <div style="font-size: 12px; color: #ccc; margin-top: 20px;">拾于 ${random.date}</div>
  `;
  
  overlay.style.display = "flex";
  overlay.classList.add("show");
}

function closeRandomQuote() {
  const overlay = document.getElementById("quoteRandomOverlay");
  overlay.classList.remove("show");
  setTimeout(() => overlay.style.display = "none", 400);
}

// ================= 头像框系统 =================
function openFrameModal() {
  document.getElementById("frameModal").hidden = false;
  renderFrameGrid();
}

function closeFrameModal() {
  document.getElementById("frameModal").hidden = true;
}

function renderFrameGrid() {
  const grid = document.getElementById("frameGrid");
  if (!grid) return;

  grid.innerHTML = FRAME_POOL.map(frame => {
    const isSelected = tempFrameId === frame.id; // 这里改成判断 tempFrameId
    const borderColor = isSelected ? "var(--accent)" : "transparent";
    
    // 兼容图片和 SVG，支持单独缩放
    let previewHtml = "";
    const scaleVal = frame.scale || 1;

    if (frame.svg) {
      previewHtml = `<div style="width: 100%; height: 100%; transform: scale(${scaleVal});">${frame.svg}</div>`;
    } else if (frame.img) {
      previewHtml = `<img src="${frame.img}" style="width: 100%; height: 100%; object-fit: contain; transform: scale(${scaleVal});">`;
    } else {
      previewHtml = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-tertiary); font-size: 18px;">无</div>`;
    }

    return `
      <div onclick="selectFrame('${frame.id}')" style="cursor: pointer; text-align: center;">
        <!-- 预览容器 -->
        <div style="width: 64px; height: 64px; border-radius: 50%; border: 2px solid ${borderColor}; margin: 0 auto 8px auto; background: var(--surface); position: relative; display: flex; align-items: center; justify-content: center;">
          
          <!-- 底层小头像（去掉白边） -->
          <img src="./assets/girl-color.png" style="width: 110%; height: 110%; border-radius: 50%; object-fit: cover;">
          
          <!-- 顶层小框 -->
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 120%; height: 120%; pointer-events: none; z-index: 10;">
            ${previewHtml}
          </div>
          
        </div>
        <div style="font-size: 12px; color: ${isSelected ? 'var(--accent-text)' : 'var(--text-secondary)'};">${frame.name}</div>
      </div>
    `;
  }).join("");
}

function selectFrame(frameId) {
  tempFrameId = frameId; // 只修改试穿数据
  renderFrameGrid(); // 刷新框弹窗的高亮
  updateProfileFramePreview(); // 刷新资料弹窗的预览
  closeFrameModal(); // 选完直接退回资料弹窗
}

// 初始化时检查主题并高亮按钮
if (typeof initThemeUI === 'function') {
  initThemeUI();
}

function openThemeModal() {
  document.getElementById("themeModal").hidden = false;
  updateThemeUI(); // 每次打开同步高亮
}

function closeThemeModal() {
  document.getElementById("themeModal").hidden = true;
}

let currentLadderTab = 'checkin';

function switchLadderTab(tab) {
  currentLadderTab = tab;
  // 切换按钮样式
  const btnC = document.getElementById("tabCheckin");
  const btnH = document.getElementById("tabHabit");
  if (tab === 'checkin') {
    btnC.style.background = "var(--surface)"; btnC.style.color = "var(--text-primary)"; btnC.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
    btnH.style.background = "transparent"; btnH.style.color = "var(--text-tertiary)"; btnH.style.boxShadow = "none";
  } else {
    btnH.style.background = "var(--surface)"; btnH.style.color = "var(--text-primary)"; btnH.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
    btnC.style.background = "transparent"; btnC.style.color = "var(--text-tertiary)"; btnC.style.boxShadow = "none";
  }
  renderLadderView();
}

function renderLadderView() {
  const checkins = getCheckins();
  const totalCheckinDays = new Set(checkins.map(c => c.date)).size;
  
  let currentStreak = 0;
  let targetDays = 30;
  let labelText = "本轮连签 (天)";

  // 1. 根据不同的 Tab，读取正确的数据
  if (currentLadderTab === 'checkin') {
    currentStreak = calcCurrentCheckinStreak();
    document.getElementById("totalCheckinDays").innerText = totalCheckinDays;
    targetDays = 30;
    labelText = "本轮连签 (天)";
  } else {
    currentStreak = habitStreak.current;
    // 如果是习惯打卡，累计天数暂时用当前连击来展示，或者你可以替换为特定的累计数据
    document.getElementById("totalCheckinDays").innerText = currentStreak; 
    targetDays = 50;
    labelText = "全清连击 (天)";
  }

  // 2. 【防漏领机制】基于基准点计算本轮进度
  const baseStart = ladderRoundStart[currentLadderTab] || 0;
  let currentRoundProgress = currentStreak - baseStart;
  
  // 如果进度超过目标，直接封顶显示
  if (currentRoundProgress > targetDays) {
    currentRoundProgress = targetDays;
  }
  // 防止出现负数（比如手动清空过数据）
  if (currentRoundProgress < 0) {
    currentRoundProgress = 0;
  }
  
  document.getElementById("currentCheckinStreak").innerText = currentRoundProgress;
  document.getElementById("streakTarget").innerText = `/ ${targetDays}`;
  document.getElementById("streakLabel").innerText = labelText;

  const container = document.getElementById("ladderContent");
  
  // 3. 获取对应的数据源
  const rewards = currentLadderTab === 'checkin' ? CHECKIN_REWARDS : HABIT_REWARDS;
  const claimedList = claimedRewards[currentLadderTab] || [];

  // 4. 图标定义
  const giftIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M20 11v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="M7.5 7a1 1 0 0 1 0-5A4.8 8 0 0 1 12 7a4.8 8 0 0 1 4.5-5 1 1 0 0 1 0 5"/><rect x="3" y="7" width="18" height="4" rx="1"/></svg>`;
  const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
  const lockIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/></svg>`;

  let html = "";
  
  rewards.forEach((reward, index) => {
    const isClaimed = claimedList.includes(reward.day);
    // 使用本轮进度来判断是否解锁
    const isReached = currentRoundProgress >= reward.day; 
    
    // 状态样式初始化
    let iconHtml = lockIcon;
    let iconColor = "var(--text-tertiary)";
    let titleColor = "var(--text-tertiary)"; 
    let descColor = "var(--text-tertiary)";
    let cursorStyle = "default";
    let nodeBorder = "2px solid var(--border)";
    let nodeBg = "var(--surface)";
    
    if (isClaimed) {
      // 已领取状态
      iconHtml = checkIcon;
      nodeBorder = "2px solid var(--border)";
      titleColor = "var(--text-secondary)";
      descColor = "var(--text-tertiary)";
    } else if (isReached) {
      // 可领取状态
      iconHtml = giftIcon;
      iconColor = "var(--accent)";
      titleColor = "var(--text-primary)";
      descColor = "var(--text-secondary)";
      cursorStyle = "pointer";
      nodeBorder = "2px solid var(--accent)";
      nodeBg = "var(--accent-soft)";
    }

    // 线条逻辑（如果节点达成，线条变色；最后一个节点不画线）
    const lineColor = isReached ? "var(--accent)" : "var(--border)";
    const lineHtml = index < rewards.length - 1 
      ? `<div style="position: absolute; left: 22px; top: 46px; bottom: -30px; width: 1px; background: ${lineColor}; z-index: 0;"></div>` 
      : "";

    html += `
      <div onclick="${isReached && !isClaimed ? `claimLadderReward('${currentLadderTab}', ${reward.day})` : ''}" 
           style="display: flex; align-items: center; gap: 16px; margin-bottom: 30px; position: relative; z-index: 1; cursor: ${cursorStyle};">
        
        ${lineHtml}

        <!-- 左侧：图标节点 -->
        <div style="width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: ${nodeBorder}; background: ${nodeBg}; color: ${iconColor}; transition: all 0.2s; z-index: 2;">
          ${iconHtml}
        </div>

        <!-- 右侧：文字信息 -->
        <div style="display: flex; flex-direction: column; justify-content: center;">
          <div style="font-size: 15px; font-weight: 600; color: ${titleColor}; margin-bottom: 2px;">
            ${currentLadderTab === 'checkin' ? '连签' : '累计'} ${reward.day} 天
          </div>
          <div style="font-size: 12px; color: ${descColor};">
            ${reward.desc} ${isClaimed ? '(已领取)' : (reward.title && unlockedTitles.includes(reward.title) ? '(称号已拥有)' : '')}
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function claimLadderReward(type, day) {
  const rewards = type === 'checkin' ? CHECKIN_REWARDS : HABIT_REWARDS;
  const reward = rewards.find(r => r.day === day);
  if (!reward) return;

  // 判断称号是否已拥有
  let hasTitleAlready = false;
  if (reward.title && unlockedTitles.includes(reward.title)) {
    hasTitleAlready = true;
  }

  // 弹窗确认（如果已拥有称号，提示语稍微变一下）
  const confirmMsg = hasTitleAlready 
    ? `确定领取【${type === 'checkin' ? '连签' : '打卡'} ${day} 天】的奖励吗？`
    : `确定领取【${type === 'checkin' ? '连签' : '打卡'} ${day} 天】的奖励吗？`;

  if (!confirm(confirmMsg)) return;
  
  // 1. 发基础奖（静默加星迹，发卡、发券）
  if (reward.stars) addStars(reward.stars, true, true); 
  if (reward.card) { inventory.replenishCard = (inventory.replenishCard || 0) + reward.card; saveInventory(); }
  if (reward.ticket) { inventory.ticket = (inventory.ticket || 0) + reward.ticket; saveInventory(); }
  
  // 2. 发主题
  if (reward.theme && !ownedThemes.includes(reward.theme)) {
    ownedThemes.push(reward.theme);
    localStorage.setItem("mini-owned-themes", JSON.stringify(ownedThemes));
  }

  // 3. 发称号
  if (reward.title && !hasTitleAlready) {
    unlockedTitles.push(reward.title);
    saveUnlockedTitles();
  }

  // 【新增】4. 发气泡
  if (reward.bubble && !ownedBubbles.includes(reward.bubble)) {
    ownedBubbles.push(reward.bubble);
    saveBubbles();
  }

  // 4. 记录已领取
  if (!claimedRewards[type]) claimedRewards[type] = [];
  claimedRewards[type].push(day);
  saveClaimedRewards();
  
  // 5. 【轮回归零】如果领取的是最高档位奖励，清空已领取记录，开启新一轮！
  const maxDay = rewards[rewards.length - 1].day; 
  if (day === maxDay) {
    claimedRewards[type] = []; 
    saveClaimedRewards();
    
    // 【终极修复】基准点增加一个周期的长度，多出来的天数完美结转！
    ladderRoundStart[type] = (ladderRoundStart[type] || 0) + maxDay;
    saveLadderRoundStart();
    
    showToast("领取成功，下一轮阶梯已开启！");
  } else {
    showToast("领取成功");
  }
  
  renderLadderView(); 
}