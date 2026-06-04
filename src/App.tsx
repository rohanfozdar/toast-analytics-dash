// @ts-nocheck
import { checks, itemSelections, timeEntries, kitchenTimings } from './data/generateData';
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
            <CostTab checks={checks} timeEntries={timeEntries} />
          )}
          {activeTab === 'sales' && (
            <SalesTab checks={checks} itemSelections={itemSelections} kitchenTimings={kitchenTimings} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;