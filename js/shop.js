const STAR_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px;"><path d="M12.983 21.186a1 1 0 0 1-1.966 0 10 10 0 0 0-8.203-8.203 1 1 0 0 1 0-1.966 10 10 0 0 0 8.203-8.203 1 1 0 0 1 1.966 0 10 10 0 0 0 8.203 8.203 1 1 0 0 1 0 1.966 10 10 0 0 0-8.203 8.203"/></svg>`;

const BOX_POOLS = {
  nature: {
    name: "自然物语", price: 100, 
    img: "./assets/box-mint.svg", 
    items: [
      { id: "n1", title: "四叶草", color1: "#6ee7b7", color2: "#047857", icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="#fff" style="width: 36px; height: 36px;"><path d="M13.7449 10.0916C14.58 9.7304 15 8.7441 15 7.16s-0.42 -2.5704 -1.2551 -2.9316c-0.8813 -0.3815 -2.1581 -0.0273 -3.7954 1.05l-0.21 0.14 0.14 -0.21c1.0787 -1.6373 1.4329 -2.9141 1.05 -3.7954C10.5704 0.58 9.5841 0.16 8 0.16S5.4296 0.58 5.0684 1.4151c-0.3815 0.8813 -0.0273 2.1581 1.05 3.7954q0.07 0.1071 0.14 0.21l-0.21 -0.14c-1.6373 -1.0787 -2.9141 -1.4329 -3.7954 -1.05C1.42 4.5896 1 5.5759 1 7.16s0.42 2.5704 1.2551 2.9316c0.24375 0.10183125 0.50586875 0.15235 0.77 0.1484 0.8022 0 1.82 -0.4011 3.0282 -1.1998l0.21 -0.14 -0.14 0.21c-1.0787 1.6373 -1.4329 2.9141 -1.05 3.7947C5.4296 13.74 6.4159 14.16 8 14.16s2.5704 -0.42 2.9316 -1.2558c0.2667 -0.616 0.1729 -1.4273 -0.2765 -2.4192 1.0955 1.435 2.1987 3.2452 2.6733 5.145 0.0319625 0.1238 0.1437375 0.210225 0.2716 0.21 0.0235875 0.00009375 0.0471 -0.00273125 0.07 -0.0084 0.1499875 -0.037525 0.241175 -0.18950625 0.2037 -0.3395 -0.5887 -2.3555 -2.0615 -4.5346 -3.36 -6.104 0.9674 0.5663 1.7934 0.8519 2.4682 0.8519 0.26178125 0.0029875 0.52141875 -0.0475125 0.763 -0.1484ZM5.5829 1.6377C5.8468 1.0287 6.6602 0.72 8 0.72s2.1532 0.3087 2.4171 0.9177c0.5747 1.3258 -1.3902 3.9487 -2.4171 5.11 -1.0269 -1.1613 -2.9918 -3.7842 -2.4171 -5.11ZM2.4777 9.5771C1.8687 9.3132 1.56 8.4998 1.56 7.16s0.3087 -2.1532 0.9177 -2.4171c0.17296875 -0.07154375 0.35885625 -0.106575 0.546 -0.1029 1.4056 0 3.5462 1.6205 4.5605 2.52 -1.1578 1.0269 -3.7807 2.9918 -5.1065 2.4171Zm7.9394 3.1052C10.1532 13.2913 9.3398 13.6 8 13.6s-2.1532 -0.3087 -2.4171 -0.9177C5.0082 11.36 6.9731 8.7336 8 7.5758c1.0269 1.1578 2.9918 3.7842 2.4171 5.1065Z"></path></svg>` },
      { id: "n2", title: "松果", color1: "#fcd34d", color2: "#b45309", icon: `<img src="./assets/pinecone.svg" style="width: 36px; height: 36px; object-fit: contain; filter: brightness(0) invert(1);">` },
      { id: "n3", title: "新芽", color1: "#86efac", color2: "#15803d", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg>` },
      { id: "n4", title: "落叶", color1: "#fda4af", color2: "#9f1239", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>` }
    ]
  },
  space: {
    name: "深空漫游", price: 150, 
    img: "./assets/box-pink.svg", 
    items: [
      { id: "s1", title: "流星", color1: "#60a5fa", color2: "#1d4ed8", icon: `<img src="./assets/star1.svg" style="width: 36px; height: 36px; object-fit: contain; filter: brightness(0) invert(1);">` },
      { id: "s2", title: "银河", color1: "#c084fc", color2: "#6b21a8", icon: `<img src="./assets/galaxy.svg" style="width: 36px; height: 36px; object-fit: contain; filter: brightness(0) invert(1);">` },
      { id: "s3", title: "月相", color1: "#818cf8", color2: "#3730a3", icon: `<img src="./assets/moon1.svg" style="width: 36px; height: 36px; object-fit: contain; filter: brightness(0) invert(1);">` },
      { id: "s4", title: "繁星", color1: "#f472b6", color2: "#9d174d", icon: `<img src="./assets/star2.svg" style="width: 36px; height: 36px; object-fit: contain; filter: brightness(0) invert(1);">` },
      { id: "s5", title: "星云", color1: "#2dd4bf", color2: "#115e59", icon: `<img src="./assets/star3.svg" style="width: 36px; height: 36px; object-fit: contain; filter: brightness(0) invert(1);">` }
    ]
  },
  // 第三个盲盒：林间生灵（动物类）
  animal: {
    name: "林间生灵", price: 120, 
    img: "./assets/box-yellow.svg", 
    items: [
      { 
        id: "a1", title: "猫", color1: "#fca5a5", color2: "#991b1b", 
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z" /><path d="M8 14v.5" /><path d="M16 14v.5" /><path d="M11.25 16.25h1.5L12 17l-.75-.75Z" /></svg>` 
      },
      { 
        id: "a2", title: "狗", color1: "#fcd34d", color2: "#b45309", 
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.25 16.25h1.5L12 17z" /><path d="M16 14v.5" /><path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309" /><path d="M8 14v.5" /><path d="M8.5 8.5c-.384 1.05-1.083 2.028-2.344 2.5-1.931.722-3.576-.297-3.656-1-.113-.994 1.177-6.53 4-7 1.923-.321 3.651.845 3.651 2.235A7.497 7.497 0 0 1 14 5.277c0-1.39 1.844-2.598 3.767-2.277 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5" /></svg>` 
      },
      { 
        id: "a3", title: "爪印", color1: "#f9a8d4", color2: "#831843", 
        // 【修改点】把有问题的兔子换成了完美无缺的爪印
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/></svg>` 
      },
      { 
        id: "a4", title: "飞鸟", color1: "#93c5fd", color2: "#1e40af", 
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 7h.01" /><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20" /><path d="m20 7 2 .5-2 .5" /><path d="M10 18v3" /><path d="M14 17.75V21" /><path d="M7 18a6 6 0 0 0 3.84-10.61" /></svg>` 
      },
      { 
        id: "a5", title: "游鱼", color1: "#5eead4", color2: "#115e59", 
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" /><path d="M18 12v.5" /><path d="M16 17.93a9.77 9.77 0 0 1 0-11.86" /><path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33" /><path d="M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4" /><path d="m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98" /></svg>` 
      }
    ]
  }
};

