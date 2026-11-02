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

// ================= 模块定制中心配置 =================
let defaultFeatures = {
  timeline: true,  // 时间轴
  plan: true,      // 计划页（含待办、习惯、专注钟）
  shop: true,      // 拾光商店（在更多里）
  game: true,      // 拾光趣问（在更多里）
  book: true,      // 书架（在更多里）
  review: true,    // 回顾（在更多里）
  capsule: true,   // 时间胶囊（在更多里）
  checkin: true,   // 首页右上角签到
  story: true,      // 剧情小女孩
  quotes: true
};

let savedFeatures = JSON.parse(localStorage.getItem("mini-features") || "{}");
let appFeatures = Object.assign({}, defaultFeatures, savedFeatures);
function saveFeatures() {
  localStorage.setItem("mini-features", JSON.stringify(appFeatures));
}

// === 拾光摘录数据 ===
let quotes = JSON.parse(localStorage.getItem("mini-quotes") || "[]");
function saveQuotes() {
  localStorage.setItem("mini-quotes", JSON.stringify(quotes));
}

// === 头像框数据 ===
const FRAME_POOL = [
  { id: "none", name: "无边框" },
  { id: "moon", name: "星月夜", img: "./assets/frames/frame_moon.png", scale: 1.1 }, // 确保你的图片叫这个
  { id: "flower", name: "水彩花环", img: "./assets/frames/frame_flower.png" },
  { id: "tape", name: "碎花胶带", img: "./assets/frames/frame_tape.png" },
  { id: "f_07", name: "水墨", img: "./assets/frames/frame_07.png" },
  { id: "f_08", name: "多彩斑点", img: "./assets/frames/frame_08.png", scale: 1.3 },
  { id: "f_09", name: "画框", img: "./assets/frames/frame_09.png" },
  { id: "f_10", name: "藤曼", img: "./assets/frames/frame_10.png" },
  { id: "f_11", name: "云中月", img: "./assets/frames/frame_11.png", scale: 1.3 },
  { id: "f_12", name: "蝴蝶", img: "./assets/frames/frame_12.png" },
  { id: "f_13", name: "春", img: "./assets/frames/frame_13.png", scale: 1.1 },
  { id: "f_14", name: "star", img: "./assets/frames/frame_14.png" }
];

// 确保 userProfile 里有 frameId（如果没有，默认无边框）
if (!userProfile.frameId) {
  userProfile.frameId = "none";
  saveProfile();
}

// ================= 通用道具（补签卡）系统 =================

// 读取背包库存（默认 0 张卡）
let inventory = JSON.parse(localStorage.getItem("mini-inventory") || '{"replenishCard": 0}');
function saveInventory() {
  localStorage.setItem("mini-inventory", JSON.stringify(inventory));
}

// 核心算法：动态计算补签卡的当前价格
function getReplenishPrice() {
  const lastBuy = localStorage.getItem("mini-last-replenish-date");
  if (!lastBuy) return 200; // 从来没买过，原价 200
  
  const daysSinceLastBuy = (Date.now() - parseInt(lastBuy)) / (1000 * 60 * 60 * 24);
  
  // 借用 review.js 的连续打卡计算（如果没有这个函数，默认算 0）
  let currentStreak = 0;
  if (typeof calculateStreak === 'function') {
    currentStreak = calculateStreak(entries);
  }
  
  // 【冷却惩罚】7 天内买过，且连续打卡没达到 7 天，价格暴涨到 800
  if (daysSinceLastBuy < 7 && currentStreak < 7) {
    return 800; 
  }
  
  return 200; // 冷却结束或达成连签，恢复原价
}

// ================= 称号系统 =================
const TITLE_POOL = [
  // 莫兰迪色系荧光笔，透明度经过精细调校
  { id: "t1", name: "拾光萌新", req: 0, color: "rgba(167, 243, 208, 0.65)" },   // 初春嫩芽绿
  { id: "t2", name: "时间旅人", req: 10, color: "rgba(191, 219, 254, 0.7)" },   // 晴空浅蓝
  { id: "t3", name: "深夜造梦师", req: 30, color: "rgba(233, 213, 255, 0.7)" }, // 梦幻香芋紫
  { id: "t4", name: "岁月拾荒者", req: 100, color: "rgba(253, 230, 138, 0.65)" }, // 落日鹅黄
  { id: "t5", name: "不朽的史诗", req: 365, color: "rgba(254, 205, 211, 0.75)" }  // 古典玫瑰粉
];

// 确保 userProfile 有 title 字段
if (!userProfile.title) {
  userProfile.title = "拾光萌新";
  saveProfile();
}

// 获取当前应该解锁的最高称号（根据记录天数）
function updateTitle() {
  const uniqueDays = new Set(entries.map(e => e.date)).size;
  let maxTitle = TITLE_POOL[0].name;
  for (let t of TITLE_POOL) {
    if (uniqueDays >= t.req) maxTitle = t.name;
  }
  // 自动升级称号
  if (userProfile.title === "拾光萌新" || userProfile.title === maxTitle) {
    userProfile.title = maxTitle;
    saveProfile();
  }
}