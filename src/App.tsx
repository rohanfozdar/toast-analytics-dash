// @ts-nocheck
import { checks, itemSelections, timeEntries, kitchenTimings, paymentDetails, modifierSelections } from './data/generateData';
import useDashboardStore from './store/useDashboardStore';
import Header from './components/layout/Header';
import TabNav from './components/layout/TabNav';
import RevenueTab from './components/tabs/RevenueTab';
import CostTab from './components/tabs/CostTab';
import SalesTab from './components/tabs/SalesTab';

function App() {
  const activeTab = useDashboardStore(s => s.activeTab);

  return (
    <div>
      <Header />
      <TabNav />
      <main>
        <div key={activeTab}>
          {activeTab === 'revenue' && (
            <RevenueTab checks={checks} itemSelections={itemSelections} />
          )}
          {activeTab === 'cost' && (
            <CostTab checks={checks} timeEntries={timeEntries} paymentDetails={paymentDetails} />
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
        </div>
      </main>
    </div>
  );
}

export default App;