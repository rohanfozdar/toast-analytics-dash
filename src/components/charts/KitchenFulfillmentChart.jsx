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
import { getKitchenFulfillmentStats } from '../../lib/calculations';
import KpiCard from '../shared/KpiCard';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BUCKET_LABELS = ['<10 min', '10–15 min', '15–20 min', '20–30 min', '30+ min'];
const BUCKET_KEYS = ['<10', '10-15', '15-20', '20-30', '30+'];

const minFmt = v => `${v.toFixed(1)} min`;

export default function KitchenFulfillmentChart({ kitchenTimings, start, end }) {
  const stats = useMemo(
    () => getKitchenFulfillmentStats(kitchenTimings, start, end),
    [kitchenTimings, start, end]
  );

  const { avgMinutes, byDiningOption, histogram } = stats;

  const barData = {
    labels: BUCKET_LABELS,
    datasets: [
      {
        label: 'Ticket Count',
        data: BUCKET_KEYS.map(k => histogram[k]),
        backgroundColor: '--chart-color-1',
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.parsed.y} tickets`,
        },
      },
    },
    scales: {
      y: {
        ticks: { callback: v => v },
      },
    },
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
        <KpiCard
          label="Avg Kitchen Time (All)"
          value={minFmt(avgMinutes)}
        />
        {byDiningOption.map(opt => (
          <KpiCard
            key={opt.diningOption}
            label={`Avg Time — ${opt.diningOption}`}
            value={minFmt(opt.avgMinutes)}
          />
        ))}
      </div>

      <div data-chart="kitchen-fulfillment" style={{ height: '280px' }}>
        <Bar data={barData} options={barOptions} />
      </div>

      <div data-role="kitchen-notice">
        Time from kitchen ticket fired to ticket fulfilled. This measures kitchen throughput
        speed, not guest dwell time. Toast export data does not capture when a check is closed
        or a table is vacated.
      </div>
    </div>
  );
}
