// @ts-nocheck
import useDashboardStore from '../../store/useDashboardStore';

const TABS = [
  { id: 'revenue', label: 'Revenue' },
  { id: 'cost', label: 'Cost' },
  { id: 'sales', label: 'Sales' },
];

export default function TabNav() {
  const activeTab = useDashboardStore(s => s.activeTab);
  const setActiveTab = useDashboardStore(s => s.actions.setActiveTab);

  return (
    <nav>
      {TABS.map(t => (
        <button
          key={t.id}
          onClick={() => setActiveTab(t.id)}
          aria-pressed={activeTab === t.id}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}