function toggleEndDateInput() {
  const endInput = document.getElementById("endDateInput");
  const btn = document.getElementById("toggleEndDateBtn");
  if (endInput.style.display === "none") {
    endInput.style.display = "block";
  } else {
    endInput.style.display = "none";
    endInput.value = "";
  }
}

function addEntry() {
  const content = contentInput.value.trim();
  if (!content) {
    alert("先写点什么吧");
    return;
  }
  const date = dateInput.value || todayStr();
  const endDate = document.getElementById("endDateInput").value;
  const tags = tagsInput.value.trim().split(/\s+/).filter(Boolean);

  if (endDate && endDate < date) {
    alert("结束日期不能早于开始日期哦！");
    return;
  }

  entries.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    content,
    date,
    endDate: endDate || null, 
    tags,
    isMilestone: false,
    isPinned: false,
    detail: "",
    createdAt: new Date().toISOString(),
  });

  addStars(5);
  saveEntries();
  checkStoryTrigger("save_entry", { content: content });
  localStorage.removeItem(DRAFT_KEY);
  
  contentInput.value = "";
  tagsInput.value = "";
  dateInput.value = todayStr();
  document.getElementById("endDateInput").value = "";
  toggleEndDateInput(); // 收起跨度
  
  render();
  if (document.activeElement) {
    document.activeElement.blur(); // 让输入框失去焦点
  }
  const nav = document.querySelector('.bottom-nav');
  if (nav) {
    nav.classList.remove('keyboard-open'); // 强制移除隐藏类，让导航栏立刻滑回来
  }

  if (typeof checkStoryTrigger === 'function') setTimeout(checkStoryTrigger, 500);
  if (typeof checkAndUnlockTitles === 'function') checkAndUnlockTitles();
}

function deleteEntry(id) {
  if (!confirm("删除这条记录？")) return;
  
  entries = entries.filter((e) => e.id !== id);
  
  // 删掉以前残留的 expandedIds 和 editingIds 的清理
  saveEntries();
  checkStoryTrigger("delete_entry");
  render();
}

function togglePin(id) {
  const item = entries.find((e) => e.id === id);
  if (!item) return;
  item.isPinned = !item.isPinned;
  saveEntries();
  render();
}