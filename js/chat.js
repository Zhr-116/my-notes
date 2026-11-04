let chatPressTimer = null;
let chatLongPressTriggered = false;
let currentChatId = null;

function openChatOverlay() {
  document.getElementById("chatOverlay").style.display = "flex";
  document.getElementById("chatOverlay").offsetHeight; // 强制重绘
  document.getElementById("chatOverlay").classList.add("show");
  renderChatList();
}

function closeChatOverlay() {
  const overlay = document.getElementById("chatOverlay");
  overlay.classList.remove("show");
  setTimeout(() => { overlay.style.display = "none"; }, 300);
}

// 输入框自适应高度
function autoResizeChatInput(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

// 键盘 Enter 发送（PC端支持，移动端换行）
function handleChatKeydown(e) {
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 768) {
    e.preventDefault();
    sendChatMessage();
  }
}

// 发送消息
function sendChatMessage() {
  const input = document.getElementById("chatInput");
  const content = input.value.trim();
  if (!content) return;

  chatMessages.push({
    id: Date.now().toString(),
    content: content,
    time: new Date().toISOString()
  });
  
  saveChatMessages();
  input.value = "";
  input.style.height = "auto";
  renderChatList();
  
  // 滚动到底部
  setTimeout(() => {
    const list = document.getElementById("chatList");
    list.scrollTop = list.scrollHeight;
  }, 50);
}

// 渲染列表
async function renderChatList() {
  const list = document.getElementById("chatList");
  if (!list) return;

  if (chatMessages.length === 0) {
    list.innerHTML = `<div class="empty" style="margin-top: 40px; font-size: 13px;">这里很安静，只有你自己。</div>`;
    return;
  }

  // 获取用户头像
  let avatarSrc = "./assets/girl-color.png";
  if (userProfile.avatarId && imageDB.db) {
    const base64 = await imageDB.get(userProfile.avatarId);
    if (base64) avatarSrc = base64;
  }

  let html = "";
  let lastTime = 0;

  chatMessages.forEach((msg, index) => {
    const msgTime = new Date(msg.time).getTime();
    // 如果上条消息和这条消息间隔超过 5 分钟，显示时间
    if (msgTime - lastTime > 5 * 60 * 1000 || index === 0) {
      const d = new Date(msg.time);
      const timeStr = `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
      html += `<div class="chat-time-divider">${timeStr}</div>`;
    }
    lastTime = msgTime;

    // 把原来的 <div class="chat-bubble"> 替换为：
    html += `
      <div class="chat-msg-row" ...>
        <div class="chat-bubble style-${currentBubble}">${escapeHtml(msg.content).replace(/\n/g, '<br>')}</div>
        <img src="${avatarSrc}" class="chat-avatar">
      </div>
    `;
  });

  list.innerHTML = html;
  
  // 渲染完成后直接滚到底部
  list.scrollTop = list.scrollHeight;
}

// 长按逻辑
function startChatPress(e, id) {
  chatLongPressTriggered = false;
  chatPressTimer = setTimeout(() => {
    chatLongPressTriggered = true;
    if (navigator.vibrate) navigator.vibrate(50);
    currentChatId = id;
    document.getElementById("chatActionMenu").style.display = "flex";
  }, 500);
}

function cancelChatPress() {
  if (chatPressTimer) clearTimeout(chatPressTimer);
}

// 菜单操作
function closeChatActionMenu() {
  document.getElementById("chatActionMenu").style.display = "none";
  currentChatId = null;
}

function deleteChatMessage() {
  if (!currentChatId) return;
  chatMessages = chatMessages.filter(m => m.id !== currentChatId);
  saveChatMessages();
  renderChatList();
  closeChatActionMenu();
  showToast("已抹去");
}

function copyChatText() {
  const msg = chatMessages.find(m => m.id === currentChatId);
  if (msg && navigator.clipboard) {
    navigator.clipboard.writeText(msg.content).then(() => {
      showToast("已复制到剪贴板");
    });
  }
  closeChatActionMenu();
}

// 转为正式记录
function convertChatToEntry() {
  const msg = chatMessages.find(m => m.id === currentChatId);
  if (!msg) return;

  // 调用 entry 逻辑生成记录
  const newEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    content: msg.content,
    date: todayStr(),
    tags: ["碎碎念"],
    isMilestone: false,
    isPinned: false,
    detail: "",
    createdAt: new Date().toISOString(),
  };
  
  entries.push(newEntry);
  addStars(5); // 奖励星迹
  saveEntries();
  
  // 如果当前在记录页，刷新一下列表（虽然对话框盖着看不到，但关掉就看到了）
  if (currentView === "record") renderList();
  
  showToast("已转为一条小事，标签 #碎碎念");
  closeChatActionMenu();
}

// ================= 气泡商店/切换逻辑 =================
// ================= 气泡商店/切换逻辑 =================
const BUBBLE_POOL = [
  { 
    id: "default", 
    name: "圆润素白", 
    color: "var(--accent-soft)", 
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>` 
  },
  { 
    id: "round", 
    name: "纯正圆角", 
    color: "var(--surface-muted)", 
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="14" x="3" y="5" rx="6"/></svg>` 
  },
  { 
    id: "paper", 
    name: "拾光信纸", 
    color: "#fcf9f2", 
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8c8273" stroke-width="2"><rect width="16" height="16" x="4" y="4" rx="1"/></svg>` 
  },
  { 
    id: "ticket", 
    name: "极简票根", 
    color: "var(--bg)", 
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>` 
  },
  { 
    id: "highlighter", 
    name: "荧光叠色", 
    color: "rgba(253, 230, 138, 0.5)", 
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>` 
  }
];

function openBubbleModal() {
  document.getElementById("bubbleModal").hidden = false;
  const grid = document.getElementById("bubbleGrid");
  
  grid.innerHTML = BUBBLE_POOL.map(bubble => {
    const isOwned = ownedBubbles.includes(bubble.id);
    const isCurrent = currentBubble === bubble.id;
    
    return `
      <div onclick="${isOwned ? `selectBubble('${bubble.id}')` : ''}" 
           style="display: flex; align-items: center; justify-content: space-between; padding: 16px; border-radius: 12px; 
                  border: 1px solid ${isCurrent ? 'var(--accent)' : 'var(--border)'}; 
                  background: ${isCurrent ? 'var(--accent-soft)' : 'var(--surface)'}; 
                  cursor: ${isOwned ? 'pointer' : 'not-allowed'}; opacity: ${isOwned ? '1' : '0.5'};">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; border-radius: 8px; background: ${bubble.color}; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);">
            ${bubble.icon}
          </div>
          <span style="font-size: 15px; color: var(--text-primary); font-weight: 600;">${bubble.name}</span>
        </div>
        <span style="font-size: 13px; color: ${isCurrent ? 'var(--accent-text)' : 'var(--text-tertiary)'};">
          ${isCurrent ? '使用中' : (isOwned ? '点击使用' : '未解锁')}
        </span>
      </div>
    `;
  }).join("");
}

function selectBubble(bubbleId) {
  currentBubble = bubbleId;
  saveBubbles();
  document.getElementById("bubbleModal").hidden = true;
  renderChatList();
  showToast("气泡样式已切换");
}


