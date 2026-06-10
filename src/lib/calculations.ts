// @ts-nocheck
import { formatDate, dayOfWeekLabel } from './dateUtils';

// ── Filters ───────────────────────────────────────────────────────────────────

export function filterChecksByRange(checks, start, end) {
  return checks.filter(c => c.openedAt >= start && c.openedAt <= end);
}

export function filterItemsByRange(itemSelections, checks, start, end) {
  const checkIds = new Set(filterChecksByRange(checks, start, end).map(c => c.checkId));
  return itemSelections.filter(i => checkIds.has(i.checkId));
}

export function filterLaborByRange(timeEntries, start, end) {
  return timeEntries.filter(t => t.clockIn >= start);
}

export function filterKitchenByRange(kitchenTimings, start, end) {
  return kitchenTimings.filter(k => k.firedAt >= start);
}

// ── Net sales helpers ─────────────────────────────────────────────────────────

function netSalesOfCheck(c) {
  return Math.round((c.total - c.tax - c.discount) * 100) / 100;
}

// ── KPI & revenue ─────────────────────────────────────────────────────────────

export function getNetSalesByDay(checks, start, end) {
  const filtered = filterChecksByRange(checks, start, end);
  const byDay = {};
  for (const c of filtered) {
    const key = formatDate(c.openedAt);
    byDay[key] = (byDay[key] || 0) + netSalesOfCheck(c);
  }
  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, netSales]) => ({ date, netSales: Math.round(netSales * 100) / 100 }));
}

export function getPeriodComparison(checks, preset) {
  const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 90;
  const now = new Date();

  const currentEnd = new Date(now);
  currentEnd.setHours(23, 59, 59, 999);
  const currentStart = new Date(currentEnd);
  currentStart.setDate(currentStart.getDate() - (days - 1));
  currentStart.setHours(0, 0, 0, 0);

  const priorEnd = new Date(currentStart.getTime() - 1);
  const priorStart = new Date(priorEnd);
  priorStart.setDate(priorStart.getDate() - (days - 1));
  priorStart.setHours(0, 0, 0, 0);

  return {
    current: getNetSalesByDay(checks, currentStart, currentEnd),
    prior: getNetSalesByDay(checks, priorStart, priorEnd),
  };
}

export function getKpiSummary(checks, start, end) {
  const filtered = filterChecksByRange(checks, start, end);

  const days = filtered.map(c => formatDate(c.openedAt));
  const uniqueDays = new Set(days).size;

  // Current period net sales
  const totalNetSales = Math.round(
    filtered.reduce((s, c) => s + netSalesOfCheck(c), 0) * 100
  ) / 100;

  const totalChecks = filtered.length;
  const avgCheckSize = totalChecks > 0
    ? Math.round((totalNetSales / totalChecks) * 100) / 100
    : 0;

  // Prior period (same length, immediately before)
  const rangeLengthMs = end.getTime() - start.getTime();
  const priorEnd = new Date(start.getTime() - 1);
  const priorStart = new Date(priorEnd.getTime() - rangeLengthMs);
  const priorFiltered = filterChecksByRange(checks, priorStart, priorEnd);
  const priorNetSales = priorFiltered.reduce((s, c) => s + netSalesOfCheck(c), 0);

  const periodChangePct = priorNetSales > 0
    ? Math.round(((totalNetSales - priorNetSales) / priorNetSales) * 1000) / 10
    : null;

  return { totalNetSales, totalChecks, avgCheckSize, periodChangePct };
}

// ── Sales breakdowns ──────────────────────────────────────────────────────────

export function getSalesByService(itemSelections, checks, start, end) {
  const items = filterItemsByRange(itemSelections, checks, start, end);

  const byService = {};
  for (const item of items) {
    if (item.isVoid) continue;
    const svc = item.service;
    byService[svc] = (byService[svc] || 0) + item.netPrice;
  }

  return Object.entries(byService)
    .map(([service, netSales]) => ({ service, netSales: Math.round(netSales * 100) / 100 }))
    .sort((a, b) => b.netSales - a.netSales);
}

