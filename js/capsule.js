// 读取本地时间胶囊
let capsules = JSON.parse(localStorage.getItem("mini-capsules") || "[]");
let currentCapsuleId = null;

function openCapsuleModal() {
  document.getElementById("capsuleModal").hidden = false;
}
function closeCapsuleModal() {
  document.getElementById("capsuleModal").hidden = true;
  document.getElementById("capsuleInput").value = "";
  document.getElementById("capsuleDateInput").value = "";
}

function saveCapsule() {
  const text = document.getElementById("capsuleInput").value.trim();
  const date = document.getElementById("capsuleDateInput").value;
  
  if (!text || !date) {
    alert("请把想说的话和日期填完整哦！");
    return;
  }
  
  capsules.push({
    id: Date.now().toString(),
    text: text,
    unlockDate: date,
    isOpened: false
  });
  
  localStorage.setItem("mini-capsules", JSON.stringify(capsules));
  closeCapsuleModal();
  showToast("胶囊已深埋，期待未来的相遇！");
}

// 检查是否有到期未拆的胶囊
function checkCapsuleTrigger() {
  const today = todayStr();
  const pendingCapsule = capsules.find(c => c.unlockDate <= today && !c.isOpened);
  
  if (pendingCapsule) {
    setTimeout(() => {
      playStory("叮！我在地底挖到了一个宝贝。是一封来自过去的信。", () => {
        showEnvelope(pendingCapsule);
      });
    }, 1000);
  }
}

// 展示信封
function showEnvelope(capsule) {
  currentCapsuleId = capsule.id;
  const overlay = document.getElementById("envelopeOverlay");
  
  document.getElementById("capsuleTextContent").innerText = capsule.text;
  document.getElementById("capsuleDateContent").innerText = "封存于 " + capsule.unlockDate;
  
  // --- 彻底重置所有状态 ---
  document.getElementById("envelopeTop").classList.remove("open");
  document.getElementById("waxSeal").classList.remove("open");
  document.getElementById("envelopeMask").classList.remove("open");
  
  const paper = document.getElementById("envelopePaper");
  // 移除所有动画类
  paper.classList.remove("pull-up", "unfold", "paper-fly-away");
  // 强制重置内联样式，防止飞走后残留
  paper.style.transition = "none"; 
  paper.offsetHeight; 
  paper.style.transition = ""; 
  
  const wrapper = document.getElementById("envelopeWrapper");
  wrapper.style.opacity = "1";
  wrapper.style.pointerEvents = "auto";
  
  document.getElementById("flyAwayBtn").style.display = "none";
  
  const hint = document.getElementById("envelopeHint");
  hint.style.opacity = "1";
  hint.innerText = "点击信封拆阅";
  
  overlay.style.display = "flex";
  overlay.offsetHeight; 
  overlay.classList.add("show");
}

// 触发拆信
function openEnvelope() {
  const top = document.getElementById("envelopeTop");
  // 确保状态清理干净
  top.classList.remove("open"); 

  const seal = document.getElementById("waxSeal");
  const paper = document.getElementById("envelopePaper");
  const hint = document.getElementById("envelopeHint");
  const wrapper = document.getElementById("envelopeWrapper");
  const flyBtn = document.getElementById("flyAwayBtn");

  // 1. 印章碎裂，盖子翻开，信纸开始向上抽
  seal.classList.add("open");
  top.classList.add("open");
  paper.classList.add("pull-up"); 
  hint.style.opacity = "0"; 

  // 2. 等信纸抽出（700ms），信封外壳淡出，信纸展开放大
  setTimeout(() => {
    wrapper.style.opacity = "0";
    wrapper.style.pointerEvents = "none";
    
    paper.classList.add("unfold");
    
    setTimeout(() => {
      flyBtn.style.display = "block";
      flyBtn.style.animation = "popIn 0.4s ease forwards";
    }, 500);

  }, 700);
}

// 收回信纸并盖上盖子
function flyPaperAway() {
  const paper = document.getElementById("envelopePaper");
  const overlay = document.getElementById("envelopeOverlay");
  const flyBtn = document.getElementById("flyAwayBtn");
  const wrapper = document.getElementById("envelopeWrapper");
  const top = document.getElementById("envelopeTop");
  const seal = document.getElementById("waxSeal");
  
  flyBtn.style.display = "none";

  // 第一步：信纸从“展开大图”缩回“抽出时的纸条”
  paper.classList.remove("unfold");

  // 等待缩小动画完成
  setTimeout(() => {
    // 第二步：信封外壳现形（透明度恢复），准备接住信纸
    wrapper.style.opacity = "1";
    wrapper.style.pointerEvents = "auto";

    // 第三步：信纸向下沉入信封（移除 pull-up）
    paper.classList.remove("pull-up");

    // 等待信纸彻底滑入信封内部
    setTimeout(() => {
      // 第四步：盖子盖上，印章出现
      top.classList.remove("open");
      seal.classList.remove("open");

      // 等待盖子完全合上
      setTimeout(() => {
        // 第五步：整个遮罩层淡出
        overlay.classList.remove("show");

        setTimeout(() => {
          overlay.style.display = "none";

          // 清理内联样式，保存已读数据
          paper.style.transition = "none"; 
          paper.offsetHeight; 
          paper.style.transition = ""; 

          const cap = capsules.find(c => c.id === currentCapsuleId);
          if(cap) cap.isOpened = true;
          localStorage.setItem("mini-capsules", JSON.stringify(capsules));
        }, 400);

      }, 600); // 盖子盖上的等待时间

    }, 600); // 信纸沉入的等待时间

  }, 600); // 信纸缩小的等待时间
}