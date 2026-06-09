// @ts-nocheck
const currencyFmt = v =>
  v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const COLOR_VARS = [
  'var(--chart-color-1)',
  'var(--chart-color-2)',
  'var(--chart-color-3)',
  'var(--chart-color-4)',
  'var(--chart-color-5)',
  'var(--chart-color-6)',
];

export default function MarginWaterfallChart({ waterfall }) {
  const {
    revenue,
    foodCostAmt,
    laborCostAmt,
    fixedCostAmt,
    variableCostAmt,
    netProfit,
    afterFood,
    afterLabor,
    afterFixed,
  } = waterfall;

  const pctOfRev = amt =>
    revenue > 0 ? Math.round((amt / revenue) * 1000) / 10 : 0;

  const barLeft = val =>
    revenue > 0 ? Math.max(0, Math.min(100, (val / revenue) * 100)) : 0;
  const barWidth = amt =>
    revenue > 0 ? Math.max(0, Math.min(100, (amt / revenue) * 100)) : 0;

  const steps = [
    { category: 'revenue',        label: 'Revenue',         amount: revenue,         pct: 100,                 left: 0,                       width: 100,                       hidden: false, colorIdx: 0 },
    { category: 'food-cost',      label: 'Food Cost',       amount: foodCostAmt,     pct: pctOfRev(foodCostAmt),     left: barLeft(afterFood),     width: barWidth(foodCostAmt),     hidden: false, colorIdx: 1 },
    { category: 'labor-cost',     label: 'Labor Cost',      amount: laborCostAmt,    pct: pctOfRev(laborCostAmt),    left: barLeft(afterLabor),    width: barWidth(laborCostAmt),    hidden: false, colorIdx: 2 },
    { category: 'fixed-cost',     label: 'Fixed Costs',     amount: fixedCostAmt,    pct: pctOfRev(fixedCostAmt),    left: barLeft(afterFixed),    width: barWidth(fixedCostAmt),    hidden: false, colorIdx: 3 },
    { category: 'variable-cost',  label: 'Variable Costs',  amount: variableCostAmt, pct: pctOfRev(variableCostAmt), left: barLeft(netProfit),     width: barWidth(variableCostAmt), hidden: false, colorIdx: 4 },
    { category: 'net-profit',     label: 'Net Profit (Est.)', amount: netProfit,       pct: pctOfRev(netProfit),       left: 0,                       width: barWidth(netProfit),       hidden: false, colorIdx: 5 },
  ];

  return (
    <div data-chart="margin-waterfall">
      <h2 className="chart-section-title">Margin Waterfall</h2>
      {steps.map(step => (
        <div
          key={step.category}
          data-category={step.category}
          data-profit-sign={step.category === 'net-profit' ? (netProfit >= 0 ? 'positive' : 'negative') : undefined}
          style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', height: '40px' }}
        >
          <div className="waterfall-label" style={{ width: '120px', flexShrink: 0 }}>
            {step.label}
          </div>
          <div style={{ flex: 1, position: 'relative', height: '24px', background: 'var(--color-border-subtle)', borderRadius: '4px' }}>
            <div
              style={{
                position: 'absolute',
                left: step.left + '%',
                width: step.width + '%',
                height: '100%',
                backgroundColor: step.category === 'net-profit'
                  ? (netProfit >= 0 ? 'var(--chart-positive)' : 'var(--chart-negative)')
                  : COLOR_VARS[step.colorIdx],
                minWidth: step.width > 0 ? '2px' : '0',
                borderRadius: '4px',
              }}
            />
          </div>
          <div style={{ width: '180px', flexShrink: 0, textAlign: 'right', paddingLeft: '16px' }}>
            {currencyFmt(step.amount)} ({step.pct}%)
          </div>
        </div>
      ))}
    </div>
  );
}
