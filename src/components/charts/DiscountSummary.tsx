// @ts-nocheck
import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getDiscountSummary, getVoidSummary } from '../../lib/calculations';
import KpiCard from '../shared/KpiCard';
import { CHART_COLORS } from '../../lib/chartColors';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const currencyFmt = v =>
  v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function DiscountSummary({ checks, itemSelections, start, end }) {
  const discountStats = useMemo(
    () => getDiscountSummary(checks, start, end),
    [checks, start, end]
  );

  const voidStats = useMemo(
    () => getVoidSummary(itemSelections, checks, start, end),
    [itemSelections, checks, start, end]
  );

  const { totalDiscountAmt, discountedCheckCount, discountPctOfGross, byReason } = discountStats;

  const discountAlertLevel =
    discountPctOfGross > 15 ? 'high' :
    discountPctOfGross >= 8 ? 'caution' :
    undefined;

  const barData = {
    labels: byReason.map(r => r.reason),
    datasets: [{
      label: 'Discount Amount by Reason',
      data: byReason.map(r => r.amount),
      backgroundColor: CHART_COLORS[1],
      borderRadius: 4,
    }],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => currencyFmt(ctx.parsed.y) } } },
    scales: { y: { ticks: { callback: v => currencyFmt(v) } } },
  };

  return (
    <div>
      <h2 className="chart-section-title" style={{ marginBottom: 0 }}>Discounts &amp; Voids</h2>

      <div className="kpi-grid-3">
        <KpiCard label="Total Discount Amount" value={currencyFmt(totalDiscountAmt)} />
        <KpiCard label="Discounted Checks" value={discountedCheckCount.toLocaleString()} />
        <div data-alert={discountAlertLevel}>
          <KpiCard
            label="Discount % of Gross Revenue"
            value={`${discountPctOfGross.toFixed(1)}%`}
          />
        </div>
      </div>

      <div data-chart="discount-by-reason" style={{ marginTop: '24px' }}>
        <h2 className="chart-section-title">Discount Amount by Reason</h2>
        <div className="chart-canvas" style={{ height: '280px' }}>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      <div data-role="void-summary">
        <h3>Voids</h3>
        <div className="kpi-grid-2">
          <KpiCard label="Total Void Amount" value={currencyFmt(voidStats.totalVoidAmt)} />
          <KpiCard label="Total Void Count" value={voidStats.totalVoidCount.toLocaleString()} />
        </div>
      </div>
    </div>
  );
}