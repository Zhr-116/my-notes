function toggleDetail(id) {
  if (expandedIds.has(id)) {
    expandedIds.delete(id);
    editingIds.delete(id);
  } else {
    expandedIds.add(id);
    const item = entries.find((e) => e.id === id);
    if (!item.detail || !item.detail.trim()) {
      editingIds.add(id);
    }
  }
  render();
  focusDetailIfEditing(id);
}

function startEdit(id) {
  editingIds.add(id);
  render();
  focusDetailIfEditing(id);
}

function cancelEdit(id) {
  editingIds.delete(id);
  const item = entries.find((e) => e.id === id);
  if (!item.detail || !item.detail.trim()) {
    expandedIds.delete(id);
  }
  render();
}

function saveDetail(id) {
  const ta = document.querySelector(`#detail-${id} textarea`);
  if (!ta) return;
  const item = entries.find((e) => e.id === id);
  if (!item) return;
  item.detail = ta.value;
  saveEntries();
  editingIds.delete(id);
  render();
  showToast("详情已保存");
}

function focusDetailIfEditing(id) {
  if (!editingIds.has(id)) return;
  requestAnimationFrame(() => {
    const ta = document.querySelector(`#detail-${id} textarea`);
    if (ta) {
      ta.focus();
      const len = ta.value.length;
      ta.setSelectionRange(len, len);
    }
  });
}