// @ts-nocheck
import {
  MENU_ITEMS,
  STAFF,
  SERVICES,
  DINING_OPTIONS,
  TENDERS,
  DINING_AREAS,
  STATIONS,
  DISCOUNT_REASONS,
  VOID_REASONS,
  CARD_TYPES,
  CARD_TYPE_WEIGHTS,
  PROCESSING_FEE_RATE,
  MODIFIER_CATALOG,
} from './constants';

// ── Seeded PRNG (mulberry32) for reproducible data ────────────────────────────
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(0xdeadbeef);

function randInt(min, max) { return Math.floor(rand() * (max - min + 1)) + min; }
function randFloat(min, max) { return rand() * (max - min) + min; }
function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }

// Box-Muller normal distribution
function randNormal(mean, sd) {
  const u = 1 - rand();
  const v = rand();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mean + z * sd;
}

// ── Date formatting helpers ───────────────────────────────────────────────────
function fmtCheckDate(d) {
  // MM/DD/YY
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const y = String(d.getFullYear()).slice(-2);
  return `${m}/${day}/${y}`;
}

function fmtCheckTime(d) {
  // hh:mm a
  let h = d.getHours();
  const min = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${min} ${ampm}`;
}

function fmtItemDate(d) {
  // MM/DD/YYYY HH:MM:SS
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const y = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${m}/${day}/${y} ${hh}:${mm}:${ss}`;
}

function fmtKitchenDate(d) {
  // MM/DD/YY h:mm AM|PM
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const y = String(d.getFullYear()).slice(-2);
  let h = d.getHours();
  const min = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${m}/${day}/${y} ${h}:${min} ${ampm}`;
}

function fmtLaborDate(d) {
  // M/D/YY HH:mm AM|PM
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const y = String(d.getFullYear()).slice(-2);
  let h = d.getHours();
  const min = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${m}/${day}/${y} ${h}:${min} ${ampm}`;
}

// ── Day-of-week multipliers ───────────────────────────────────────────────────
const DOW_MULT = [1.10, 0.75, 0.80, 0.90, 1.00, 1.45, 1.55]; // Sun=0

// ── Daypart config ────────────────────────────────────────────────────────────
const DAYPARTS = [
  { service: 'Breakfast',  pct: 0.15, startH: 7,  endH: 11 },
  { service: 'Lunch',      pct: 0.35, startH: 11, endH: 15 },
  { service: 'Dinner',     pct: 0.40, startH: 17, endH: 22 },
  { service: 'Late Night', pct: 0.10, startH: 22, endH: 26 },
];

// Items per daypart (weighted by avg daily qty to emphasise appropriate items)
const BREAKFAST_GROUPS = ['Coffee & Drinks', 'Breakfast'];
const LUNCH_GROUPS = ['Coffee & Drinks', 'Lunch', 'Desserts'];
const DINNER_GROUPS = ['Dinner', 'Bar', 'Desserts'];
const LATE_NIGHT_GROUPS = ['Bar', 'Dinner'];

function itemsForService(service) {
  const groupMap = {
    Breakfast: BREAKFAST_GROUPS,
    Lunch: LUNCH_GROUPS,
    Dinner: DINNER_GROUPS,
    'Late Night': LATE_NIGHT_GROUPS,
  };
  const groups = groupMap[service];
  return MENU_ITEMS.filter(i => groups.includes(i.group));
}

