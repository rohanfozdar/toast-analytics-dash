// @ts-nocheck
import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import useDashboardStore from '../../store/useDashboardStore';
import { getCustomerSummary } from '../../lib/calculations';
import KpiCard from '../shared/KpiCard';
import DataSourceNote from '../shared/DataSourceNote';
import { CHART_COLOR_LIST } from '../../lib/chartColors';
import { formatCurrency, formatPercent, formatCount } from '../../lib/format';

ChartJS.register(ArcElement, Tooltip, Legend);

const SOURCE_NOTE =
  'Customer/loyalty data from CheckDetails.csv (Customer Id, Customer, Customer Phone, ' +
  'Customer Email). Only checks with a linked loyalty/customer profile are included.';

const currencyFmt = formatCurrency;

export default function CustomersTab({ checks }) {
  const { start, end } = useDashboardStore(s => s.dateRange);

  const summary = useMemo(
    () => getCustomerSummary(checks, start, end),
    [checks, start, end]
  );

  const {
    uniqueCustomers,
    linkedCheckPct,
    repeatCustomerRate,
    avgCustomerSpend,
    newVsReturning,
    topCustomers,
  } = summary;

  const nvrData = {
    labels: ['New', 'Returning'],
    datasets: [{
      data: [newVsReturning.new, newVsReturning.returning],
      backgroundColor: [CHART_COLOR_LIST[0], CHART_COLOR_LIST[1]],
      borderColor: '#FEFCFA',
      borderWidth: 2,
    }],
  };
  const nvrTotal = newVsReturning.new + newVsReturning.returning;
  const nvrOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: { position: 'right' },
      tooltip: {
        callbacks: {
          label: ctx => {
            const v = ctx.parsed;
            const pct = nvrTotal > 0 ? (v / nvrTotal * 100).toFixed(1) : '0';
            return `${ctx.label}: ${v} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div>
      <div className="kpi-grid-4">
        <KpiCard label="Unique Customers" value={uniqueCustomers.toLocaleString()} />
        <KpiCard label="Repeat Rate" value={`${repeatCustomerRate.toFixed(1)}%`} />
        <KpiCard label="Avg Customer Spend" value={currencyFmt(avgCustomerSpend)} />
        <KpiCard label="Loyalty-Linked Checks" value={`${linkedCheckPct.toFixed(1)}%`} />
      </div>

      <div data-chart="new-vs-returning">
        <h2 className="chart-section-title">New vs Returning Customers</h2>
        <div className="chart-canvas" style={{ height: '280px' }}>
          <Doughnut data={nvrData} options={nvrOptions} />
        </div>
      </div>

      <div data-role="top-customers">
        <h2 className="chart-section-title">Top Customers</h2>
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Visits</th>
              <th>Total Spend</th>
            </tr>
          </thead>
          <tbody>
            {topCustomers.length === 0 ? (
              <tr><td colSpan={3}>No linked customer data in range.</td></tr>
            ) : topCustomers.map(c => (
              <tr key={c.customer}>
                <td>{c.customer}</td>
                <td>{c.visits}</td>
                <td>{currencyFmt(c.totalSpend)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DataSourceNote text={SOURCE_NOTE} />
    </div>
  );
}
