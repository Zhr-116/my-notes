function render() {
  // 【核心修复】把 hasMoreModules 的定义提前到第一行，解决 TDZ 报错
  const hasMoreModules = appFeatures.shop || appFeatures.game || appFeatures.book || appFeatures.review || appFeatures.capsule || appFeatures.quotes;

  // 安全拦截：如果当前页面所在的模块被关了，强制退回记录页
  if (
    (currentView === 'timeline' && !appFeatures.timeline) ||
    (currentView === 'plan' && !appFeatures.plan) ||
    (currentView === 'shop' && !appFeatures.shop) ||
    (currentView === 'game' && !appFeatures.game) ||
    (currentView === 'book' && !appFeatures.book) ||
    (currentView === 'review' && !appFeatures.review) ||
    ((currentView === 'more') && !hasMoreModules)
  ) {
    currentView = 'record';
  }

  // 字典：需要显示顶部返回按钮和标题的子页面
  const pageTitles = { 'review': '回顾', 'book': '书架', 'shop': '拾光商店', 'tagDetail': '标签档案', 'settings': '应用设置', 'game': '拾光关卡', 'quotes': '拾光摘录', 'ladder': '进阶礼包' };
  const isSubPage = Object.keys(pageTitles).includes(currentView);
  
  const subPageTitle = document.getElementById("subPageTitle");
  const appTitle = document.getElementById("appTitle");
  const subBackBtn = document.getElementById("subBackBtn");
  const headerCheckinBtn = document.getElementById("headerCheckinBtn");
  const headerSettingsBtn = document.getElementById("headerSettingsBtn");
  const headerFocusBtn = document.getElementById("headerFocusBtn");
  const headerTreeHoleBtn = document.getElementById("headerTreeHoleBtn");

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
    if (headerTreeHoleBtn) headerTreeHoleBtn.hidden = true; // 【新增】子页面隐藏树洞
  } else {
    subPageTitle.hidden = true;
    appTitle.hidden = false;
    subBackBtn.hidden = true;
    
    // 主页面动态显示逻辑
    if (currentView === "mine") {
      headerCheckinBtn.hidden = true;
      if (headerSettingsBtn) headerSettingsBtn.hidden = false;
      if (headerFocusBtn) headerFocusBtn.hidden = true;
      if (headerTreeHoleBtn) headerTreeHoleBtn.hidden = true; // 【新增】我的页面隐藏树洞
    } else if (currentView === "plan") {
      // 计划页显示签到和专注闹钟
      headerCheckinBtn.hidden = false;
      if (headerSettingsBtn) headerSettingsBtn.hidden = true;
      if (headerFocusBtn) headerFocusBtn.hidden = false;
      if (headerTreeHoleBtn) headerTreeHoleBtn.hidden = true; // 【新增】计划页隐藏树洞
    } else {
      // 其他主页面（记录、时间轴、更多）
      headerCheckinBtn.hidden = false;
      if (headerSettingsBtn) headerSettingsBtn.hidden = true;
      if (headerFocusBtn) headerFocusBtn.hidden = true;
      
      // 【核心修复】树洞只在“记录”页显示，时间轴和更多页都隐藏
      if (headerTreeHoleBtn) {
        headerTreeHoleBtn.hidden = (currentView !== "record");
      }
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
        if (!document.getElementById("gamePlayPanel").hidden || !document.getElementById("gameEndPanel").hidden) {
          resetGame();
        } else {
          switchView("more", true);
        }
      } else if (currentView === "tagDetail") {
        switchView("record", true); 
      } else if (currentView === "settings") {
        switchView("mine", true);   
      } else if (currentView === "ladder") { // 【新增】拾光阶梯回“我的”
        switchView("mine", true);
      } else if (currentView === "quotes") { // 【新增这行】明确指出摘录回更多
        switchView("more", true);
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
  const addBookBtn = document.getElementById("addBookBtn");
  if (addBookBtn) {
    addBookBtn.style.display = currentView === "book" ? "flex" : "none";
  }
  document.getElementById("planView").hidden = currentView !== "plan";
  document.getElementById("moreView").hidden = currentView !== "more";
  document.getElementById("mineView").hidden = currentView !== "mine";
  document.getElementById("shopView").hidden = currentView !== "shop";
  document.getElementById("tagDetailView").hidden = currentView !== "tagDetail";
  document.getElementById("settingsView").hidden = currentView !== "settings"; 
  document.getElementById("gameView").hidden = currentView !== "game"; 
  document.getElementById("quotesView").hidden = currentView !== "quotes";
  document.getElementById("ladderView").hidden = currentView !== "ladder";

  // ================= 模块定制：动态底部导航 =================
  const navContainer = document.querySelector(".bottom-nav");
  if (navContainer) {
    let navHtml = `
      <div class="nav-item" data-view="record" onclick="switchView('record')">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        <span>记录</span>
      </div>
    `;
    
    if (appFeatures.timeline) {
      navHtml += `
      <div class="nav-item" data-view="timeline" onclick="switchView('timeline')">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span>时间轴</span>
      </div>`;
    }
    
    if (appFeatures.plan) {
      navHtml += `
      <div class="nav-item" data-view="plan" onclick="switchView('plan')">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
        <span>计划</span>
      </div>`;
    }

    if (hasMoreModules) {
      navHtml += `
      <div class="nav-item" data-view="more" onclick="switchView('more')">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        <span>更多</span>
      </div>`;
    }

    navHtml += `
      <div class="nav-item" data-view="mine" onclick="switchView('mine')">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>我的</span>
      </div>
    `;
    
    navContainer.innerHTML = navHtml;
  }

  // 底部导航栏高亮
  document.querySelectorAll(".nav-item").forEach((item) => {
    const view = item.dataset.view;
    const isMoreSub = ["review", "book", "shop", "game"].includes(currentView); 
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
    if (select) {
      // 收集当前开启的可作为启动页的模块
      let optionsHtml = `<option value="record">记录</option>`;
      if (appFeatures.timeline) optionsHtml += `<option value="timeline">时间轴</option>`;
      if (appFeatures.plan) optionsHtml += `<option value="plan">计划倒计时</option>`;
      if (appFeatures.review) optionsHtml += `<option value="review">回顾看板</option>`;
      if (appFeatures.book) optionsHtml += `<option value="book">私人书架</option>`;
      if (appFeatures.game) optionsHtml += `<option value="game">拾光趣问</option>`;
      if (appFeatures.quotes) optionsHtml += `<option value="quotes">拾光摘录</option>`;
      if (appFeatures.shop) optionsHtml += `<option value="shop">拾光商店</option>`;
      optionsHtml += `<option value="mine">我的</option>`;
      
      select.innerHTML = optionsHtml;
      
      // 获取当前保存的默认页，如果它被关闭了，强制回退到 record
      let savedDefault = localStorage.getItem("mini-default-view") || "record";
      let availableValues = Array.from(select.options).map(o => o.value);
      
      if (!availableValues.includes(savedDefault)) {
        savedDefault = "record";
        localStorage.setItem("mini-default-view", "record");
      }
      
      select.value = savedDefault;
    }
  }
  else if (currentView === "mine") { renderMineView(); } 
  // 【新增】动态渲染更多页
  else if (currentView === "more") {
    renderMoreView();
  } else if (currentView === "quotes") { renderQuotesView(); }
  else if (currentView === "ladder") { renderLadderView(); }
  // 同步设置页的勾选状态
  if (document.getElementById("featStory")) document.getElementById("featStory").checked = appFeatures.story;
  if (document.getElementById("featTimeline")) document.getElementById("featTimeline").checked = appFeatures.timeline;
  if (document.getElementById("featPlan")) document.getElementById("featPlan").checked = appFeatures.plan;
  if (document.getElementById("featShop")) document.getElementById("featShop").checked = appFeatures.shop;
  if (document.getElementById("featGame")) document.getElementById("featGame").checked = appFeatures.game;
  if (document.getElementById("featBook")) document.getElementById("featBook").checked = appFeatures.book;
  if (document.getElementById("featReview")) document.getElementById("featReview").checked = appFeatures.review;
  if (document.getElementById("featCapsule")) document.getElementById("featCapsule").checked = appFeatures.capsule;
  if (document.getElementById("featQuotes")) document.getElementById("featQuotes").checked = appFeatures.quotes;
}

// 动态渲染“更多”页面
function renderMoreView() {
  const grid = document.querySelector("#moreView .more-grid");
  if (!grid) return;

  let html = "";

  // 回顾看板
  if (appFeatures.review) {
    html += `
      <div class="more-card" onclick="switchView('review')">
        <span class="more-icon" style="color: var(--text-primary);">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
        </span>
        <span>回顾看板</span>
      </div>`;
  }

  // 私人书架
  if (appFeatures.book) {
    html += `
      <div class="more-card" onclick="switchView('book')">
        <span class="more-icon" style="color: var(--text-primary);">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v16"/><path d="M16 13h2"/><path d="M16 9h2"/><path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z"/><path d="M6 13h2"/><path d="M6 9h2"/></svg>
        </span>
        <span>私人书架</span>
      </div>`;
  }

  // 拾光商店
  if (appFeatures.shop) {
    html += `
      <div class="more-card" onclick="switchView('shop')">
        <span class="more-icon" style="color: var(--text-primary);">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 10a4 4 0 0 1-8 0"/><path d="M3.103 6.034h17.794"/><path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z"/></svg>
        </span>
        <span>拾光商店</span>
      </div>`;
  }

  // 拾光趣问
  if (appFeatures.game) {
    html += `
      <div class="more-card" onclick="switchView('game')">
        <span class="more-icon" style="color: var(--text-primary);">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="6" x2="10" y1="11" y2="11"/><line x1="8" x2="8" y1="9" y2="13"/><line x1="15" x2="15.01" y1="12" y2="12"/><line x1="18" x2="18.01" y1="10" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/></svg>
        </span>
        <span>拾光趣问</span>
      </div>`;
  }

  // 拾光摘录
  if (appFeatures.quotes) {
    html += `
      <div class="more-card" onclick="switchView('quotes')">
        <span class="more-icon" style="color: var(--text-primary);">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
        </span>
        <span>拾光摘录</span>
      </div>`;
  }

  // 时间胶囊
  if (appFeatures.capsule) {
    html += `
      <div class="more-card" onclick="openCapsuleModal()">
        <span class="more-icon" style="color: var(--text-primary);">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15.363 17.634a2 2 0 00-.506.854l-.837 2.87a.5.5 0 00.62.62l2.87-.837a2 2 0 00.854-.506l3.013-3.009a1 1 0 10-3.004-3.004z"/><path d="M22 10.38V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2h6.25"/><path d="m22 7-8.991 5.727a2 2 0 01-2.009 0L2 7"/></svg>
        </span>
        <span>时间胶囊</span>
      </div>`;
  }

  // 如果全关了，给个提示
  if (html === "") {
    html = `<div class="empty" style="grid-column: 1/-1;">没有开启任何模块哦，去“我的-设置”里开启吧。</div>`;
  }

  grid.innerHTML = html;
  // 渲染“我的”页面时，同步主题按钮的高亮
  if (typeof updateThemeUI === 'function') {
    updateThemeUI();
  }
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
  if (typeof updateTitle === 'function') updateTitle(); 
  const titleEl = document.getElementById("myTitle");
  if (titleEl && userProfile.title) {
    titleEl.innerText = userProfile.title;
    // 【核心修复】合并两个池子去找颜色
    const allTitles = [...TITLE_POOL, ...MONTH_TITLES];
    const titleData = allTitles.find(t => t.name === userProfile.title) || TITLE_POOL[0];
    titleEl.style.setProperty('--title-color', titleData.color);
  }
  document.getElementById("myNickname").innerText = userProfile.nickname;
  document.getElementById("mySignature").innerText = userProfile.signature;
  
  const avatarEl = document.getElementById("myAvatar");
  const frameEl = document.getElementById("myAvatarFrame");

  // 1. 强制等待数据库就绪
  if (!imageDB.db) {
    await imageDB.init();
  }

  // 2. 严格加载头像
  if (avatarEl) {
    if (userProfile.avatarId) {
      try {
        const base64 = await imageDB.get(userProfile.avatarId);
        if (base64) {
          avatarEl.src = base64;
        } else {
          // 如果数据库里找不到，才用默认
          avatarEl.src = "./assets/girl-color.png"; 
        }
      } catch (err) {
        console.error("头像加载失败", err);
        avatarEl.src = "./assets/girl-color.png";
      }
    } else {
      avatarEl.src = "./assets/girl-color.png";
    }
  }

  // 【修复】渲染头像框（支持单独缩放）
  if (frameEl) {
    const currentFrame = FRAME_POOL.find(f => f.id === userProfile.frameId);
    if (currentFrame) {
      // 如果没有写 scale，默认就是 1
      const scaleVal = currentFrame.scale || 1;
      
      if (currentFrame.svg) {
        frameEl.innerHTML = `<div style="width: 100%; height: 100%; transform: scale(${scaleVal});">${currentFrame.svg}</div>`;
        frameEl.style.display = "block";
      } else if (currentFrame.img) {
        frameEl.innerHTML = `<img src="${currentFrame.img}" style="width: 100%; height: 100%; object-fit: contain; transform: scale(${scaleVal});">`;
        frameEl.style.display = "block";
      } else {
        frameEl.innerHTML = "";
        frameEl.style.display = "none";
      }
    } else {
      frameEl.innerHTML = "";
      frameEl.style.display = "none";
    }
  }

  // 动态控制抽屉显隐
  const mineCapsule = document.getElementById("mineCapsule");
  const mineQuotes = document.getElementById("mineQuotes");
  if (mineCapsule) mineCapsule.style.display = appFeatures.capsule ? "flex" : "none";
}

function renderQuotesView() {
  const list = document.getElementById("quotesList");
  if (!list) return;

  if (quotes.length === 0) {
    list.innerHTML = `<div class="empty" style="padding: 40px 0;">这里空空如也，去拾起第一句打动你的话吧。</div>`;
    return;
  }

  list.innerHTML = quotes.map(q => `
    <div class="quote-card">
      <button class="quote-card-delete" onclick="deleteQuote('${q.id}', event)">×</button>
      <div class="quote-card-content">“ ${q.content} ”</div>
      <div class="quote-card-source">—— ${q.source || '未知出处'}</div>
    </div>
  `).join("");
}