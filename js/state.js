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
function saveCountdowns() { localStorage.setItem("mini-countdowns", JSON.stringify(countdowns)); }

// === 拾光商店数据 ===
let userStars = parseInt(localStorage.getItem("mini-stars") || "0"); 
let unlockedBadges = JSON.parse(localStorage.getItem("mini-badges") || "[]"); 

// 每日星迹上限设定（50星迹）
const DAILY_STAR_LIMIT = 50;

function addStars(amount) {
  const today = todayStr();
  // 获取今天已经获得的星迹记录
  let dailyData = JSON.parse(localStorage.getItem("mini-daily-stars") || '{"date":"", "count":0}');
  
  // 如果跨天了，重置今日获取量
  if (dailyData.date !== today) {
    dailyData = { date: today, count: 0 };
  }

  // 计算还能获得多少
  let remaining = DAILY_STAR_LIMIT - dailyData.count;
  
  // 如果今天已经拿满了
  if (remaining <= 0) {
    showToast(`今日星迹已达上限（${DAILY_STAR_LIMIT}），明天再来吧！`);
    return; 
  }

  // 实际增加的星迹（不能超过上限）
  let actualAmount = Math.min(amount, remaining);
  
  userStars += actualAmount;
  dailyData.count += actualAmount;

  // 保存数据
  localStorage.setItem("mini-stars", userStars.toString());
  localStorage.setItem("mini-daily-stars", JSON.stringify(dailyData));
  
  showToast(`${STAR_ICON} 获得 ${actualAmount} 星迹！`);
}