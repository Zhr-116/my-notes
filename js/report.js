(function() {
  let rptCurrentSlideIndex = 0;
  const rptTotalSlides = 7;
  
  let rptPressTimer = null;
  let rptIsPressing = false;
  let rptLongPressTriggered = false; // 【新增】标记是否刚刚长按翻页了，防止 click 穿透
  const rptPressDuration = 800;
  
  const rptLongPressPages = [3, 6]; 

  window.openAnnualReport = function() {
    const totalEntries = entries.length;
    const totalMilestones = entries.filter(e => e.isMilestone).length;
    
    let nightEntries = 0;
    entries.forEach(e => {
      if (e.createdAt) {
        const hour = new Date(e.createdAt).getHours();
        if (hour >= 22 || hour <= 4) nightEntries++;
      }
    });

    let longestEntry = { content: "没有留下太长的文字。" };
    entries.forEach(e => {
      if (e.content && e.content.length > (longestEntry.content ? longestEntry.content.length : 0)) {
        longestEntry = e;
      }
    });

    const tagCounts = {};
    entries.forEach(e => {
      (e.tags || []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; });
    });
    let topTag = "无";
    for (let t in tagCounts) {
      if (!topTag || tagCounts[t] > tagCounts[topTag]) topTag = t;
    }

    document.getElementById("rs-total-entries").innerText = totalEntries;
    document.getElementById("rs-total-milestones").innerText = totalMilestones;
    document.getElementById("rs-night-entries").innerText = nightEntries;
    document.getElementById("rs-special-date").innerText = longestEntry.date || "某一天";
    
    let shortContent = longestEntry.content || "";
    if (shortContent.length > 30) shortContent = shortContent.substring(0, 30) + "...";
    document.getElementById("rs-special-content").innerText = shortContent;

    if (topTag !== "无") {
      document.getElementById("rs-top-tag").innerText = `#${topTag}`;
    }

    rptCurrentSlideIndex = 0;
    rptLongPressTriggered = false;
    updateRptSlideView();
    
    const overlay = document.getElementById("annualReportOverlay");
    overlay.style.display = "flex";
    overlay.offsetHeight; 
    overlay.classList.add("show");
  };

  window.closeAnnualReport = function() {
    const overlay = document.getElementById("annualReportOverlay");
    overlay.classList.remove("show");
    setTimeout(() => { overlay.style.display = "none"; }, 600);
  };

  function updateRptSlideView() {
    const slides = document.querySelectorAll(".report-slide");
    slides.forEach((slide, index) => {
      if (index === rptCurrentSlideIndex) slide.classList.add("active");
      else slide.classList.remove("active");
    });

    const hint = document.getElementById("reportHint");
    const indicator = document.getElementById("pressIndicator");

    if (rptCurrentSlideIndex === rptTotalSlides - 1) {
      hint.style.opacity = "0";
      if (indicator) indicator.style.display = "none";
    } else if (rptLongPressPages.includes(rptCurrentSlideIndex)) {
      hint.innerText = "长按屏幕继续";
      hint.style.opacity = "1";
      if (indicator) indicator.style.display = "block";
    } else {
      hint.innerText = "轻触屏幕继续 ▸";
      hint.style.opacity = "1";
      if (indicator) indicator.style.display = "none";
    }
  }

  function nextRptSlide() {
    if (rptCurrentSlideIndex < rptTotalSlides - 1) {
      rptCurrentSlideIndex++;
      updateRptSlideView();
    }
  }

  function endRptPress() {
    rptIsPressing = false;
    const indicator = document.getElementById("pressIndicator");
    if (indicator) indicator.classList.remove("active");
    if (rptPressTimer) clearTimeout(rptPressTimer);
  }

  // 绑定交互事件
  const overlay = document.getElementById("annualReportOverlay");

  if (overlay) {
    overlay.addEventListener("mousedown", (e) => {
      if (e.target.tagName === "BUTTON") return;

      if (rptLongPressPages.includes(rptCurrentSlideIndex)) {
        rptIsPressing = true;
        rptLongPressTriggered = false; // 重置标记
        const indicator = document.getElementById("pressIndicator");
        if (indicator) indicator.classList.add("active");
        
        rptPressTimer = setTimeout(() => {
          if (rptIsPressing) {
            rptLongPressTriggered = true; // 【关键】长按成功，标记为 true
            nextRptSlide();
            endRptPress();
          }
        }, rptPressDuration);
      }
    });

    overlay.addEventListener("mouseup", endRptPress);
    overlay.addEventListener("mouseleave", endRptPress);

    overlay.addEventListener("touchstart", (e) => {
      if (e.target.tagName === "BUTTON") return;
      if (rptLongPressPages.includes(rptCurrentSlideIndex)) {
        rptIsPressing = true;
        rptLongPressTriggered = false;
        const indicator = document.getElementById("pressIndicator");
        if (indicator) indicator.classList.add("active");
        
        rptPressTimer = setTimeout(() => {
          if (rptIsPressing) {
            rptLongPressTriggered = true; // 【关键】长按成功，标记为 true
            nextRptSlide();
            endRptPress();
          }
        }, rptPressDuration);
      }
    }, { passive: true });

    overlay.addEventListener("touchend", endRptPress);

    // 普通点击翻页
    overlay.addEventListener("click", (e) => {
      if (e.target.tagName === "BUTTON") return;
      
      // 【修复】：如果刚刚是因为长按翻的页，就忽略这次跟随着的 click
      if (rptLongPressTriggered) {
        rptLongPressTriggered = false; 
        return;
      }

      if (!rptLongPressPages.includes(rptCurrentSlideIndex)) {
        nextRptSlide();
      }
    });
  }
})();