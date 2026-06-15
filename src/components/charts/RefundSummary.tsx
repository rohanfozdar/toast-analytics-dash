// @ts-nocheck
import { useMemo } from 'react';
import { getRefundSummary } from '../../lib/calculations';
import KpiCard from '../shared/KpiCard';
import { formatCurrency, formatPercent, formatCount } from '../../lib/format';

const currencyFmt = formatCurrency;

export default function RefundSummary({ paymentDetails, checks, start, end }) {
  const { refundCount, refundAmount, refundRate } = useMemo(
    () => getRefundSummary(paymentDetails, checks, start, end),
    [paymentDetails, checks, start, end]
  );

  return (
    <div data-role="refund-summary">
      <h3>Refunds</h3>
      <div className="kpi-grid-3">
        <KpiCard label="Refund Count" value={formatCount(refundCount)} />
        <KpiCard label="Refund Amount" value={currencyFmt(refundAmount)} />
        <KpiCard label="Refund Rate" value={formatPercent(refundRate, 'ratio')} />
      </div>
    </div>
  );
}
