// @ts-nocheck
import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  getModifierPerformance,
  getModifierAttachRate,
  getUpsellRevenue,
} from '../../lib/calculations';
import KpiCard from '../shared/KpiCard';
import { CHART_COLORS } from '../../lib/chartColors';
import { formatCurrency, formatPercent, formatCount } from '../../lib/format';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const currencyFmt = formatCurrency;

export default function ModifierPerformance({
  modifierSelections,
  itemSelections,
  checks,
  start,
  end,
}) {
  const rows = useMemo(
    () => getModifierPerformance(modifierSelections, checks, start, end),
    [modifierSelections, checks, start, end]
  );

  const attachRate = useMemo(
    () => getModifierAttachRate(modifierSelections, itemSelections, checks, start, end),
    [modifierSelections, itemSelections, checks, start, end]
  );

  const { upsellRevenue, pctOfNetSales } = useMemo(
    () => getUpsellRevenue(modifierSelections, checks, start, end),
    [modifierSelections, checks, start, end]
  );

  const top = rows.slice(0, 10);
  const barData = {
    labels: top.map(r => r.modifierName),
    datasets: [{
      label: 'Modifier Revenue',
      data: top.map(r => r.revenue),
      backgroundColor: CHART_COLORS[2],
      borderRadius: 4,
    }],
  };
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => currencyFmt(ctx.parsed.x) } },
    },
    scales: { x: { ticks: { callback: v => currencyFmt(v) } } },
  };

  return (
    <section data-section="modifiers">
      <h2 className="chart-section-title" style={{ marginBottom: 0 }}>Modifier Performance</h2>

      <div className="kpi-grid-3">
        <KpiCard label="Attach Rate (paid mods)" value={formatPercent(attachRate, 'ratio')} />
        <KpiCard label="Upsell Revenue" value={currencyFmt(upsellRevenue)} />
        <KpiCard label="Upsell % of Net Sales" value={formatPercent(pctOfNetSales, 'ratio')} />
      </div>

      <div data-chart="modifier-performance" style={{ marginTop: '24px' }}>
        <h3 className="chart-section-title">Top Modifiers by Revenue</h3>
        <div className="chart-canvas" style={{ height: '320px' }}>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      <table data-role="modifier-table">
        <thead>
          <tr>
            <th>Modifier</th>
            <th>Count</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.modifierName}>
              <td>{r.modifierName}</td>
              <td>{formatCount(r.count)}</td>
              <td>{currencyFmt(r.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
