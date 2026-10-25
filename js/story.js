let storyTypingTimer = null;
let isStoryTyping = false;
let currentStoryText = "";
let storyCloseCallback = null;

// ================= 台词库 =================
const STORY_LINES = {
  first_entry: "终于见面了。我是拾迹，以后你的每一次心动，我都会帮你收好。",
  fifty_entries: "五十段时光了。看着这些密密麻麻的字，我发现你已经把这里当成了一个真正的家。",
  hundred_entries: "一百次了。你已经走出了很长的一段路，回头看，都是闪闪发光的脚印。",
  night_owl: "这么晚还没睡吗？夜深了，心里的声音会被放大。写下来，就去好好睡一觉吧。",
  early_bird: "早安。连太阳都还没完全醒，你一定是今天最先抓住微光的人。",
  all_tasks_done: "叮！任务清零。今天辛苦啦，去喝杯水，或者奖励自己看一集剧吧。",
  first_delete: "删掉不想要的回忆，也是整理时间的一种方式。别难过，我会一直在。",
  first_draw: "原来你也喜欢这种未知的惊喜。希望这枚小小的徽章，能成为你今天的点缀。",
  first_book: "恭喜你，又走过了一个人的一生。你把灵魂的碎片留在了书架上，我都替你收好了。",
  sad_comfort: "如果觉得累了，就停下来休息一下吧。允许自己偶尔脱轨，拾迹会在这里接住你。"
};

// ================= 播放与交互逻辑 =================
function playStory(storyIdOrText, onComplete = null) {
  // 如果传入的是 ID，就从库里取台词
  const text = STORY_LINES[storyIdOrText] || storyIdOrText;
  
  const overlay = document.getElementById("storyOverlay");
  const textEl = document.getElementById("storyText");
  const hintEl = document.getElementById("storyContinue");
  
  overlay.style.display = "flex";
  overlay.offsetHeight; 
  overlay.classList.add("show");
  
  currentStoryText = text;
  storyCloseCallback = onComplete;
  
  textEl.innerText = "";
  hintEl.classList.remove("show");
  isStoryTyping = true;
  
  let charIndex = 0;
  clearInterval(storyTypingTimer);
  
  storyTypingTimer = setInterval(() => {
    if (charIndex < text.length) {
      textEl.innerText += text.charAt(charIndex);
      charIndex++;
    } else {
      clearInterval(storyTypingTimer);
      isStoryTyping = false;
      hintEl.classList.add("show"); 
    }
  }, 60); 
}

function handleStoryClick() {
  const textEl = document.getElementById("storyText");
  const hintEl = document.getElementById("storyContinue");
  
  if (isStoryTyping) {
    clearInterval(storyTypingTimer);
    textEl.innerText = currentStoryText;
    isStoryTyping = false;
    hintEl.classList.add("show");
  } else {
    const overlay = document.getElementById("storyOverlay");
    overlay.classList.remove("show");
    setTimeout(() => {
      overlay.style.display = "none";
      if (storyCloseCallback) storyCloseCallback();
    }, 400); 
  }
}

// ================= 核心：剧情触发引擎 =================
// 我们增加了一个 actionType，用来区分是“保存记录”还是“完成任务”等
function checkStoryTrigger(actionType, extraData = {}) {
  // 获取已看过的剧情
  let viewedStories = JSON.parse(localStorage.getItem("mini-viewed-stories") || "[]");
  
  // 定义一个内部函数，用来播放并记录
  const trigger = (storyId) => {
    if (!viewedStories.includes(storyId)) {
      // 延迟 500ms 播放，给前面的 UI 渲染留出时间
      setTimeout(() => {
        playStory(storyId, () => {
          viewedStories.push(storyId);
          localStorage.setItem("mini-viewed-stories", JSON.stringify(viewedStories));
        });
      }, 500);
      return true; // 表示触发了
    }
    return false;
  };

  const totalEntries = entries.length;
  const hour = new Date().getHours();

  // 1. 记录相关的触发
  if (actionType === "save_entry") {
    if (trigger("first_entry")) return;
    if (totalEntries === 50) { if(trigger("fifty_entries")) return; }
    if (totalEntries === 100) { if(trigger("hundred_entries")) return; }
    
    // 深夜与清晨
    if (hour >= 0 && hour <= 4) { if(trigger("night_owl")) return; }
    if (hour >= 5 && hour <= 7) { if(trigger("early_bird")) return; }

    // 情绪词检测
    if (extraData.content) {
      const sadWords = ["累", "难过", "焦虑", "烦", "哭"];
      if (sadWords.some(word => extraData.content.includes(word))) {
        if(trigger("sad_comfort")) return;
      }
    }
  }

  // 2. 任务全部完成
  if (actionType === "all_tasks_done") {
    if(trigger("all_tasks_done")) return;
  }

  // 3. 第一次删除记录
  if (actionType === "delete_entry") {
    if(trigger("first_delete")) return;
  }

  // 4. 第一次抽盲盒
  if (actionType === "draw_box") {
    if(trigger("first_draw")) return;
  }

  // 5. 第一本书读完
  if (actionType === "read_book") {
    if(trigger("first_book")) return;
  }
}