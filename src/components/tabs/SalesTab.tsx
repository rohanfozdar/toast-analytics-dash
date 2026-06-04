// @ts-nocheck
import useDashboardStore from '../../store/useDashboardStore';
import MenuPerformanceTable from '../charts/MenuPerformanceTable';
import DiningChannelChart from '../charts/DiningChannelChart';
import DiscountSummary from '../charts/DiscountSummary';
import AvgCheckChart from '../charts/AvgCheckChart';
import KitchenFulfillmentChart from '../charts/KitchenFulfillmentChart';
import DataSourceNote from '../shared/DataSourceNote';

const SOURCE_NOTE =
  'Menu data aggregated from ItemSelectionDetails.csv using AllItemsReport.csv field logic. ' +
  'Void rate = Void Qty ÷ (Item Qty incl voids). ' +
  'Kitchen timing from KitchenTimings.csv (Fired Date to Fulfilled Date). ' +
  'Discounts from CheckDetails.csv (Discount, Reason of Discount).';

export default function SalesTab({ checks, itemSelections, kitchenTimings }) {
  const { start, end } = useDashboardStore(s => s.dateRange);

  return (
    <div>
      <MenuPerformanceTable
        itemSelections={itemSelections}
        checks={checks}
        start={start}
        end={end}
      />

      <DiningChannelChart
        itemSelections={itemSelections}
        checks={checks}
        start={start}
        end={end}
      />

      <AvgCheckChart checks={checks} start={start} end={end} />

      <DiscountSummary
        checks={checks}
        itemSelections={itemSelections}
        start={start}
        end={end}
      />

      <KitchenFulfillmentChart
        kitchenTimings={kitchenTimings}
        start={start}
        end={end}
      />

      <DataSourceNote text={SOURCE_NOTE} />
    </div>
  );
}