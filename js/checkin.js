const CALENDAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>`;
let selectedCheckinDate = todayStr();
const QUOTES = [
  "时间不会辜负每一个安静努力的人。",
  "把所有的夜归还给星河，把所有的春光归还给疏疏篱落。",
  "允许自己偶尔脱轨，去吹吹风。",
  "你走过的每一步，都算数。",
  "慢慢来，比较快。",
  "万物皆有裂痕，那是光照进来的地方。",
  "今天也是被生活温柔以待的一天。"
];

const MOOD_SVGS = {
  sun: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
  cloud: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`,
  rain: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`,
  zap: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>`,
  smile: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>`
};

function getCheckins() {
  return JSON.parse(localStorage.getItem("mini-checkins") || "[]");
}

// 只保留这一个 initCheckin
function initCheckin() {
  const today = todayStr();
  const checkins = getCheckins();
  const todayRecord = checkins.find(c => c.date === today);
  const btn = document.getElementById("headerCheckinBtn");

  if (todayRecord) {
    // 渲染心情图标
    btn.innerHTML = MOOD_SVGS[todayRecord.mood] || todayRecord.mood;
    btn.classList.add("has-mood");
    const svg = btn.querySelector('svg');
    if(svg) { svg.style.width = "22px"; svg.style.height = "22px"; }
  } else {
    // 渲染日历图标
    btn.innerHTML = CALENDAR_SVG;
    btn.classList.remove("has-mood");
  }
}

function renderHorizontalCalendar() {
  const container = document.getElementById("horizontalCalendar");
  const today = new Date();
  const checkins = getCheckins();
  let html = "";

  for (let i = -3; i <= 3; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${day}`;
    
    const isToday = dateStr === todayStr() ? "today" : "";
    const isSelected = dateStr === selectedCheckinDate;
    const record = checkins.find(c => c.date === dateStr);
    
    let moodHtml = "";
    if (record) {
      moodHtml = MOOD_SVGS[record.mood] || record.mood;
    } else if (i === -1 || i === -2) {
      moodHtml = `<span style="font-size: 10px; color: var(--accent); font-weight: bold; border: 1px dashed var(--accent); padding: 2px 4px; border-radius: 4px;">补</span>`;
    }

    // 根据状态绑定点击事件
    let clickAction = "";
    if (record) {
      clickAction = `onclick="selectCheckinDate('${dateStr}')"`;
    } else if (i === -1 || i === -2) {
      clickAction = `onclick="handleReplenishCheckin('${dateStr}')"`;
    } else if (dateStr === todayStr()) {
      clickAction = `onclick="selectCheckinDate('${dateStr}')"`;
    }

    // 选中的那天加高亮圈
    const borderStyle = isSelected ? 'border: 2px solid var(--accent); box-shadow: 0 0 8px var(--accent-soft);' : 'border: 1px solid var(--border);';

    html += `
      <div class="calendar-day ${isToday}" ${clickAction} style="cursor: pointer;">
        <div class="cal-day-num">${d.getDate()}</div>
        <div class="cal-day-mood" style="${borderStyle}">${moodHtml}</div>
      </div>
    `;
  }
  container.innerHTML = html;
}

function selectCheckinDate(dateStr) {
  selectedCheckinDate = dateStr;
  renderCheckinView();
}

function openCheckinPage() {
  // 每次打开默认选中今天
  selectedCheckinDate = todayStr();
  renderCheckinView(); 
  
  const overlay = document.getElementById("checkinOverlay");
  overlay.style.display = "flex";
  overlay.offsetHeight;
  overlay.classList.add("show");
}

function renderCheckinView() {
  renderHorizontalCalendar();
  
  const checkins = getCheckins();
  const today = todayStr();
  const record = checkins.find(c => c.date === selectedCheckinDate);
  
  const card = document.getElementById("checkinCard");
  const btnFlip = document.getElementById("btnFlipCard");
  const btnClose = document.getElementById("btnCloseCheckin");

  // 更新卡片数据
  document.getElementById("checkinDateText").innerText = selectedCheckinDate;
  
  if (record) {
    // 有记录：填充数据
    document.getElementById("checkinMoodText").innerHTML = MOOD_SVGS[record.mood] || record.mood;
    const svg = document.getElementById("checkinMoodText").querySelector('svg');
    if(svg) { svg.style.width = "64px"; svg.style.height = "64px"; }
    document.getElementById("checkinQuoteText").innerText = `“${record.quote}”`;
    
    // 翻转展示正面
    card.classList.add("flipped");
    btnFlip.style.display = "none";
    btnClose.style.display = "block";
    
    // 如果选中的不是今天，关闭按钮的文案稍微变一下（或者保持不变，点完直接关闭全屏）
    btnClose.innerText = selectedCheckinDate === today ? "收下这份记忆" : "关闭回忆";
  } else {
    // 无记录
    card.classList.remove("flipped");
    
    if (selectedCheckinDate === today) {
      // 选中的是今天且没签到：显示签到按钮
      btnFlip.style.display = "block";
      btnClose.style.display = "none";
    } else {
      // 选中的是历史某天且没记录：只能关闭
      btnFlip.style.display = "none";
      btnClose.style.display = "block";
      btnClose.innerText = "这一天没有留下痕迹";
    }
  }
}

function closeCheckinPage() {
  const overlay = document.getElementById("checkinOverlay");
  overlay.classList.remove("show");
  setTimeout(() => {
    overlay.style.display = "none";
    initCheckin(); 
  }, 400);
}

