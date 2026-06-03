import { useMemo } from 'react';
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
import { getAvgCheckByDay } from '../../lib/calculations';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const currencyFmt = v =>
  v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function AvgCheckChart({ checks, start, end }) {
  const { labels, values } = useMemo(() => {
    const data = getAvgCheckByDay(checks, start, end);
    return {
      labels: data.map(d => d.date),
      values: data.map(d => d.avgCheckSize),
    };
  }, [checks, start, end]);

  const data = {
    labels,
    datasets: [
      {
        label: 'Avg Check Size',
        data: values,
        borderColor: '--chart-color-1',
        backgroundColor: '--chart-color-1',
        tension: 0.3,
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
    <div data-chart="avg-check-trend" style={{ height: '280px' }}>
      <Line data={data} options={options} />
    </div>
  );
}
