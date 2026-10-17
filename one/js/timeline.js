function renderTimeline() {
  const milestones = entries
    .filter((e) => e.isMilestone)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (!milestones.length) {
    timelineEl.innerHTML =
      '<div class="empty">还没有标记大事。去记录页点“标记大事”吧。</div>';
    return;
  }

  let html = "";
  let currentYear = "";

  milestones.forEach((e) => {
    const year = e.date.slice(0, 4);
    if (year !== currentYear) {
      currentYear = year;
      html += `<div class="year">${escapeHtml(year)}</div>`;
    }

    const tagsHtml =
      e.tags && e.tags.length
        ? `<div class="tags">${e.tags
            .map((t) => `<span class="tag">#${escapeHtml(t)}</span>`)
            .join("")}</div>`
        : "";

    html += `
      <div class="timeline-item">
        <div class="dot"></div>
        <div>
          <div class="date">${escapeHtml(e.date)}</div>
          <div class="content">${escapeHtml(e.content)}</div>
          ${tagsHtml}
        </div>
      </div>
    `;
  });

  timelineEl.innerHTML = html;
}