let currentEditImages = []; // 保存原有的图片 ID
let currentEditFiles = [];  // 保存新选的文件
let currentCardImageBase64 = null; // 卡片选中的配图

// 打开全屏预览
function showImagePreview(base64) {
  document.getElementById("imagePreviewImg").src = base64;
  document.getElementById("imagePreviewModal").hidden = false;
}

function closeImagePreview() {
  document.getElementById("imagePreviewModal").hidden = true;
  document.getElementById("imagePreviewImg").src = "";
}

// 渲染阅读态图片
async function renderViewImages(imageIds) {
  const container = document.getElementById("detailImagesView");
  container.innerHTML = "";
  if (!imageIds || !imageIds.length) return;

  for (const id of imageIds) {
    const base64 = await imageDB.get(id);
    if (base64) {
      const img = document.createElement("img");
      img.src = base64;
      img.className = "detail-img";
      img.onclick = (e) => {
        e.stopPropagation();
        showImagePreview(base64);
      };
      container.appendChild(img);
    }
  }
}

// 渲染编辑态图片（带删除按钮）
async function renderEditImages() {
  const container = document.getElementById("editImagesPreview");
  container.innerHTML = "";

  // 1. 渲染已经保存的旧图
  for (const id of currentEditImages) {
    const base64 = await imageDB.get(id);
    if (base64) {
      const wrapper = document.createElement("div");
      wrapper.className = "edit-img-wrapper";
      wrapper.innerHTML = `
        <img src="${base64}">
        <div class="remove-img-btn" onclick="removeEditImage('${id}')">×</div>
      `;
      container.appendChild(wrapper);
    }
  }

  // 2. 渲染新选的图
  currentEditFiles.forEach((file, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "edit-img-wrapper";
    const tempUrl = URL.createObjectURL(file);
    wrapper.innerHTML = `
      <img src="${tempUrl}">
      <div class="remove-img-btn" onclick="removeEditFile(${index})">×</div>
    `;
    container.appendChild(wrapper);
  });
}

// 删除旧图
function removeEditImage(id) {
  currentEditImages = currentEditImages.filter(imgId => imgId !== id);
  renderEditImages();
}

// 删除新图
function removeEditFile(index) {
  currentEditFiles.splice(index, 1);
  renderEditImages();
}

async function openModal(id) {
  const item = entries.find((e) => e.id === id);
  if (!item) return;
  
  currentModalId = id;
  document.getElementById("modalDate").innerText = item.date + (item.isMilestone ? "  ★ 大事" : "");
  document.getElementById("modalContent").innerText = item.content;
  
  const tagsEl = document.getElementById("modalTags");
  tagsEl.innerHTML = (item.tags || []).map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join("");
  
  const textView = document.getElementById("detailTextView");
  if (item.detail && item.detail.trim()) {
    textView.innerText = item.detail;
    document.getElementById("editDetailBtn").innerText = "📝 编辑详情";
  } else {
    textView.innerText = "";
    document.getElementById("editDetailBtn").innerText = "➕ 添加详情";
  }

  await renderViewImages(item.images);

  document.getElementById("detailViewMode").hidden = false;
  document.getElementById("detailEditMode").hidden = true;
  document.getElementById("detailModal").hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("detailModal").hidden = true;
  currentModalId = null;
  document.body.style.overflow = "";
}

function startEditDetail() {
  const item = entries.find((e) => e.id === currentModalId);
  if (!item) return;

  document.getElementById("modalDetailInput").value = item.detail || "";
  
  currentEditImages = item.images ? [...item.images] : [];
  currentEditFiles = [];
  renderEditImages();

  document.getElementById("detailViewMode").hidden = true;
  document.getElementById("detailEditMode").hidden = false;
}

function cancelEditDetail() {
  document.getElementById("detailViewMode").hidden = false;
  document.getElementById("detailEditMode").hidden = true;
}

async function saveModalDetail() {
  if (!currentModalId) return;
  const item = entries.find((e) => e.id === currentModalId);
  if (!item) return;
  
  item.detail = document.getElementById("modalDetailInput").value;
  
  // 图片保存逻辑（不变）
  if (currentEditFiles.length > 0) {
    showToast("正在保存图片...");
    for (const file of currentEditFiles) {
      const base64 = await compressImage(file);
      const imgId = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
      await imageDB.save(imgId, base64);
      currentEditImages.push(imgId);
    }
  }
  item.images = currentEditImages;
  
  // 音频保存逻辑
  if (newAudioBlob) {
    showToast("正在保存语音...");
    const newAudioId = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    await audioDB.save(newAudioId, newAudioBlob);
    
    // 如果之前有旧音频，删掉它
    if (item.audioId && item.audioId !== newAudioId) {
      await audioDB.delete(item.audioId);
    }
    item.audioId = newAudioId;
  } else if (!currentAudioId && item.audioId) {
    // 如果用户点了删除语音
    await audioDB.delete(item.audioId);
    item.audioId = null;
  }

  saveEntries();
  await loadAudioView(currentModalId); // 刷新阅读态音频
  cancelEditDetail();
  showToast("保存成功");
  render(); 
}

