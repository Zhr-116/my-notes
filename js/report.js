let currentSlideIndex = 0;
const totalSlides = 5;

function openAnnualReport() {
  // 1. 计算数据
  const totalEntries = entries.length;
  const totalMilestones = entries.filter(e => e.isMilestone).length;
  
  // 计算深夜记录数（22点到凌晨4点）
  let nightEntries = 0;
  entries.forEach(e => {
    if (e.createdAt) {
      const hour = new Date(e.createdAt).getHours();
      if (hour >= 22 || hour <= 4) nightEntries++;
    }
  });

  // 计算最常出现的标签
  const tagCounts = {};
  entries.forEach(e => {
    (e.tags || []).forEach(t => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });
  let topTag = "无";
  let topTagCount = 0;
  for (let t in tagCounts) {
    if (tagCounts[t] > topTagCount) {
      topTag = t;
      topTagCount = tagCounts[t];
    }
  }

  // 2. 填充到 HTML 里
  document.getElementById("rs-total-entries").innerText = totalEntries;
  document.getElementById("rs-total-milestones").innerText = totalMilestones;
  document.getElementById("rs-night-entries").innerText = nightEntries;
  
  // 【就是这里】：填充第 3 页的标签和次数
  if (topTag !== "无") {
    document.getElementById("rs-top-tag").innerText = `#${topTag}`;
    document.getElementById("rs-top-tag-count").innerText = topTagCount;
  } else {
    document.getElementById("rs-top-tag").innerText = "空白";
    document.getElementById("rs-top-tag-count").innerText = "0";
  }

  // 3. 重置到第一页并显示
  currentSlideIndex = 0;
  updateSlideView();
  
  const overlay = document.getElementById("annualReportOverlay");
  overlay.style.display = "flex";
  overlay.offsetHeight; 
  overlay.classList.add("show");
}

function closeAnnualReport() {
  const overlay = document.getElementById("annualReportOverlay");
  overlay.classList.remove("show");
  setTimeout(() => {
    overlay.style.display = "none";
  }, 600);
}

// 点击切页（在 overlay 上绑定点击事件）
function nextSlide() {
  if (currentSlideIndex < totalSlides - 1) {
    currentSlideIndex++;
    updateSlideView();
  }
}

// 数字滚动函数
function animateNumber(elementId, targetValue) {
  const el = document.getElementById(elementId);
  if (!el) return;
  let start = 0;
  const duration = 1000; // 1秒滚完
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // 缓动：先快后慢
    const easeOut = 1 - Math.pow(1 - progress, 3);
    el.innerText = Math.floor(easeOut * targetValue);

    if (progress < 1) requestAnimationFrame(update);
    else el.innerText = targetValue;
  }
  requestAnimationFrame(update);
}

// 在切页时触发数字滚动
function updateSlideView() {
  const slides = document.querySelectorAll(".report-slide");
  slides.forEach((slide, index) => {
    if (index === currentSlideIndex) {
      slide.classList.add("active");
    } else {
      slide.classList.remove("active");
    }
  });

  // 根据当前页，触发数字滚动
  if (currentSlideIndex === 0) {
    animateNumber("rs-total-entries", entries.length);
  } else if (currentSlideIndex === 1) {
    animateNumber("rs-total-milestones", entries.filter(e => e.isMilestone).length);
  } else if (currentSlideIndex === 3) {
    // 统计深夜记录数
    let nightEntries = 0;
    entries.forEach(e => {
      if (e.createdAt) {
        const hour = new Date(e.createdAt).getHours();
        if (hour >= 22 || hour <= 4) nightEntries++;
      }
    });
    animateNumber("rs-night-entries", nightEntries);
  }

  const hint = document.getElementById("reportHint");
  hint.style.opacity = currentSlideIndex === totalSlides - 1 ? "0" : "1";
}

// 绑定点击事件
document.getElementById("annualReportOverlay")?.addEventListener("click", (e) => {
  // 如果点的是“结束回顾”按钮，就不触发翻页了
  if (e.target.tagName === "BUTTON") return;
  nextSlide();
});