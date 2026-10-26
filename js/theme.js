let currentTheme = localStorage.getItem("mini-theme") || "default";
// 获取已拥有的主题列表，默认拥有"default"
let ownedThemes = JSON.parse(localStorage.getItem("mini-owned-themes") || '["default"]');

function buyTheme(themeName, price) {
  // 如果已经买过了，直接切换
  if (ownedThemes.includes(themeName)) {
    setTheme(themeName);
    return;
  }
  if (userStars < price) {
    showToast("星迹不足，快去记录吧！");
    return;
  }
  
  if (confirm(`确定花费 ${price} 星迹解锁并切换至该主题吗？`)) {
    userStars -= price;
    localStorage.setItem("mini-stars", userStars.toString());
    
    // 记录已购买
    ownedThemes.push(themeName);
    localStorage.setItem("mini-owned-themes", JSON.stringify(ownedThemes));
    
    setTheme(themeName); 
  }
}

// 核心图标库
const THEME_ICONS = {
  // 默认主题：极简 Lucide 线条
  default: {
    bell: `<svg class="star-svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>`,
    pencil: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>`,
    camera: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"/><circle cx="12" cy="13" r="3"/></svg>`,
    card: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.65 7.65a2 2 0 012.629-1.046l5.51 2.374a2 2 0 011.046 2.628l-3.957 9.184a2 2 0 01-2.628 1.046l-5.51-2.374a2 2 0 01-1.046-2.628z"/><path d="M18 7.777V4a2 2 0 00-2-2h-6a2 2 0 00-2 2v10a2 2 0 001.137 1.805"/><path d="m8 4.389-4.364.809a2 2 0 00-1.602 2.33l1.822 9.833a2 2 0 002.331 1.602l2.542-.47"/></svg>`
  },
  
  // 新主题：手账涂鸦风（你刚找的彩色图标）
  doodle: {
    bell: `<img src="./assets/theme-doodle/bell.svg" style="width: 16px; height: 16px; object-fit: contain;">`,
    pencil: `<img src="./assets/theme-doodle/pencil.svg" style="width: 16px; height: 16px; object-fit: contain; vertical-align: middle; margin-right: 4px;">`,
    camera: `<img src="./assets/theme-doodle/camera.svg" style="width: 16px; height: 16px; object-fit: contain;">`,
    card: `<img src="./assets/theme-doodle/card.svg" style="width: 16px; height: 16px; object-fit: contain;">`
  }
};

// 全局获取图标的函数
function getIcon(name) {
  return THEME_ICONS[currentTheme][name] || THEME_ICONS["default"][name];
}

// 切换主题并刷新页面
function setTheme(themeName) {
  currentTheme = themeName;
  localStorage.setItem("mini-theme", themeName);
  
  // 【关键新增】把主题写到 html 标签上
  if (themeName === "default") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", themeName);
  }
  
  render(); 
  showToast("外观已切换！");
}