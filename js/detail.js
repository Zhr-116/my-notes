function openModal(id) {
  const item = entries.find((e) => e.id === id);
  if (!item) return;
  
  currentModalId = id;
  document.getElementById("modalDate").innerText = item.date + (item.isMilestone ? "  ★ 大事" : "");
  document.getElementById("modalContent").innerText = item.content;
  
  const tagsEl = document.getElementById("modalTags");
  tagsEl.innerHTML = (item.tags || []).map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join("");
  
  // 设置阅读态内容
  const textView = document.getElementById("detailTextView");
  if (item.detail && item.detail.trim()) {
    textView.innerText = item.detail;
    document.getElementById("editDetailBtn").innerText = "📝 编辑详情";
  } else {
    textView.innerText = "";
    document.getElementById("editDetailBtn").innerText = "➕ 添加详情";
  }

  // 默认强制显示阅读态，隐藏编辑态
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

  // 切换到编辑态
  document.getElementById("modalDetailInput").value = item.detail || "";
  document.getElementById("detailViewMode").hidden = true;
  document.getElementById("detailEditMode").hidden = false;
  
  // 自动聚焦到输入框
  setTimeout(() => document.getElementById("modalDetailInput").focus(), 100);
}

function cancelEditDetail() {
  // 取消编辑，退回阅读态
  document.getElementById("detailViewMode").hidden = false;
  document.getElementById("detailEditMode").hidden = true;
}

function saveModalDetail() {
  if (!currentModalId) return;
  const item = entries.find((e) => e.id === currentModalId);
  if (!item) return;
  
  item.detail = document.getElementById("modalDetailInput").value;
  saveEntries();
  
  // 保存后不关闭弹窗，而是更新阅读态的内容并切回阅读态
  document.getElementById("detailTextView").innerText = item.detail;
  cancelEditDetail();
  
  showToast("详情已保存");
  render(); // 更新底层列表的角标
}