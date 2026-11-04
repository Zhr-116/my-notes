const STAR_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px;"><path d="M12.983 21.186a1 1 0 0 1-1.966 0 10 10 0 0 0-8.203-8.203 1 1 0 0 1 0-1.966 10 10 0 0 0 8.203-8.203 1 1 0 0 1 1.966 0 10 10 0 0 0 8.203 8.203 1 1 0 0 1 0 1.966 10 10 0 0 0-8.203 8.203"/></svg>`;

const CARD_POOL = [
  { id: "card_01", title: "为你鼓掌", rarity: "N", img: "./assets/cards/card_01.png", quote: "太棒啦！" },
  { id: "card_02", title: "眼里有光", rarity: "N", img: "./assets/cards/card_02.png", quote: "今天也充满了期待。" },
  { id: "card_03", title: "一点魔法", rarity: "R", img: "./assets/cards/card_03.png", quote: "一点点魔法，就能点亮心情。" },
  { id: "card_04", title: "偷偷比心", rarity: "R", img: "./assets/cards/card_04.png", quote: "给你一点甜。" },
  { id: "card_05", title: "探索未知", rarity: "R", img: "./assets/cards/card_05.png", quote: "一起看看这个世界吧。" },
  { id: "card_06", title: "安静力量", rarity: "N", img: "./assets/cards/card_06.png", quote: "安静的时候，最接近自己。" },
  { id: "card_07", title: "记录此刻", rarity: "N", img: "./assets/cards/card_07.png", quote: "帮你把这一刻收好。" },
  { id: "card_08", title: "寻找答案", rarity: "N", img: "./assets/cards/card_08.png", quote: "这题好像有点难哦？" },
  { id: "card_09", title: "满满心意", rarity: "R", img: "./assets/cards/card_09.png", quote: "收下我全部的心意。" },
  { id: "card_10", title: "满载而归", rarity: "SSR", img: "./assets/cards/card_10.png", quote: "恭喜完成，这是属于你的荣光。" }
];

let isBadgeGridExpanded = false;
let isCardGridExpanded = false;

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
  animal: {
    name: "林间生灵", price: 120, 
    img: "./assets/box-yellow.svg", 
    items: [
      { id: "a1", title: "猫", color1: "#fca5a5", color2: "#991b1b", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z" /><path d="M8 14v.5" /><path d="M16 14v.5" /><path d="M11.25 16.25h1.5L12 17l-.75-.75Z" /></svg>` },
      { id: "a2", title: "狗", color1: "#fcd34d", color2: "#b45309", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.25 16.25h1.5L12 17z" /><path d="M16 14v.5" /><path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309" /><path d="M8 14v.5" /><path d="M8.5 8.5c-.384 1.05-1.083 2.028-2.344 2.5-1.931.722-3.576-.297-3.656-1-.113-.994 1.177-6.53 4-7 1.923-.321 3.651.845 3.651 2.235A7.497 7.497 0 0 1 14 5.277c0-1.39 1.844-2.598 3.767-2.277 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5" /></svg>` },
      { id: "a3", title: "爪印", color1: "#f9a8d4", color2: "#831843", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/></svg>` },
      { id: "a4", title: "飞鸟", color1: "#93c5fd", color2: "#1e40af", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 7h.01" /><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20" /><path d="m20 7 2 .5-2 .5" /><path d="M10 18v3" /><path d="M14 17.75V21" /><path d="M7 18a6 6 0 0 0 3.84-10.61" /></svg>` },
      { id: "a5", title: "游鱼", color1: "#5eead4", color2: "#115e59", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" /><path d="M18 12v.5" /><path d="M16 17.93a9.77 9.77 0 0 1 0-11.86" /><path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33" /><path d="M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4" /><path d="m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98" /></svg>` }
    ]
  }
};

