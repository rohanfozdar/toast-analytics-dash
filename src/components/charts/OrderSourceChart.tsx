// @ts-nocheck
import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getOrderSummary } from '../../lib/calculations';
import { CHART_COLOR_LIST } from '../../lib/chartColors';
import { formatPercent } from '../../lib/format';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function OrderSourceChart({ orderDetails, checks, start, end }) {
  const summary = useMemo(
    () => getOrderSummary(orderDetails, checks, start, end),
    [orderDetails, checks, start, end]
  );

  const mix = summary.bySource;

  const data = {
    labels: mix.map(m => m.source),
    datasets: [{
      data: mix.map(m => m.count),
      backgroundColor: mix.map((_, i) => CHART_COLOR_LIST[i % CHART_COLOR_LIST.length]),
      borderColor: '#FEFCFA',
      borderWidth: 2,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: { position: 'right' },
      tooltip: {
        callbacks: {
          label: ctx => {
            const m = mix[ctx.dataIndex];
            return `${ctx.label}: ${m.count} orders (${formatPercent(m.pct, 'composition')})`;
          },
        },
      },
    },
  };

  return (
    <div data-chart="order-source">
      <h2 className="chart-section-title">Order Source</h2>
      <div className="chart-canvas" style={{ height: '280px' }}>
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}
