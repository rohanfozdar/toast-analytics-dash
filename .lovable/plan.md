# Toast Analytics Dashboard — Visual Design System

## Step 1 — Replace template with your codebase

This Lovable project currently holds the empty TanStack Start template. Your `Toast_dash.zip` is a plain Vite + React 18 app — different stack, so we swap it in wholesale.

- Delete the TanStack scaffolding: `src/routes/`, `src/router.tsx`, `src/server.ts`, `src/start.ts`, `src/routeTree.gen.ts`, `src/components/ui/`, `src/hooks/`, `src/lib/`, the existing `src/styles.css`, and `index.html` at root.
- Copy from the upload (excluding `node_modules`, `dist`, `.git`):
  - `src/` (App.jsx, main.jsx, components/, data/, lib/, store/)
  - `index.html`
  - `vite.config.js`
  - `package.json` + `package-lock.json`
- Run `bun install` to materialize deps (react 18, zustand 5, chart.js 4.4.1, react-chartjs-2 5.3.1, vite 6).
- Lovable's dev server already runs `vite` — no further wiring needed.

## Step 2 — One global stylesheet does the heavy lifting

Create `src/styles.css` containing the entire design system from your spec, then import it once from `src/main.jsx`. Because your components already carry the `data-*` contract (`data-sentiment`, `data-chart`, `data-role`, `data-active`, `data-alert`, `data-category`, `data-hidden`, `data-period`, `data-sortable`), the stylesheet binds without touching most JSX.

Contents:
- `@import` Fraunces + DM Sans from Google Fonts
- `:root` block: every color token (`--color-bg` … `--color-text-on-accent`), all 6 chart colors, the type-scale custom properties (`--text-xs` through `--text-h1`)
- `body`: warm off-white + the 28px receipt-paper repeating-linear-gradient
- Layout primitives: `.page` (max-width 1280px, 24px horizontal padding), header masthead rules (64px, border-bottom), tab-nav underline rules (Fraunces tab labels, terracotta active underline overlapping the nav border)
- `[data-chart]` shared card shell (surface, border, 10px radius, soft shadow) — applies automatically to all 9 chart wrappers
- KPI card grid utilities (`.kpi-grid-4`, `.kpi-grid-3`, `.kpi-grid-auto`) and the internal KpiCard layout rules (label / value Fraunces 32px / delta / source label)
- Every `data-*` selector verbatim from spec section 4: sentiment tints + left border, delta-direction colors, alert variants (caution/high), category label styling on waterfall rows, hidden "Coming soon" overlay, all the role-based notice/table/picker/void-summary blocks, `data-active` button treatment, `data-period` colored top-borders, sortable header cursor + indicator
- Interactions: KpiCard hover lift, sortable header hover, date-preset hover, editable food-cost cell focus underline, `fadeTab` keyframes
- Form element resets so number inputs match the warm palette

That single file covers ~90% of the spec.

## Step 3 — Targeted JSX additions

A few components need small markup additions so the stylesheet has something to bind to. No business logic changes.

- **`App.jsx`** — wrap `<main>` with class `tab-content` and set `key={activeTab}` so the `fadeTab` animation re-fires on tab change.
- **`main.jsx`** — `import './styles.css'`.
- **All 8 Chart.js chart components** (`SalesTrendChart`, `PeriodComparisonChart`, `DaypartChart`, `DayOfWeekChart`, `AvgCheckChart`, `CostBreakdownChart`, `DiningChannelChart`, `KitchenFulfillmentChart`, plus the discount-by-reason bar inside `DiscountSummary`) — add a Fraunces `<h2>` section heading inside the `data-chart` wrapper above the canvas (titles from spec: "Sales Trend", "Net Sales by Daypart", "Avg Sales by Day of Week", "Average Check Size Over Time", "Cost Breakdown", "Revenue by Dining Channel", "Kitchen Fulfillment Times", "Discounts & Voids").
- **`MarginWaterfallChart.jsx`** — confirm each row's left-label uses class `waterfall-label` (so the per-category color rules bind); add it if missing. Wrap chart in a section heading "Margin Waterfall".
- **`MenuPerformanceTable.jsx`** — add `data-role="menu-table"` to the `<table>` (spec assumes it; current file likely missing it). Add `data-sortable="true"` on `<thead>`. Add a "Menu Performance" section heading above.
- **`DiscountSummary.jsx`** — add `<h3>Voids</h3>` inside the `data-role="void-summary"` block.
- **`CostInputPanel.jsx`** —
  - Wrap the whole panel in a card div with class `cost-panel-card`.
  - Replace the plain toggle button with a `<button class="cost-toggle">` containing a `<span class="chevron">▾</span>` that rotates via CSS based on `aria-expanded`.
  - Use `aria-expanded={expanded}` on the button so the CSS chevron-rotation hook is semantic.
  - Add `data-alert="true"` to the labor `<span>` already there — file already does this conditionally; verify.
- **`CostTab.jsx`** — wrap each of the 3 margin-stat columns in a `<div data-period="weekly|monthly|yearly" class="period-card">` if the wrapper isn't already present (need to check the file; if it is, the styling already binds).
- **`Header.jsx`** — strip the inline `style` attributes (CSS in stylesheet will handle layout via `.app-header` class).
- **`TabNav.jsx`** — add `className="tab-nav"` and `className="tab-btn"` on the buttons so the underline-style selectors bind cleanly without depending only on `[aria-pressed]`.

I'll read each file before editing and keep changes purely structural — no behavior, no data flow, no calculation changes.

## Step 4 — Verify

- Confirm the build/dev server boots clean (Vite 6 + React 18).
- Open all three tabs in the preview, screenshot each, and check against the spec:
  - Warm off-white background with faint receipt lines visible between cards
  - Terracotta active tab + date-preset
  - Sentiment tint + left border on Period-over-Period KPI
  - Coming-soon overlay on hidden waterfall rows + profit cards
  - Caution-amber outline on the discount % card when threshold triggers
  - Fraunces serif on H1 / KPI numbers / section headings; DM Sans elsewhere
- Note any spec items that require additional JSX changes I didn't anticipate and fix in the same pass.

## Technical notes

- `vite.config.js` from the upload uses plain `@vitejs/plugin-react` — no path aliases. All imports stay relative as in the original source.
- `package.json` is dropped in as-is so versions match what you developed against.
- No Lovable Cloud, no auth, no backend — purely a frontend styling pass, as you asked.
- No dark mode, no theme toggle, no shadcn primitives added.

After approval I'll execute steps 1–4 in one go and report verification screenshots.