function renderShop() {
  const container = document.getElementById("shopContent");
  if (!container) return;

  let badgesHtml = "";
  const allItems = Object.values(BOX_POOLS).flatMap(p => p.items);
  const totalItemsCount = allItems.length;
  const validUnlockedBadges = unlockedBadges.map(id => allItems.find(b => b.id === id)).filter(b => b !== undefined);
  const validUnlockedCount = validUnlockedBadges.length;

  if (validUnlockedCount === 0) {
    badgesHtml = `<div class="empty" style="grid-column: 1/-1; padding: 20px 0; font-size: 13px; color: var(--text-tertiary);">继续记录，去解锁隐藏的惊喜吧！</div>`;
  } else {
    const badgesToDisplay = (!isBadgeGridExpanded && validUnlockedCount > 4) ? validUnlockedBadges.slice(0, 4) : validUnlockedBadges;
    badgesHtml = badgesToDisplay.map(badge => `
      <div class="badge-item">
        <div class="luxury-badge" style="--c1: ${badge.color1}; --c2: ${badge.color2};">${badge.icon}</div>
        <span class="badge-name">${badge.title}</span>
      </div>
    `).join("");
    if (validUnlockedCount > 4) {
      badgesHtml += `
        <div style="grid-column: 1 / -1; text-align: center; margin-top: -6px; margin-bottom: -6px;">
          <button onclick="toggleBadgeGrid()" style="background: transparent; border: none; color: var(--text-tertiary); font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px;">
            ${isBadgeGridExpanded ? '收起橱窗 ▴' : `展开全部 ${validUnlockedCount} 款 ▾`}
          </button>
        </div>`;
    }
  }

  let cardsHtml = "";
  const totalCards = CARD_POOL.length;
  const unlockedCardList = CARD_POOL.filter(c => unlockedCards.includes(c.id));
  const validCardsCount = unlockedCardList.length;

  if (validCardsCount === 0) {
    cardsHtml = `<div class="empty" style="grid-column: 1/-1; padding: 20px 0; font-size: 13px; color: var(--text-tertiary);">继续记录，去收集拾迹的精灵卡牌吧！</div>`;
  } else {
    const cardsToDisplay = (!isCardGridExpanded && validCardsCount > 3) ? unlockedCardList.slice(0, 3) : unlockedCardList;
    cardsHtml = cardsToDisplay.map(card => `
      <div class="collect-card" onclick="previewCard('${card.id}')">
        <div class="card-inner">
          <img src="${card.img}" alt="${card.title}" class="card-img" loading="lazy">
          <div class="card-quote">${card.quote}</div>
        </div>
        <div class="card-rarity rarity-${card.rarity.toLowerCase()}">${card.rarity}</div>
      </div>
    `).join("");
    if (validCardsCount > 3) {
      cardsHtml += `
        <div style="grid-column: 1 / -1; text-align: center; margin-top: -6px; margin-bottom: -6px;">
          <button onclick="toggleCardGrid()" style="background: transparent; border: none; color: var(--text-tertiary); font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px;">
            ${isCardGridExpanded ? '收起卡册 ▴' : `展开全部 ${validCardsCount} 张 ▾`}
          </button>
        </div>`;
    }
  }

  let shelvesHtml = Object.keys(BOX_POOLS).map(key => {
    const box = BOX_POOLS[key];
    const poolTotal = box.items.length;
    const poolUnlocked = box.items.filter(item => unlockedBadges.includes(item.id)).length;
    return `
      <div class="mystery-box" onclick="openMysteryBox('${key}')">
        <div class="box-progress">${poolUnlocked}/${poolTotal}</div>
        <img src="${box.img}" alt="${box.name}" class="box-img" loading="lazy">
        <div class="box-price">${STAR_ICON} ${box.price}</div>
      </div>`;
  }).join("");

  container.innerHTML = `
    <div class="shop-header">
      <div class="stars-display">${STAR_ICON} 星迹：<span>${userStars}</span></div>
    </div>

    <div class="shop-section">
      <h3 class="section-title">荣誉橱窗 <span style="font-size: 12px; color: var(--text-tertiary); font-weight: normal; margin-left: 8px;">已集齐 ${validUnlockedCount} / ${totalItemsCount} 款</span></h3>
      <div class="badge-showcase">${badgesHtml}</div>
    </div>

    <div class="shop-section" style="margin-top: 40px;">
      <h3 class="section-title">拾迹精灵 <span style="font-size: 12px; color: var(--text-tertiary); font-weight: normal; margin-left: 8px;">已收集 ${validCardsCount} / ${totalCards} 张</span></h3>
      <div class="card-grid" id="shopCardGrid">${cardsHtml}</div>
    </div>

    <div class="shop-section" style="margin-top: 40px;">
      <h3 class="section-title">神秘盲盒</h3>
      <div class="shelf-container">
        ${shelvesHtml}
        <div class="mystery-box" onclick="openCardPack()">
          <div class="box-progress">${validCardsCount}/${totalCards}</div>
          <div class="box-img" style="display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="6" y="4" width="12" height="16" rx="2" ry="2" transform="rotate(-15 12 12)" fill="var(--accent-soft)"></rect>
              <rect x="6" y="4" width="12" height="16" rx="2" ry="2" fill="var(--surface)"></rect>
              <path d="M12 8v8"></path><path d="M9 12h6"></path>
            </svg>
          </div>
          <div class="box-price">${STAR_ICON} 200</div>
        </div>
        <div class="shelf-board"></div>
      </div>
    </div>

    <!-- 【新增】功能道具区 -->
    <div class="shop-section" style="margin-top: 40px;">
      <h3 class="section-title">功能道具</h3>
      <div class="theme-card" style="background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center;">
        
        <!-- 左侧：名字与购买 -->
        <div style="display: flex; flex-direction: column; gap: 6px; flex: 1;">
          <h4 style="margin: 0; font-size: 15px; color: var(--text-primary); font-weight: 600;">拾光回溯卡</h4>
          <p style="margin: 0; font-size: 12px; color: var(--text-tertiary);">用于补救断签的心情或习惯。</p>
          <div>
            <button onclick="buyReplenishCard()" class="primary" style="padding: 6px 12px; font-size: 13px; border-radius: 8px; background: ${getReplenishPrice() === 800 ? '#ef4444' : 'var(--text-primary)'}; color: white;">
              ${getReplenishPrice()} 星迹购买
            </button>
            ${getReplenishPrice() === 800 ? `<span style="font-size: 11px; color: #ef4444; margin-left: 8px;">冷却溢价中</span>` : ``}
          </div>
        </div>

        <!-- 右侧：书包与库存 -->
        <div onclick="openInventoryModal()" style="cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; padding: 8px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"><path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8Z"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M8 21v-5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5"/></svg>
          <span style="font-size: 11px; color: var(--text-tertiary); margin-top: 4px;">库存 ${inventory.replenishCard || 0}</span>
        </div>
      </div>
    </div>

    <!-- 外观装扮区 -->
    <div class="shop-section" style="margin-top: 40px; margin-bottom: 40px;">
      <h3 class="section-title">外观装扮</h3>
      
      <!-- 使用 flex 容器和 gap 统一控制间距，不用给每个卡片写 margin-bottom 了 -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        
        <!-- 手账风 -->
        <div class="theme-card" style="background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <h4 style="margin: 0; font-size: 15px; color: var(--text-primary); font-weight: 500;">手账涂鸦包</h4>
          </div>
          ${ownedThemes.includes('doodle')
            ? `<span style="font-size: 13px; color: var(--text-tertiary);">已在“我的”页面解锁</span>`
            : `<button onclick="buyTheme('doodle', 500)" class="primary" style="padding: 6px 14px; font-size: 13px;">500 解锁</button>`
          }
        </div>

        <!-- 落日橘 -->
        <div class="theme-card" style="background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <h4 style="margin: 0; font-size: 15px; color: var(--text-primary); font-weight: 500;">落日橘</h4>
          </div>
          ${ownedThemes.includes('sunset')
            ? `<span style="font-size: 13px; color: var(--text-tertiary);">已在“我的”页面解锁</span>`
            : `<button onclick="buyTheme('sunset', 300)" class="primary" style="padding: 6px 14px; font-size: 13px;">300 解锁</button>`
          }
        </div>

        <!-- 纯正圆角气泡 -->
        <div class="theme-card" style="background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <h4 style="margin: 0; font-size: 15px; color: var(--text-primary); font-weight: 500;">纯正圆角 气泡</h4>
          </div>
          ${ownedBubbles.includes('round')
            ? `<span style="font-size: 13px; color: var(--text-tertiary);">已拥有，去碎碎念切换</span>`
            : `<button onclick="buyBubble('round', 150)" class="primary" style="padding: 6px 14px; font-size: 13px;">150 解锁</button>`
          }
        </div>

        <!-- 荧光叠色气泡 -->
        <div class="theme-card" style="background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <h4 style="margin: 0; font-size: 15px; color: var(--text-primary); font-weight: 500;">荧光叠色 气泡</h4>
          </div>
          ${ownedBubbles.includes('highlighter')
            ? `<span style="font-size: 13px; color: var(--text-tertiary);">已拥有，去碎碎念切换</span>`
            : `<button onclick="buyBubble('highlighter', 300)" class="primary" style="padding: 6px 14px; font-size: 13px;">300 解锁</button>`
          }
        </div>

      </div>
    </div>

    <!-- 拾光兑换所（在原有外观装扮下面） -->
    <div class="shop-section" style="margin-top: 40px; margin-bottom: 40px;">
      <h3 class="section-title">
        拾光兑换所 
        <span style="font-size: 12px; color: var(--text-tertiary); font-weight: normal; margin-left: 8px;">
          当前兑换券：${inventory.ticket || 0} 张
        </span>
      </h3>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: var(--surface); padding: 16px; border-radius: 12px; border: 1px solid var(--border);">
        ${MONTH_TITLES.map(month => {
          const isUnlocked = unlockedTitles.includes(month.name);
          return `
            <div onclick="${isUnlocked ? '' : `exchangeTitle('${month.name}')`}" 
                 style="position: relative; padding: 12px 0; border-radius: 8px; text-align: center; font-family: 'Kaiti', serif; font-size: 15px; font-weight: bold;
                        background: ${isUnlocked ? month.color : 'var(--surface-muted)'};
                        color: ${isUnlocked ? '#333' : 'var(--text-tertiary)'};
                        cursor: ${isUnlocked ? 'default' : 'pointer'};
                        opacity: ${isUnlocked ? '1' : '0.6'};">
              ${month.name}
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function buyTheme(themeName, price) {
  // 如果已经拥有，直接提示
  if (ownedThemes.includes(themeName)) {
    showToast("你已经在设置里解锁这个主题啦");
    return;
  }
  
  if (userStars < price) {
    showToast("星迹不足，快去记录吧！");
    return;
  }
  
  if (confirm(`确定花费 ${price} 星迹解锁该主题吗？\n（解锁后可随时在“我的”页面自由切换）`)) {
    userStars -= price;
    localStorage.setItem("mini-stars", userStars.toString());
    
    // 记录已购买
    ownedThemes.push(themeName);
    localStorage.setItem("mini-owned-themes", JSON.stringify(ownedThemes));
    
    // 刷新商店视图，更新按钮状态
    renderShop(); 
    showToast("✨ 解锁成功！快去“我的”页面换上吧");
  }
}

// 购买气泡
function buyBubble(bubbleId, price) {
  if (ownedBubbles.includes(bubbleId)) {
    showToast("你已拥有该气泡");
    return;
  }
  if (userStars < price) {
    showToast("星迹不足，快去记录吧！");
    return;
  }
  if (confirm(`确定花费 ${price} 星迹解锁该气泡吗？\n（解锁后可在碎碎念顶部的标题里切换）`)) {
    userStars -= price;
    localStorage.setItem("mini-stars", userStars.toString());
    
    ownedBubbles.push(bubbleId);
    saveBubbles(); // 调用 state.js 里存数据的函数
    
    renderShop(); // 刷新商店视图
    showToast("✨ 气泡解锁成功！");
  }
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
  // 强制重置 HTML，防止被卡牌撑爆
  overlay.innerHTML = `
    <div id="openingBoxContainer" style="width: 200px; height: 200px; display: flex; align-items: center; justify-content: center;"></div>
    <div id="boxResult" style="display: none; width: 320px; background: #fff; border-radius: 24px; padding: 40px 20px; text-align: center; flex-direction: column; align-items: center; position: relative; box-shadow: 0 20px 50px rgba(0,0,0,0.3);"></div>
  `;
  const boxContainer = document.getElementById("openingBoxContainer");
  const resultEl = document.getElementById("boxResult");
  
  overlay.style.display = "flex";
  boxContainer.style.display = "flex";
  resultEl.style.display = "none";
  
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
      const refund = Math.floor(pool.price * 0.4);
      userStars += refund;
      localStorage.setItem("mini-stars", userStars.toString());
      resultEl.innerHTML = `
        <div class="luxury-badge" style="filter: grayscale(100%); opacity: 0.5; --c1: #ccc; --c2: #999; width: 80px; height: 80px;">${drawnItem.icon}</div>
        <div class="result-title" style="color: #666; margin-top: 16px;">重复的【${drawnItem.title}】</div>
        <div class="result-desc" style="color: var(--text-secondary); font-size: 14px;">已退还 ${STAR_ICON} ${refund} 星迹</div>
        <button class="primary" style="margin-top: 24px; width: 100%;" onclick="document.getElementById('boxOverlay').style.display='none'; document.getElementById('boxOverlay').innerHTML = ''; renderShop();">我知道了</button>
      `;
    } else {
      unlockedBadges.push(drawnItem.id);
      checkStoryTrigger("draw_box");
      localStorage.setItem("mini-badges", JSON.stringify(unlockedBadges));
      resultEl.innerHTML = `
        <div class="luxury-badge" style="--c1: ${drawnItem.color1}; --c2: ${drawnItem.color2}; width: 90px; height: 90px; margin-bottom: 20px;">${drawnItem.icon}</div>
        <div class="result-title" style="color: var(--accent); font-size: 18px;">获得全新徽章</div>
        <div class="result-name">【${drawnItem.title}】</div>
        <button class="primary" style="margin-top: 24px; width: 100%;" onclick="document.getElementById('boxOverlay').style.display='none'; document.getElementById('boxOverlay').innerHTML = ''; renderShop();">收入橱窗</button>
      `;
    }
    resultEl.style.display = "flex";
    resultEl.style.animation = "popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards";
  }, 800); 
}

