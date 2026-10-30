let focusInterval = null;
let focusEndTime = null;
let starSpawner = null;
let totalFocusMinutes = 25; // 默认时长

function openFocusModal() {
  document.getElementById("focusDurationModal").hidden = false;
}
function closeFocusModal() {
  document.getElementById("focusDurationModal").hidden = true;
}

// 开始专注
function startFocus(minutes) {
  closeFocusModal();
  totalFocusMinutes = minutes;
  
  const overlay = document.getElementById("focusOverlay");
  overlay.style.display = "flex";
  overlay.offsetHeight;
  overlay.classList.add("show");

  // 计算结束的绝对时间戳
  focusEndTime = Date.now() + minutes * 60 * 1000;

  if (focusInterval) cancelAnimationFrame(focusInterval);
  updateFocusTime();
  starSpawner = setInterval(createStar, 300);
}

function updateFocusTime() {
  const now = Date.now();
  const remaining = focusEndTime - now;

  if (remaining <= 0) {
    cancelAnimationFrame(focusInterval);
    clearInterval(starSpawner);
    finishFocus(totalFocusMinutes, false); // 正常完成
    return;
  }

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const timeEl = document.getElementById("focusTime");
  if (timeEl) {
    timeEl.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  
  focusInterval = requestAnimationFrame(updateFocusTime);
}

function createStar() {
  const starField = document.getElementById("starField");
  const star = document.createElement("div");
  star.className = "star";
  star.style.left = `${30 + Math.random() * 40}%`;
  star.style.top = `${40 + Math.random() * 20}%`;
  star.style.animationDuration = `${2 + Math.random() * 2}s`;
  starField.appendChild(star);
  setTimeout(() => star.remove(), 4000);
}

// 按钮触发的结束
function quitFocus() {
  if (confirm("确定要提前结束专注吗？未满一分钟将没有星迹奖励哦。")) {
    cancelAnimationFrame(focusInterval);
    clearInterval(starSpawner);
    
    const remaining = focusEndTime - Date.now();
    const focusedMs = (totalFocusMinutes * 60 * 1000) - remaining;
    const focusedMinutes = Math.floor(focusedMs / 60000);
    
    finishFocus(focusedMinutes, true); // 提前结束
  }
}

// 统一处理结束逻辑
function finishFocus(minutes, isEarlyQuit) {
  const overlay = document.getElementById("focusOverlay");
  overlay.classList.remove("show");
  setTimeout(() => overlay.style.display = "none", 500);
  document.getElementById("starField").innerHTML = "";

  if (minutes <= 0) {
    showToast("本次专注未满 1 分钟，无奖励");
    return;
  }

  const newEntry = {
    id: Date.now().toString(36),
    content: `🌱 专注了 ${minutes} 分钟`,
    date: todayStr(),
    tags: ["专注"],
    isMilestone: false, isPinned: false, detail: "", createdAt: new Date().toISOString()
  };
  entries.push(newEntry);
  saveEntries();
  render();

  const earnedStars = minutes;
  addStars(earnedStars);
  
  setTimeout(() => {
    if (isEarlyQuit) {
      playStory(`虽然提前结束了，但你也专注了 ${minutes} 分钟，获得了 ${earnedStars} 星迹。下次再接再厉！`);
    } else {
      playStory(`太棒啦！你完美专注了 ${minutes} 分钟，星光都为你汇聚了。这是给你的 ${earnedStars} 星迹奖励！`);
    }
  }, 800);
}