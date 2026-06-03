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
import { getSalesByService } from '../../lib/calculations';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const currencyFmt = v =>
  v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function DaypartChart({ checks, itemSelections, start, end }) {
  const { labels, values } = useMemo(() => {
    // Labels are derived dynamically from data — not hardcoded
    const data = getSalesByService(itemSelections, checks, start, end);
    return {
      labels: data.map(d => d.service),
      values: data.map(d => d.netSales),
    };
  }, [checks, itemSelections, start, end]);

  const data = {
    labels,
    datasets: [
      {
        label: 'Net Sales by Daypart',
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
    <div data-chart="daypart-sales" style={{ height: '280px' }}>
      <Bar data={data} options={options} />
    </div>
  );
}