export function getSalesByDayOfWeek(checks, start, end) {
  const filtered = filterChecksByRange(checks, start, end);

  const totals = {};
  const counts = {};
  for (const c of filtered) {
    const dow = dayOfWeekLabel(c.openedAt);
    totals[dow] = (totals[dow] || 0) + netSalesOfCheck(c);
    counts[dow] = (counts[dow] || 0) + 1;
  }

  // Build daily totals per weekday occurrence
  const dailyTotals = {};
  const dailyCounts = {};
  for (const c of filtered) {
    const dateKey = formatDate(c.openedAt);
    const dow = dayOfWeekLabel(c.openedAt);
    if (!dailyTotals[dow]) dailyTotals[dow] = {};
    dailyTotals[dow][dateKey] = (dailyTotals[dow][dateKey] || 0) + netSalesOfCheck(c);
  }

  const ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return ORDER
    .filter(dow => dailyTotals[dow])
    .map(dow => {
      const days = Object.values(dailyTotals[dow]);
      const avg = days.reduce((s, v) => s + v, 0) / days.length;
      return { dow, avgSales: Math.round(avg * 100) / 100 };
    });
}

// ── Labor ─────────────────────────────────────────────────────────────────────

export function getLaborCostByRole(timeEntries, start, end) {
  const filtered = filterLaborByRange(timeEntries, start, end);

  const byRole = {};
  for (const t of filtered) {
    const role = t.jobTitle;
    if (!byRole[role]) byRole[role] = { jobTitle: role, totalHours: 0, overtimeHours: 0, totalPay: 0 };
    byRole[role].totalHours += t.payableHours;
    byRole[role].overtimeHours += t.overtimeHours;
    byRole[role].totalPay += t.totalPay;
  }

  return Object.values(byRole).map(r => ({
    ...r,
    totalHours: Math.round(r.totalHours * 100) / 100,
    overtimeHours: Math.round(r.overtimeHours * 100) / 100,
    totalPay: Math.round(r.totalPay * 100) / 100,
  }));
}

export function getTotalLaborCost(timeEntries, start, end) {
  const filtered = filterLaborByRange(timeEntries, start, end);
  return Math.round(filtered.reduce((s, t) => s + t.totalPay, 0) * 100) / 100;
}

export function getLaborPct(timeEntries, checks, start, end) {
  const laborCost = getTotalLaborCost(timeEntries, start, end);
  const filtered = filterChecksByRange(checks, start, end);
  const netSales = filtered.reduce((s, c) => s + netSalesOfCheck(c), 0);
  if (netSales === 0) return 0;
  return Math.round((laborCost / netSales) * 1000) / 10;
}

// ── Margin waterfall ──────────────────────────────────────────────────────────

export function computeMarginWaterfall(netSales, laborCost, weeksInRange, costInputs) {
  const { foodCostPct, fixedWeeklyCost, variableCostPct } = costInputs;

  const foodCostAmt = Math.round(netSales * foodCostPct / 100 * 100) / 100;
  const afterFood = Math.round((netSales - foodCostAmt) * 100) / 100;

  const laborCostAmt = Math.round(laborCost * 100) / 100;
  const afterLabor = Math.round((afterFood - laborCostAmt) * 100) / 100;

  const fixedCostAmt = Math.round(fixedWeeklyCost * weeksInRange * 100) / 100;
  const afterFixed = Math.round((afterLabor - fixedCostAmt) * 100) / 100;

  const variableCostAmt = Math.round(netSales * variableCostPct / 100 * 100) / 100;
  const netProfit = Math.round((afterFixed - variableCostAmt) * 100) / 100;

  return {
    revenue: netSales,
    foodCostAmt,
    afterFood,
    laborCostAmt,
    afterLabor,
    fixedCostAmt,
    afterFixed,
    variableCostAmt,
    netProfit,
  };
}

// ── Menu performance ──────────────────────────────────────────────────────────

