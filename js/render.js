function render() {
  const pageTitles = { 'review': '回顾', 'book': '书架', 'plan': '计划', 'shop': '拾光商店' };
  const isSubPage = Object.keys(pageTitles).includes(currentView);

  const mainTabs = document.getElementById("mainTabs");
  const subPageTitle = document.getElementById("subPageTitle");
  const appTitle = document.getElementById("appTitle");
  const subBackBtn = document.getElementById("subBackBtn");

  if (isSubPage) {
    // 子页面：隐藏导航、隐藏拾迹，显示返回和标题
    mainTabs.hidden = true;
    subPageTitle.hidden = false;
    subPageTitle.innerText = pageTitles[currentView];
    
    appTitle.hidden = true;
    subBackBtn.hidden = false;
  } else {
    // 主页面：显示导航、显示拾迹，隐藏返回和标题
    mainTabs.hidden = false;
    subPageTitle.hidden = true;
    
    appTitle.hidden = false;
    subBackBtn.hidden = true;
  }

  // 隐藏所有页面
  document.getElementById("recordView").hidden = currentView !== "record";
  document.getElementById("timelineView").hidden = currentView !== "timeline";
  document.getElementById("reviewView").hidden = currentView !== "review";
  document.getElementById("bookView").hidden = currentView !== "book";
  document.getElementById("planView").hidden = currentView !== "plan";
  document.getElementById("moreView").hidden = currentView !== "more"; // 新增
  document.getElementById("shopView").hidden = currentView !== "shop"; // 稍后加

  document.querySelectorAll(".tabs button").forEach((btn) => {
    // 当在非前两个页面时，“更多”按钮高亮
    const isMorePage = ["review", "book", "plan", "shop", "more"].includes(currentView);
    if (btn.dataset.view === "more") {
      btn.classList.toggle("active", isMorePage);
    } else {
      btn.classList.toggle("active", btn.dataset.view === currentView);
    }
  });

  // 渲染逻辑
  if (currentView === "record") { renderTagBar(); renderList(); } 
  else if (currentView === "timeline") { renderTimeline(); } 
  else if (currentView === "review") { renderReview(); } 
  else if (currentView === "book") { renderBookView(); } 
  else if (currentView === "plan") { renderPlanView(); } 
  else if (currentView === "shop") { renderShop(); } // 稍后写
}

// 全局跳转函数
function switchView(viewName) {
  currentView = viewName;
  render();
}

// 保存默认首页
function saveDefaultView(viewName) {
  localStorage.setItem("mini-default-view", viewName);
  showToast("默认首页已设置");
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
      return `<button class="tag-chip${active}" data-tag="${escapeHtml(t)}">#${escapeHtml(t)}</button>`;
    })
    .join("");
}

function renderTimeline() {
  const milestones = entries
    .filter((e) => e.isMilestone)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (!milestones.length) {
    timelineEl.innerHTML = '<div class="empty">还没有标记大事。去记录页点“标记大事”吧。</div>';
    return;
  }

  const groups = {};
  milestones.forEach((e) => {
    const year = e.date.slice(0, 4);
    if (!groups[year]) groups[year] = [];
    groups[year].push(e);
  });
  // 这里保证年份是倒序的（最新的在最上面）
  const years = Object.keys(groups).sort().reverse();

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
        const tagsHtml = e.tags && e.tags.length
            ? `<div class="tags">${e.tags.map((t) => `<span class="tag">#${escapeHtml(t)}</span>`).join("")}</div>`
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

function renderItem(e) {
  const hasDetail = !!(e.detail && e.detail.trim());
  
  // 如果没有标为大事，显示灰色的“☆ 标记大事”，点了就变大事
  // 如果已经是大事，显示金色的“★ 大事”
  const milestoneBadge = `
    <span class="badge-toggle ${e.isMilestone ? 'is-milestone' : ''}" 
          onclick="event.stopPropagation(); toggleMilestone('${e.id}')"
          style="display: inline-flex; align-items: center; gap: 4px;">
      
      <!-- 这里是 SVG 星星 -->
      <svg class="star-svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>
      </svg>

      ${e.isMilestone ? '大事' : '标记大事'}
    </span>
  `;

    const pencilSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 2px;"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>`;
    const detailBadge = hasDetail ? `<span class="badge-detail" style="display:inline-flex; align-items:center;">${pencilSvg} 详情</span>` : '';

  return `
    <div class="list-item ${e.isMilestone ? 'is-milestone-item' : ''}" data-id="${e.id}">
      <!-- 底层：滑动出现的按钮 -->
      <div class="swipe-actions">
        <button class="swipe-btn pin ${e.isPinned ? 'active' : ''}" onclick="togglePin('${e.id}'); resetSwipe();">
          ${e.isPinned ? '取消置顶' : '置顶'}
        </button>
        <button class="swipe-btn delete" onclick="deleteEntry('${e.id}')">删除</button>
      </div>
      
      <!-- 表层：内容区 -->
      <div class="swipe-content" onclick="openModal('${e.id}')">
        <div class="item-header">
          <div class="item-date">${escapeHtml(e.date)}</div>
          <div class="item-badges">
            ${milestoneBadge}
            ${detailBadge}
          </div>
        </div>
        <div class="item-content">${escapeHtml(e.content)}</div>
      </div>
    </div>
  `;
}

function toggleMonth(month) {
  if (expandedMonths.has(month)) expandedMonths.delete(month);
  else expandedMonths.add(month);
  render();
}

function toggleYear(year) {
  if (expandedYears.has(year)) expandedYears.delete(year);
  else expandedYears.add(year);
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
    const emptyMsg = isSearching || activeTag ? "没有找到匹配的记录。" : "还没有记录，写一条吧。";
    
    // 加回纸飞机彩蛋
    listEl.innerHTML = `
      <div class="empty" style="display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%; margin-top: 60px;">
        <img src="./assets/plane.svg" alt="纸飞机" class="plane-img">
        <span style="text-align:center; margin-top: 16px;">${emptyMsg}</span>
      </div>
    `;
    return;
  }

  const pinned = filtered.filter((e) => e.isPinned);
  const normal = filtered.filter((e) => !e.isPinned);

  let html = `<div class="list-container">`;

  if (pinned.length) {
    html += `<div class="pin-header">📌 置顶</div>`;
    html += pinned.map(renderItem).join("");
  }

  const groups = {};
  normal.forEach((e) => {
    const month = e.date.slice(0, 7);
    if (!groups[month]) groups[month] = [];
    groups[month].push(e);
  });
  const months = Object.keys(groups).sort().reverse();

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
      html += items.map(renderItem).join("");
    }
  });

  html += `</div>`;
  listEl.innerHTML = html;
}