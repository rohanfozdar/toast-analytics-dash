// @ts-nocheck
import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getPaymentMix } from '../../lib/calculations';
import { CHART_COLOR_LIST } from '../../lib/chartColors';
import { formatCurrency, formatPercent } from '../../lib/format';

ChartJS.register(ArcElement, Tooltip, Legend);

const currencyFmt = formatCurrency;

export default function PaymentMixChart({ paymentDetails, checks, start, end }) {
  const mix = useMemo(
    () => getPaymentMix(paymentDetails, checks, start, end),
    [paymentDetails, checks, start, end]
  );

  const data = {
    labels: mix.map(m => m.label),
    datasets: [{
      data: mix.map(m => m.amount),
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
            return `${ctx.label}: ${currencyFmt(m.amount)} (${formatPercent(m.pct, 'composition')}, ${m.count} pmts)`;
          },
        },
      },
    },
  };

  return (
    <div data-chart="payment-mix">
      <h2 className="chart-section-title">Payment Mix</h2>
      <div className="chart-canvas" style={{ height: '280px' }}>
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}
