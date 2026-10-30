// 动态获取今天的任务
function getTodayTasks() {
  return JSON.parse(localStorage.getItem("mini-tasks-" + todayStr()) || "[]");
}
function saveTodayTasks(tasks) {
  localStorage.setItem("mini-tasks-" + todayStr(), JSON.stringify(tasks));
}

function renderPlanView() {
  renderCountdown();
  renderTasks();
}

// 渲染今日待办与习惯
function renderTasks() {
  const container = document.getElementById("taskContainer");
  const tasks = getTodayTasks(); 
  const today = todayStr();
  
  let html = ``;

  html += `<h3 class="section-title" style="margin-top: 24px;">今日待办</h3>`;
  
  // 输入区：一次性待办输入框 + 习惯设置按钮
  html += `
    <div class="task-add-row" style="margin-bottom: 16px; display: flex; gap: 8px;">
      <input type="text" id="newTaskInput" placeholder="添加新任务..." onkeypress="handleTaskKeyPress(event)" style="flex: 1;">
      <button onclick="addTask()">添加</button>
      <button onclick="openHabitModal()" style="background: var(--accent-soft); color: var(--accent-text); border: 1px solid var(--border); padding: 0 12px; border-radius: 8px; cursor: pointer;" title="设定周期习惯">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
      </button>
    </div>
  `;

  // 渲染列表
  html += `<div class="task-list">`;
  
  // 1. 渲染周期习惯
  const activeHabits = habits.filter(h => !h.isCompleted);
  if (activeHabits.length > 0) {
    activeHabits.forEach((h) => {
      const streak = calcHabitStreak(h.completedDates, today);
      const isCheckedToday = h.completedDates.includes(today);
      
      // 注意：习惯打卡完成时，不加 .completed 类，所以文字不会划线
      html += `
        <div class="task-item" style="padding: 14px 16px;">
          <div class="task-checkbox" onclick="checkHabit('${h.id}')" style="${isCheckedToday ? 'background: var(--text-primary); border-color: var(--text-primary);' : ''}">
            ${isCheckedToday ? '✓' : ''}
          </div>
          <div style="flex: 1; display: flex; flex-direction: column;">
            <span class="task-text" style="text-decoration: none; color: var(--text-primary); font-weight: 500;">${escapeHtml(h.title)}</span>
            <div style="font-size: 12px; color: var(--text-tertiary); margin-top: 4px; display: flex; gap: 8px; align-items: center;">
              <span>连续 ${streak} / ${h.targetDays} 天</span>
            </div>
          </div>
          <button class="task-delete" onclick="deleteHabit('${h.id}')">×</button>
        </div>
      `;
    });
  }

  // 2. 渲染一次性待办
  if (tasks.length === 0 && activeHabits.length === 0) {
    html += `<div class="empty-task">今天还没有任务，添加一个吧。</div>`;
  } else {
    tasks.forEach((task, index) => {
      // 一次性待办：保留原有的 completed 类，实现划线效果
      html += `
        <div class="task-item ${task.completed ? 'completed' : ''}">
          <div class="task-checkbox" onclick="toggleTask(${index})">
            ${task.completed ? '✓' : ''}
          </div>
          <span class="task-text">${escapeHtml(task.content)}</span>
          <button class="task-delete" onclick="deleteTask(${index})">×</button>
        </div>
      `;
    });
  }
  html += `</div>`;

  container.innerHTML = html;
}

// --- 待办事项交互 (保持不变) ---
function addTask() {
  const input = document.getElementById("newTaskInput");
  const content = input.value.trim();
  if (!content) return;
  
  const tasks = getTodayTasks();
  tasks.push({ content, completed: false });
  saveTodayTasks(tasks);
  renderTasks();
}

function handleTaskKeyPress(e) {
  if (e.key === "Enter") addTask();
}

function toggleTask(index) {
  const tasks = getTodayTasks();
  tasks[index].completed = !tasks[index].completed;
  saveTodayTasks(tasks);
  renderTasks();
  
  // 统一交给这个函数检查
  checkAllDailyCleared();
}

function deleteTask(index) {
  const tasks = getTodayTasks();
  tasks.splice(index, 1);
  saveTodayTasks(tasks);
  renderTasks();
}

// --- 新增：习惯设置弹窗与逻辑 ---
function openHabitModal() {
  document.getElementById("habitModal").hidden = false;
  document.getElementById("habitTitleInput").value = "";
  document.getElementById("habitDaysInput").value = "21";
}

