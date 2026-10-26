function renderReview() {
  const container = document.getElementById("reviewContent");
  
  if (entries.length === 0) {
    container.innerHTML = '<div class="empty">还没有数据，快去记录吧。</div>';
    return;
  }

  // 1. 计算核心数据
  const uniqueDays = new Set(entries.map(e => e.date)).size;
  const milestoneCount = entries.filter(e => e.isMilestone).length;
  const streak = calculateStreak(entries);

  // 2. 生成 HTML
  let html = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-num">${uniqueDays}</div>
        <div class="stat-label">记录天数</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${milestoneCount}</div>
        <div class="stat-label">标记大事</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${streak}</div>
        <div class="stat-label">连续记录(天)</div>
      </div>
    </div>

    <div class="heatmap-section">
      <h3 class="section-title">近期足迹</h3>
      <div class="heatmap-wrapper">
        <div class="heatmap-grid" id="heatmapGrid"></div>
        <div class="heatmap-legend">
          <span>少</span>
          <div class="legend-box level-0"></div>
          <div class="legend-box level-1"></div>
          <div class="legend-box level-2"></div>
          <div class="legend-box level-3"></div>
          <span>多</span>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
  drawHeatmap();

  // 在原本的统计和热力图下面，加上 11 和魔狗的对峙彩蛋
  html += `
    <div class="easter-egg-container">
      <!-- 左侧：11 和她的台词 -->
      <div class="character-left">
        <div class="speech-bubble">
          “ Friends don't lie. ”
        </div>
        <img src="./assets/eleven.svg" alt="11" class="eleven-img">
      </div>
      
      <!-- 右侧：虎视眈眈的魔狗 -->
      <div class="character-right">
        <img src="./assets/demogorgon.svg" alt="Demogorgon" class="demo-img">
      </div>
    </div>
  `;

  // 在 container.innerHTML = ... 的末尾，加上这个入口
  html += `
    <div class="annual-report-entry" onclick="openAnnualReport()" style="margin-top: 30px; margin-bottom: 40px; background: linear-gradient(135deg, #1f2937 0%, #111827 100%); border-radius: 16px; padding: 24px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; box-shadow: 0 10px 20px rgba(0,0,0,0.2);">
      <div>
        <h3 style="color: #fff; margin: 0 0 6px 0; font-size: 18px;">🎬 开启年度报告</h3>
        <p style="color: #9ca3af; margin: 0; font-size: 13px;">看看这一年，你留下了什么痕迹。</p>
      </div>
      <span style="color: #fff; font-size: 20px;">▸</span>
    </div>
  `;

  container.innerHTML = html;
  drawHeatmap();
}

// 计算连续打卡天数
function calculateStreak(entries) {
  const dates = [...new Set(entries.map(e => e.date))].sort().reverse();
  if (dates.length === 0) return 0;
  
  let streak = 1;
  let today = new Date(todayStr());
  let lastDate = new Date(dates[0]);
  
  const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
  if (diffDays > 1) return 0;
  
  for (let i = 1; i < dates.length; i++) {
    let current = new Date(dates[i-1]);
    let prev = new Date(dates[i]);
    const diff = Math.floor((current - prev) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      streak++;
    } else if (diff > 1) {
      break;
    }
  }
  return streak;
}

// 绘制热力图（最近 120 天）
function drawHeatmap() {
  const grid = document.getElementById("heatmapGrid");
  const days = 120;
  const today = new Date();
  const todayFormatted = todayStr(); // 获取今天的日期字符串
  
  // 统计每天的记录数
  const countMap = {};
  entries.forEach(e => {
    countMap[e.date] = (countMap[e.date] || 0) + 1;
  });

  let html = "";
  let startDate = new Date(today);
  startDate.setDate(today.getDate() - days + 1);

  for (let i = 0; i < days; i++) {
    let d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    
    // 手动格式化日期，避免时区偏差
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${day}`;
    
    const count = countMap[dateStr] || 0;
    
    let level = 0;
    if (count > 0) level = 1;
    if (count > 2) level = 2;
    if (count > 4) level = 3;

    // 如果是今天，加一个 today 类名用于高亮
    const isToday = dateStr === todayFormatted ? "today" : "";

    html += `<div class="heat-cell level-${level} ${isToday}" title="${dateStr}: ${count}条"></div>`;
  }
  grid.innerHTML = html;
}