export default function KpiCard({ label, value, delta, sentiment, dataSourceLabel }) {
  const deltaDirection = delta != null ? (delta >= 0 ? 'up' : 'down') : undefined;

  return (
    <div data-sentiment={sentiment || undefined}>
      <div>{label}</div>
      <div>{value}</div>
      {delta != null && (
        <div data-delta-direction={deltaDirection}>
          {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}
        </div>
      )}
      {dataSourceLabel && <div>{dataSourceLabel}</div>}
    </div>
  );
}
