import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { getDiningChannelSplit } from '../../lib/calculations';

ChartJS.register(ArcElement, Tooltip, Legend);

const currencyFmt = v =>
  v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const CHART_COLORS = [
  '--chart-color-1',
  '--chart-color-2',
  '--chart-color-3',
  '--chart-color-4',
  '--chart-color-5',
];

export default function DiningChannelChart({ itemSelections, checks, start, end }) {
  const channelData = useMemo(
    () => getDiningChannelSplit(itemSelections, checks, start, end),
    [itemSelections, checks, start, end]
  );

  const data = {
    labels: channelData.map(d => d.diningOption),
    datasets: [
      {
        data: channelData.map(d => d.netRevenue),
        backgroundColor: channelData.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: ctx => {
            const item = channelData[ctx.dataIndex];
            return `${ctx.label}: ${currencyFmt(item.netRevenue)} (${item.pct.toFixed(1)}%)`;
          },
        },
      },
    },
  };

  return (
    <div>
      <div data-chart="dining-channel" style={{ height: '280px' }}>
        <Doughnut data={data} options={options} />
      </div>

      <table>
        <thead>
          <tr>
            <th>Channel</th>
            <th>Net Revenue</th>
            <th>% of Total</th>
            <th>Avg Check Size</th>
          </tr>
        </thead>
        <tbody>
          {channelData.map(row => (
            <tr key={row.diningOption}>
              <td>{row.diningOption}</td>
              <td>{currencyFmt(row.netRevenue)}</td>
              <td>{row.pct.toFixed(1)}%</td>
              <td>{currencyFmt(row.avgCheckSize)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div data-role="channel-notice">
        Delivery revenue is shown before third-party platform fees (typically 25–30%). Actual
        delivery margin is lower than displayed here.
      </div>
    </div>
  );
}
