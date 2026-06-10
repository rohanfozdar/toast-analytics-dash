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
import { getCashSummary } from '../../lib/calculations';
import { CHART_COLORS } from '../../lib/chartColors';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const currencyFmt = v =>
  v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function CashByActionChart({ cashEntries, start, end }) {
  const { labels, values } = useMemo(() => {
    const data = getCashSummary(cashEntries, start, end);
    return { labels: data.byAction.map(d => d.action), values: data.byAction.map(d => d.amount) };
  }, [cashEntries, start, end]);

  const data = {
    labels,
    datasets: [{ label: 'Amount', data: values, backgroundColor: CHART_COLORS[1], borderRadius: 4 }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => currencyFmt(ctx.parsed.y) } } },
    scales: { y: { ticks: { callback: v => currencyFmt(v) } } },
  };

  return (
    <div data-chart="cash-by-action">
      <h2 className="chart-section-title">Cash by Action</h2>
      <div className="chart-canvas" style={{ height: '280px' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