function openCardPack() {
  const price = 200;
  if (userStars < price) {
    showToast("星迹不足，快去记录吧！");
    return;
  }
  
  userStars -= price;
  localStorage.setItem("mini-stars", userStars.toString());
  
  const unownedCards = CARD_POOL.filter(c => !unlockedCards.includes(c.id));
  const ownedCount = CARD_POOL.length - unownedCards.length;
  
  let drawnCard;
  let targetRarity;

  if (ownedCount >= 5 && unownedCards.length > 0) {
    if (Math.random() < 0.8) {
      drawnCard = unownedCards[Math.floor(Math.random() * unownedCards.length)];
    } else {
      const rand = Math.random() * 100;
      targetRarity = rand < 5 ? "SSR" : (rand < 30 ? "R" : "N");
      const pool = CARD_POOL.filter(c => c.rarity === targetRarity);
      drawnCard = pool[Math.floor(Math.random() * pool.length)];
    }
  } else {
    const rand = Math.random() * 100;
    targetRarity = rand < 5 ? "SSR" : (rand < 30 ? "R" : "N");
    const pool = CARD_POOL.filter(c => c.rarity === targetRarity);
    drawnCard = pool[Math.floor(Math.random() * pool.length)];
  }

  if (unownedCards.length === 0) {
    const rand = Math.random() * 100;
    targetRarity = rand < 5 ? "SSR" : (rand < 30 ? "R" : "N");
    const pool = CARD_POOL.filter(c => c.rarity === targetRarity);
    drawnCard = pool[Math.floor(Math.random() * pool.length)];
  }

  const isDuplicate = unlockedCards.includes(drawnCard.id);

  if (!isDuplicate) {
    unlockedCards.push(drawnCard.id);
    saveCards();
    checkStoryTrigger("draw_box"); 
  }

  playCardDrawAnimation(drawnCard, isDuplicate);
}