export function getMenuPerformance(itemSelections, checks, start, end) {
  const items = filterItemsByRange(itemSelections, checks, start, end);

  const byItem = {};
  for (const item of items) {
    const key = item.menuItem;
    if (!byItem[key]) {
      byItem[key] = {
        menuItem: key,
        menuGroup: item.menuGroup,
        unitsSold: 0,
        voidQty: 0,
        grossRevenue: 0,
        discountAmount: 0,
        netRevenue: 0,
      };
    }
    if (item.isVoid) {
      byItem[key].voidQty++;
    } else {
      byItem[key].unitsSold++;
      byItem[key].grossRevenue += item.grossPrice;
      byItem[key].discountAmount += item.discnt;
      byItem[key].netRevenue += item.netPrice;
    }
  }

  const totalNetRevenue = Object.values(byItem).reduce((s, r) => s + r.netRevenue, 0);

  return Object.values(byItem)
    .map(r => {
      const totalWithVoids = r.unitsSold + r.voidQty;
      return {
        ...r,
        totalWithVoids,
        voidRate: totalWithVoids > 0 ? Math.round((r.voidQty / totalWithVoids) * 1000) / 10 : 0,
        grossRevenue: Math.round(r.grossRevenue * 100) / 100,
        discountAmount: Math.round(r.discountAmount * 100) / 100,
        netRevenue: Math.round(r.netRevenue * 100) / 100,
        pctOfTotal: totalNetRevenue > 0
          ? Math.round((r.netRevenue / totalNetRevenue) * 1000) / 10
          : 0,
      };
    })
    .sort((a, b) => b.netRevenue - a.netRevenue);
}

// ── Dining channel split ──────────────────────────────────────────────────────

export function getDiningChannelSplit(itemSelections, checks, start, end) {
  const filteredChecks = filterChecksByRange(checks, start, end);
  const items = filterItemsByRange(itemSelections, checks, start, end);

  const channelRevenue = {};
  const channelCheckCounts = {};

  for (const item of items) {
    if (item.isVoid) continue;
    const opt = item.diningOption;
    channelRevenue[opt] = (channelRevenue[opt] || 0) + item.netPrice;
  }

  for (const c of filteredChecks) {
    const opt = c.diningOption;
    channelCheckCounts[opt] = (channelCheckCounts[opt] || 0) + 1;
  }

  const totalRevenue = Object.values(channelRevenue).reduce((s, v) => s + v, 0);

  return Object.entries(channelRevenue)
    .map(([diningOption, netRevenue]) => {
      const checkCount = channelCheckCounts[diningOption] || 1;
      return {
        diningOption,
        netRevenue: Math.round(netRevenue * 100) / 100,
        pct: totalRevenue > 0 ? Math.round((netRevenue / totalRevenue) * 1000) / 10 : 0,
        avgCheckSize: Math.round((netRevenue / checkCount) * 100) / 100,
      };
    })
    .sort((a, b) => b.netRevenue - a.netRevenue);
}

// ── Discounts ─────────────────────────────────────────────────────────────────

export function getDiscountSummary(checks, start, end) {
  const filtered = filterChecksByRange(checks, start, end);

  let totalDiscountAmt = 0;
  let discountedCheckCount = 0;
  let preDiscountGross = 0;
  const byReason = {};

  for (const c of filtered) {
    // Pre-discount gross denominator: total − tax + discount (= subtotal before discount)
    preDiscountGross += c.total - c.tax + c.discount;
    if (c.discount > 0) {
      totalDiscountAmt += c.discount;
      discountedCheckCount++;
      const reason = c.reasonOfDiscount || 'Unknown';
      if (!byReason[reason]) byReason[reason] = { reason, amount: 0, count: 0 };
      byReason[reason].amount += c.discount;
      byReason[reason].count++;
    }
  }

  return {
    totalDiscountAmt: Math.round(totalDiscountAmt * 100) / 100,
    discountedCheckCount,
    discountPctOfGross: preDiscountGross > 0
      ? Math.round((totalDiscountAmt / preDiscountGross) * 1000) / 10
      : 0,
    byReason: Object.values(byReason)
      .map(r => ({ ...r, amount: Math.round(r.amount * 100) / 100 }))
      .sort((a, b) => b.amount - a.amount),
  };
}