function weightedPickItem(items) {
  const total = items.reduce((s, i) => s + i.avgDailyQty, 0);
  let r = rand() * total;
  for (const item of items) {
    r -= item.avgDailyQty;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

// ── Dining option & tender distributions ─────────────────────────────────────
function pickDiningOption() {
  const r = rand();
  if (r < 0.55) return 'Dine-in';
  if (r < 0.80) return 'Take Out';
  if (r < 0.95) return 'Delivery';
  return 'Curbside';
}

function pickTender() {
  const r = rand();
  if (r < 0.71) return 'Credit Card';
  if (r < 0.85) return 'Cash';
  if (r < 0.94) return 'Gift Card';
  return 'Third Party';
}

// ── Kitchen durations by dining option ───────────────────────────────────────
const KITCHEN_PARAMS = {
  'Dine-in':   { mean: 14, sd: 4 },
  'Take Out':  { mean: 11, sd: 3 },
  'Delivery':  { mean: 13, sd: 4 },
  'Curbside':  { mean: 10, sd: 3 },
};

// ── Customer pool ─────────────────────────────────────────────────────────────
const CUSTOMER_POOL = Array.from({ length: 200 }, (_, i) => ({
  customerId: `CUST-${String(i + 1).padStart(4, '0')}`,
  customer: `Customer ${i + 1}`,
  customerPhone: `555-${String(randInt(1000, 9999))}`,
  customerEmail: `customer${i + 1}@example.com`,
}));

// ── Menu group → menu name mapping ───────────────────────────────────────────
const GROUP_TO_MENU = {
  'Coffee & Drinks': 'All Day Menu',
  'Breakfast': 'Breakfast Menu',
  'Lunch': 'Lunch Menu',
  'Dinner': 'Dinner Menu',
  'Bar': 'Bar Menu',
  'Desserts': 'Desserts Menu',
};

// ── Generate all data ─────────────────────────────────────────────────────────
export function generateAllData() {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const checks = [];
  const itemSelections = [];
  const kitchenTimings = [];

  let checkIdCounter = 1;
  let itemSelectionIdCounter = 1;
  let orderNumberCounter = 1;

  // Generate 90 days ending today
  for (let dayOffset = 89; dayOffset >= 0; dayOffset--) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    date.setHours(0, 0, 0, 0);

    const dow = date.getDay();
    const dowMult = DOW_MULT[dow];
    const noiseMult = randFloat(0.88, 1.12);
    const dayMult = dowMult * noiseMult;

    const checksToday = Math.round(120 * dayMult);

    // Assign checks to dayparts
    for (let ci = 0; ci < checksToday; ci++) {
      // Pick daypart
      const dpRand = rand();
      let cumPct = 0;
      let dp = DAYPARTS[0];
      for (const d of DAYPARTS) {
        cumPct += d.pct;
        if (dpRand < cumPct) { dp = d; break; }
      }

      // Opened time within daypart
      const startMin = dp.startH * 60;
      const endMin = dp.endH * 60;
      const openedMin = randInt(startMin, endMin - 1);
      const openedAt = new Date(date);
      openedAt.setHours(Math.floor(openedMin / 60), openedMin % 60, randInt(0, 59), 0);

      const diningOption = pickDiningOption();
      const tender = pickTender();
      const server = pick(STAFF.filter(s => s.jobTitle === 'Server' || s.jobTitle === 'Bartender')).name;
      const tableSize = randInt(1, 6);
      const tableNum = randInt(1, 20);

      // Items for this check (~2.2 avg)
      const numItems = Math.max(1, Math.round(randNormal(2.2, 0.9)));
      const availItems = itemsForService(dp.service);

      let subtotal = 0;
      const checkItems = [];
      for (let ii = 0; ii < numItems; ii++) {
        const menuItem = weightedPickItem(availItems);
        checkItems.push(menuItem);
        subtotal += menuItem.price;
      }

      // Discount
      const hasDiscount = rand() < 0.32;
      const discountAmt = hasDiscount ? Math.round(subtotal * randFloat(0.18, 0.42) * 100) / 100 : 0;
      const reasonOfDiscount = hasDiscount ? pick(DISCOUNT_REASONS) : '';

      const tax = Math.round(subtotal * 0.085 * 100) / 100;
      const total = Math.round((subtotal + tax) * 100) / 100;

      // Customer
      const hasCustomer = rand() < 0.10;
      const custData = hasCustomer ? pick(CUSTOMER_POOL) : null;

      const checkId = `CHK-${String(checkIdCounter).padStart(6, '0')}`;
      checkIdCounter++;

      checks.push({
        checkId,
        openedDate: fmtCheckDate(openedAt),
        openedTime: fmtCheckTime(openedAt),
        openedAt,
        server,
        tableSize,
        total,
        tax,
        discount: discountAmt,
        reasonOfDiscount,
        tender,
        diningOption,
        customerId: custData ? custData.customerId : null,
        customer: custData ? custData.customer : null,
        customerPhone: custData ? custData.customerPhone : null,
        customerEmail: custData ? custData.customerEmail : null,
      });

      // Item selections
      const orderNumber = orderNumberCounter++;
      const diningArea = diningOption === 'Dine-in'
        ? pick(DINING_AREAS)
        : diningOption === 'Delivery' ? 'Main Floor' : pick(DINING_AREAS);

      const perItemDiscount = hasDiscount ? Math.round((discountAmt / checkItems.length) * 100) / 100 : 0;

      for (let ii = 0; ii < checkItems.length; ii++) {
        const menuItem = checkItems[ii];
        // Some items have a higher void rate to demonstrate the alert UI
        const highVoidItems = new Set(['Eggs Benedict', 'Ribeye Steak', 'Pasta Arrabiata']);
        const voidChance = highVoidItems.has(menuItem.name) ? 0.075 : 0.03;
        const isVoid = rand() < voidChance;
        const voidReason = isVoid ? pick(VOID_REASONS) : '';
        const grossPrice = menuItem.price;
        const discnt = isVoid ? 0 : perItemDiscount;
        const netPrice = Math.round((grossPrice - discnt) * 100) / 100;
        const itemTax = Math.round(grossPrice * 0.085 * 100) / 100;

        // sentDate is a few minutes after openedAt
        const sentAt = new Date(openedAt.getTime() + randInt(1, 5) * 60000);

        itemSelections.push({
          itemSelectionId: `ITEM-${String(itemSelectionIdCounter).padStart(7, '0')}`,
          orderId: `ORD-${String(orderNumber).padStart(6, '0')}`,
          orderNumber,
          checkId,
          orderDate: fmtItemDate(openedAt),
          sentDate: fmtItemDate(sentAt),
          server,
          table: tableNum,
          diningArea,
          service: dp.service,
          diningOption,
          menuItem: menuItem.name,
          menuSubgroup: '',
          menuGroup: menuItem.group,
          menu: GROUP_TO_MENU[menuItem.group] || 'Main Menu',
          salesCategory: menuItem.group,
          grossPrice,
          discnt,
          netPrice,
          qty: 1.0000,
          tax: itemTax,
          isVoid,
          voidReason,
        });
        itemSelectionIdCounter++;
      }

      // Kitchen timing (one ticket per check)
      const kParams = KITCHEN_PARAMS[diningOption];
      const durationMin = Math.max(4, Math.round(randNormal(kParams.mean, kParams.sd) * 10) / 10);
      const firedAt = new Date(openedAt.getTime() + randInt(1, 3) * 60000);
      const fulfilledAt = new Date(firedAt.getTime() + durationMin * 60000);
      const station = pick(STATIONS);
      const fulfilledBy = pick(STAFF.filter(s => s.jobTitle === 'Cook')).name;

      kitchenTimings.push({
        checkNumber: orderNumber,
        checkId,
        checkOpened: fmtKitchenDate(openedAt),
        station,
        firedDate: fmtKitchenDate(firedAt),
        firedAt,
        fulfilledDate: fmtKitchenDate(fulfilledAt),
        fulfilledAt,
        fulfilledBy,
        server,
        table: tableNum,
        diningOption,
      });
    }
  }

  // ── Generate time entries ─────────────────────────────────────────────────
  const timeEntries = generateTimeEntries(today);

  // ── Generate payment details (SEPARATE PRNG to preserve existing seeds) ──
  const paymentDetails = generatePaymentDetails(checks);

  return { checks, itemSelections, timeEntries, kitchenTimings, paymentDetails };
}

function generatePaymentDetails(checks) {
  const payRand = mulberry32(0x9A1C0FFE);
  const prInt = (min, max) => Math.floor(payRand() * (max - min + 1)) + min;
  const prFloat = (min, max) => payRand() * (max - min) + min;
  const prPick = arr => arr[Math.floor(payRand() * arr.length)];
  const prWeighted = (arr, weights) => {
    const total = weights.reduce((s, w) => s + w, 0);
    let r = payRand() * total;
    for (let i = 0; i < arr.length; i++) {
      r -= weights[i];
      if (r <= 0) return arr[i];
    }
    return arr[arr.length - 1];
  };
  const last4 = () => String(prInt(0, 9999)).padStart(4, '0');
  const r2 = v => Math.round(v * 100) / 100;

  const payments = [];
  let payCounter = 1;

  const fmtPayDate = d => {
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const y = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${m}/${day}/${y} ${hh}:${mm}:${ss}`;
  };

  const tipRateFor = (type) => {
    if (type === 'Cash') return prFloat(0, 0.08);
    if (type === 'Gift Card') return 0.05;
    return prFloat(0.15, 0.22); // Credit Card / Third Party
  };

  for (const c of checks) {
    const netSales = r2(c.total - c.tax - c.discount);
    const split = payRand() < 0.08 ? 2 : 1;
    const checkNumber = c.checkId.replace(/[^0-9]/g, '').replace(/^0+/, '') || '0';
    const paidDateStr = fmtPayDate(c.openedAt);
    const orderDateStr = fmtPayDate(c.openedAt);

    // Compute totals first to split evenly
    const tipRate = tipRateFor(c.tender);
    const totalTip = r2(netSales * tipRate);
    const totalAmount = r2(c.total); // amount portion (pre-tip)
    const grandTotal = r2(totalAmount + totalTip);

    // Build N rows summing to grandTotal
    const rowAmounts = [];
    const rowTips = [];
    if (split === 1) {
      rowAmounts.push(totalAmount);
      rowTips.push(totalTip);
    } else {
      const a1 = r2(totalAmount * prFloat(0.35, 0.65));
      const a2 = r2(totalAmount - a1);
      const t1 = r2(totalTip * prFloat(0.35, 0.65));
      const t2 = r2(totalTip - t1);
      rowAmounts.push(a1, a2);
      rowTips.push(t1, t2);
    }

    for (let i = 0; i < rowAmounts.length; i++) {
      const amount = rowAmounts[i];
      const tip = rowTips[i];
      const total = r2(amount + tip);
      const type = c.tender;
      const isCard = type === 'Credit Card';
      const cardType = isCard ? prWeighted(CARD_TYPES, CARD_TYPE_WEIGHTS) : '';
      const last4CardDigits = (isCard || type === 'Gift Card') ? last4() : '';
      const vMcDFees = isCard ? r2(total * PROCESSING_FEE_RATE) : 0;

      const refunded = payRand() < 0.015;
      const refundAmount = refunded ? r2(total * prFloat(0.25, 1.0)) : 0;
      const refundDateD = refunded
        ? new Date(c.openedAt.getTime() + prInt(1, 7) * 86400000)
        : null;
      const refundDate = refundDateD ? fmtPayDate(refundDateD) : '';
      const status = refunded ? 'Refunded' : (payRand() < 0.003 ? 'Voided' : 'Paid');

      payments.push({
        paymentId: `PAY-${String(payCounter).padStart(7, '0')}`,
        amount,
        tip,
        gratuity: 0,
        total,
        refunded,
        refundDate,
        refundAmount,
        type,
        cardType,
        last4CardDigits,
        status,
        vMcDFees,
        checkId: c.checkId,
        checkNumber,
        paidDate: paidDateStr,
        paidAt: c.openedAt,
        orderDate: orderDateStr,
      });
      payCounter++;
    }
  }

  return payments;
}

function generateTimeEntries(today) {
  const entries = [];

  // Shift config by job title
  const SHIFT_CONFIG = {
    Server:    { minH: 5, maxH: 6 },
    Cook:      { minH: 8, maxH: 9 },
    Host:      { minH: 4, maxH: 5 },
    Bartender: { minH: 5, maxH: 7 },
  };

  // Work start times by job title (hour)
  const START_TIMES = {
    Server:    [10, 11, 17],
    Cook:      [7, 16],
    Host:      [10, 17],
    Bartender: [14, 17],
  };

  // Track weekly hours for OT calculation
  // Go 90 days back from today
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 89);
  startDate.setHours(0, 0, 0, 0);

  for (const emp of STAFF) {
    const config = SHIFT_CONFIG[emp.jobTitle];
    const startTimes = START_TIMES[emp.jobTitle];

    // Weekly OT tracking — Cooks accumulate OT in ~2 of every 4 weeks
    let weeklyHours = 0;
    let weekNumber = 0;
    let currentWeekStart = null;

    // Process each day
    for (let dayOffset = 89; dayOffset >= 0; dayOffset--) {
      const date = new Date(today);
      date.setDate(date.getDate() - dayOffset);
      date.setHours(0, 0, 0, 0);

      // Determine week boundary (Monday start)
      const dayOfWeek = date.getDay(); // 0=Sun
      if (dayOfWeek === 1 || currentWeekStart === null) {
        // New week
        if (currentWeekStart !== null) weekNumber++;
        currentWeekStart = new Date(date);
        weeklyHours = 0;
      }

      // Each employee works ~5 days/week → ~71% chance per day
      const dow = date.getDay();
      // Cooks work Fri/Sat more; others skip 2 days/week
      let workToday = rand() < 0.71;

      // For Cooks, ensure higher probability on Fri/Sat to drive OT
      if (emp.jobTitle === 'Cook' && (dow === 5 || dow === 6)) {
        workToday = rand() < 0.90;
      }

      if (!workToday) continue;

      const shiftH = randFloat(config.minH, config.maxH);
      const startHour = pick(startTimes);
      const startMin = randInt(0, 30);

      const clockIn = new Date(date);
      clockIn.setHours(startHour, startMin, 0, 0);
      const clockOut = new Date(clockIn.getTime() + shiftH * 3600000);

      const totalHours = Math.round(shiftH * 100) / 100;
      // Unpaid break: Cooks get 30min for 8h+ shifts
      const unpaidBreak = (emp.jobTitle === 'Cook' && totalHours >= 8) ? 0.5 : 0;
      const payableHours = Math.round((totalHours - unpaidBreak) * 100) / 100;

      // OT: weekly >40h basis
      // For cooks, in weeks 1,3 of every 4, allow OT to accumulate
      const cookOtWeek = emp.jobTitle === 'Cook' && (weekNumber % 4 === 0 || weekNumber % 4 === 2);

      const hoursBeforeThisShift = weeklyHours;
      weeklyHours += payableHours;

      let regularHours, overtimeHours;
      if (hoursBeforeThisShift >= 40) {
        regularHours = 0;
        overtimeHours = payableHours;
      } else if (weeklyHours > 40 && cookOtWeek) {
        regularHours = Math.round((40 - hoursBeforeThisShift) * 100) / 100;
        overtimeHours = Math.round((weeklyHours - 40) * 100) / 100;
      } else {
        regularHours = payableHours;
        overtimeHours = 0;
        // Non-OT week: cap weekly hours naturally
        weeklyHours = Math.min(weeklyHours, 40);
      }

      const regularPay = Math.round(regularHours * emp.wage * 100) / 100;
      const overtimePay = Math.round(overtimeHours * emp.wage * 1.5 * 100) / 100;
      const totalPay = Math.round((regularPay + overtimePay) * 100) / 100;

      // Tips (Servers/Bartenders)
      const hasTips = emp.jobTitle === 'Server' || emp.jobTitle === 'Bartender';
      const cashTipsDeclared = hasTips ? Math.round(randFloat(10, 40) * 100) / 100 : 0;
      const nonCashTips = hasTips ? Math.round(randFloat(30, 100) * 100) / 100 : 0;
      const totalTips = Math.round((cashTipsDeclared + nonCashTips) * 100) / 100;

      entries.push({
        employee: emp.name,
        jobTitle: emp.jobTitle,
        inDate: fmtLaborDate(clockIn),
        outDate: fmtLaborDate(clockOut),
        clockIn,
        clockOut,
        totalHours,
        unpaidBreakTime: unpaidBreak,
        paidBreakTime: 0,
        payableHours,
        regularHours,
        overtimeHours,
        wage: emp.wage,
        regularPay,
        overtimePay,
        totalPay,
        cashTipsDeclared,
        nonCashTips,
        totalTips,
      });
    }
  }

  return entries;
}

export const { checks, itemSelections, timeEntries, kitchenTimings, paymentDetails } = generateAllData();