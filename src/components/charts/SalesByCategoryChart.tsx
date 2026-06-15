// @ts-nocheck
import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getSalesByCategory } from '../../lib/calculations';
import { CHART_COLOR_LIST } from '../../lib/chartColors';
import { formatCurrency, formatPercent } from '../../lib/format';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SalesByCategoryChart({ itemSelections, checks, start, end }) {
  const rows = useMemo(
    () => getSalesByCategory(itemSelections, checks, start, end),
    [itemSelections, checks, start, end]
  );

  const data = {
    labels: rows.map(r => r.salesCategory),
    datasets: [{
      data: rows.map(r => r.netRevenue),
      backgroundColor: rows.map((_, i) => CHART_COLOR_LIST[i % CHART_COLOR_LIST.length]),
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
            const r = rows[ctx.dataIndex];
            return `${ctx.label}: ${formatCurrency(r.netRevenue)} (${formatPercent(r.pct, 'composition')})`;
          },
        },
      },
    },
  };

  return (
    <div>
      <div data-chart="sales-by-category">
        <h2 className="chart-section-title">Sales by Category</h2>
        <div className="chart-canvas" style={{ height: '280px' }}>
          <Doughnut data={data} options={options} />
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Sales Category</th>
            <th>Net Revenue</th>
            <th>% of Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.salesCategory}>
              <td>{r.salesCategory}</td>
              <td>{formatCurrency(r.netRevenue)}</td>
              <td>{formatPercent(r.pct, 'composition')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