// ── Voids ─────────────────────────────────────────────────────────────────────

export function getVoidSummary(itemSelections, checks, start, end) {
  const items = filterItemsByRange(itemSelections, checks, start, end);
  const voids = items.filter(i => i.isVoid);
  return {
    totalVoidAmt: Math.round(voids.reduce((s, i) => s + i.grossPrice, 0) * 100) / 100,
    totalVoidCount: voids.length,
  };
}

// ── Avg check by day ──────────────────────────────────────────────────────────

export function getAvgCheckByDay(checks, start, end) {
  const filtered = filterChecksByRange(checks, start, end);

  const byDay = {};
  const countByDay = {};
  for (const c of filtered) {
    const key = formatDate(c.openedAt);
    byDay[key] = (byDay[key] || 0) + netSalesOfCheck(c);
    countByDay[key] = (countByDay[key] || 0) + 1;
  }

  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, total]) => ({
      date,
      avgCheckSize: Math.round((total / countByDay[date]) * 100) / 100,
    }));
}

// ── Kitchen fulfillment ───────────────────────────────────────────────────────

export function getKitchenFulfillmentStats(kitchenTimings, start, end) {
  const filtered = filterKitchenByRange(kitchenTimings, start, end);

  if (filtered.length === 0) {
    return {
      avgMinutes: 0,
      byDiningOption: [],
      histogram: { '<10': 0, '10-15': 0, '15-20': 0, '20-30': 0, '30+': 0 },
    };
  }

  const histogram = { '<10': 0, '10-15': 0, '15-20': 0, '20-30': 0, '30+': 0 };
  const byOption = {};

  let totalMinutes = 0;

  for (const k of filtered) {
    const dur = (k.fulfilledAt - k.firedAt) / 60000;
    totalMinutes += dur;

    if (dur < 10) histogram['<10']++;
    else if (dur < 15) histogram['10-15']++;
    else if (dur < 20) histogram['15-20']++;
    else if (dur < 30) histogram['20-30']++;
    else histogram['30+']++;

    const opt = k.diningOption;
    if (!byOption[opt]) byOption[opt] = { total: 0, count: 0 };
    byOption[opt].total += dur;
    byOption[opt].count++;
  }

  const avgMinutes = Math.round((totalMinutes / filtered.length) * 100) / 100;

  const byDiningOption = Object.entries(byOption)
    .map(([diningOption, { total, count }]) => ({
      diningOption,
      avgMinutes: Math.round((total / count) * 100) / 100,
    }))
    .sort((a, b) => b.avgMinutes - a.avgMinutes);

  return { avgMinutes, byDiningOption, histogram };
}
// ── Payment details ──────────────────────────────────────────────────────────

export function filterPaymentsByRange(paymentDetails, checks, start, end) {
  const checkIds = new Set(filterChecksByRange(checks, start, end).map(c => c.checkId));
  return paymentDetails.filter(p => checkIds.has(p.checkId));
}

export function getProcessingFees(paymentDetails, checks, start, end) {
  const payments = filterPaymentsByRange(paymentDetails, checks, start, end);
  const totalFees = Math.round(payments.reduce((s, p) => s + (p.vMcDFees || 0), 0) * 100) / 100;
  const filteredChecks = filterChecksByRange(checks, start, end);
  const netSales = filteredChecks.reduce((s, c) => s + (c.total - c.tax - c.discount), 0);
  const feePctOfSales = netSales > 0
    ? Math.round((totalFees / netSales) * 1000) / 10
    : 0;
  return { totalFees, feePctOfSales };
}

