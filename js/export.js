// === 导出 Markdown ===
function exportMarkdown() {
  if (entries.length === 0) {
    alert("还没有记录哦！");
    return;
  }

  // 按日期倒序排列
  const sorted = entries.slice().sort((a, b) => b.date.localeCompare(a.date));
  
  // 按月份分组
  const groups = {};
  sorted.forEach(e => {
    const month = e.date.slice(0, 7); // YYYY-MM
    if (!groups[month]) groups[month] = [];
    groups[month].push(e);
  });

  let md = "# 拾迹--个人时光记\n\n";
  md += `> 导出于：${new Date().toLocaleString()}\n\n---\n\n`;

  Object.keys(groups).forEach(month => {
    const [y, m] = month.split("-");
    md += `## ${y} 年 ${parseInt(m, 10)} 月\n\n`;

    groups[month].forEach(e => {
      // 标题行：日期 + 星标 + 内容
      const star = e.isMilestone ? "★ " : "";
      md += `### ${e.date} ${star}${e.content}\n\n`;
      
      // 标签
      if (e.tags && e.tags.length > 0) {
        md += `**标签**：${e.tags.map(t => `#${t}`).join(" ")}\n\n`;
      }

      // 详情
      if (e.detail && e.detail.trim()) {
        // 把详情转为 Markdown 引用格式，并且每一行都加上 >
        const quoteDetail = e.detail.split('\n').map(line => `> ${line}`).join("\n");
        md += `${quoteDetail}\n\n`;
      }

      // 图片占位（目前只导出文本备份，图片如果以后做 zip 再带出来）
      if (e.images && e.images.length > 0) {
        md += `*(包含 ${e.images.length} 张图片，请通过 JSON 或 ZIP 备份获取)*\n\n`;
      }

      md += `---\n\n`;
    });
  });

  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  downloadFile(blob, `拾迹_${todayStr()}.md`);
}

// === 导出 JSON ===
function exportJson() {
  if (entries.length === 0) {
    alert("还没有记录哦！");
    return;
  }
  // 格式化 JSON，加上缩进方便人类阅读
  const dataStr = JSON.stringify(entries, null, 2);
  const blob = new Blob([dataStr], { type: "application/json;charset=utf-8" });
  downloadFile(blob, `拾迹备份_${todayStr()}.json`);
}

// 统一的下载辅助函数
function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  showToast("导出成功");
}