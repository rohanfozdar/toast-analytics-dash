export function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function dayOfWeekLabel(d) {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
}

export function presetToRange(preset) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 90;
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  return { start, end };
}

export function getWeeksInRange(start, end) {
  const ms = end.getTime() - start.getTime();
  const weeks = ms / (7 * 24 * 60 * 60 * 1000);
  return Math.max(1, Math.round(weeks * 100) / 100);
}
