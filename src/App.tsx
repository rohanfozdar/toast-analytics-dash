// @ts-nocheck
import { checks, itemSelections, timeEntries, kitchenTimings, paymentDetails, modifierSelections, orderDetails, cashEntries } from './data/generateData';
import useDashboardStore from './store/useDashboardStore';
import Header from './components/layout/Header';
import TabNav from './components/layout/TabNav';
import RevenueTab from './components/tabs/RevenueTab';
import CostTab from './components/tabs/CostTab';
import SalesTab from './components/tabs/SalesTab';
import CustomersTab from './components/tabs/CustomersTab';

function App() {
  const activeTab = useDashboardStore(s => s.activeTab);

  return (
    <div>
      <Header />
      <TabNav />
      <main>
        <div key={activeTab}>
          {activeTab === 'revenue' && (
            <RevenueTab checks={checks} itemSelections={itemSelections} orderDetails={orderDetails} />
          )}
          {activeTab === 'cost' && (
            <CostTab checks={checks} timeEntries={timeEntries} paymentDetails={paymentDetails} cashEntries={cashEntries} />
          )}
          {activeTab === 'sales' && (
            <SalesTab
              checks={checks}
              itemSelections={itemSelections}
              kitchenTimings={kitchenTimings}
              paymentDetails={paymentDetails}
              modifierSelections={modifierSelections}
            />
          )}
          {activeTab === 'customers' && (
            <CustomersTab checks={checks} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;