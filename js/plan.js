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

// 渲染倒计时看板
function renderCountdown() {
  const container = document.getElementById("countdownContainer");
  
  if (countdowns.length === 0) {
    container.innerHTML = `
      <div class="countdown-card empty-countdown" onclick="openCountdownModal()">
        <p>+ 设定你的第一个倒计时</p>
      </div>
    `;
    return;
  }

  countdowns.sort((a, b) => new Date(a.date) - new Date(b.date));

  container.innerHTML = countdowns.map(cd => {
    const targetDate = new Date(cd.date + "T00:00:00");
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

    return `
      <div class="countdown-card" onclick="deleteCountdown('${cd.id}')">
        <div class="cd-title">${escapeHtml(cd.title)}</div>
        <div class="cd-days">
          ${typeof dayText === 'number' ? `<span>${dayText}</span> 天` : dayText}
        </div>
        <div class="cd-label">${isPast ? '已过去' : '倒计时'}</div>
      </div>
    `;
  }).join("");
}

// 渲染今日待办
function renderTasks() {
  const container = document.getElementById("taskContainer");
  const tasks = getTodayTasks(); 
  
  let html = `<h3 class="section-title">今日待办</h3>`;
  
  // 【关键修改】：把输入框放到最上面
  html += `
    <div class="task-add-row" style="margin-bottom: 16px;">
      <input type="text" id="newTaskInput" placeholder="添加新任务..." onkeypress="handleTaskKeyPress(event)">
      <button onclick="addTask()">添加</button>
    </div>
  `;

  // 然后再渲染列表
  html += `<div class="task-list">`;
  if (tasks.length === 0) {
    html += `<div class="empty-task">今天还没有任务，添加一个吧。</div>`;
  } else {
    tasks.forEach((task, index) => {
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

// --- 倒计时交互 ---
function openCountdownModal() {
  document.getElementById("countdownModal").hidden = false;
}
function closeCountdownModal() {
  document.getElementById("countdownModal").hidden = true;
  document.getElementById("cdTitleInput").value = "";
  document.getElementById("cdDateInput").value = "";
}
function saveCountdown() {
  const title = document.getElementById("cdTitleInput").value.trim();
  const date = document.getElementById("cdDateInput").value;
  
  if (!title || !date) {
    alert("请把名字和日期填完整哦！");
    return;
  }
  
  countdowns.push({ id: Date.now().toString(), title, date });
  saveCountdowns();
  closeCountdownModal();
  renderPlanView();
}
function deleteCountdown(id) {
  if (confirm("确定要删除这个倒计时吗？")) {
    countdowns = countdowns.filter(c => c.id !== id);
    saveCountdowns();
    renderPlanView();
  }
}

// --- 待办事项交互 ---
function addTask() {
  const input = document.getElementById("newTaskInput");
  const content = input.value.trim();
  if (!content) return;
  
  const tasks = getTodayTasks(); // 获取最新
  tasks.push({ content, completed: false });
  saveTodayTasks(tasks); // 保存
  renderTasks(); // 重新渲染
}
function handleTaskKeyPress(e) {
  if (e.key === "Enter") addTask();
}
function toggleTask(index) {
  const tasks = getTodayTasks();
  tasks[index].completed = !tasks[index].completed;
  saveTodayTasks(tasks);
  renderTasks();
}
function deleteTask(index) {
  const tasks = getTodayTasks();
  tasks.splice(index, 1);
  saveTodayTasks(tasks);
  renderTasks();
}