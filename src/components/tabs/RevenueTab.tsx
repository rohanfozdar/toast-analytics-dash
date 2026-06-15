// @ts-nocheck
import useDashboardStore from '../../store/useDashboardStore';
import { getKpiSummary, getOrderSummary, getPerPersonAverage, getTipSummary } from '../../lib/calculations';
import KpiCard from '../shared/KpiCard';
import DataSourceNote from '../shared/DataSourceNote';
import SalesTrendChart from '../charts/SalesTrendChart';
import PeriodComparisonChart from '../charts/PeriodComparisonChart';
import DaypartChart from '../charts/DaypartChart';
import DayOfWeekChart from '../charts/DayOfWeekChart';
import OrderSourceChart from '../charts/OrderSourceChart';
import { formatCurrency, formatPercent, formatCount, formatMinutes } from '../../lib/format';

const SOURCE_NOTE =
  'Revenue data sourced from CheckDetails.csv (Opened Date, Total, Tax, Discount), ' +
  'ItemSelectionDetails.csv (Service field for daypart breakdown), and ' +
  'OrderDetails.csv (Order Source, Duration, Guests). ' +
  'Net sales = Total − Tax − Discount.';

export default function RevenueTab({ checks, itemSelections, orderDetails, paymentDetails }) {
  const { start, end } = useDashboardStore(s => s.dateRange);

  const { totalNetSales, totalChecks, avgCheckSize, periodChangePct } =
    getKpiSummary(checks, start, end);

  const { orderCount, avgGuests, avgDurationMin } =
    getOrderSummary(orderDetails, checks, start, end);

  const ppa = getPerPersonAverage(checks, orderDetails, start, end);
  const tips = getTipSummary(paymentDetails, checks, start, end);
  const avgTipPerCheck = totalChecks > 0
    ? Math.round((tips.totalTips / totalChecks) * 100) / 100
    : 0;

  const changeSentiment =
    periodChangePct == null ? 'neutral' : periodChangePct > 0 ? 'positive' : 'negative';

  const cur = formatCurrency;

  return (
    <div>
      <div className="kpi-grid-4">
        <KpiCard label="Total Net Sales" value={cur(totalNetSales)} />
        <KpiCard label="Total Checks" value={formatCount(totalChecks)} />
        <KpiCard
          label="Avg Check Size"
          value={cur(avgCheckSize)}
          dataSourceLabel="Net sales ÷ checks (per transaction)"
        />
        <KpiCard
          label="Per-Person Average (PPA)"
          value={cur(ppa)}
          dataSourceLabel="Net sales ÷ guests (per guest)"
        />
      </div>

      <div className="kpi-grid-3" style={{ marginTop: '16px' }}>
        <KpiCard
          label="Period-over-Period Change"
          value={formatPercent(periodChangePct, 'change')}
          sentiment={changeSentiment}
        />
        <KpiCard
          label="Average Tip / Check"
          value={cur(avgTipPerCheck)}
          dataSourceLabel="Separate from check totals"
        />
        <KpiCard
          label="Tip %"
          value={formatPercent(tips.tipPctOfSales, 'ratio')}
          dataSourceLabel="Tips ÷ net sales"
        />
      </div>


      <SalesTrendChart checks={checks} start={start} end={end} />
      <PeriodComparisonChart checks={checks} />
      <DaypartChart checks={checks} itemSelections={itemSelections} start={start} end={end} />
      <DayOfWeekChart checks={checks} start={start} end={end} />

      <div>
        <h2 className="chart-section-title" style={{ marginBottom: '16px' }}>Orders</h2>
        <div className="kpi-grid-3">
          <KpiCard label="Order Count" value={formatCount(orderCount)} />
          <KpiCard label="Avg Guests / Order" value={avgGuests.toFixed(1)} />
          <KpiCard label="Avg Processing Time" value={formatMinutes(avgDurationMin)} />
        </div>
      </div>

      <OrderSourceChart orderDetails={orderDetails} checks={checks} start={start} end={end} />

      <p data-role="order-note" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: '8px' }}>
        Duration is order open-to-paid processing time, not guest dwell time.
      </p>

      <DataSourceNote text={SOURCE_NOTE} />
    </div>
  );
}
