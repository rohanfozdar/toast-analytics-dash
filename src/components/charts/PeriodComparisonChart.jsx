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
import { getPeriodComparison } from '../../lib/calculations';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MODES = [
  { id: 'week',  label: 'Week vs Week',   preset: '7d'  },
  { id: 'month', label: 'Month vs Month', preset: '30d' },
  { id: 'year',  label: 'Year vs Year',   preset: '90d' },
];

const currencyFmt = v =>
  v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

// Aggregate daily data into weekly buckets
function byWeek(dayData) {
  const weeks = [];
  for (let i = 0; i < dayData.length; i += 7) {
    const chunk = dayData.slice(i, Math.min(i + 7, dayData.length));
    weeks.push(chunk.reduce((s, d) => s + d.netSales, 0));
  }
  return weeks;
}

// Aggregate daily data into monthly buckets (calendar month, YYYY-MM key)
function byMonth(dayData) {
  const months = {};
  const order = [];
  for (const d of dayData) {
    const key = d.date.slice(0, 7);
    if (!months[key]) { months[key] = 0; order.push(key); }
    months[key] += d.netSales;
  }
  return order.map(k => months[k]);
}

export default function PeriodComparisonChart({ checks }) {
  const [mode, setMode] = useState('week');

  const activeMode = MODES.find(m => m.id === mode);

  const { labels, currentValues, priorValues } = useMemo(() => {
    const { current, prior } = getPeriodComparison(checks, activeMode.preset);

    if (mode === 'week') {
      // X axis = individual days
      const len = Math.max(current.length, prior.length);
      return {
        labels: Array.from({ length: len }, (_, i) => `Day ${i + 1}`),
        currentValues: current.map(d => d.netSales),
        priorValues: prior.map(d => d.netSales),
      };
    }

    if (mode === 'month') {
      // X axis = weeks within the month
      const cAgg = byWeek(current);
      const pAgg = byWeek(prior);
      const len = Math.max(cAgg.length, pAgg.length);
      return {
        labels: Array.from({ length: len }, (_, i) => `Week ${i + 1}`),
        currentValues: cAgg,
        priorValues: pAgg,
      };
    }

    // year mode — X axis = calendar months
    const cAgg = byMonth(current);
    const pAgg = byMonth(prior);
    const len = Math.max(cAgg.length, pAgg.length);
    return {
      labels: Array.from({ length: len }, (_, i) => `Month ${i + 1}`),
      currentValues: cAgg,
      priorValues: pAgg,
    };
  }, [checks, mode, activeMode.preset]);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Current',
        data: currentValues,
        backgroundColor: '--chart-color-1',
      },
      {
        label: 'Prior',
        data: priorValues,
        backgroundColor: '--chart-color-2',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: ctx => currencyFmt(ctx.parsed.y),
        },
      },
    },
    scales: {
      y: {
        ticks: { callback: v => currencyFmt(v) },
      },
    },
  };

  return (
    <div data-chart="period-comparison">
      <div>
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            aria-pressed={mode === m.id}
            data-active={mode === m.id ? 'true' : undefined}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div style={{ height: '280px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
