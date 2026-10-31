// ================= 拾光趣问逻辑 =================
let gameQuestions = [];
let currentQuestionIndex = 0;
let currentScore = 0;

let currentSubject = 'poem'; // 默认诗词
let currentMode = 'rush'; // 默认限时冲分

let timerInterval = null;
let timeLeft = 60;
let timeElapsed = 0;

const MAX_QUESTIONS = 20; // 限时模式上限
const RELAX_QUESTIONS = 10; // 悠闲模式固定题数

// 选中科目
function selectSubject(el, subject) {
  document.querySelectorAll("#gameStartPanel .tag-chip").forEach(c => c.classList.remove("active"));
  el.classList.add("active");
  currentSubject = subject;
}

// 选中模式
function selectMode(el, mode) {
  document.querySelectorAll(".mode-card").forEach(c => c.classList.remove("active"));
  el.classList.add("active");
  currentMode = mode;
}

// 开始游戏
async function startGame() {
  document.getElementById("gameStartPanel").hidden = true;
  document.getElementById("gamePlayPanel").hidden = false;
  document.getElementById("gameEndPanel").hidden = true;
  document.getElementById("feedbackPanel").hidden = true;
  
  currentQuestionIndex = 0;
  currentScore = 0;
  timeLeft = 60;
  timeElapsed = 0;

  try {
    // 动态读取题库
    const res = await fetch(`./js/data/${currentSubject}.json?v=` + new Date().getTime());
    let allQuestions = await res.json();

    // 随机打乱题库
    gameQuestions = allQuestions.sort(() => 0.5 - Math.random());
    
    // 启动计时器
    startGameTimer();
    loadQuestion();
  } catch (error) {
    console.error("题库加载失败", error);
    alert(`题库加载失败，请检查本地是否存有：${currentSubject}.json`);
    switchView('more');
  }
}

