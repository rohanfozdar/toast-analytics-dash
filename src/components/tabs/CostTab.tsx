// @ts-nocheck
import useDashboardStore from '../../store/useDashboardStore';
import {
  getKpiSummary,
  getTotalLaborCost,
  getLaborCostByRole,
  computeMarginWaterfall,
} from '../../lib/calculations';
import { getWeeksInRange } from '../../lib/dateUtils';
import CostInputPanel from '../shared/CostInputPanel';
import MarginWaterfallChart from '../charts/MarginWaterfallChart';
import CostBreakdownChart from '../charts/CostBreakdownChart';
import KpiCard from '../shared/KpiCard';
import DataSourceNote from '../shared/DataSourceNote';

const currencyFmt = v =>
  v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const round2 = v => Math.round(v * 100) / 100;

const SOURCE_NOTE =
  'Labor costs from TimeEntries.csv (Employee, Job Title, Payable Hours, Regular Pay, ' +
  'Overtime Pay, Total Pay). Food, fixed, and variable costs entered manually — not ' +
  'available in Toast export data.';

export default function CostTab({ checks, timeEntries }) {
  const { start, end } = useDashboardStore(s => s.dateRange);
  const costInputs = useDashboardStore(s => s.costInputs);

  const { totalNetSales } = getKpiSummary(checks, start, end);
  const laborCost = getTotalLaborCost(timeEntries, start, end);
  const weeksInRange = getWeeksInRange(start, end);
  const waterfall = computeMarginWaterfall(totalNetSales, laborCost, weeksInRange, costInputs);
  const laborByRole = getLaborCostByRole(timeEntries, start, end);

  const weeklyNetSales = weeksInRange > 0 ? round2(totalNetSales / weeksInRange) : 0;
  const monthlyNetSales = round2(weeklyNetSales * (52 / 12));
  const yearlyNetSales = round2(weeklyNetSales * 52);

  const weeklyNetProfit = weeksInRange > 0 ? round2(waterfall.netProfit / weeksInRange) : 0;
  const monthlyNetProfit = round2(weeklyNetProfit * (52 / 12));
  const yearlyNetProfit = round2(weeklyNetProfit * 52);

  return (
    <div>
      <CostInputPanel checks={checks} timeEntries={timeEntries} />

      <MarginWaterfallChart waterfall={waterfall} />
      <CostBreakdownChart waterfall={waterfall} />

      <table data-role="labor-table">
        <thead>
          <tr>
            <th>Role</th>
            <th>Total Hours</th>
            <th>Overtime Hours</th>
            <th>Total Pay</th>
            <th>Labor % of Revenue</th>
          </tr>
        </thead>
        <tbody>
          {laborByRole.map(role => {
            const roleLaborPct =
              totalNetSales > 0
                ? Math.round((role.totalPay / totalNetSales) * 1000) / 10
                : 0;
            return (
              <tr
                key={role.jobTitle}
                data-alert={roleLaborPct > 35 ? 'true' : undefined}
              >
                <td>{role.jobTitle}</td>
                <td>{role.totalHours}</td>
                <td>{role.overtimeHours}</td>
                <td>{currencyFmt(role.totalPay)}</td>
                <td>{roleLaborPct}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="kpi-grid-3">
        <div data-period="weekly" className="period-card">
          <KpiCard label="Weekly Net Sales" value={currencyFmt(weeklyNetSales)} />
          <div data-hidden="true">
            <KpiCard label="Weekly Net Profit" value={currencyFmt(weeklyNetProfit)} />
          </div>
        </div>
        <div data-period="monthly" className="period-card">
          <KpiCard label="Monthly Net Sales" value={currencyFmt(monthlyNetSales)} />
          <div data-hidden="true">
            <KpiCard label="Monthly Net Profit" value={currencyFmt(monthlyNetProfit)} />
          </div>
        </div>
        <div data-period="yearly" className="period-card">
          <KpiCard label="Yearly Net Sales" value={currencyFmt(yearlyNetSales)} />
          <div data-hidden="true">
            <KpiCard label="Yearly Net Profit" value={currencyFmt(yearlyNetProfit)} />
          </div>
        </div>
      </div>

      <DataSourceNote text={SOURCE_NOTE} />
    </div>
  );
}