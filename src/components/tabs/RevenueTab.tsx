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

const SOURCE_NOTE =
  'Revenue data sourced from CheckDetails.csv (Opened Date, Total, Tax, Discount), ' +
  'ItemSelectionDetails.csv (Service field for daypart breakdown), and ' +
  'OrderDetails.csv (Order Source, Duration, Guests). ' +
  'Net sales = Total − Tax − Discount.';

export default function RevenueTab({ checks, itemSelections, orderDetails }) {
  const { start, end } = useDashboardStore(s => s.dateRange);

  const { totalNetSales, totalChecks, avgCheckSize, periodChangePct } =
    getKpiSummary(checks, start, end);

  const { orderCount, avgGuests, avgDurationMin } =
    getOrderSummary(orderDetails, checks, start, end);

  const changeSentiment =
    periodChangePct == null ? 'neutral' : periodChangePct > 0 ? 'positive' : 'negative';

  return (
    <div>
      <div className="kpi-grid-4">
        <KpiCard
          label="Total Net Sales"
          value={totalNetSales.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        />
        <KpiCard
          label="Total Checks"
          value={totalChecks.toLocaleString()}
        />
        <KpiCard
          label="Avg Check Size"
          value={avgCheckSize.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        />
        <KpiCard
          label="Period-over-Period Change"
          value={periodChangePct != null ? periodChangePct.toFixed(1) + '%' : 'N/A'}
          sentiment={changeSentiment}
        />
      </div>

      <SalesTrendChart checks={checks} start={start} end={end} />
      <PeriodComparisonChart checks={checks} />
      <DaypartChart checks={checks} itemSelections={itemSelections} start={start} end={end} />
      <DayOfWeekChart checks={checks} start={start} end={end} />

      <div>
        <h2 className="chart-section-title" style={{ marginBottom: '16px' }}>Orders</h2>
        <div className="kpi-grid-3">
          <KpiCard label="Order Count" value={orderCount.toLocaleString()} />
          <KpiCard label="Avg Guests / Order" value={avgGuests.toFixed(1)} />
          <KpiCard label="Avg Processing Time" value={`${avgDurationMin.toFixed(0)} min`} />
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
