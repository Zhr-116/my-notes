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

  // 2. 计算“专属时间人格”
  let timePersonality = "随性的记录者";
  if (entries.length > 3) {
    const hourCounts = new Array(24).fill(0);
    entries.forEach(e => {
      if (e.createdAt) {
        const hour = new Date(e.createdAt).getHours();
        hourCounts[hour]++;
      }
    });
    const maxHour = hourCounts.indexOf(Math.max(...hourCounts));
    
    if (maxHour >= 0 && maxHour <= 5) { timePersonality = "深夜的造梦师"; }
    else if (maxHour >= 6 && maxHour <= 9) { timePersonality = "清晨的拾光者"; }
    else if (maxHour >= 10 && maxHour <= 13) { timePersonality = "正午的向日葵"; }
    else if (maxHour >= 14 && maxHour <= 17) { timePersonality = "午后的品茶人"; }
    else if (maxHour >= 18 && maxHour <= 21) { timePersonality = "黄昏的拾荒者"; }
    else { timePersonality = "星夜的晚风"; }
  }

  // 3. 拼装完整 HTML
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

    <!-- 近期足迹（热力图） -->
    <div class="heatmap-section" style="margin-top: 30px;">
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

    <!-- 时间人格：像手账末尾的斜体签名 -->
    <div style="text-align: right; font-size: 14px; color: var(--text-secondary); font-family: 'Kaiti', serif; font-style: italic; margin-top: 15px; margin-bottom: 40px; padding-right: 10px;">
      —— ${timePersonality}
    </div>

    <!-- 彩蛋保留 -->
    <div class="easter-egg-container">
      <div class="character-left">
        <div class="speech-bubble">
          “ Friends don't lie. ”
        </div>
        <img src="./assets/eleven.svg" alt="11" class="eleven-img">
      </div>
      <div class="character-right">
        <img src="./assets/demogorgon.svg" alt="Demogorgon" class="demo-img">
      </div>
    </div>
  `;

  container.innerHTML = html;
  drawHeatmap();
}

// 计算连续天数
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

// 绘制热力图
function drawHeatmap() {
  const grid = document.getElementById("heatmapGrid");
  if (!grid) return;
  
  const days = 120;
  const today = new Date();
  const todayFormatted = todayStr();
  
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
    
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${day}`;
    
    const count = countMap[dateStr] || 0;
    
    let level = 0;
    if (count > 0) level = 1;
    if (count > 2) level = 2;
    if (count > 4) level = 3;

    const isToday = dateStr === todayFormatted ? "today" : "";

    html += `<div class="heat-cell level-${level} ${isToday}" title="${dateStr}: ${count}条"></div>`;
  }
  grid.innerHTML = html;
}