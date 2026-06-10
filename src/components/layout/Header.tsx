// @ts-nocheck
import DateRangePicker from './DateRangePicker';

export default function Header() {
  return (
    <header>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0 }}>Toast Analytics Dashboard</h1>
        <span
          data-role="demo-badge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '0.72rem',
            fontWeight: 600,
            letterSpacing: '0.02em',
            background: 'var(--color-primary-tint)',
            color: 'var(--color-primary)',
            border: '1px solid var(--color-border)',
            textTransform: 'uppercase',
          }}
          title="This dashboard uses simulated data, not a live Toast account."
        >
          Demo · Simulated data
        </span>
      </div>
      <DateRangePicker />
    </header>
  );
}
