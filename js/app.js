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
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', () => {
    const nav = document.querySelector('.bottom-nav');
    if (!nav) return;
    
    // 如果视口高度明显小于屏幕高度（通常差值 > 100px），说明键盘弹出了
    if (window.visualViewport.height < window.innerHeight - 100) {
      nav.style.display = 'none'; // 键盘弹起，隐藏导航
    } else {
      nav.style.display = 'flex'; // 键盘收起，恢复导航
    }
  });
}

// === 个人资料编辑逻辑 ===
let tempAvatarId = null;

async function openProfileModal() {
  document.getElementById("profileModal").hidden = false;
  document.getElementById("profileNameInput").value = userProfile.nickname;
  document.getElementById("profileSignInput").value = userProfile.signature;
  
  const preview = document.getElementById("profileAvatarPreview");
  tempAvatarId = userProfile.avatarId || null;
  
  if (tempAvatarId) {
    if (!imageDB.db) await imageDB.init(); 
    const base64 = await imageDB.get(tempAvatarId);
    preview.src = base64 || "./assets/girl-color.png";
  } else {
    preview.src = "./assets/girl-color.png";
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

function saveProfileData() {
  const nickname = document.getElementById("profileNameInput").value.trim() || "拾迹";
  const signature = document.getElementById("profileSignInput").value.trim() || "收集时间的痕迹";
  
  userProfile.nickname = nickname;
  userProfile.signature = signature;
  
  if (tempAvatarId) {
    userProfile.avatarId = tempAvatarId;
  }
  
  saveProfile();
  closeProfileModal();
  
  // 先同步更新 DOM 上的文字，保证立刻看到效果
  document.getElementById("myNickname").innerText = userProfile.nickname;
  document.getElementById("mySignature").innerText = userProfile.signature;
  
  // 再异步渲染一下头像（如果你有 renderMineView 函数就调用它，这步不影响文字）
  renderMineView(); 
  showToast("资料已更新");
}

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