function toggleMilestone(id) {
  const item = entries.find((e) => e.id === id);
  if (!item) return;
  
  item.isMilestone = !item.isMilestone;
  
  // 【防刷修复】：如果标记为大事，且这条记录以前从未领过大事奖励
  if (item.isMilestone && !item.hasClaimedMilestoneReward) {
    addStars(10);
    item.hasClaimedMilestoneReward = true; // 打上永久标记，取消再标记也不给了
  }
  
  saveEntries();
  render();
}