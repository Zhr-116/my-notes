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

function addStars(amount, silent = false, bypassLimit = false) {
  // 1. 如果是礼包发放，直接无视上限加
  if (bypassLimit) {
    userStars += amount;
    localStorage.setItem("mini-stars", userStars.toString());
    if (!silent) showToast(`${STAR_ICON} 获得 ${amount} 星迹！`);
    return;
  }

  const today = todayStr();
  let dailyData = JSON.parse(localStorage.getItem("mini-daily-stars") || '{"date":"", "count":0}');
  
  if (dailyData.date !== today) {
    dailyData = { date: today, count: 0 };
  }

  let remaining = DAILY_STAR_LIMIT - dailyData.count;
  
  // 2. 如果达到上限
  if (remaining <= 0) {
    // 【核心修复】如果当前没有静默，且今天还没提示过上限
    if (!silent) {
      if (localStorage.getItem("mini-limit-toast-date") !== today) {
        showToast(`今日星迹获取已达上限（${DAILY_STAR_LIMIT}）`);
        localStorage.setItem("mini-limit-toast-date", today); // 标记今天提示过了
      }
    }
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
// 常规称号池（靠累计记录天数解锁）
const TITLE_POOL = [
  { id: "t1", name: "拾光萌新", req: 0, color: "rgba(167, 243, 208, 0.65)" },   
  { id: "t2", name: "时间旅人", req: 30, color: "rgba(191, 219, 254, 0.7)" },   // 提高到30天
  { id: "t3", name: "深夜造梦师", req: 100, color: "rgba(233, 213, 255, 0.7)" }, // 提高到100天
  { id: "t4", name: "岁月拾荒者", req: 365, color: "rgba(253, 230, 138, 0.65)" }, 
  { id: "t5", name: "不朽的史诗", req: 1000, color: "rgba(254, 205, 211, 0.75)" } // 终身成就
];

// 确保 userProfile 有 title 字段
if (!userProfile.title) {
  userProfile.title = "拾光萌新";
  saveProfile();
}

// 记录用户已经解锁的称号池（默认只有第一个“拾光萌新”）
let unlockedTitles = JSON.parse(localStorage.getItem("mini-unlocked-titles") || '["拾光萌新"]');

// 保存解锁池（后续发奖时调用这个函数）
function saveUnlockedTitles() {
  localStorage.setItem("mini-unlocked-titles", JSON.stringify(unlockedTitles));
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

// ================= 进阶礼包系统 =================

// 定义连签奖励节点（后续可以改数值）
const CHECKIN_REWARDS = [
  { day: 3, stars: 30, desc: "30星迹" },
  { day: 7, stars: 70, card: 1, desc: "70星迹 + 1补签卡" },
  { day: 15, stars: 150, theme: "sakura", desc: "150星迹 + 樱花粉主题" },
  { day: 30, stars: 200, card: 1, ticket: 1, desc: "200星迹 + 1补签卡 + 1兑换券" }
];

// 存储用户在这些节点上的领取状态（为了兼容周期轮回，存数组）
let claimedRewards = JSON.parse(localStorage.getItem("mini-claimed-rewards") || '{"checkin": [], "habit": []}');
function saveClaimedRewards() {
  localStorage.setItem("mini-claimed-rewards", JSON.stringify(claimedRewards));
}

// 计算当前连签天数（基于之前的 checkins 数据）
function calcCurrentCheckinStreak() {
  const checkins = getCheckins();
  if (!checkins.length) return 0;
  
  // 去重并倒序
  const dates = [...new Set(checkins.map(c => c.date))].sort().reverse();
  let streak = 0;
  let today = new Date();
  today.setHours(0,0,0,0);
  
  for (let i = 0; i < dates.length; i++) {
    const d = new Date(dates[i]);
    d.setHours(0,0,0,0);
    const diffDays = Math.floor((today - d) / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak) {
      streak++;
    } else if (diffDays > streak) {
      break; // 断签了
    }
  }
  return streak;
}

// ================= 习惯打卡阶梯系统 =================
// 习惯打卡奖励（21天的称号改名为：星轨漫步者）
const HABIT_REWARDS = [
  { day: 3, stars: 60, desc: "60 星迹" },
  { day: 7, stars: 140, card: 1, desc: "140 星迹 + 1 补签卡" },
  { day: 21, stars: 200, title: "星轨漫步者", desc: "200 星迹 + 专属称号" },
  { day: 50, stars: 300, theme: "matcha", desc: "300 星迹 + 抹茶绿主题" }
];

// 【新增】检查并自动解锁常规称号（在渲染主页时调用）
function checkAndUnlockTitles() {
  const uniqueDays = new Set(entries.map(e => e.date)).size;
  let newUnlock = false;
  
  TITLE_POOL.forEach(t => {
    if (uniqueDays >= t.req && !unlockedTitles.includes(t.name)) {
      unlockedTitles.push(t.name);
      newUnlock = true;
    }
  });
  
  if (newUnlock) {
    saveUnlockedTitles();
  }
}

// 记录习惯打卡的连续天数状态
let habitStreak = JSON.parse(localStorage.getItem("mini-habit-streak") || '{"current": 0, "lastDate": ""}');
function saveHabitStreak() {
  localStorage.setItem("mini-habit-streak", JSON.stringify(habitStreak));
}

// ================= 十二月份专属称号 =================
const MONTH_TITLES = [
  { id: "m1", name: "岁首拾光者", color: "rgba(191, 219, 254, 0.65)" }, // 1月：岁首，拾起新一年的光
  { id: "m2", name: "迎春记录人", color: "rgba(167, 243, 208, 0.65)" }, // 2月：早春，记录复苏
  { id: "m3", name: "寻芳拾翠客", color: "rgba(254, 205, 211, 0.75)" }, // 3月：春花初绽，寻芳之人
  { id: "m4", name: "听雨观花人", color: "rgba(233, 213, 255, 0.7)" },  // 4月：清明谷雨，听雨赏花
  { id: "m5", name: "初夏观云客", color: "rgba(253, 230, 138, 0.65)" }, // 5月：榴花似火，静观流云
  { id: "m6", name: "听蝉记录官", color: "rgba(165, 243, 252, 0.65)" }, // 6月：蝉鸣荷月，记录夏日
  { id: "m7", name: "流萤寻梦人", color: "rgba(253, 224, 71, 0.65)" },  // 7月：盛夏流萤，追寻梦境
  { id: "m8", name: "望秋折桂客", color: "rgba(253, 186, 116, 0.7)" },  // 8月：立秋桂香，折桂之人
  { id: "m9", name: "秋分拾荒者", color: "rgba(252, 165, 165, 0.7)" },  // 9月：深秋落叶，拾起回忆
  { id: "m10", name: "霜降寻迹人", color: "rgba(251, 113, 133, 0.65)" },// 10月：霜染红叶，寻找岁月痕迹
  { id: "m11", name: "立冬听雪客", color: "rgba(209, 213, 219, 0.8)" }, // 11月：初冬微寒，静听雪落
  { id: "m12", name: "岁暮守夜人", color: "rgba(239, 68, 68, 0.6)" }    // 12月：岁暮天寒，守着这一年的记忆
];

// 记录每一轨的轮次起始天数（用于防漏领重置）
let ladderRoundStart = JSON.parse(localStorage.getItem("mini-ladder-start") || '{"checkin": 0, "habit": 0}');
function saveLadderRoundStart() {
  localStorage.setItem("mini-ladder-start", JSON.stringify(ladderRoundStart));
}