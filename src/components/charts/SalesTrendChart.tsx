// @ts-nocheck
import { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getNetSalesByDay } from '../../lib/calculations';
import { CHART_COLORS } from '../../lib/chartColors';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const currencyFmt = v =>
  v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const COMPARE_OPTIONS = [
  { value: '0', label: 'No comparison' },
  { value: '1', label: 'Previous period' },
  { value: '2', label: '2 periods ago' },
  { value: '3', label: '3 periods ago' },
  { value: '4', label: '4 periods ago' },
  { value: '6', label: '6 periods ago' },
  { value: '12', label: '12 periods ago' },
];

export default function SalesTrendChart({ checks, start, end }) {
  const [compareOffset, setCompareOffset] = useState('0');

  const { labels, currentValues, compareValues, compareLabel } = useMemo(() => {
    const rangeLengthMs = end.getTime() - start.getTime();
    const current = getNetSalesByDay(checks, start, end);

    const offset = parseInt(compareOffset, 10);
    let compare = null;
    let label = '';
    if (offset > 0) {
      const cmpEnd = new Date(start.getTime() - 1 - (offset - 1) * (rangeLengthMs + 1));
      const cmpStart = new Date(cmpEnd.getTime() - rangeLengthMs);
      compare = getNetSalesByDay(checks, cmpStart, cmpEnd);
      label = COMPARE_OPTIONS.find(o => o.value === compareOffset)?.label || '';
    }

    return {
      labels: current.map(d => d.date),
      currentValues: current.map(d => d.netSales),
      compareValues: compare ? compare.map(d => d.netSales) : null,
      compareLabel: label,
    };
  }, [checks, start, end, compareOffset]);

  const datasets = [
    {
      label: 'Current Period',
      data: currentValues,
      borderColor: CHART_COLORS[1],
      backgroundColor: CHART_COLORS[1],
      tension: 0.3,
    },
  ];
  if (compareValues) {
    datasets.push({
      label: compareLabel,
      data: compareValues,
      borderColor: CHART_COLORS[2],
      backgroundColor: CHART_COLORS[2],
      borderDash: [6, 4],
      tension: 0.3,
    });
  }

  const data = { labels, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: !!compareValues },
      tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${currencyFmt(ctx.parsed.y)}` } },
    },
    scales: { y: { ticks: { callback: v => currencyFmt(v) } } },
  };

  return (
    <div data-chart="sales-trend">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <h2 className="chart-section-title" style={{ margin: 0 }}>Sales Trend</h2>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Compare to:</span>
          <select
            value={compareOffset}
            onChange={e => setCompareOffset(e.target.value)}
            className="border border-border rounded-md bg-background px-2 py-1 text-sm"
          >
            {COMPARE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="chart-canvas" style={{ height: '320px' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
