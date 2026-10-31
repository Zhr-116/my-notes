function render() {
  // 字典：需要显示顶部返回按钮和标题的子页面
  const pageTitles = { 'review': '回顾', 'book': '书架', 'shop': '拾光商店', 'tagDetail': '标签档案', 'settings': '应用设置', 'game': '拾光关卡' };
  const isSubPage = Object.keys(pageTitles).includes(currentView);
  
  const subPageTitle = document.getElementById("subPageTitle");
  const appTitle = document.getElementById("appTitle");
  const subBackBtn = document.getElementById("subBackBtn");
  const headerCheckinBtn = document.getElementById("headerCheckinBtn");
  const headerSettingsBtn = document.getElementById("headerSettingsBtn");
  const headerFocusBtn = document.getElementById("headerFocusBtn"); // 【修复1】补上漏掉的声明

  // 处理顶部栏状态
  if (isSubPage) {
    subPageTitle.hidden = false;
    subPageTitle.innerText = pageTitles[currentView];
    appTitle.hidden = true;
    subBackBtn.hidden = false;
    
    // 子页面隐藏所有右侧图标
    headerCheckinBtn.hidden = true; 
    if (headerSettingsBtn) headerSettingsBtn.hidden = true; 
    if (headerFocusBtn) headerFocusBtn.hidden = true;
  } else {
    subPageTitle.hidden = true;
    appTitle.hidden = false;
    subBackBtn.hidden = true;
    
    // 主页面动态显示逻辑
    if (currentView === "mine") {
      headerCheckinBtn.hidden = true;
      if (headerSettingsBtn) headerSettingsBtn.hidden = false;
      if (headerFocusBtn) headerFocusBtn.hidden = true;
    } else if (currentView === "plan") {
      // 计划页显示签到和专注闹钟
      headerCheckinBtn.hidden = false;
      if (headerSettingsBtn) headerSettingsBtn.hidden = true;
      if (headerFocusBtn) headerFocusBtn.hidden = false;
    } else {
      // 其他页面（记录、时间轴、更多）只显示签到
      headerCheckinBtn.hidden = false;
      if (headerSettingsBtn) headerSettingsBtn.hidden = true;
      if (headerFocusBtn) headerFocusBtn.hidden = true;
    }
  }

  // 动态控制底部导航栏的显隐
  const bottomNav = document.querySelector(".bottom-nav");
  if (bottomNav) {
    if (isSubPage) {
      bottomNav.style.display = "none";
    } else {
      bottomNav.style.display = "flex"; 
    }
  }

  // 动态返回按钮逻辑
  if (subBackBtn) {
    subBackBtn.onclick = () => {
      if (currentView === "game") {
        if (typeof stopGameTimer === 'function') stopGameTimer();
        // 如果在答题中或结算中，回大厅；如果本来就在大厅，回更多
        if (!document.getElementById("gamePlayPanel").hidden || !document.getElementById("gameEndPanel").hidden) {
          resetGame();
        } else {
          switchView("more", true);
        }
      } else if (currentView === "tagDetail") {
        switchView("record", true); 
      } else if (currentView === "settings") {
        switchView("mine", true);   
      } else {
        switchView("more", true);   
      }
    };
  }

  // 页面显隐控制
  document.getElementById("recordView").hidden = currentView !== "record";
  document.getElementById("timelineView").hidden = currentView !== "timeline";
  document.getElementById("reviewView").hidden = currentView !== "review";
  document.getElementById("bookView").hidden = currentView !== "book";
  document.getElementById("planView").hidden = currentView !== "plan";
  document.getElementById("moreView").hidden = currentView !== "more";
  document.getElementById("mineView").hidden = currentView !== "mine";
  document.getElementById("shopView").hidden = currentView !== "shop";
  document.getElementById("tagDetailView").hidden = currentView !== "tagDetail";
  document.getElementById("settingsView").hidden = currentView !== "settings"; 
  document.getElementById("gameView").hidden = currentView !== "game"; 

  // 底部导航栏高亮
  document.querySelectorAll(".nav-item").forEach((item) => {
    const view = item.dataset.view;
    const isMoreSub = ["review", "book", "shop", "game"].includes(currentView); // 【加上 "game"】
    const isMineSub = ["settings"].includes(currentView);
    
    if (view === "more" && isMoreSub) {
      item.classList.add("active"); 
    } else if (view === "mine" && isMineSub) {
      item.classList.add("active");
    } else if (view === "record" && currentView === "tagDetail") {
      item.classList.add("active");
    } else {
      item.classList.toggle("active", view === currentView);
    }
  });

  // 动态替换图标
  const camLabel = document.getElementById("cameraBtnLabel");
  if (camLabel) camLabel.innerHTML = getIcon('camera') + ' 添加图片';

  const genCardBtn = document.getElementById("generateCardBtn");
  if (genCardBtn) genCardBtn.innerHTML = getIcon('card') + ' 生成分享卡片';

  // 路由渲染分发
  if (currentView === "record") { renderTagBar(); renderList(); } 
  else if (currentView === "timeline") { renderTimeline(); } 
  else if (currentView === "review") { renderReview(); } 
  else if (currentView === "book") { renderBookView(); } 
  else if (currentView === "plan") { renderPlanView(); } 
  else if (currentView === "shop") { renderShop(); } 
  else if (currentView === "tagDetail") { renderTagDetailView(); } 
  else if (currentView === "settings") {
    const select = document.getElementById("defaultViewSelect");
    if (select) select.value = localStorage.getItem("mini-default-view") || "record";
  }
  else if (currentView === "mine") { renderMineView(); } // 【修复2】补上“我的”页面的渲染调用
}

