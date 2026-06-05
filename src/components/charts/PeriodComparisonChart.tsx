// @ts-nocheck
import { useState, useMemo } from 'react';
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
import { getNetSalesByDay } from '../../lib/calculations';
import { CHART_COLORS } from '../../lib/chartColors';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MODES = [
  { id: 'week',  label: 'Week',  unitLabel: 'week',  days: 7,  bucketsLabel: 'Day',  buckets: 7  },
  { id: 'month', label: 'Month', unitLabel: 'month', days: 30, bucketsLabel: 'Week', buckets: 4  },
  { id: 'year',  label: 'Year',  unitLabel: 'year',  days: 90, bucketsLabel: 'Month', buckets: 3 },
];

const currencyFmt = v =>
  v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

// Aggregate a daily series into N evenly-sized buckets.
function bucketize(daily, bucketCount) {
  if (daily.length === 0) return new Array(bucketCount).fill(0);
  const size = Math.ceil(daily.length / bucketCount);
  const out = [];
  for (let i = 0; i < bucketCount; i++) {
    const chunk = daily.slice(i * size, (i + 1) * size);
    out.push(chunk.reduce((s, d) => s + d.netSales, 0));
  }
  return out;
}

function rangeForOffset(mode, offset) {
  // offset = 0 → current period (last `days` days), 1 → previous, etc.
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  end.setDate(end.getDate() - offset * mode.days);

  const start = new Date(end);
  start.setDate(start.getDate() - (mode.days - 1));
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

export default function PeriodComparisonChart({ checks }) {
  const [modeId, setModeId] = useState('week');
  const [compareOffset, setCompareOffset] = useState('0');
  const mode = MODES.find(m => m.id === modeId);

  const compareOptions = useMemo(() => {
    const opts = [{ value: '0', label: 'No comparison' }];
    for (let i = 1; i <= 12; i++) {
      opts.push({
        value: String(i),
        label: i === 1 ? `Previous ${mode.unitLabel}` : `${i} ${mode.unitLabel}s ago`,
      });
    }
    return opts;
  }, [mode]);

  const { labels, currentValues, compareValues, compareLabel } = useMemo(() => {
    const { start: cStart, end: cEnd } = rangeForOffset(mode, 0);
    const currentDaily = getNetSalesByDay(checks, cStart, cEnd);
    const current = bucketize(currentDaily, mode.buckets);

    const offset = parseInt(compareOffset, 10);
    let compare = null;
    let label = '';
    if (offset > 0) {
      const { start: pStart, end: pEnd } = rangeForOffset(mode, offset);
      const priorDaily = getNetSalesByDay(checks, pStart, pEnd);
      compare = bucketize(priorDaily, mode.buckets);
      label = compareOptions.find(o => o.value === compareOffset)?.label || '';
    }

    const labels = Array.from({ length: mode.buckets }, (_, i) => `${mode.bucketsLabel} ${i + 1}`);
    return { labels, currentValues: current, compareValues: compare, compareLabel: label };
  }, [checks, mode, compareOffset, compareOptions]);

  const datasets = [
    { label: `Current ${mode.unitLabel}`, data: currentValues, backgroundColor: CHART_COLORS[1], borderRadius: 4 },
  ];
  if (compareValues) {
    datasets.push({ label: compareLabel, data: compareValues, backgroundColor: CHART_COLORS[2], borderRadius: 4 });
  }

  const chartData = { labels, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${currencyFmt(ctx.parsed.y)}` } },
    },
    scales: { y: { ticks: { callback: v => currencyFmt(v) } } },
  };

  return (
    <div data-chart="period-comparison">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
        <h2 className="chart-section-title" style={{ margin: 0 }}>Period Comparison</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            {MODES.map(m => (
              <button
                key={m.id}
                onClick={() => { setModeId(m.id); setCompareOffset('0'); }}
                aria-pressed={modeId === m.id}
                data-active={modeId === m.id ? 'true' : undefined}
                className="px-3 py-1 text-sm rounded-md border border-border data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
              >
                {m.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Compare to:</span>
            <select
              value={compareOffset}
              onChange={e => setCompareOffset(e.target.value)}
              className="border border-border rounded-md bg-background px-2 py-1 text-sm"
            >
              {compareOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="chart-canvas" style={{ height: '320px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