export function getRefundSummary(paymentDetails, checks, start, end) {
  const payments = filterPaymentsByRange(paymentDetails, checks, start, end);
  const refunds = payments.filter(p => p.refunded);
  const refundAmount = Math.round(refunds.reduce((s, p) => s + (p.refundAmount || 0), 0) * 100) / 100;
  const refundCount = refunds.length;
  const refundRate = payments.length > 0
    ? Math.round((refundCount / payments.length) * 1000) / 10
    : 0;
  return { refundCount, refundAmount, refundRate };
}

export function getPaymentMix(paymentDetails, checks, start, end) {
  const payments = filterPaymentsByRange(paymentDetails, checks, start, end);
  const buckets = {};
  for (const p of payments) {
    const label = p.type === 'Credit Card' && p.cardType ? p.cardType : p.type;
    if (!buckets[label]) buckets[label] = { label, count: 0, amount: 0 };
    buckets[label].count++;
    buckets[label].amount += p.total;
  }
  const totalAmount = Object.values(buckets).reduce((s, b) => s + b.amount, 0);
  return Object.values(buckets)
    .map(b => ({
      label: b.label,
      count: b.count,
      amount: Math.round(b.amount * 100) / 100,
      pct: totalAmount > 0 ? Math.round((b.amount / totalAmount) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getTipSummary(paymentDetails, checks, start, end) {
  const payments = filterPaymentsByRange(paymentDetails, checks, start, end);
  let cashTips = 0;
  let nonCashTips = 0;
  for (const p of payments) {
    if (p.type === 'Cash') cashTips += p.tip;
    else nonCashTips += p.tip;
  }
  const totalTips = cashTips + nonCashTips;
  const filteredChecks = filterChecksByRange(checks, start, end);
  const netSales = filteredChecks.reduce((s, c) => s + (c.total - c.tax - c.discount), 0);
  return {
    cashTips: Math.round(cashTips * 100) / 100,
    nonCashTips: Math.round(nonCashTips * 100) / 100,
    totalTips: Math.round(totalTips * 100) / 100,
    tipPctOfSales: netSales > 0 ? Math.round((totalTips / netSales) * 1000) / 10 : 0,
  };
}

// ── Modifier selections ──────────────────────────────────────────────────────

export function filterModifiersByRange(modifierSelections, checks, start, end) {
  const checkIds = new Set(filterChecksByRange(checks, start, end).map(c => c.checkId));
  return modifierSelections.filter(m => checkIds.has(m.checkId));
}

export function getModifierAttachRate(modifierSelections, itemSelections, checks, start, end) {
  const items = filterItemsByRange(itemSelections, checks, start, end).filter(i => !i.isVoid);
  const mods = filterModifiersByRange(modifierSelections, checks, start, end)
    .filter(m => !m.isVoid && m.netPrice > 0);
  const parentsWithPaidMod = new Set(mods.map(m => m.parentMenuSelectionItemId));
  const attached = items.filter(i => parentsWithPaidMod.has(i.itemSelectionId)).length;
  return items.length > 0 ? Math.round((attached / items.length) * 1000) / 10 : 0;
}

export function getModifierPerformance(modifierSelections, checks, start, end) {
  const mods = filterModifiersByRange(modifierSelections, checks, start, end)
    .filter(m => !m.isVoid);
  const byName = {};
  for (const m of mods) {
    if (!byName[m.modifierName]) {
      byName[m.modifierName] = { modifierName: m.modifierName, count: 0, revenue: 0 };
    }
    byName[m.modifierName].count++;
    byName[m.modifierName].revenue += m.netPrice;
  }
  return Object.values(byName)
    .map(r => ({ ...r, revenue: Math.round(r.revenue * 100) / 100 }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function getUpsellRevenue(modifierSelections, checks, start, end) {
  const mods = filterModifiersByRange(modifierSelections, checks, start, end)
    .filter(m => !m.isVoid);
  const upsell = Math.round(mods.reduce((s, m) => s + m.netPrice, 0) * 100) / 100;
  const filteredChecks = filterChecksByRange(checks, start, end);
  const netSales = filteredChecks.reduce((s, c) => s + (c.total - c.tax - c.discount), 0);
  return {
    upsellRevenue: upsell,
    pctOfNetSales: netSales > 0 ? Math.round((upsell / netSales) * 1000) / 10 : 0,
  };
}

// ── Order details ─────────────────────────────────────────────────────────────

export function filterOrdersByRange(orderDetails, checks, start, end) {
  const checkIds = new Set(filterChecksByRange(checks, start, end).map(c => c.checkId));
  return orderDetails.filter(o => checkIds.has(o.checkId));
}

export function getOrderSummary(orderDetails, checks, start, end) {
  const orders = filterOrdersByRange(orderDetails, checks, start, end);
  const orderCount = orders.length;
  const avgGuests = orderCount > 0
    ? Math.round(orders.reduce((s, o) => s + o.numGuests, 0) / orderCount * 100) / 100
    : 0;
  const avgDurationMin = orderCount > 0
    ? Math.round(orders.reduce((s, o) => s + o.durationOpenedToPaid, 0) / orderCount * 100) / 100
    : 0;

  const bySource = {};
  for (const o of orders) {
    if (!bySource[o.orderSource]) bySource[o.orderSource] = { source: o.orderSource, count: 0 };
    bySource[o.orderSource].count++;
  }
  const totalOrders = orders.length;
  const bySourceArr = Object.values(bySource).map(s => ({
    ...s,
    pct: totalOrders > 0 ? Math.round((s.count / totalOrders) * 1000) / 10 : 0,
  })).sort((a, b) => b.count - a.count);

  return { orderCount, avgGuests, avgDurationMin, bySource: bySourceArr };
}

// ── Cash management ───────────────────────────────────────────────────────────

export function filterCashByRange(cashEntries, start, end) {
  return cashEntries.filter(c => c.createdDate >= start && c.createdDate <= end);
}

export function getCashSummary(cashEntries, start, end) {
  const filtered = filterCashByRange(cashEntries, start, end);
  let totalPayIns = 0;
  let totalPayOuts = 0;

  const byAction = {};
  for (const c of filtered) {
    if (!byAction[c.action]) {
      byAction[c.action] = { action: c.action, count: 0, amount: 0 };
    }
    byAction[c.action].count++;
    byAction[c.action].amount += Math.abs(c.amount);

    if (c.action === 'Cash In') {
      totalPayIns += c.amount;
    } else if (c.action === 'Pay Out' || c.action === 'Tip Out') {
      totalPayOuts += c.amount;
    }
  }

  const netCashMovement = Math.round((totalPayIns - totalPayOuts) * 100) / 100;

  return {
    totalPayIns: Math.round(totalPayIns * 100) / 100,
    totalPayOuts: Math.round(totalPayOuts * 100) / 100,
    netCashMovement,
    byAction: Object.values(byAction).map(a => ({
      ...a,
      amount: Math.round(a.amount * 100) / 100,
    })).sort((a, b) => b.amount - a.amount),
  };
}

export function getCashOverShort(cashEntries, checks, start, end) {
  const filteredCash = filterCashByRange(cashEntries, start, end);
  const filteredChecks = filterChecksByRange(checks, start, end);

  // Sum cash-tender check totals
  const cashTenderTotal = filteredChecks
    .filter(c => c.tender === 'Cash')
    .reduce((s, c) => s + c.total, 0);

  // Sum cash drawer activity (pay-ins minus pay-outs)
  const drawerActivity = filteredCash.reduce((s, c) => {
    if (c.action === 'Cash In') return s + c.amount;
    if (c.action === 'Pay Out' || c.action === 'Tip Out') return s - c.amount;
    return s;
  }, 0);

  const overShort = Math.round((cashTenderTotal - drawerActivity) * 100) / 100;

  return {
    cashTenderTotal: Math.round(cashTenderTotal * 100) / 100,
    drawerActivity: Math.round(drawerActivity * 100) / 100,
    overShort,
  };
}