function switchView(viewName, isBack = false) {
  const oldView = currentView;
  if (oldView === viewName) return;
  
  currentView = viewName;
  render();

  const mainViews = ["record", "timeline", "plan", "more", "mine"];
  const isOldMain = mainViews.includes(oldView);
  const isNewMain = mainViews.includes(viewName);

  let animClass = "";

  if (isBack) {
    animClass = "anim-slide-left"; 
  } else if (isOldMain && isNewMain) {
    animClass = "anim-fade-soft"; 
  } else {
    animClass = "anim-slide-right"; 
  }

  const targetId = viewName === "tagDetail" ? "tagDetailView" : viewName + "View";
  const activeSection = document.getElementById(targetId);
  
  if (activeSection) {
    activeSection.classList.remove("anim-fade-soft", "anim-slide-right", "anim-slide-left");
    void activeSection.offsetWidth; 
    activeSection.classList.add(animClass);
  }
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
  const milestones = entries.filter((e) => e.isMilestone);

  if (!milestones.length) {
    timelineEl.innerHTML = '<div class="empty">还没有标记大事。去记录页点“标记大事”吧。</div>';
    return;
  }

  // 定义两个排序图标
  const iconDesc = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 16 4 4 4-4"/><path d="M7 4v16"/><path d="M15 4h5l-5 6h5"/><path d="M15 20v-3.5a2.5 2.5 0 0 1 5 0V20"/><path d="M20 18h-5"/></svg>`;
  const iconAsc = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M20 8h-5"/><path d="M15 10V6.5a2.5 2.5 0 0 1 5 0V10"/><path d="M15 14h5l-5 6h5"/></svg>`;
  
  // 根据当前排序状态选择图标
  const currentIcon = timelineSortOrder === "desc" ? iconDesc : iconAsc;

  const groups = {};
  milestones.forEach((e) => {
    const year = e.date.slice(0, 4);
    if (!groups[year]) groups[year] = [];
    groups[year].push(e);
  });
  
  // 年份永远固定倒序
  const years = Object.keys(groups).sort().reverse();

  let html = "";

  years.forEach((year) => {
    const items = groups[year];
    
    // 年份内部事件排序
    items.sort((a, b) => {
      return timelineSortOrder === "desc" 
        ? b.date.localeCompare(a.date) 
        : a.date.localeCompare(b.date);
    });

    const isExpanded = expandedYears.has(year);
    
    html += `
      <div class="year-header" onclick="toggleYear('${year}')">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>${year} 年</span>
          <!-- 排序图标：阻止冒泡，防止触发折叠 -->
          <span onclick="event.stopPropagation(); toggleTimelineSort()" style="color: var(--text-tertiary); cursor: pointer; display: flex; align-items: center; transition: color 0.2s;" onmouseover="this.style.color='var(--text-primary)'" onmouseout="this.style.color='var(--text-tertiary)'">
            ${currentIcon}
          </span>
        </div>
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

// 切换排序逻辑保持不变
function toggleTimelineSort() {
  timelineSortOrder = timelineSortOrder === "desc" ? "asc" : "desc";
  renderTimeline();
}

// 新增：切换排序逻辑
function toggleTimelineSort() {
  timelineSortOrder = timelineSortOrder === "desc" ? "asc" : "desc";
  renderTimeline();
}

function renderItem(e) {
  const hasDetail = !!(e.detail && e.detail.trim());
  
  const milestoneBadge = `
    <span class="badge-toggle ${e.isMilestone ? 'is-milestone' : ''}" 
          onclick="event.stopPropagation(); toggleMilestone('${e.id}')"
          style="display: inline-flex; align-items: center; gap: 6px;">
      ${getIcon('bell')}
      ${e.isMilestone ? '大事' : '标记大事'}
    </span>
  `;

  const detailBadge = hasDetail ? `<span class="badge-detail" style="display:inline-flex;align-items:center; gap:4px;">${getIcon('pencil')} 详情</span>` : '';

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
        <img src="./assets/plane.svg" alt="纸飞机" class="plane-img" style="width: 65px; height: 65px; object-fit: contain;">
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

  const tagEntries = entries.filter(e => (e.tags || []).includes(currentTagDetail));

  if (!tagEntries.length) {
    container.innerHTML = `<div class="empty" style="margin-top: 50px;">这个标签下还没有记录。</div>`;
    return;
  }

  const total = tagEntries.length;
  const sortedAsc = tagEntries.slice().sort((a,b) => a.date.localeCompare(b.date));
  const firstDate = sortedAsc[0].date;

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
    const isExpanded = expandedMonths.has("tag-" + month);
    
    listHtml += `
      <div class="month-header" onclick="toggleTagMonth('${month}')">
        <span>${formatMonth(month)}</span>
        <span class="month-count">${items.length} 条 ${isExpanded ? "▾" : "▸"}</span>
      </div>
    `;
    
    if (isExpanded) {
      listHtml += `<div class="list-container">${items.map(renderItem).join("")}</div>`;
    }
  });

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

function toggleTagMonth(month) {
  const key = "tag-" + month;
  if (expandedMonths.has(key)) expandedMonths.delete(key);
  else expandedMonths.add(key);
  renderTagDetailView();
}

// 渲染“我的”页面
async function renderMineView() {
  document.getElementById("myNickname").innerText = userProfile.nickname;
  document.getElementById("mySignature").innerText = userProfile.signature;
  
  const avatarEl = document.getElementById("myAvatar");
  if (userProfile.avatarId) {
    if (!imageDB.db) await imageDB.init(); // 核心修复：确保数据库已初始化
    const base64 = await imageDB.get(userProfile.avatarId);
    if (base64) {
      avatarEl.src = base64;
      return;
    }
  }
  // 如果没头像或者没取到，用默认小女孩
  avatarEl.src = "./assets/girl-color.png";
}