const CALENDAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>`;

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
    
    const isToday = i === 0 ? "today" : "";
    const record = checkins.find(c => c.date === dateStr);
    const moodHtml = record ? (MOOD_SVGS[record.mood] || record.mood) : "";

    html += `
      <div class="calendar-day ${isToday}">
        <div class="cal-day-num">${d.getDate()}</div>
        <div class="cal-day-mood">${moodHtml}</div>
      </div>
    `;
  }
  container.innerHTML = html;
}

function openCheckinPage() {
  const today = todayStr();
  const checkins = getCheckins();
  const todayRecord = checkins.find(c => c.date === today);
  
  const overlay = document.getElementById("checkinOverlay");
  const card = document.getElementById("checkinCard");
  const btnFlip = document.getElementById("btnFlipCard");
  const btnClose = document.getElementById("btnCloseCheckin");

  document.getElementById("checkinDateText").innerText = today;
  
  if (todayRecord) {
    const moodHtml = MOOD_SVGS[todayRecord.mood] || todayRecord.mood;
    document.getElementById("checkinMoodText").innerHTML = moodHtml;
    document.getElementById("checkinQuoteText").innerText = `“${todayRecord.quote}”`;
    card.classList.add("flipped");
    btnFlip.style.display = "none";
    btnClose.style.display = "block";
  } else {
    card.classList.remove("flipped");
    btnFlip.style.display = "block";
    btnClose.style.display = "none";
  }

  renderHorizontalCalendar(); 

  overlay.style.display = "flex";
  overlay.offsetHeight;
  overlay.classList.add("show");
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