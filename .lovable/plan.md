# Migrate to Standard Lovable Stack

Convert the entire dashboard from plain JS + custom CSS to the standard Lovable stack: **React + TypeScript (TSX) + Tailwind CSS + shadcn/ui**, while preserving every calculation, chart, store, data flow and visual design (Emerald Prestige palette, Space Grotesk + DM Sans, full-width sections).

This also restores the **Visual Edits** feature.

## What stays exactly the same

- All business logic in `src/lib/calculations.js`, `src/lib/dateUtils.js`, `src/data/generateData.js`, `src/data/constants.js` (ported to `.ts` with types, zero logic change)
- Zustand store shape and actions
- Every chart's data, options, and Chart.js usage
- Tab structure (Revenue / Cost / Sales) and what each tab displays
- All KPIs, tables, notices, cost-input panel behavior
- Emerald Prestige colors, typography, spacing rhythm, section gaps, card styling, sentiment treatments

## What changes

- File extensions: `.jsx` → `.tsx`, `.js` → `.ts` (for app code)
- Restore `tsconfig.json`, `vite.config.ts`, `eslint.config.js`, `components.json`, Tailwind (`tailwind.config.ts`, `postcss.config.js`)
- Replace `src/styles.css` custom CSS with:
  - `src/index.css` containing Tailwind directives + design tokens as HSL CSS variables + `@layer base` typography
  - `tailwind.config.ts` mapping tokens to semantic classes (`bg-background`, `text-primary`, `border-border`, custom `font-display`, custom shadows, etc.)
- Re-introduce only the shadcn primitives we actually use: `Card`, `Tabs`, `Button`, `Input`, `Label`, `Table`, `Select` (for date presets), `Tooltip` if needed
- Components rewritten to use Tailwind utility classes + shadcn components instead of the bespoke selector-based CSS
- Router: keep simple — single `App.tsx` mounted in `main.tsx` (no TanStack Router needed; existing app has no routes)

## Technical details

### Design tokens (in `src/index.css`)
Convert current hex values to HSL and expose as CSS variables consumed by Tailwind:
```
--background: 47 56% 92%;       /* #F5F0E0 */
--card: 47 65% 95%;             /* #FBF7EA */
--primary: 162 86% 16%;         /* #064E3B */
--accent: 43 56% 54%;           /* #C9A84C */
--positive / --negative / --caution / etc.
--chart-1..6
```
Plus radii, font families (`--font-display: 'Space Grotesk'`, `--font-sans: 'DM Sans'`), and the same layered shadows.

### Tailwind config
- `theme.extend.colors` maps every token (`primary`, `accent`, `positive`, `negative`, `chart.1..6`, `surface`, `border-subtle`, etc.)
- `fontFamily.display` and `fontFamily.sans`
- `fontSize.kpi`, `h1`, `h2`, `tab`
- Custom `boxShadow.card`, `boxShadow.cardHover`
- `keyframes.fadeTab` + `animation.fadeTab`

### File-by-file migration
```
src/main.tsx                       (was main.jsx)
src/App.tsx                        (was App.jsx)
src/index.css                      (replaces styles.css)
src/components/layout/Header.tsx
src/components/layout/TabNav.tsx           -> shadcn Tabs styling
src/components/layout/DateRangePicker.tsx  -> shadcn Input + Button presets
src/components/shared/KpiCard.tsx          -> shadcn Card + variants
src/components/shared/DataSourceNote.tsx
src/components/shared/CostInputPanel.tsx   -> shadcn Card + Input + Label
src/components/tabs/RevenueTab.tsx
src/components/tabs/CostTab.tsx
src/components/tabs/SalesTab.tsx
src/components/charts/*.tsx                (11 charts; Chart.js usage unchanged)
src/lib/calculations.ts
src/lib/dateUtils.ts
src/lib/chartColors.ts                     (read HSL vars via getComputedStyle)
src/lib/utils.ts                           (shadcn cn helper)
src/store/useDashboardStore.ts
src/data/generateData.ts
src/data/constants.ts
```

### Config files restored
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- `vite.config.ts` with `@/` alias to `src/`
- `tailwind.config.ts`, `postcss.config.js`
- `components.json` (shadcn)
- `eslint.config.js`

### Verification
After migration, take a full-page screenshot of each tab and visually compare against the current Emerald Prestige design to confirm parity.

## Out of scope
- Any data, calculation, or behavior change
- Any new features
- Any visual redesign beyond pixel-equivalent re-implementation
