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
import { getSalesByDayOfWeek } from '../../lib/calculations';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const currencyFmt = v =>
  v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function DayOfWeekChart({ checks, start, end }) {
  const { labels, values } = useMemo(() => {
    // getSalesByDayOfWeek returns Mon–Sun ordered already
    const data = getSalesByDayOfWeek(checks, start, end);
    return {
      labels: data.map(d => d.dow),
      values: data.map(d => d.avgSales),
    };
  }, [checks, start, end]);

  const data = {
    labels,
    datasets: [
      {
        label: 'Avg Net Sales',
        data: values,
        backgroundColor: '--chart-color-1',
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
    <div data-chart="day-of-week" style={{ height: '280px' }}>
      <Bar data={data} options={options} />
    </div>
  );
}