// 录音按钮逻辑
document.getElementById("recordBtn")?.addEventListener("click", async () => {
  const recordBtn = document.getElementById("recordBtn");
  const recordStatus = document.getElementById("recordStatus");

  if (!isRecording) {
    // 开始录音
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        newAudioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
        const audioUrl = URL.createObjectURL(newAudioBlob);
        const editPlayer = document.getElementById("editAudioPlayer");
        editPlayer.src = audioUrl;
        document.getElementById("editAudioPreview").style.display = "block";
        stream.getTracks().forEach(track => track.stop()); // 释放麦克风
      };

      mediaRecorder.start();
      isRecording = true;
      recordBtn.innerHTML = "⏹️ 停止";
      recordBtn.style.color = "#ef4444";
      recordStatus.style.display = "inline";
    } catch (err) {
      alert("无法访问麦克风，请检查浏览器权限设置！");
    }
  } else {
    // 停止录音
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    isRecording = false;
    recordBtn.innerHTML = "🎤 重录";
    recordBtn.style.color = "";
    recordStatus.style.display = "none";
  }
});

// 删除语音
function removeAudio() {
  newAudioBlob = null;
  currentAudioId = null;
  document.getElementById("editAudioPreview").style.display = "none";
  document.getElementById("editAudioPlayer").src = "";
  document.getElementById("recordBtn").innerHTML = "🎤 录音";
}

// 修改 startEditDetail 初始化音频状态
const originalStartEditDetail = startEditDetail; // 备份原函数
startEditDetail = function() {
  originalStartEditDetail();
  const item = entries.find((e) => e.id === currentModalId);
  currentAudioId = item.audioId || null;
  newAudioBlob = null;
  
  document.getElementById("recordBtn").innerHTML = "🎤 录音";
  document.getElementById("recordStatus").style.display = "none";
  
  if (currentAudioId) {
    audioDB.get(currentAudioId).then(blob => {
      if (blob) {
        document.getElementById("editAudioPlayer").src = URL.createObjectURL(blob);
        document.getElementById("editAudioPreview").style.display = "block";
      }
    });
  } else {
    document.getElementById("editAudioPreview").style.display = "none";
  }
};

// 修改 openModal 调用 loadAudioView
const originalOpenModal = openModal;
openModal = async function(id) {
  await originalOpenModal(id);
  await loadAudioView(id);
};

// === 分享卡片逻辑 ===
async function openCardGenerator() {
  const item = entries.find((e) => e.id === currentModalId);
  if (!item) return;

  // 1. 填充文字
  document.getElementById("cardDateDisplay").innerText = formatCardDate(item.date);
  document.getElementById("cardTagDisplay").innerText = item.isMilestone ? "★ 大事" : "· 小事";
  document.getElementById("cardContentDisplay").innerText = item.content;
  document.getElementById("cardDetailDisplay").innerText = item.detail || "";
  document.getElementById("cardDetailInput").value = item.detail || "";
  
  // 2. 重置下拉框的默认值
  document.getElementById("cardThemeSelect").value = "minimal";
  document.getElementById("cardTextSelect").value = "normal";

  // 3. 处理图片
  const imageWrapper = document.getElementById("cardImageWrapper");
  const imageSelector = document.getElementById("cardImageSelector");
  const imageOptions = document.getElementById("cardImageOptions");
  
  currentCardImageBase64 = null;
  imageWrapper.hidden = true;
  imageWrapper.innerHTML = ""; // 彻底清空，不留幽灵 img 标签
  imageOptions.innerHTML = "";

  if (item.images && item.images.length > 0) {
    imageSelector.hidden = false;
    for (const id of item.images) {
      const base64 = await imageDB.get(id);
      if (base64) {
        const img = document.createElement("img");
        img.src = base64;
        img.className = "image-option";
        img.onclick = () => {
          document.querySelectorAll(".image-option").forEach(el => el.classList.remove("selected"));
          img.classList.add("selected");
          currentCardImageBase64 = base64;
          
          // 【关键修复】：只有选中时，才动态把图片插入到容器里
          imageWrapper.innerHTML = `<img src="${base64}" alt="配图">`;
          imageWrapper.hidden = false;
        };
        imageOptions.appendChild(img);
      }
    }
  } else {
    imageSelector.hidden = true;
  }

  // 4. 应用初始样式
  applyCardStyles();

  // 5. 显示弹窗
  document.getElementById("cardGeneratorModal").hidden = false;
}

function closeCardGenerator() {
  document.getElementById("cardGeneratorModal").hidden = true;
}

// 核心：独立应用主题和文字排版
function applyCardStyles() {
  const theme = document.getElementById("cardThemeSelect").value;
  const textStyle = document.getElementById("cardTextSelect").value;
  const rawText = document.getElementById("cardDetailInput").value;

  const previewArea = document.getElementById("cardPreviewArea");
  const detailEl = document.getElementById("cardDetailDisplay");

  // 1. 应用卡片主题
  previewArea.className = "card-preview-area";
  if (theme === "film") previewArea.classList.add("theme-film");
  if (theme === "ticket") previewArea.classList.add("theme-ticket");

  // 2. 应用文字排版
  detailEl.className = "card-detail";
  if (!rawText.trim()) {
    detailEl.innerText = "";
    return;
  }

  if (textStyle === "literary") {
    detailEl.classList.add("style-literary");
    detailEl.innerText = `“${rawText}”`;
  } else if (textStyle === "kaiti") {
    detailEl.classList.add("style-kaiti");
    detailEl.innerText = rawText;
  } else {
    detailEl.innerText = rawText;
  }
}

// 绑定两个下拉框和输入框的事件
document.getElementById("cardDetailInput")?.addEventListener("input", applyCardStyles);
document.getElementById("cardThemeSelect")?.addEventListener("change", applyCardStyles);
document.getElementById("cardTextSelect")?.addEventListener("change", applyCardStyles);