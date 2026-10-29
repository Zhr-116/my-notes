function render() {
  const pageTitles = { 'review': '回顾', 'book': '书架', 'plan': '计划', 'shop': '拾光商店', 'tagDetail': '标签档案' };
  const isSubPage = Object.keys(pageTitles).includes(currentView);

  const mainTabs = document.getElementById("mainTabs");
  const subPageTitle = document.getElementById("subPageTitle");
  const appTitle = document.getElementById("appTitle");
  const subBackBtn = document.getElementById("subBackBtn");
  const headerCheckinBtn = document.getElementById("headerCheckinBtn"); // 新增

  if (isSubPage) {
    mainTabs.hidden = true;
    subPageTitle.hidden = false;
    subPageTitle.innerText = pageTitles[currentView];
    appTitle.hidden = true;
    subBackBtn.hidden = false;
    headerCheckinBtn.hidden = true; 
  } else {
    mainTabs.hidden = false;
    subPageTitle.hidden = true;
    appTitle.hidden = false;
    subBackBtn.hidden = true;
    headerCheckinBtn.hidden = false;
  }

  document.getElementById("recordView").hidden = currentView !== "record";
  document.getElementById("timelineView").hidden = currentView !== "timeline";
  document.getElementById("reviewView").hidden = currentView !== "review";
  document.getElementById("bookView").hidden = currentView !== "book";
  document.getElementById("planView").hidden = currentView !== "plan";
  document.getElementById("moreView").hidden = currentView !== "more";
  document.getElementById("shopView").hidden = currentView !== "shop";
  document.getElementById("tagDetailView").hidden = currentView !== "tagDetail"; 

  document.querySelectorAll(".tabs button").forEach((btn) => {
    const isMorePage = ["review", "book", "plan", "shop", "more"].includes(currentView);
    if (btn.dataset.view === "more") {
      btn.classList.toggle("active", isMorePage);
    } else {
      btn.classList.toggle("active", btn.dataset.view === currentView);
    }
  });

  // 动态替换相机图标（在 index.html 里的那个 label）
  const camLabel = document.getElementById("cameraBtnLabel");
  if (camLabel) camLabel.innerHTML = getIcon('camera') + ' 添加图片';

  const genCardBtn = document.getElementById("generateCardBtn");
  if (genCardBtn) genCardBtn.innerHTML = getIcon('card') + ' 生成分享卡片';

  if (currentView === "record") { renderTagBar(); renderList(); } 
  else if (currentView === "timeline") { renderTimeline(); } 
  else if (currentView === "review") { renderReview(); } 
  else if (currentView === "book") { renderBookView(); } 
  else if (currentView === "plan") { renderPlanView(); } 
  else if (currentView === "shop") { renderShop(); } 
  else if (currentView === "tagDetail") { renderTagDetailView(); } 
}

function switchView(viewName) {
  currentView = viewName;
  render();
}

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
  
  // 动态获取铃铛/星星图标
  const milestoneBadge = `
    <span class="badge-toggle ${e.isMilestone ? 'is-milestone' : ''}" 
          onclick="event.stopPropagation(); toggleMilestone('${e.id}')"
          style="display: inline-flex; align-items: center; gap: 6px;">
      ${getIcon('bell')}
      ${e.isMilestone ? '大事' : '标记大事'}
    </span>
  `;

  // 动态获取铅笔图标
  const detailBadge = hasDetail ? `<span class="badge-detail" style="display:inline-flex; align-items:center; gap:4px;">${getIcon('pencil')} 详情</span>` : '';

  return `
    <div class="list-item ${e.isMilestone ? 'is-milestone-item' : ''}" data-id="${e.id}">
      <div class="swipe-actions">
        <button class="swipe-btn pin ${e.isPinned ? 'active' : ''}" onclick="togglePin('${e.id}'); resetSwipe();">
          ${e.isPinned ? '取消置顶' : '置顶'}
        </button>
        <button class="swipe-btn delete" onclick="deleteEntry('${e.id}')">删除</button>
      </div>
      
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

function renderTagDetailView() {
  const container = document.getElementById("tagDetailContent");
  if (!container) return;

  // 1. 过滤出当前标签的所有记录
  const tagEntries = entries.filter(e => (e.tags || []).includes(currentTagDetail));

  if (!tagEntries.length) {
    container.innerHTML = `<div class="empty" style="margin-top: 50px;">这个标签下还没有记录。</div>`;
    return;
  }

  // 2. 统计数据
  const total = tagEntries.length;
  const sortedAsc = tagEntries.slice().sort((a,b) => a.date.localeCompare(b.date));
  const firstDate = sortedAsc[0].date;

  // 3. 构建近 60 天的微型热力图
  const today = new Date();
  let heatmapHtml = `<div class="heatmap-grid" style="grid-template-columns: repeat(15, 1fr); gap: 4px; margin-bottom: 20px;">`;
  const countMap = {};
  tagEntries.forEach(e => { countMap[e.date] = (countMap[e.date] || 0) + 1; });

  for (let i = 59; i >= 0; i--) {
    let d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    
    const count = countMap[dateStr] || 0;
    let level = 0;
    if (count > 0) level = 1;
    if (count > 1) level = 2;
    if (count > 2) level = 3;

    heatmapHtml += `<div class="heat-cell level-${level}" title="${dateStr}: ${count}条"></div>`;
  }
  heatmapHtml += `</div>`;

  // 4. 按月分组，生成折叠列表
  const sortedDesc = tagEntries.slice().sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || "").localeCompare(a.createdAt || ""));
  const groups = {};
  sortedDesc.forEach(e => {
    const month = e.date.slice(0, 7);
    if (!groups[month]) groups[month] = [];
    groups[month].push(e);
  });
  const months = Object.keys(groups).sort().reverse();

  let listHtml = "";
  months.forEach((month) => {
    const items = groups[month];
    // 复用全局的 expandedMonths，但加个前缀防止和主页冲突
    const isExpanded = expandedMonths.has("tag-" + month);
    
    listHtml += `
      <div class="month-header" onclick="toggleTagMonth('${month}')">
        <span>${formatMonth(month)}</span>
        <span class="month-count">${items.length} 条 ${isExpanded ? "▾" : "▸"}</span>
      </div>
    `;
    
    if (isExpanded) {
      // 直接复用 renderItem，完美保留左滑、置顶等所有功能！
      listHtml += `<div class="list-container">${items.map(renderItem).join("")}</div>`;
    }
  });

  // 5. 拼装完整 HTML
  container.innerHTML = `
    <div class="stats-grid" style="grid-template-columns: repeat(2, 1fr); margin-bottom: 20px;">
      <div class="stat-card">
        <div class="stat-num">${total}</div>
        <div class="stat-label">共记录</div>
      </div>
      <div class="stat-card">
        <div class="stat-num" style="font-size: 20px; padding-top: 8px;">${firstDate}</div>
        <div class="stat-label">最早相遇</div>
      </div>
    </div>

    <div class="section-title" style="margin-top: 30px;">近 60 天足迹</div>
    ${heatmapHtml}

    <div class="section-title" style="margin-top: 30px;">档案记录</div>
    <div class="list-container">
      ${listHtml}
    </div>
  `;
}

// 标签页专属的折叠控制
function toggleTagMonth(month) {
  const key = "tag-" + month;
  if (expandedMonths.has(key)) expandedMonths.delete(key);
  else expandedMonths.add(key);
  renderTagDetailView();
}