// 计时器逻辑
function startGameTimer() {
  clearInterval(timerInterval);
  const timerEl = document.getElementById("gameTimerText");
  
  const hourglassSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px;"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>`;
  const clockSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

  if (currentMode === 'relax') {
    // 悠闲模式：正计时
    timerEl.innerHTML = `${clockSvg} 00:00`;
    timerInterval = setInterval(() => {
      timeElapsed++;
      let m = String(Math.floor(timeElapsed / 60)).padStart(2, '0');
      let s = String(timeElapsed % 60).padStart(2, '0');
      timerEl.innerHTML = `${clockSvg} ${m}:${s}`;
    }, 1000);
  } else {
    // 限时模式：倒计时
    timerEl.innerHTML = `${hourglassSvg} ${timeLeft}s`;
    timerInterval = setInterval(() => {
      timeLeft--;
      timerEl.innerHTML = `${hourglassSvg} ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        endGame(true); 
      }
    }, 1000);
  }
}

function stopGameTimer() {
  clearInterval(timerInterval);
}

// 加载题目
function loadQuestion() {
  document.getElementById("feedbackPanel").hidden = true;
  
  // 如果题库抽完了，重新洗牌（防止溢出）
  if (currentQuestionIndex >= gameQuestions.length) {
    currentQuestionIndex = 0;
  }

  const isRelax = currentMode === 'relax';
  const totalText = isRelax ? `第 ${currentQuestionIndex + 1} / ${RELAX_QUESTIONS} 题` : `第 ${currentQuestionIndex + 1} 题`;
  
  document.getElementById("gameProgressText").innerText = totalText;
  document.getElementById("gameScoreText").innerText = `得分: ${currentScore}`;

  const q = gameQuestions[currentQuestionIndex];
  document.getElementById("questionText").innerText = q.question;

  const optionsList = document.getElementById("optionsList");
  optionsList.innerHTML = "";
  const letters = ['A', 'B', 'C', 'D'];

  // 打乱选项并渲染
  [...q.options].sort(() => 0.5 - Math.random()).forEach((opt, index) => {
    const btn = document.createElement("button");
    btn.className = "game-option-btn";
    btn.innerHTML = `<span class="game-option-prefix">${letters[index]}</span> ${opt}`;
    btn.onclick = () => checkAnswer(opt, q.answer, q.explanation, q.translation, btn, optionsList);
    optionsList.appendChild(btn);
  });
}

// 判断对错
function checkAnswer(selected, correct, explanation, translation, btnElement, container) {
  container.querySelectorAll(".game-option-btn").forEach(b => b.disabled = true);

  const isCorrect = (selected === correct);
  if (isCorrect) {
    btnElement.classList.add("correct");
    currentScore++;
    addStars(2, true); // 开启静默，不弹烦人的 Toast // 答对给 2 星迹
  } else {
    btnElement.classList.add("wrong");
    // 把正确的选项标绿
    container.querySelectorAll(".game-option-btn").forEach(b => {
      if (b.innerText.includes(correct)) b.classList.add("correct");
    });
  }

  document.getElementById("gameScoreText").innerText = `得分: ${currentScore}`;

  if (currentMode === 'relax') {
    // 【悠闲模式】显示解析，手动点下一题
    const feedbackPanel = document.getElementById("feedbackPanel");
    const feedbackResult = document.getElementById("feedbackResult");
    const feedbackExplanation = document.getElementById("feedbackExplanation");
    
    const sparkleIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" style="vertical-align:-2px;margin-right:4px;"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/></svg>`;
    const errorBulbIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" style="vertical-align:-2px;margin-right:4px;"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`;
    const bookIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`;
    const tipBulbIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`;
    
    feedbackResult.innerHTML = isCorrect ? `${sparkleIcon} 答对啦！` : `${errorBulbIcon} 差一点点。`;
    feedbackResult.style.color = isCorrect ? "#166534" : "#991b1b";
    
    let htmlContent = "";
    if (translation) {
      htmlContent += `<div style="margin-bottom: 8px; color: var(--text-secondary);">${bookIcon} 补充：${translation}</div>`;
    }
    htmlContent += `<div style="border-top: 1px dashed var(--border); padding-top: 8px; margin-top: 8px;">${tipBulbIcon} 解析：${explanation || "暂无解析"}</div>`;
    
    feedbackExplanation.innerHTML = htmlContent;
    feedbackPanel.hidden = false;
    
    // 如果是最后一题，修改按钮文案
    if (currentQuestionIndex + 1 >= RELAX_QUESTIONS || currentQuestionIndex + 1 >= gameQuestions.length) {
      document.getElementById("feedbackPanel").querySelector("button").innerText = "查看结算";
    } else {
      document.getElementById("feedbackPanel").querySelector("button").innerText = "下一题";
    }
  } else {
    // 【限时模式】不显示解析，极速切题
    // 【修复】检查是否达到题数上限
    if (currentScore >= MAX_QUESTIONS || currentQuestionIndex + 1 >= gameQuestions.length) {
      stopGameTimer();
      endGame(false, true); 
      return;
    }
    
    setTimeout(() => {
      if (timeLeft > 0) { 
        currentQuestionIndex++;
        loadQuestion();
      }
    }, 300); // 300ms 极速切题
  }
}

function nextQuestion() {
  // 悠闲模式到达题数上限
  if (currentMode === 'relax' && (currentQuestionIndex + 1 >= RELAX_QUESTIONS || currentQuestionIndex + 1 >= gameQuestions.length)) {
    stopGameTimer();
    endGame(false, false);
    return;
  }
  currentQuestionIndex++;
  loadQuestion();
}

// 辅助函数：让面板切换带有平滑动画
function animatePanel(panelId, show) {
  const panel = document.getElementById(panelId);
  if (show) {
    panel.hidden = false;
    panel.classList.remove("anim-slide-up"); // 使用带位移的类
    void panel.offsetWidth; // 强制重绘
    panel.classList.add("anim-slide-up");
  } else {
    panel.hidden = true;
  }
}

async function startGame() {
  // 1. 给按钮加一个加载状态，防止用户连点
  const startBtn = document.querySelector("#gameStartPanel .primary");
  const oldText = startBtn.innerText;
  startBtn.innerText = "准备中...";
  startBtn.disabled = true;

  currentQuestionIndex = 0;
  currentScore = 0;
  timeLeft = 60;
  timeElapsed = 0;

  try {
    // 2. 先把题库拉下来
    const res = await fetch(`./js/data/${currentSubject}.json?v=` + new Date().getTime());
    let allQuestions = await res.json();
    allQuestions = allQuestions.filter(q => !q.question.includes(q.answer));
    gameQuestions = allQuestions.sort(() => 0.5 - Math.random());

    // 3. 题库准备就绪后，再丝滑切换面板
    document.getElementById("gameStartPanel").hidden = true;
    document.getElementById("gameEndPanel").hidden = true;
    document.getElementById("feedbackPanel").hidden = true;
    
    // 让答题面板带着“向上浮出”的动画出现
    animatePanel("gamePlayPanel", true);
    
    // 4. 启动计时和第一题
    startGameTimer();
    loadQuestion();
    
  } catch (error) {
    console.error("题库加载失败", error);
    alert(`题库加载失败，请检查本地是否存有：${currentSubject}.json`);
  } finally {
    // 恢复按钮状态
    startBtn.innerText = oldText;
    startBtn.disabled = false;
  }
}

// ... (中间的计时器、加载题目、判断对错逻辑保持不变) ...

function endGame(isTimeout = false, isMaxReached = false) {
  stopGameTimer();
  animatePanel("gamePlayPanel", false);
  animatePanel("gameEndPanel", true);
  
  document.getElementById("finalScore").innerText = currentScore;
  
  const timeInfo = document.getElementById("endTimeInfo");
  if (currentMode === 'relax') {
    let m = String(Math.floor(timeElapsed / 60)).padStart(2, '0');
    let s = String(timeElapsed % 60).padStart(2, '0');
    timeInfo.innerText = `用时 ${m}分${s}秒`;
  } else {
    timeInfo.innerText = isTimeout ? "时间到！" : (isMaxReached ? "达到题数上限，提前结束！" : "挑战完成");
  }

  const quotes = [
    "每一次练习，都在为你铺路。",
    "答错的题，是未来最牢固的记忆。",
    "星光不问赶路人，时光不负有心人。",
    "知识就像散落的星星，慢慢都被你拾起。"
  ];
  document.getElementById("endQuote").innerText = `“${quotes[Math.floor(Math.random() * quotes.length)]}”`;

  if (currentMode === 'relax' && currentScore >= RELAX_QUESTIONS) {
    addStars(10, true);
    showToast("全对！额外获得 10 星迹");
  } else if (currentMode === 'rush' && isMaxReached) {
    addStars(5, true);
    showToast("达成上限！额外获得 5 星迹");
  }
}

function resetGame() {
  stopGameTimer();
  animatePanel("gamePlayPanel", false);
  animatePanel("gameEndPanel", false);
  animatePanel("gameStartPanel", true);
}