function renderShop() {
  const container = document.getElementById("shopContent");
  if (!container) return;

  let badgesHtml = "";
  const allItems = Object.values(BOX_POOLS).flatMap(p => p.items);
  
  // 计算总进度：总款式数 vs 已获得的款式数
  const totalItemsCount = allItems.length;
  // 过滤一下，防止旧数据里有已经不存在的ID
  const validUnlockedCount = unlockedBadges.filter(id => allItems.some(b => b.id === id)).length;

  if (unlockedBadges.length === 0) {
    badgesHtml = `<div class="empty" style="grid-column: 1/-1; padding: 20px 0; font-size: 13px; color: var(--text-tertiary);">继续记录，去解锁隐藏的惊喜吧！</div>`;
  } else {
    badgesHtml = unlockedBadges.map(badgeId => {
      const badge = allItems.find(b => b.id === badgeId);
      if (!badge) return "";
      
      return `
        <div class="badge-item">
          <div class="luxury-badge" style="--c1: ${badge.color1}; --c2: ${badge.color2};">
            ${badge.icon}
          </div>
          <span class="badge-name">${badge.title}</span>
        </div>
      `;
    }).join("");
  }

  // 计算单池进度，并渲染货架
  let shelvesHtml = Object.keys(BOX_POOLS).map(key => {
    const box = BOX_POOLS[key];
    // 该盲盒的总款式
    const poolTotal = box.items.length;
    // 该盲盒已获得的款式
    const poolUnlocked = box.items.filter(item => unlockedBadges.includes(item.id)).length;
    
    return `
      <div class="mystery-box" onclick="openMysteryBox('${key}')">
        <div class="box-progress">${poolUnlocked}/${poolTotal}</div> <!-- 新增进度角标 -->
        <img src="${box.img}" alt="${box.name}" class="box-img">
        <div class="box-price">${STAR_ICON} ${box.price}</div>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div class="shop-header">
      <div class="stars-display">${STAR_ICON} 星迹：<span>${userStars}</span></div>
    </div>

    <div class="shop-section">
      <!-- 给标题加一个总进度 -->
      <h3 class="section-title">
        荣誉橱窗 
        <span style="font-size: 12px; color: var(--text-tertiary); font-weight: normal; margin-left: 8px;">
          已集齐 ${validUnlockedCount} / ${totalItemsCount} 款
        </span>
      </h3>
      <div class="badge-showcase">${badgesHtml}</div>
    </div>

    <div class="shop-section" style="margin-top: 40px;">
      <h3 class="section-title">神秘盲盒</h3>
      <div class="shelf-container">
        ${shelvesHtml}
        <div class="shelf-board"></div>
      </div>
    </div>
  `;
}

function openMysteryBox(poolKey) {
  const pool = BOX_POOLS[poolKey];
  if (userStars < pool.price) {
    showToast("星迹不足，快去记录吧！");
    return;
  }
  
  userStars -= pool.price;
  localStorage.setItem("mini-stars", userStars.toString());
  renderShop(); 

  const overlay = document.getElementById("boxOverlay");
  const boxContainer = document.getElementById("openingBoxContainer");
  const resultEl = document.getElementById("boxResult");
  
  overlay.style.display = "flex";
  boxContainer.style.display = "flex";
  resultEl.style.display = "none";
  resultEl.innerHTML = "";
  
  boxContainer.innerHTML = `<img src="${pool.img}" style="width: 120px; height: 120px; object-fit: contain;">`;

  boxContainer.style.animation = "none";
  boxContainer.offsetHeight; 
  boxContainer.style.animation = "boxShake 0.4s ease-in-out infinite";

  setTimeout(() => {
    boxContainer.style.display = "none";
    
    const randomIndex = Math.floor(Math.random() * pool.items.length);
    const drawnItem = pool.items[randomIndex];
    const isDuplicate = unlockedBadges.includes(drawnItem.id);
    
    if (isDuplicate) {
      // 退款提高到 40%
      const refund = Math.floor(pool.price * 0.4);
      userStars += refund;
      localStorage.setItem("mini-stars", userStars.toString());
      
      resultEl.innerHTML = `
        <div class="luxury-badge" style="filter: grayscale(100%); opacity: 0.5; --c1: #ccc; --c2: #999; width: 80px; height: 80px;">
          ${drawnItem.icon}
        </div>
        <div class="result-title" style="color: #666; margin-top: 16px;">重复的【${drawnItem.title}】</div>
        <div class="result-desc" ...>已退还 ${STAR_ICON} ${refund} 星迹</div>
        <button class="primary" style="margin-top: 24px; width: 100%;" onclick="document.getElementById('boxOverlay').style.display='none'; renderShop();">我知道了</button>
      `;
    } else {
      unlockedBadges.push(drawnItem.id);
      localStorage.setItem("mini-badges", JSON.stringify(unlockedBadges));
      
      resultEl.innerHTML = `
        <div class="luxury-badge" style="--c1: ${drawnItem.color1}; --c2: ${drawnItem.color2}; width: 90px; height: 90px; margin-bottom: 20px;">
          ${drawnItem.icon}
        </div>
        <div class="result-title" style="color: var(--accent); font-size: 18px;">🎉 获得全新徽章</div>
        <div class="result-name">【${drawnItem.title}】</div>
        <button class="primary" style="margin-top: 24px; width: 100%;" onclick="document.getElementById('boxOverlay').style.display='none'; renderShop();">收入橱窗</button>
      `;
    }
    
    resultEl.style.display = "flex";
    resultEl.style.animation = "popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards";
    
  }, 800); 
}