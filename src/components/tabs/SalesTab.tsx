// @ts-nocheck
import useDashboardStore from '../../store/useDashboardStore';
import MenuPerformanceTable from '../charts/MenuPerformanceTable';
import SalesByCategoryChart from '../charts/SalesByCategoryChart';
import DiningChannelChart from '../charts/DiningChannelChart';
import DiscountSummary from '../charts/DiscountSummary';
import AvgCheckChart from '../charts/AvgCheckChart';
import KitchenFulfillmentChart from '../charts/KitchenFulfillmentChart';
import PaymentMixChart from '../charts/PaymentMixChart';
import RefundSummary from '../charts/RefundSummary';
import ModifierPerformance from '../charts/ModifierPerformance';
import DataSourceNote from '../shared/DataSourceNote';

const SOURCE_NOTE =
  'Menu data aggregated from ItemSelectionDetails.csv using AllItemsReport.csv field logic. ' +
  'Void rate = Void Qty ÷ (Item Qty incl voids). ' +
  'Kitchen timing from KitchenTimings.csv (Fired Date to Fulfilled Date). ' +
  'Discounts from CheckDetails.csv (Discount, Reason of Discount). ' +
  'Payment mix and refunds from PaymentDetails.csv (Type, Card Type, Refunded, Refund Amount). ' +
  'Add-ons and upsells from ModifierSelectionDetails.csv (Modifier Name, Option Group, Net Price); ' +
  'paid modifier revenue is included in parent item gross/net price.';

export default function SalesTab({ checks, itemSelections, kitchenTimings, paymentDetails, modifierSelections }) {
  const { start, end } = useDashboardStore(s => s.dateRange);

  return (
    <div>
      <MenuPerformanceTable
        itemSelections={itemSelections}
        checks={checks}
        start={start}
        end={end}
      />

      <ModifierPerformance
        modifierSelections={modifierSelections}
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

      <section data-section="payments">
        <h2 className="chart-section-title" style={{ marginBottom: 0 }}>Payments</h2>
        <PaymentMixChart
          paymentDetails={paymentDetails}
          checks={checks}
          start={start}
          end={end}
        />
        <RefundSummary
          paymentDetails={paymentDetails}
          checks={checks}
          start={start}
          end={end}
        />
      </section>

      <KitchenFulfillmentChart
        kitchenTimings={kitchenTimings}
        start={start}
        end={end}
      />

      <DataSourceNote text={SOURCE_NOTE} />
    </div>
  );
}
