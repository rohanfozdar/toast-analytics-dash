// Data strategy: import the materialized arrays directly from generateData.js.
// generateAllData() runs once at module-load time (not per render), so every
// tab importing from generateData.js receives the same object references.
// App.jsx imports them here and passes as props so tabs remain pure components.
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
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Header />
      <TabNav />
      <main>
        {activeTab === 'revenue' && (
          <RevenueTab checks={checks} itemSelections={itemSelections} />
        )}
        {activeTab === 'cost' && (
          <CostTab checks={checks} timeEntries={timeEntries} />
        )}
        {activeTab === 'sales' && (
          <SalesTab checks={checks} itemSelections={itemSelections} kitchenTimings={kitchenTimings} />
        )}
      </main>
    </div>
  );
}

export default App;
