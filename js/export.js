function exportMarkdown() {
  const milestones = entries
    .filter((e) => e.isMilestone)
    .sort((a, b) => a.date.localeCompare(b.date));

  const all = entries.slice().sort((a, b) => b.date.localeCompare(a.date));

  let md = "# 我的大事时间轴\n\n";

  if (!milestones.length) {
    md += "暂无标记的大事\n\n";
  } else {
    milestones.forEach((e) => {
      md += `- ${e.date} ${e.content}`;
      if (e.tags && e.tags.length) {
        md += " " + e.tags.map((t) => `#${t}`).join(" ");
      }
      md += "\n";
      if (e.detail) {
        md += `  > ${e.detail.replace(/\n/g, "\n  > ")}\n`;
      }
    });
  }

  md += "\n# 全部记录\n\n";

  all.forEach((e) => {
    md += `## ${e.date}\n`;
    md += `- ${e.content}`;
    if (e.tags && e.tags.length) {
      md += " " + e.tags.map((t) => `#${t}`).join(" ");
    }
    md += "\n";
    if (e.detail) {
      md += `  > ${e.detail.replace(/\n/g, "\n  > ")}\n`;
    }
    md += "\n";
  });

  download("我的小事与大事.md", md, "text/markdown;charset=utf-8");
}

function exportJson() {
  download(
    "我的小事与大事备份.json",
    JSON.stringify(entries, null, 2),
    "application/json;charset=utf-8"
  );
}