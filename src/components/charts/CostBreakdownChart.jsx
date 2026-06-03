import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const currencyFmt = v =>
  v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function CostBreakdownChart({ waterfall }) {
  const { foodCostAmt, laborCostAmt, fixedCostAmt, variableCostAmt } = waterfall;

  const data = useMemo(() => ({
    labels: ['Food Cost', 'Labor Cost', 'Fixed Costs', 'Variable Costs'],
    datasets: [
      {
        data: [foodCostAmt, laborCostAmt, fixedCostAmt, variableCostAmt],
        backgroundColor: [
          '--chart-color-1',
          '--chart-color-2',
          '--chart-color-3',
          '--chart-color-4',
        ],
      },
    ],
  }), [foodCostAmt, laborCostAmt, fixedCostAmt, variableCostAmt]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: ctx => {
            const total = ctx.dataset.data.reduce((s, v) => s + v, 0);
            const pct = total > 0 ? Math.round((ctx.parsed / total) * 1000) / 10 : 0;
            return `${ctx.label}: ${currencyFmt(ctx.parsed)} (${pct}% of costs)`;
          },
        },
      },
    },
  };

  return (
    <div data-chart="cost-breakdown" style={{ height: '280px' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}
