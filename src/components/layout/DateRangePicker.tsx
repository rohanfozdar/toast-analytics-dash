// @ts-nocheck
import useDashboardStore from '../../store/useDashboardStore';
import { formatDate } from '../../lib/dateUtils';

const PRESETS = ['7d', '30d', '90d'];

export default function DateRangePicker() {
  const dateRange = useDashboardStore(s => s.dateRange);
  const setDateRange = useDashboardStore(s => s.actions.setDateRange);

  function handlePreset(preset) {
    setDateRange({ preset });
  }

  function handleFromChange(e) {
    // Parse as local time to avoid UTC-offset date shifts
    const start = new Date(e.target.value + 'T00:00:00');
    setDateRange({ start, end: dateRange.end });
  }

  function handleToChange(e) {
    const end = new Date(e.target.value + 'T23:59:59');
    setDateRange({ start: dateRange.start, end });
  }

  const fromValue = formatDate(dateRange.start);
  const toValue = formatDate(dateRange.end);

  return (
    <div data-role="date-picker">
      <div>
        {PRESETS.map(p => (
          <button
            key={p}
            onClick={() => handlePreset(p)}
            aria-pressed={dateRange.preset === p}
            data-active={dateRange.preset === p ? 'true' : undefined}
          >
            {p}
          </button>
        ))}
      </div>
      <div>
        <label>
          From
          <input type="date" value={fromValue} onChange={handleFromChange} />
        </label>
        <label>
          To
          <input type="date" value={toValue} onChange={handleToChange} />
        </label>
      </div>
    </div>
  );
}