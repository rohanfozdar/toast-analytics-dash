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
import { getNetSalesByDay } from '../../lib/calculations';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const currencyFmt = v =>
  v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function SalesTrendChart({ checks, start, end }) {
  const { labels, currentValues, priorValues } = useMemo(() => {
    // Prior period: same length, ending the moment before current start
    const rangeLengthMs = end.getTime() - start.getTime();
    const priorEnd = new Date(start.getTime() - 1);
    const priorStart = new Date(priorEnd.getTime() - rangeLengthMs);

    const current = getNetSalesByDay(checks, start, end);
    const prior = getNetSalesByDay(checks, priorStart, priorEnd);

    return {
      labels: current.map(d => d.date),
      currentValues: current.map(d => d.netSales),
      priorValues: prior.map(d => d.netSales),
    };
  }, [checks, start, end]);

  const data = {
    labels,
    datasets: [
      {
        label: 'Current Period',
        data: currentValues,
        borderColor: '--chart-color-1',
        backgroundColor: '--chart-color-1',
        tension: 0.3,
      },
      {
        label: 'Prior Period',
        data: priorValues,
        borderColor: '--chart-color-2',
        backgroundColor: '--chart-color-2',
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
    <div data-chart="sales-trend" style={{ height: '280px' }}>
      <Line data={data} options={options} />
    </div>
  );
}
