function toggleMilestone(id) {
  const item = entries.find((e) => e.id === id);
  if (!item) return;
  item.isMilestone = !item.isMilestone;
  saveEntries();
  render();
}