function closeHabitModal() {
  document.getElementById("habitModal").hidden = true;
}

function saveHabit() {
  const title = document.getElementById("habitTitleInput").value.trim();
  const days = parseInt(document.getElementById("habitDaysInput").value, 10);
  
  if (!title || !days || days <= 0) {
    alert("请填写完整的习惯名称和有效天数！");
    return;
  }
  
  habits.push({
    id: "h_" + Date.now().toString(),
    title: title,
    targetDays: days,
    completedDates: [],
    isCompleted: false
  });
  
  saveHabits();
  closeHabitModal();
  renderTasks();
  showToast("习惯已创建，开始坚持吧！");
}

// 打卡逻辑
function checkHabit(id) {
  const today = todayStr();
  const h = habits.find(x => x.id === id);
  if (!h) return;
  
  if (h.completedDates.includes(today)) {
    showToast("今天已经打过卡啦");
    return;
  }
  
  h.completedDates.push(today);
  const streak = calcHabitStreak(h.completedDates, today);
  
  if (streak >= h.targetDays) {
    // 达成目标
    const newEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      content: `🏅 完成了 ${h.targetDays} 天【${h.title}】打卡`,
      date: today,
      tags: ["习惯", h.title],
      isMilestone: true,
      isPinned: false,
      detail: "",
      createdAt: new Date().toISOString()
    };
    entries.push(newEntry);
    saveEntries();
    addStars(10);
    
    h.isCompleted = true;
    
    setTimeout(() => {
      if (confirm(`🎉 恭喜！你完成了 ${h.targetDays} 天的【${h.title}】打卡！\n\n点击【确定】开启新一轮。\n点击【取消】永久养成该习惯（不再计入进度）。`)) {
        h.completedDates = [];
        h.isCompleted = false;
      } else {
        h.isCompleted = true; // 保留 but 不显示在活跃列表
      }
      saveHabits();
      renderTasks();
      render();
    }, 500);
  } else {
    addStars(1);
    saveHabits();
    renderTasks();
    checkAllDailyCleared(); 
  }
}

function deleteHabit(id) {
  if (confirm("确定要放弃这个习惯吗？")) {
    habits = habits.filter(h => h.id !== id);
    saveHabits();
    renderTasks();
  }
}

// 计算连续天数
function calcHabitStreak(dates, todayStr) {
  if (!dates.length) return 0;
  const sorted = [...new Set(dates)].sort();
  let streak = 0;
  let currentDate = new Date(todayStr);
  
  for (let i = sorted.length - 1; i >= 0; i--) {
    const d = new Date(sorted[i]);
    const diffTime = Math.abs(currentDate - d);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0 || diffDays === 1) {
      streak++;
      currentDate = d;
    } else if (diffDays > 1) {
      break; 
    }
  }
  return streak;
}

// 检查“今日全清”：一次性待办全做完，且所有习惯全打卡
// 检查“今日全清”：一次性待办全做完，且所有习惯全打卡
function checkAllDailyCleared() {
  const today = todayStr();
  
  // 防刷
  if (localStorage.getItem("mini-all-cleared-date") === today) return;

  const tasks = getTodayTasks();
  const activeHabits = habits.filter(h => !h.isCompleted);
  
  if (tasks.length === 0 && activeHabits.length === 0) return;

  const allTasksDone = tasks.every(t => t.completed);
  const allHabitsDone = activeHabits.every(h => h.completedDates.includes(today));

  if (allTasksDone && allHabitsDone) {
    localStorage.setItem("mini-all-cleared-date", today); 
    addStars(10);
    
    // 🌟 恢复拾迹的专属剧情触发！
    checkStoryTrigger("all_tasks_done");
  }
}

