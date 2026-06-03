// Resolves CSS custom properties to actual color values so Chart.js (which
// draws to canvas) can use them. CSS strings like "var(--chart-color-1)"
// don't work on canvas — Chart.js needs real hex/rgb values.
//
// We resolve once at module load against :root computed styles.

function resolveVar(name, fallback) {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export const CHART_COLORS = {
  1: resolveVar('--chart-color-1', '#C25B3F'),
  2: resolveVar('--chart-color-2', '#4A7C59'),
  3: resolveVar('--chart-color-3', '#D4936A'),
  4: resolveVar('--chart-color-4', '#6889A8'),
  5: resolveVar('--chart-color-5', '#9A7BB5'),
  6: resolveVar('--chart-color-6', '#C9A84C'),
};

export const CHART_COLOR_LIST = [
  CHART_COLORS[1], CHART_COLORS[2], CHART_COLORS[3],
  CHART_COLORS[4], CHART_COLORS[5], CHART_COLORS[6],
];

export const CHART_TEXT = resolveVar('--color-text-secondary', '#6B5E54');
export const CHART_GRID = resolveVar('--color-border-subtle', '#F0EAE3');

// Global Chart.js defaults — call once at app boot.
export function applyChartDefaults(ChartJS) {
  ChartJS.defaults.font.family = "'DM Sans', system-ui, sans-serif";
  ChartJS.defaults.font.size = 12;
  ChartJS.defaults.color = CHART_TEXT;
  ChartJS.defaults.borderColor = CHART_GRID;
  ChartJS.defaults.plugins.legend.labels.usePointStyle = true;
  ChartJS.defaults.plugins.legend.labels.boxWidth = 8;
  ChartJS.defaults.plugins.tooltip.backgroundColor = '#2A211B';
  ChartJS.defaults.plugins.tooltip.titleFont = { family: "'DM Sans'", weight: '600', size: 12 };
  ChartJS.defaults.plugins.tooltip.bodyFont = { family: "'DM Sans'", size: 12 };
  ChartJS.defaults.plugins.tooltip.padding = 10;
  ChartJS.defaults.plugins.tooltip.cornerRadius = 6;
}