function playCardDrawAnimation(card, isDuplicate) {
  const overlay = document.getElementById("boxOverlay");
  overlay.style.display = "flex";
  
  overlay.innerHTML = `
    <div class="flip-card-container">
      <div class="flip-card" id="drawFlipCard">
        <div class="flip-card-back" style="background: url('./assets/card-back.jpg') center/cover; background-size: cover;"></div>
        <div class="flip-card-front">
          <div class="card-inner">
            <img src="${card.img}" class="card-img" loading="lazy">
            <div class="card-quote">${card.quote}</div>
          </div>
          <div class="card-rarity rarity-${card.rarity.toLowerCase()}" style="position: absolute; top: 6px; right: 6px; z-index: 5;">${card.rarity}</div>
        </div>
      </div>
    </div>
    
    <div id="cardResultContent" style="opacity: 0; display: flex; flex-direction: column; align-items: center; margin-top: 20px; transition: opacity 0.6s ease; text-align: center;">
      <div style="font-size: 12px; color: #a1a1aa; letter-spacing: 1px;">${isDuplicate ? '重复获得' : '获得全新卡牌'}</div>
      <div style="font-size: 18px; font-family: 'Songti SC', serif; font-weight: 700; margin: 6px 0; color: #fff;">【${card.title}】</div>
      <div style="font-size: 12px; color: #fcd34d; margin-bottom: 16px;">${isDuplicate ? '自动转化为 80 星迹' : '已收入拾迹精灵图鉴'}</div>
      <button class="primary" style="width: 160px; background: #fff; color: #333; border-radius: 20px; padding: 10px; font-size: 14px; font-weight: bold;" onclick="document.getElementById('boxOverlay').style.display='none'; document.getElementById('boxOverlay').innerHTML = ''; renderShop();">收下卡牌</button>
    </div>
  `;

  if (isDuplicate) {
    userStars += 80; 
    localStorage.setItem("mini-stars", userStars.toString());
  }

  const flipCard = document.getElementById("drawFlipCard");
  const resultContent = document.getElementById("cardResultContent");
  
  flipCard.style.animation = "cardShake 0.5s ease-in-out 2"; 
  
  setTimeout(() => {
    flipCard.style.animation = "none";
    void flipCard.offsetWidth; 
    flipCard.classList.add("flipped");
    setTimeout(() => {
      resultContent.style.opacity = "1";
    }, 800); 
  }, 1000); 
}

