# Toast Analytics Dashboard

A restaurant operations analytics dashboard built to mirror **Toast POS**'s
reporting — running on a **seeded synthetic dataset**, not a live account.

> **Demo · Simulated data.** Every figure is generated from a fixed random seed.
> The app is architected so a live Toast connection is a data-source swap, not a
> rewrite — see [Connecting to real Toast data](#connecting-to-real-toast-data).

---

## Overview

A single-page dashboard for a restaurant owner/operator to review sales, costs,
menu performance, labor, payments, and customers at a glance. It's a real
analytics engine — correct restaurant math, Toast-accurate data structures —
deliberately decoupled from its data source so it can run on simulated data today
and live Toast data later.

## Toast analytics coverage

The data model and views replicate **8 of Toast's operational analytics categories**:

| Category | In this app |
|---|---|
| Sales Summary | Summary tab (executive rollup) |
| Sales | Revenue tab — net sales, dayparts, day-of-week, period comparison |
| Product Mix | Sales tab — menu performance, void rates, % of total |
| Modifiers | Sales tab — modifier/upsell performance |
| Labor | Cost tab — hours, overtime, pay, labor % |
| Payments | Cost + Sales — processing fees, card mix, refunds, tips |
| Cash Management | Cost tab — pay-ins/outs, drawer activity |
| Kitchen Operations | Sales tab — fulfillment times |
| Customers / Loyalty | Customers tab — repeat rate, top customers |

*Not replicated:* Toast's Accounting/GL export (bookkeeping, not analytics).

## Tech stack

- **Vite + React + TypeScript**
- **Zustand** — global state (active tab, date range, cost inputs)
- **Chart.js** via **react-chartjs-2** — charts
- **Tailwind CSS + shadcn/ui** — styling
- No backend — data is generated client-side at load.

## Data model

All data is simulated in `src/data/generateData.ts` using a seeded PRNG
(deterministic — identical on every reload). Field names and formats mirror
Toast's published export schema (CheckDetails, ItemSelectionDetails, PaymentDetails,
ModifierSelectionDetails, TimeEntries, KitchenTimings, OrderDetails, CashEntries).

Key correctness rules implemented per Toast's spec:
- Net sales = `Total − Tax − Discount`
- Void rate = `Void Qty / (Item Qty incl voids)`
- Kitchen timing = `Fulfilled − Fired` (throughput, **not** guest dwell)
- Overtime = weekly hours > 40

Reference: [Toast Data Export Field Reference](https://doc.toasttab.com/doc/platformguide/adminDataExportFieldReference.html)

## Project structure

```
src/
  data/         constants + generateData (simulated Toast records)
  lib/          calculations (pure functions) + dateUtils + chartColors
  store/        Zustand store
  components/
    layout/     Header, TabNav, DateRangePicker
    shared/     KpiCard, CostInputPanel, DataSourceNote
    charts/     all charts + tables
    tabs/       Summary, Revenue, Cost, Sales, Customers
```

## Getting started

```bash
bun install      # or: npm install
bun run dev      # or: npm run dev      -> http://localhost:5173
bun run build    # or: npm run build    -> static output in dist/
```

## Connecting to real Toast data

The app's calculation layer consumes records shaped exactly like Toast's exports,
so going live means swapping the data source — not rewriting the analytics:

1. **Backend** — Toast credentials and customer PII must live server-side.
2. **Ingestion** — pull from Toast (nightly SFTP CSV exports *or* the Toast
   Partner API) and normalize into the existing record shapes.
3. **Front-end swap** — replace the `generateData` import with a fetch to the
   backend; keep a Demo/Live toggle.

For production scale, aggregation would move server-side (the existing pure
functions become API endpoints almost verbatim).

## Status

Prototype / demo. Data is simulated; there is no authentication or live Toast
connection yet.
