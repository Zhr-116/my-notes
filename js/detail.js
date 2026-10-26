let currentEditImages = []; 
let currentEditFiles = [];  
let currentCardImageBase64 = null; 

function showImagePreview(base64) {
  document.getElementById("imagePreviewImg").src = base64;
  document.getElementById("imagePreviewModal").hidden = false;
}

function closeImagePreview() {
  document.getElementById("imagePreviewModal").hidden = true;
  document.getElementById("imagePreviewImg").src = "";
}

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

async function renderEditImages() {
  const container = document.getElementById("editImagesPreview");
  container.innerHTML = "";

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

function removeEditImage(id) {
  currentEditImages = currentEditImages.filter(imgId => imgId !== id);
  renderEditImages();
}

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
  const editBtn = document.getElementById("editDetailBtn");
  
  // 【修改点】动态获取铅笔图标；加号我们用个简单的文字或代码
  const pencilSvg = getIcon('pencil');
  const plusSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`;

  if (item.detail && item.detail.trim()) {
    textView.innerText = item.detail;
    editBtn.innerHTML = pencilSvg + " 编辑详情";
  } else {
    textView.innerText = "";
    editBtn.innerHTML = plusSvg + " 添加详情";
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
  saveEntries();
  
  document.getElementById("detailTextView").innerText = item.detail;
  await renderViewImages(item.images);
  
  cancelEditDetail();
  showToast("保存成功");
  render(); 
}

// === 分享卡片逻辑 ===
async function openCardGenerator() {
  const item = entries.find((e) => e.id === currentModalId);
  if (!item) return;

  document.getElementById("cardDateDisplay").innerText = formatCardDate(item.date);
  document.getElementById("cardTagDisplay").innerText = item.isMilestone ? "★ 大事" : "· 小事";
  document.getElementById("cardContentDisplay").innerText = item.content;
  document.getElementById("cardDetailDisplay").innerText = item.detail || "";
  document.getElementById("cardDetailInput").value = item.detail || "";
  
  document.getElementById("cardThemeSelect").value = "minimal";
  document.getElementById("cardTextSelect").value = "normal";

  const imageWrapper = document.getElementById("cardImageWrapper");
  const imageSelector = document.getElementById("cardImageSelector");
  const imageOptions = document.getElementById("cardImageOptions");
  
  currentCardImageBase64 = null;
  imageWrapper.hidden = true;
  imageWrapper.innerHTML = ""; 
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
          imageWrapper.innerHTML = `<img src="${base64}" alt="配图">`;
          imageWrapper.hidden = false;
        };
        imageOptions.appendChild(img);
      }
    }
  } else {
    imageSelector.hidden = true;
  }

  applyCardStyles();
  document.getElementById("cardGeneratorModal").hidden = false;
}

function closeCardGenerator() {
  document.getElementById("cardGeneratorModal").hidden = true;
}

function applyCardStyles() {
  const theme = document.getElementById("cardThemeSelect").value;
  const textStyle = document.getElementById("cardTextSelect").value;
  const rawText = document.getElementById("cardDetailInput").value;

  const previewArea = document.getElementById("cardPreviewArea");
  const detailEl = document.getElementById("cardDetailDisplay");

  previewArea.className = "card-preview-area";
  if (theme === "film") previewArea.classList.add("theme-film");
  if (theme === "ticket") previewArea.classList.add("theme-ticket");

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

document.getElementById("cardDetailInput")?.addEventListener("input", applyCardStyles);
document.getElementById("cardThemeSelect")?.addEventListener("change", applyCardStyles);
document.getElementById("cardTextSelect")?.addEventListener("change", applyCardStyles);