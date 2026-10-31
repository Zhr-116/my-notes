let timelineSortOrder = "desc"; // "desc" 为最新优先，"asc" 为最早优先
const STORAGE_KEY = "mini-notes-v1";
const DRAFT_KEY = "mini-notes-draft-v1";

let entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let currentView = "record";

let expandedMonths = new Set();
let expandedYears = new Set();
let monthInitialized = false;
let yearInitialized = false;
let searchQuery = "";
let activeTag = "";

let currentModalId = null;

const contentInput = document.getElementById("contentInput");
const dateInput = document.getElementById("dateInput");
const tagsInput = document.getElementById("tagsInput");
const listEl = document.getElementById("list");
const timelineEl = document.getElementById("timeline");
const searchInput = document.getElementById("searchInput");
const tagBar = document.getElementById("tagBar");

function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// === 书籍数据 ===
let books = JSON.parse(localStorage.getItem("mini-books") || "[]");
function saveBooks() {
  localStorage.setItem("mini-books", JSON.stringify(books));
}

// === 计划模块数据 ===
let countdowns = JSON.parse(localStorage.getItem("mini-countdowns") || "[]");
// 记录首页展示的主倒计时 ID
let mainCountdownId = localStorage.getItem("mini-main-countdown-id") || null; 
function saveCountdowns() { localStorage.setItem("mini-countdowns", JSON.stringify(countdowns)); }
// === 计划模块：周期习惯数据 ===
let habits = JSON.parse(localStorage.getItem("mini-habits") || "[]");
function saveHabits() { localStorage.setItem("mini-habits", JSON.stringify(habits)); }

// === 拾光商店数据 ===
let userStars = parseInt(localStorage.getItem("mini-stars") || "0"); 
let unlockedBadges = JSON.parse(localStorage.getItem("mini-badges") || "[]"); 

// === 拾迹卡牌数据 ===
let unlockedCards = JSON.parse(localStorage.getItem("mini-cards") || "[]"); 
function saveCards() { localStorage.setItem("mini-cards", JSON.stringify(unlockedCards)); }

// 每日星迹上限设定（100星迹）
const DAILY_STAR_LIMIT = 100;

function addStars(amount, silent = false) {
  const today = todayStr();
  let dailyData = JSON.parse(localStorage.getItem("mini-daily-stars") || '{"date":"", "count":0}');
  
  if (dailyData.date !== today) {
    dailyData = { date: today, count: 0 };
  }

  let remaining = DAILY_STAR_LIMIT - dailyData.count;
  
  if (remaining <= 0) {
    if (!silent) showToast(`今日星迹已达上限（${DAILY_STAR_LIMIT}），明天再来吧！`);
    return; 
  }

  let actualAmount = Math.min(amount, remaining);
  
  userStars += actualAmount;
  dailyData.count += actualAmount;

  localStorage.setItem("mini-stars", userStars.toString());
  localStorage.setItem("mini-daily-stars", JSON.stringify(dailyData));
  
  if (!silent) showToast(`${STAR_ICON} 获得 ${actualAmount} 星迹！`);
}

// 记录当前查看的标签聚合页名称
let currentTagDetail = "";

// === 个人资料数据 ===
let userProfile = JSON.parse(localStorage.getItem("mini-user-profile") || '{"nickname":"拾迹", "signature":"收集时间的痕迹", "avatarId":""}');
function saveProfile() {
  localStorage.setItem("mini-user-profile", JSON.stringify(userProfile));
}