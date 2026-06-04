// @ts-nocheck
import useDashboardStore from '../../store/useDashboardStore';
import { getKpiSummary } from '../../lib/calculations';
import KpiCard from '../shared/KpiCard';
import DataSourceNote from '../shared/DataSourceNote';
import SalesTrendChart from '../charts/SalesTrendChart';
import PeriodComparisonChart from '../charts/PeriodComparisonChart';
import DaypartChart from '../charts/DaypartChart';
import DayOfWeekChart from '../charts/DayOfWeekChart';

const SOURCE_NOTE =
  'Revenue data sourced from CheckDetails.csv (Opened Date, Total, Tax, Discount) and ' +
  'ItemSelectionDetails.csv (Service field for daypart breakdown). ' +
  'Net sales = Total − Tax − Discount.';

export default function RevenueTab({ checks, itemSelections }) {
  const { start, end } = useDashboardStore(s => s.dateRange);

  const { totalNetSales, totalChecks, avgCheckSize, periodChangePct } =
    getKpiSummary(checks, start, end);

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

      <DataSourceNote text={SOURCE_NOTE} />
    </div>
  );
}