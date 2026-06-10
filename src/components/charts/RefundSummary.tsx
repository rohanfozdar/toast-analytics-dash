// @ts-nocheck
import { useMemo } from 'react';
import { getRefundSummary } from '../../lib/calculations';
import KpiCard from '../shared/KpiCard';

const currencyFmt = v =>
  v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function RefundSummary({ paymentDetails, checks, start, end }) {
  const { refundCount, refundAmount, refundRate } = useMemo(
    () => getRefundSummary(paymentDetails, checks, start, end),
    [paymentDetails, checks, start, end]
  );

  return (
    <div data-role="refund-summary">
      <h3>Refunds</h3>
      <div className="kpi-grid-3">
        <KpiCard label="Refund Count" value={refundCount.toLocaleString()} />
        <KpiCard label="Refund Amount" value={currencyFmt(refundAmount)} />
        <KpiCard label="Refund Rate" value={`${refundRate.toFixed(1)}%`} />
      </div>
    </div>
  );
}