function previewCard(cardId) {
  const card = CARD_POOL.find(c => c.id === cardId);
  if (!card) return;
  
  const overlay = document.getElementById("boxOverlay");
  overlay.style.display = "flex";
  
  overlay.innerHTML = `
    <div class="collect-card" style="width: 240px; height: 340px; padding: 12px; border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); transform: scale(1.1);">
      <div class="card-inner">
        <img src="${card.img}" class="card-img" loading="lazy">
        <div class="card-quote">${card.quote}</div>
      </div>
      <div class="card-rarity rarity-${card.rarity.toLowerCase()}" style="font-size: 12px; padding: 4px 8px; top: 8px; right: 8px; z-index: 5;">${card.rarity}</div>
    </div>
    <button class="primary" style="margin-top: 40px; background: #fff; color: #333; padding: 10px 30px; border-radius: 20px;" onclick="document.getElementById('boxOverlay').style.display='none'; document.getElementById('boxOverlay').innerHTML = '';">关闭预览</button>
  `;
}

function toggleCardGrid() {
  isCardGridExpanded = !isCardGridExpanded;
  renderShop();
}

function toggleBadgeGrid() {
  isBadgeGridExpanded = !isBadgeGridExpanded;
  renderShop();
}

// 购买补签卡
function buyReplenishCard() {
  const price = getReplenishPrice();
  
  if (userStars < price) {
    showToast("星迹不足，快去记录吧！");
    return;
  }
  
  if (confirm(`确定花费 ${price} 星迹购买 1 张【拾光回溯卡】吗？\n\n购买后若7天内未达成连续打卡7天，下次购买价格将上涨至800星迹。`)) {
    userStars -= price;
    localStorage.setItem("mini-stars", userStars.toString());
    
    // 增加库存
    inventory.replenishCard = (inventory.replenishCard || 0) + 1;
    saveInventory();
    
    // 记录购买时间
    localStorage.setItem("mini-last-replenish-date", Date.now().toString());
    
    renderShop(); // 刷新商店，价格会自动变成 800
    showToast("购买成功，已存入背包");
  }
}