function openMoodModal() {
  document.getElementById("moodModal").hidden = false;
}

function closeMoodModal() {
  document.getElementById("moodModal").hidden = true;
}

function submitCheckin(moodKey, moodDesc) {
  closeMoodModal();
  const today = todayStr();
  const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  let checkins = getCheckins();
  checkins = checkins.filter(c => c.date !== today);
  checkins.push({ date: today, mood: moodKey, moodDesc: moodDesc, quote: randomQuote });
  localStorage.setItem("mini-checkins", JSON.stringify(checkins));

  addStars(1); 

  document.getElementById("checkinMoodText").innerHTML = MOOD_SVGS[moodKey];
  const svg = document.getElementById("checkinMoodText").querySelector('svg');
  if(svg) { svg.style.width = "64px"; svg.style.height = "64px"; }

  document.getElementById("checkinQuoteText").innerText = `“${randomQuote}”`;
  document.getElementById("checkinCard").classList.add("flipped");

  document.getElementById("btnFlipCard").style.display = "none";
  document.getElementById("btnCloseCheckin").style.display = "block";
  
  renderHorizontalCalendar(); 
}

// ================= 心情签到补签逻辑 =================

function handleReplenishCheckin(dateStr) {
  // 1. 如果背包里有卡，直接问是否使用
  if (inventory.replenishCard > 0) {
    if (confirm(`是否消耗 1 张【拾光回溯卡】补签 ${dateStr}？`)) {
      useReplenishCheckin(dateStr);
    }
    return;
  }

  // 2. 如果没卡，问是否花钱买
  const price = getReplenishPrice();
  if (userStars < price) {
    alert(`补签需要 ${price} 星迹，但你只有 ${userStars}。快去记录赚星迹吧！`);
    return;
  }

  if (confirm(`你目前没有补签卡。\n是否花费 ${price} 星迹购买一张，并立即补签？`)) {
    userStars -= price;
    localStorage.setItem("mini-stars", userStars.toString());
    localStorage.setItem("mini-last-replenish-date", Date.now().toString());
    
    // 直接买+用
    useReplenishCheckin(dateStr, true);
  }
}

function useReplenishCheckin(dateStr, justBought = false) {
  // 1. 扣除库存（如果是刚刚花星迹直接买的，就跳过扣库存这一步）
  if (!justBought) {
    inventory.replenishCard -= 1;
    saveInventory();
  }

  // 2. 取出所有打卡记录并防重复
  let checkins = getCheckins();
  checkins = checkins.filter(c => c.date !== dateStr);
  
  // 3. 心情盲盒：随机抽一个心情和对应的文案
  const moods = [
    { key: "sun", desc: "充满阳光" },
    { key: "cloud", desc: "平静充实" },
    { key: "rain", desc: "有些低落" },
    { key: "zap", desc: "焦虑烦躁" },
    { key: "smile", desc: "充满期待" }
  ];
  const randomMood = moods[Math.floor(Math.random() * moods.length)];
  const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  // 4. 塞入数据并保存
  checkins.push({ 
    date: dateStr, 
    mood: randomMood.key, 
    moodDesc: randomMood.desc, 
    quote: randomQuote 
  });
  localStorage.setItem("mini-checkins", JSON.stringify(checkins));

  // 5. 【核心刷新逻辑】
  // 将当前选中的日期切换为刚补签的这一天
  selectedCheckinDate = dateStr;
  
  // 重新渲染日历和卡片（卡片会自动翻转并显示新抽到的心情）
  renderCheckinView();
  
  // 刷新主页右上角的签到图标状态（防止补的是今天或影响了其他状态）
  if (typeof initCheckin === 'function') initCheckin();

  if (document.getElementById("shopView") && !document.getElementById("shopView").hidden) {
    if (typeof renderShop === 'function') renderShop();
  }

  // 6. 给出提示
  showToast("时光已拾回");
}

// 查看历史签到的卡牌
function viewPastCheckin(dateStr) {
  const checkins = getCheckins();
  const record = checkins.find(c => c.date === dateStr);
  if (!record) return;

  const card = document.getElementById("checkinCard");
  const btnFlip = document.getElementById("btnFlipCard");
  const btnClose = document.getElementById("btnCloseCheckin");

  // 替换卡牌上的数据
  document.getElementById("checkinDateText").innerText = record.date;
  
  // 还原心情图标（并放大）
  document.getElementById("checkinMoodText").innerHTML = MOOD_SVGS[record.mood] || record.mood;
  const svg = document.getElementById("checkinMoodText").querySelector('svg');
  if(svg) { svg.style.width = "64px"; svg.style.height = "64px"; }

  // 替换鸡汤
  document.getElementById("checkinQuoteText").innerText = `“${record.quote}”`;

  // 翻转卡片
  card.classList.add("flipped");

  // 改变底部按钮的状态
  const today = todayStr();
  if (dateStr === today) {
    // 如果点的是今天，显示正常的关闭按钮
    btnFlip.style.display = "none";
    btnClose.style.display = "block";
    btnClose.innerText = "收下这份记忆";
    btnClose.onclick = closeCheckinPage;
  } else {
    // 如果点的是过去的记录，按钮变成“返回今天”
    btnFlip.style.display = "none";
    btnClose.style.display = "block";
    btnClose.innerText = "返回今日签到";
    btnClose.onclick = () => openCheckinPage(); // 重新打开今天的签到页
  }
}