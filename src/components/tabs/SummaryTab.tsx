// @ts-nocheck
import { useMemo } from 'react';
import useDashboardStore from '../../store/useDashboardStore';
import { getSalesSummary } from '../../lib/calculations';
import KpiCard from '../shared/KpiCard';
import DataSourceNote from '../shared/DataSourceNote';

const SOURCE_NOTE =
  'Sales Summary rollup from CheckDetails.csv (net sales, tax, discounts), ' +
  'ItemSelectionDetails.csv (service type, dining option, voids), ' +
  'PaymentDetails.csv (tips, gratuity, payment method), and ' +
  'OrderDetails.csv (guest counts).';

const cur = v => v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function SummaryTab({ checks, itemSelections, paymentDetails, orderDetails }) {
  const { start, end } = useDashboardStore(s => s.dateRange);

  const s = useMemo(
    () => getSalesSummary(checks, itemSelections, paymentDetails, orderDetails, start, end),
    [checks, itemSelections, paymentDetails, orderDetails, start, end]
  );

  return (
    <div>
      <div className="kpi-grid-4">
        <KpiCard label="Net Sales" value={cur(s.netSales)} />
        <KpiCard label="Guests" value={s.totalGuests.toLocaleString()} />
        <KpiCard label="Checks" value={s.checkCount.toLocaleString()} />
        <KpiCard label="Avg Check" value={cur(s.avgCheck)} />
      </div>
      <div className="kpi-grid-4" style={{ marginTop: '16px' }}>
        <KpiCard label="Tips" value={cur(s.totalTips)} />
        <KpiCard label="Discounts" value={cur(s.totalDiscounts)} />
        <KpiCard label="Tax" value={cur(s.totalTax)} />
        <KpiCard label="Voids" value={cur(s.voidAmount)} />
      </div>

      <div data-role="summary-by-service" style={{ marginTop: '24px' }}>
        <h2 className="chart-section-title">Net Sales by Service Type</h2>
        <table>
          <thead>
            <tr><th>Service</th><th>Net Sales</th><th>%</th></tr>
          </thead>
          <tbody>
            {s.byServiceType.map(r => (
              <tr key={r.service}>
                <td>{r.service}</td>
                <td>{cur(r.netSales)}</td>
                <td>{r.pct.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div data-role="summary-by-dining" style={{ marginTop: '24px' }}>
        <h2 className="chart-section-title">Net Sales by Dining Option</h2>
        <table>
          <thead>
            <tr><th>Dining Option</th><th>Net Sales</th><th>%</th></tr>
          </thead>
          <tbody>
            {s.byDiningOption.map(r => (
              <tr key={r.diningOption}>
                <td>{r.diningOption}</td>
                <td>{cur(r.netSales)}</td>
                <td>{r.pct.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div data-role="summary-by-payment" style={{ marginTop: '24px' }}>
        <h2 className="chart-section-title">Payment Methods</h2>
        <table>
          <thead>
            <tr><th>Method</th><th>Amount</th><th>%</th></tr>
          </thead>
          <tbody>
            {s.byPaymentMethod.map(r => (
              <tr key={r.type}>
                <td>{r.type}</td>
                <td>{cur(r.amount)}</td>
                <td>{r.pct.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DataSourceNote text={SOURCE_NOTE} />
    </div>
  );
}