function openInventoryModal() {
  document.getElementById("inventoryModal").hidden = false;
  
  const contentEl = document.querySelector("#inventoryModal .modal-content");
  const cards = inventory.replenishCard || 0;

  // 1. 寻找所有可以补签的习惯记录（只找昨天和前天的漏签）
  let canReplenishList = [];
  const today = new Date();
  
  [1, 2].forEach(daysAgo => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    
    // 遍历所有习惯
    if (typeof habits !== 'undefined') {
      habits.forEach(h => {
        // 1. 判断这一天是否在习惯的开启日之后
        const isValidDate = !h.startDate || dateStr >= h.startDate;
        
        // 2. 真正把 isValidDate 加上，同时去掉 length > 0（允许 0 次打卡的新习惯出现在待补签列表中）
        if (isValidDate && !h.isCompleted && !h.completedDates.includes(dateStr)) {
          canReplenishList.push({ habitId: h.id, title: h.title, dateStr: dateStr, dateName: daysAgo === 1 ? "昨天" : "前天" });
        }
      });
    }
  });

  // 2. 拼装 HTML
  let html = `
    <div class="modal-header">
      <span class="modal-date">时光回溯台</span>
      <button class="close-btn" onclick="document.getElementById('inventoryModal').hidden = true">×</button>
    </div>
    <div style="text-align: center; padding: 10px 0;">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 10px;"><path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8Z"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M8 21v-5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5"/></svg>
      <h3 style="font-size: 18px; margin-bottom: 20px;">拾光回溯卡：${cards} 张</h3>
  `;

  if (canReplenishList.length === 0) {
    html += `<p style="font-size: 13px; color: var(--text-tertiary);">近期没有漏签的记录，继续保持哦！</p>`;
  } else {
    html += `<div style="text-align: left; background: var(--surface-muted); border-radius: 12px; padding: 12px; margin-bottom: 10px;">`;
    html += `<div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">发现以下可挽回的痕迹：</div>`;
    
    canReplenishList.forEach((item, index) => {
      html += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px dashed var(--border);">
          <span style="font-size: 14px; color: var(--text-primary);">${escapeHtml(item.title)} <span style="font-size: 11px; color: var(--text-tertiary);">(${item.dateName})</span></span>
          <button onclick="handleInventoryReplenish('${item.habitId}', '${item.dateStr}')" class="primary" style="padding: 4px 10px; font-size: 12px; border-radius: 6px;">补签</button>
        </div>
      `;
    });
    html += `</div>`;
  }

  html += `</div>`;
  contentEl.innerHTML = html;
}

// 在背包里点击补签
function handleInventoryReplenish(habitId, dateStr) {
  document.getElementById("inventoryModal").hidden = true; // 先关掉弹窗
  handleReplenishHabit(habitId, dateStr); // 直接复用我们在 plan.js 里写好的丝滑连招！
}

function exchangeTitle(titleName) {
  const tickets = inventory.ticket || 0;
  if (tickets <= 0) {
    showToast("兑换券不足，去连签 30 天获取吧！");
    return;
  }
  if (!confirm(`确定消耗 1 张【拾光兑换券】解锁称号【${titleName}】吗？`)) return;

  inventory.ticket -= 1;
  saveInventory();

  if (!unlockedTitles.includes(titleName)) {
    unlockedTitles.push(titleName);
    saveUnlockedTitles();
  }

  renderShop(); // 刷新商店
  showToast(`成功解锁称号【${titleName}】！`);
}