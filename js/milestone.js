function toggleMilestone(id) {
  const item = entries.find((e) => e.id === id);
  if (!item) return;
  item.isMilestone = !item.isMilestone;
  // 只要标记为大事，直接加 10 星迹（内部会自动扣减今日额度）
  if (item.isMilestone) {
    addStars(10);
  }
  saveEntries();
  render();
}