// 渲染倒计时看板（只展示一个主倒计时）
function renderCountdown() {
  const container = document.getElementById("countdownContainer");
  
  if (countdowns.length === 0) {
    container.innerHTML = `
      <div class="countdown-card empty-countdown" onclick="openCountdownManageModal()">
        <p>+ 设定你的第一个倒计时</p>
      </div>
    `;
    return;
  }

  // 寻找当前要展示的主倒计时
  let activeCd = countdowns.find(c => c.id === mainCountdownId);
  if (!activeCd) {
    // 如果没设置或设置的被删了，默认找最近的那个
    countdowns.sort((a, b) => new Date(a.date) - new Date(b.date));
    activeCd = countdowns[0];
    mainCountdownId = activeCd.id; // 顺便保存一下
  }

  const targetDate = new Date(activeCd.date + "T00:00:00");
  const today = new Date(todayStr() + "T00:00:00");
  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let dayText = diffDays;
  let isPast = false;
  if (diffDays === 0) dayText = "今天";
  if (diffDays < 0) {
    dayText = Math.abs(diffDays);
    isPast = true;
  }

    container.innerHTML = `
    <div class="countdown-card" onclick="openCountdownManageModal()">
      <div class="cd-title">${escapeHtml(activeCd.title)}</div>
      <div class="cd-days">
        ${typeof dayText === 'number' ? `<span>${dayText}</span> 天` : dayText}
      </div>
      <div class="cd-label">${isPast ? '已过去' : '倒计时'}</div>
    </div>
  `;
}

// --- 倒计时管理弹窗逻辑 ---

function openCountdownManageModal() {
  document.getElementById("countdownManageModal").hidden = false;
  renderCountdownManageList();
}

function closeCountdownManageModal() {
  document.getElementById("countdownManageModal").hidden = true;
  document.getElementById("cdTitleInput").value = "";
  document.getElementById("cdDateInput").value = "";
}

function renderCountdownManageList() {
  const listEl = document.getElementById("countdownManageList");
  
  if (countdowns.length === 0) {
    listEl.innerHTML = `<div style="text-align: center; color: var(--text-tertiary); font-size: 13px; padding: 10px 0;">还没有添加任何倒计时</div>`;
    return;
  }

  // 按日期排序展示
  countdowns.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  listEl.innerHTML = countdowns.map(cd => {
    const isCurrent = cd.id === mainCountdownId;
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid ${isCurrent ? 'var(--accent)' : 'var(--border)'}; border-radius: 8px; margin-bottom: 8px; background: ${isCurrent ? 'var(--accent-soft)' : 'var(--surface)'}; cursor: pointer;" onclick="setMainCountdown('${cd.id}')">
        <div>
          <div style="font-size: 14px; font-weight: 600; color: ${isCurrent ? 'var(--accent-text)' : 'var(--text-primary)'};">${escapeHtml(cd.title)}</div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">${cd.date} ${isCurrent ? '(当前展示)' : ''}</div>
        </div>
        <button onclick="event.stopPropagation(); deleteCountdown('${cd.id}')" style="background: transparent; border: none; color: #ef4444; font-size: 18px; cursor: pointer; padding: 0 8px;">×</button>
      </div>
    `;
  }).join("");
}

function setMainCountdown(id) {
  mainCountdownId = id;
  localStorage.setItem("mini-main-countdown-id", mainCountdownId);
  closeCountdownManageModal();
  renderPlanView();
  showToast("已切换主倒计时");
}

// 添加倒计时
function saveCountdown() {
  if (countdowns.length >= 5) {
    alert("最多只能设置 5 个倒计时哦！");
    return;
  }

  const title = document.getElementById("cdTitleInput").value.trim();
  const date = document.getElementById("cdDateInput").value;
  
  if (!title || !date) {
    alert("请把名字和日期填完整哦！");
    return;
  }
  
  const newId = Date.now().toString();
  countdowns.push({ id: newId, title, date });
  saveCountdowns();
  
  // 如果之前没有主倒计时，自动把它设为当前主倒计时
  if (!mainCountdownId) {
    mainCountdownId = newId;
    localStorage.setItem("mini-main-countdown-id", mainCountdownId);
  }

  document.getElementById("cdTitleInput").value = "";
  document.getElementById("cdDateInput").value = "";
  
  renderCountdownManageList(); // 只刷新弹窗里的列表
  renderCountdown(); // 刷新背后卡片的展示
}

// 删除倒计时
function deleteCountdown(id) {
  if (confirm("确定要删除这个倒计时吗？")) {
    countdowns = countdowns.filter(c => c.id !== id);
    saveCountdowns();
    
    // 如果删的是当前主倒计时，重置
    if (mainCountdownId === id) {
      mainCountdownId = countdowns.length > 0 ? countdowns[0].id : null;
      localStorage.setItem("mini-main-countdown-id", mainCountdownId || "");
    }
    
    renderCountdownManageList();
    renderCountdown();
  }
}