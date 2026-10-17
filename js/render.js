function render() {
  document.getElementById("recordView").hidden = currentView !== "record";
  document.getElementById("timelineView").hidden = currentView !== "timeline";

  document.querySelectorAll(".tabs button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === currentView);
  });

  if (currentView === "record") {
    renderTagBar();
    renderList();
  } else {
    renderTimeline();
  }
}

function renderTagBar() {
  const tags = getAllTags();
  if (!tags.length) {
    tagBar.innerHTML = "";
    return;
  }
  tagBar.innerHTML = tags
    .map((t) => {
      const active = activeTag === t ? " active" : "";
      return `<button class="tag-chip${active}" data-tag="${escapeHtml(
        t
      )}">#${escapeHtml(t)}</button>`;
    })
    .join("");
}

function renderCard(e) {
  const hasDetail = !!(e.detail && e.detail.trim());
  const isExpanded = expandedIds.has(e.id);
  const isEditing = editingIds.has(e.id);

  const tagsHtml =
    e.tags && e.tags.length
      ? `<div class="tags">${e.tags
          .map((t) => `<span class="tag">#${escapeHtml(t)}</span>`)
          .join("")}</div>`
      : "";

  let detailInner = "";
  if (isEditing || (!hasDetail && isExpanded)) {
    detailInner = `
      <textarea placeholder="写点心得、背景、细节……">${escapeHtml(
        e.detail || ""
      )}</textarea>
      <div class="detail-actions">
        <button class="primary-small" onclick="saveDetail('${e.id}')">保存</button>
        <button onclick="cancelEdit('${e.id}')">取消</button>
      </div>
    `;
  } else if (hasDetail) {
    detailInner = `
      <div class="detail-text">${escapeHtml(e.detail)}</div>
      <div class="detail-actions">
        <button onclick="startEdit('${e.id}')">编辑</button>
      </div>
    `;
  }

  return `
    <div class="card ${e.isMilestone ? "milestone" : ""}">
      <div class="date">${escapeHtml(e.date)}</div>
      <div class="content">${escapeHtml(e.content)}</div>
      ${tagsHtml}
      <div class="actions">
        <button class="action-main ${e.isMilestone ? "flag-on" : ""}" onclick="toggleMilestone('${e.id}')">
          ${e.isMilestone ? "★ 大事" : "☆ 大事"}
        </button>
        <button class="action-main ${hasDetail ? "has-detail" : ""}" onclick="toggleDetail('${e.id}')">
          ${isExpanded ? "收起" : "详情"}
        </button>
        <span class="action-spacer"></span>
        <button class="action-sub ${e.isPinned ? "pin-on" : ""}" onclick="togglePin('${e.id}')">
          ${e.isPinned ? "📌 已置顶" : "📌 置顶"}
        </button>
        <button class="action-sub danger" onclick="deleteEntry('${e.id}')">删除</button>
      </div>
      <div class="detail" id="detail-${e.id}" ${isExpanded ? "" : "hidden"}>
        ${detailInner}
      </div>
    </div>
  `;
}

function toggleMonth(month) {
  if (expandedMonths.has(month)) expandedMonths.delete(month);
  else expandedMonths.add(month);
  render();
}

function renderList() {
  const q = searchQuery.trim().toLowerCase();
  const isSearching = q.length > 0;

  let filtered = entries.slice();

  if (isSearching) {
    filtered = filtered.filter(
      (e) =>
        e.content.toLowerCase().includes(q) ||
        (e.detail || "").toLowerCase().includes(q) ||
        (e.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }

  if (activeTag) {
    filtered = filtered.filter((e) => (e.tags || []).includes(activeTag));
  }

  filtered.sort(
    (a, b) =>
      b.date.localeCompare(a.date) ||
      (b.createdAt || "").localeCompare(a.createdAt || "")
  );

  if (!filtered.length) {
    const emptyMsg = isSearching
      ? "没有找到匹配的记录。"
      : activeTag
      ? "这个标签下还没有记录。"
      : "还没有记录，写一条吧。";
    listEl.innerHTML = `<div class="empty">${emptyMsg}</div>`;
    return;
  }

  const pinned = filtered.filter((e) => e.isPinned);
  const normal = filtered.filter((e) => !e.isPinned);

  let html = "";

  if (pinned.length) {
    html += `<div class="pin-header">📌 置顶</div>`;
    html += pinned.map(renderCard).join("");
  }

  const groups = {};
  normal.forEach((e) => {
    const month = e.date.slice(0, 7);
    if (!groups[month]) groups[month] = [];
    groups[month].push(e);
  });
  const months = Object.keys(groups).sort().reverse();

  if (!monthInitialized && months.length) {
    monthInitialized = true;
  }

  months.forEach((month) => {
    const items = groups[month];
    const isExpanded = isSearching || activeTag || expandedMonths.has(month);
    html += `
      <div class="month-header" onclick="toggleMonth('${month}')">
        <span>${formatMonth(month)}</span>
        <span class="month-count">${items.length} 条 ${isExpanded ? "▾" : "▸"}</span>
      </div>
    `;
    if (isExpanded) {
      html += items.map(renderCard).join("");
    }
  });

  listEl.innerHTML = html;
}

function toggleYear(year) {
  if (expandedYears.has(year)) expandedYears.delete(year);
  else expandedYears.add(year);
  render();
}

function renderTimeline() {
  const milestones = entries
    .filter((e) => e.isMilestone)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (!milestones.length) {
    timelineEl.innerHTML =
      '<div class="empty">还没有标记大事。去记录页点“标记大事”吧。</div>';
    return;
  }

  const groups = {};
  milestones.forEach((e) => {
    const year = e.date.slice(0, 4);
    if (!groups[year]) groups[year] = [];
    groups[year].push(e);
  });
  const years = Object.keys(groups).sort().reverse();

  if (!yearInitialized && years.length) {
    yearInitialized = true;
  }

  let html = "";
  years.forEach((year) => {
    const items = groups[year];
    const isExpanded = expandedYears.has(year);
    html += `
      <div class="year-header" onclick="toggleYear('${year}')">
        <span>${year} 年</span>
        <span class="month-count">${items.length} 件 ${isExpanded ? "▾" : "▸"}</span>
      </div>
    `;
    if (isExpanded) {
      items.forEach((e, idx) => {
        const isLast = idx === items.length - 1;
        const tagsHtml =
          e.tags && e.tags.length
            ? `<div class="tags">${e.tags
                .map((t) => `<span class="tag">#${escapeHtml(t)}</span>`)
                .join("")}</div>`
            : "";
        html += `
          <div class="timeline-item ${isLast ? "timeline-item-last" : ""}">
            <div class="dot"></div>
            <div>
              <div class="date">${escapeHtml(e.date)}</div>
              <div class="content">${escapeHtml(e.content)}</div>
              ${tagsHtml}
            </div>
          </div>
        `;
      });
    }
  });

  timelineEl.innerHTML = html;
}