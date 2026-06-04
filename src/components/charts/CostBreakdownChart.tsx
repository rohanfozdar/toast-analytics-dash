// @ts-nocheck
import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { CHART_COLORS } from '../../lib/chartColors';

ChartJS.register(ArcElement, Tooltip, Legend);

const currencyFmt = v =>
  v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function CostBreakdownChart({ waterfall }) {
  const { foodCostAmt, laborCostAmt, fixedCostAmt, variableCostAmt } = waterfall;

  const data = useMemo(() => ({
    labels: ['Food Cost', 'Labor Cost', 'Fixed Costs', 'Variable Costs'],
    datasets: [{
      data: [foodCostAmt, laborCostAmt, fixedCostAmt, variableCostAmt],
      backgroundColor: [CHART_COLORS[1], CHART_COLORS[2], CHART_COLORS[3], CHART_COLORS[4]],
      borderColor: '#FEFCFA',
      borderWidth: 2,
    }],
  }), [foodCostAmt, laborCostAmt, fixedCostAmt, variableCostAmt]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: { position: 'right' },
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
    <div data-chart="cost-breakdown">
      <h2 className="chart-section-title">Cost Breakdown</h2>
      <div className="chart-canvas" style={{ height: '280px' }}>
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}