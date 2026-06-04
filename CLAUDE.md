# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # next dev on http://localhost:3000
npm run build      # production build
npm run start      # serve production build
npm run typecheck  # tsc --noEmit (no separate test runner is wired up)
npm run lint       # next lint
```

There is no test suite. To sanity-check ROI math after touching `src/lib/roi.ts`, run the calculator with `DEFAULT_PARTS` + `DEFAULT_INPUTS` — the result must match the source spreadsheet `RBW_ROI_Calculator.xlsx` to 4+ decimals: `annualLaborSaving ≈ €46,126.35`, `roiYears ≈ 0.9756`.

## Architecture

**Stack:** Next.js 15 App Router · React 19 · TypeScript (strict) · MUI v6 + Emotion · `@mui/x-charts`. All UI components are `"use client"`; there's no server-side data fetching.

**Layout chain** (`src/app/layout.tsx`): `AppRouterCacheProvider` (from `@mui/material-nextjs/v15-appRouter`) wraps `ThemeProvider` (`src/theme.ts`, uses `cssVariables: true`) wraps `LanguageProvider`. Adding new MUI features must stay inside this chain to keep SSR styling consistent.

**Single page (`/`):** `src/app/page.tsx` holds all calculator state (`parts`, `inputs`) in `useState` and recomputes `calcRoi(...)` in a `useMemo`. Children are presentational only — they receive state + an `onChange`. There is no global store.

**ROI logic — `src/lib/roi.ts`:** pure functions that mirror the Excel formulas in `RBW_ROI_Calculator.xlsx` (Sheet 1, "Advanced ROI Calculator"). Two non-obvious things:

- `productivityIncrease` contains a literal `(1 - totalDiffHours) / totalManualHours` — the `1` is copied verbatim from Excel cell `C15`. It looks wrong but is intentional and load-bearing for parity with the spreadsheet; do not "fix" it.
- `theoreticalWelders` uses `Math.ceil` to mirror Excel's `ROUNDUP`.

**Scenario projection — `src/lib/scenarios.ts`:** layered on top of `roi.ts`. Takes the base `annualLaborSaving` and projects three cumulative curves (pessimistic / realistic / optimistic) by applying a per-year ramp schedule, labor-cost inflation, and maintenance cost. **The "realistic" scenario is intentionally pure linear** (`ramp=[1,1,1]`, inflation 0, maintenance 0) — keep it that way unless the user explicitly asks otherwise; the chart's design relies on optimistic landing below it and pessimistic above. Break-even is linearly interpolated within the year where cumulative crosses `systemCost`.

**i18n — `src/i18n/`:** hand-rolled, no library. `dictionary.ts` exports `en` and `tr` dictionaries; `TranslationKey = keyof typeof en` so **every key added to `en` must also be added to `tr` or TypeScript will narrow `t(key)` incorrectly**. `LanguageProvider` persists the choice to `localStorage` under `"rbw.lang"`. Components call `useLanguage()` and `t("key")`.

**Locale-aware formatting — `src/lib/format.ts`:** `formatCurrency` / `formatNumber` / `formatPercent` cache `Intl.NumberFormat` instances. Components pass `locale = lang === "tr" ? "tr-TR" : "en-US"`. Always route numeric output through these helpers (don't `.toFixed()` in components).

## ROI calculation reference

These tables are the spec. Any code change to `src/lib/roi.ts` must keep them satisfied — the source of truth is the "Advanced ROI Calculator" sheet of `RBW_ROI_Calculator.xlsx` in the repo root.

### Per-part (each row in `parts[]`)

| Output | Formula | Excel cell |
| --- | --- | --- |
| `manualHours` | `annualQty * manualCycleSec / 3600` | row 12 |
| `roboticHours` | `annualQty * roboticCycleSec / 3600 + programmingSec / 3600` | row 13 |
| `diffHours` | `roboticHours - manualHours` | row 14 |

### Aggregates and calculated variables

| Output | Formula | Excel cell |
| --- | --- | --- |
| `totalManualHours` | `Σ manualHours[i]` | sum(C12:L12) |
| `totalRoboticHours` | `Σ roboticHours[i]` | sum(C13:L13) |
| `totalDiffHours` | `totalRoboticHours - totalManualHours` | sum(C14:L14) |
| `annualRobotCapacity` | `workingDays * shiftsPerDay * hoursPerShift` | C30 |
| `annualAvailableLabor` | `workingDays * shiftsPerDay * hoursPerShift * numWelders` | C33 |
| `annualManualCost` | `annualAvailableLabor * hourlyLaborCost` | C34 |
| `annualAmortization` | `rbwSystemCost / amortizationYears` | C31 |
| `annualPowerCost` | `electricityPrice * powerConsumption * totalRoboticHours` | C32 |
| `theoreticalWelders` | `Math.ceil(totalManualHours / annualAvailableLabor)` (Excel `ROUNDUP`) | C35 |
| `robotUtilization` | `totalRoboticHours / annualRobotCapacity` | C36 |
| `productivityIncrease` | piecewise (see below) | C15 |

`productivityIncrease` (Excel `C15`) is piecewise on whether the robot is within capacity:

```
if totalRoboticHours <= annualRobotCapacity:
    (1 - totalDiffHours) / totalManualHours
else:
    (1 - (annualRobotCapacity - totalManualHours)) / totalManualHours
```

The literal `1` in both branches is copied verbatim from the spreadsheet. It looks wrong but is intentional and load-bearing for parity — do not "fix" it.

### Outputs

| Output | Formula | Excel cell |
| --- | --- | --- |
| `annualLaborSaving` | `annualManualCost * (theoreticalWelders * (1 + productivityIncrease)) - annualAmortization - annualPowerCost` | C40 |
| `roiYears` | `rbwSystemCost / annualLaborSaving` | C41 |

### Scenario projection (`src/lib/scenarios.ts`)

For each year `y = 1..horizon`:
```
yearSaving[y]   = baseAnnualSaving * ramp[y] * (1 + laborInflation)^(y-1) - systemCost * maintenancePct
cumulative[y]   = cumulative[y-1] + yearSaving[y]   (cumulative[0] = 0)
```
`ramp[y]` reads `rampSchedule[min(y-1, rampSchedule.length - 1)]` — the last entry continues for all later years. Break-even is linearly interpolated within the year where cumulative first crosses `systemCost`.

The three scenarios are tuned so optimistic lands strictly below realistic and pessimistic strictly above. Keep this relative ordering when tuning:

| Scenario | `rampSchedule` (Y1 / Y2 / Y3+) | `laborInflation` | `maintenancePct` | Break-even @ defaults |
| --- | --- | --- | --- | --- |
| `optimistic` | 1.10 / 1.20 / 1.25 | 0.05 | 0 | ~0.89 yr |
| `realistic` | 1.00 / 1.00 / 1.00 | 0 | 0 | ~0.98 yr (pure linear) |
| `pessimistic` | 0.50 / 0.75 / 0.90 | 0 | 0.04 | ~1.72 yr |

### Reference values (defaults)

Computed from `DEFAULT_PARTS` + `DEFAULT_INPUTS` in `src/lib/roi.ts`; must match to 4+ decimals after any refactor:

| Field | Expected |
| --- | --- |
| `totalManualHours` | 3310.6667 |
| `totalRoboticHours` | 1037.4897 |
| `productivityIncrease` | 0.686924 |
| `annualLaborSaving` | €46,126.35 |
| `roiYears` | 0.9756 |
