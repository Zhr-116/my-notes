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

// 草稿自动保存：输入停 400ms 后写入
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