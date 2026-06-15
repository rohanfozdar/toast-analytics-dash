// @ts-nocheck
import { useMemo } from 'react';
import useDashboardStore from '../../store/useDashboardStore';
import { getSalesSummary, getPrimeCost, getPerPersonAverage } from '../../lib/calculations';
import KpiCard from '../shared/KpiCard';
import DataSourceNote from '../shared/DataSourceNote';
import { formatCurrency, formatPercent, formatCount } from '../../lib/format';

const SOURCE_NOTE =
  'Sales Summary rollup from CheckDetails.csv (net sales, tax, discounts), ' +
  'ItemSelectionDetails.csv (service type, dining option, voids), ' +
  'PaymentDetails.csv (tips, gratuity, payment method), and ' +
  'OrderDetails.csv (guest counts).';

const cur = formatCurrency;

export default function SummaryTab({ checks, itemSelections, paymentDetails, orderDetails, timeEntries }) {
  const { start, end } = useDashboardStore(s => s.dateRange);
  const costInputs = useDashboardStore(s => s.costInputs);

  const s = useMemo(
    () => getSalesSummary(checks, itemSelections, paymentDetails, orderDetails, start, end),
    [checks, itemSelections, paymentDetails, orderDetails, start, end]
  );

  const prime = useMemo(
    () => getPrimeCost(checks, timeEntries, costInputs, start, end),
    [checks, timeEntries, costInputs, start, end]
  );
  const ppa = useMemo(
    () => getPerPersonAverage(checks, orderDetails, start, end),
    [checks, orderDetails, start, end]
  );
  const primeAlert = prime.primeCostPct > 65 ? 'true' : undefined;
  const primeSentiment = prime.primeCostPct > 65
    ? 'negative'
    : prime.primeCostPct >= 60 ? 'neutral' : 'positive';

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
      <div className="kpi-grid-2" style={{ marginTop: '16px' }} data-role="industry-kpis">
        <div data-alert={primeAlert}>
          <KpiCard
            label="Prime Cost %"
            value={`${prime.primeCostPct.toFixed(1)}%`}
            sentiment={primeSentiment}
            dataSourceLabel="Food + labor; target 55–65%"
          />
        </div>
        <KpiCard
          label="Per-Person Average (PPA)"
          value={cur(ppa)}
          dataSourceLabel="Net sales ÷ guests"
        />
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
