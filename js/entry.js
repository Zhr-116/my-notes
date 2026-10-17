function addEntry() {
  const content = contentInput.value.trim();
  if (!content) {
    alert("先写点什么吧");
    return;
  }
  const date = dateInput.value || todayStr();
  const tags = tagsInput.value.trim().split(/\s+/).filter(Boolean);

  entries.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    content,
    date,
    tags,
    isMilestone: false,
    isPinned: false,
    detail: "",
    createdAt: new Date().toISOString(),
  });

  saveEntries();
  localStorage.removeItem(DRAFT_KEY);
  contentInput.value = "";
  tagsInput.value = "";
  dateInput.value = todayStr();
  render();
  contentInput.focus();
}

function deleteEntry(id) {
  if (!confirm("删除这条记录？")) return;
  
  entries = entries.filter((e) => e.id !== id);
  
  // 删掉以前残留的 expandedIds 和 editingIds 的清理
  saveEntries();
  render();
}

function togglePin(id) {
  const item = entries.find((e) => e.id === id);
  if (!item) return;
  item.isPinned = !item.isPinned;
  saveEntries();
  render();
}