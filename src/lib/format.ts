// @ts-nocheck

export function formatCurrency(v) {
  const n = Number(v) || 0;
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

/**
 * kind:
 *  - 'composition' : share of a whole (sums to ~100). Clamp display to [0, 100].
 *  - 'ratio'       : metric ratio (food%, labor%, void%, etc.). Not clamped.
 *  - 'change'      : period-over-period growth. Keep sign, allow >100 and <0, '+' prefix.
 */
export function formatPercent(v, kind = 'ratio') {
  if (v == null || isNaN(v)) return 'N/A';
  let n = Number(v);
  if (kind === 'composition') {
    if (n < 0) n = 0;
    if (n > 100) n = 100;
    return `${n.toFixed(1)}%`;
  }
  if (kind === 'change') {
    const sign = n > 0 ? '+' : '';
    return `${sign}${n.toFixed(1)}%`;
  }
  return `${n.toFixed(1)}%`;
}

export function formatCount(v) {
  const n = Number(v) || 0;
  return n.toLocaleString('en-US');
}

export function formatMinutes(v) {
  const n = Number(v) || 0;
  return `${n.toFixed(0)} min`;
}
