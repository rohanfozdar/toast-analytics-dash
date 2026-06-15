// @ts-nocheck
import { useMemo, useState } from 'react';
import { getMenuPerformance } from '../../lib/calculations';
import { formatCurrency, formatPercent } from '../../lib/format';


const SORT_KEYS = [
  'menuItem', 'menuGroup', 'unitsSold', 'grossRevenue',
  'voidQty', 'voidRate', 'discountAmount', 'netRevenue', 'pctOfTotal',
];

export default function MenuPerformanceTable({ itemSelections, checks, start, end }) {
  const [sortKey, setSortKey] = useState('netRevenue');
  const [sortDir, setSortDir] = useState('desc');
  const [foodCosts, setFoodCosts] = useState({});

  const rows = useMemo(
    () => getMenuPerformance(itemSelections, checks, start, end),
    [itemSelections, checks, start, end]
  );

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  function handleHeaderClick(key) {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function handleFoodCostChange(menuItem, value) {
    setFoodCosts(prev => ({ ...prev, [menuItem]: value }));
  }

  function getMarginPct(row) {
    const raw = foodCosts[row.menuItem];
    if (raw === undefined || raw === '') return null;
    const costPerUnit = parseFloat(raw);
    if (isNaN(costPerUnit) || row.netRevenue === 0) return null;
    const totalFoodCost = costPerUnit * row.unitsSold;
    return Math.round(((row.netRevenue - totalFoodCost) / row.netRevenue) * 1000) / 10;
  }

  function sortIndicator(key) {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  }

  const thStyle = { cursor: 'pointer', userSelect: 'none' };

  return (
    <div>
      <h2 className="chart-section-title">Menu Performance</h2>
      <div style={{ overflowX: 'auto', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
      <table data-role="menu-table" style={{ border: 'none' }}>
        <thead data-sortable="true">
          <tr>
            <th style={thStyle} onClick={() => handleHeaderClick('menuItem')}>
              Item Name{sortIndicator('menuItem')}
            </th>
            <th style={thStyle} onClick={() => handleHeaderClick('menuGroup')}>
              Menu Group{sortIndicator('menuGroup')}
            </th>
            <th style={thStyle} onClick={() => handleHeaderClick('unitsSold')}>
              Units Sold{sortIndicator('unitsSold')}
            </th>
            <th style={thStyle} onClick={() => handleHeaderClick('grossRevenue')}>
              Gross Revenue{sortIndicator('grossRevenue')}
            </th>
            <th style={thStyle} onClick={() => handleHeaderClick('voidQty')}>
              Void Qty{sortIndicator('voidQty')}
            </th>
            <th style={thStyle} onClick={() => handleHeaderClick('voidRate')}>
              Void Rate %{sortIndicator('voidRate')}
            </th>
            <th style={thStyle} onClick={() => handleHeaderClick('discountAmount')}>
              Discount Amount{sortIndicator('discountAmount')}
            </th>
            <th style={thStyle} onClick={() => handleHeaderClick('netRevenue')}>
              Net Revenue{sortIndicator('netRevenue')}
            </th>
            <th style={thStyle} onClick={() => handleHeaderClick('pctOfTotal')}>
              % of Total{sortIndicator('pctOfTotal')}
            </th>
            <th>Food Cost</th>
            <th>Margin %</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(row => {
            const marginPct = getMarginPct(row);
            return (
              <tr key={row.menuItem}>
                <td>{row.menuItem}</td>
                <td>{row.menuGroup}</td>
                <td>{row.unitsSold}</td>
                <td>{currencyFmt(row.grossRevenue)}</td>
                <td>{row.voidQty}</td>
                <td data-alert={row.voidRate > 5 ? 'true' : undefined}>
                  {pctFmt(row.voidRate)}
                </td>
                <td>{currencyFmt(row.discountAmount)}</td>
                <td>{currencyFmt(row.netRevenue)}</td>
                <td>{pctFmt(row.pctOfTotal)}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter cost $"
                    value={foodCosts[row.menuItem] ?? ''}
                    onChange={e => handleFoodCostChange(row.menuItem, e.target.value)}
                  />
                </td>
                <td>
                  {marginPct !== null ? pctFmt(marginPct) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}