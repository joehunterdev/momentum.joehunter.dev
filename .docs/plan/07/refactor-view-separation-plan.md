# Refactor Plan: View Separation & Moment Configuration

**Date:** 2026-04-29  
**Branch:** release/production  
**Goal:** Separate concerns cleanly across Daily / Weekly / Monthly views and establish Moments as the canonical configuration surface.

---

## Problem Summary

Weekly and Monthly pages are hybrid views — they handle both **overview rendering** and **moment creation/scheduling** via an internal `mode` state (`'overview' | 'configure'`). This means:

- `SchedulingState` and its handlers are duplicated in both page components
- `FrequencyBar` is rendered conditionally inside calendar views — it belongs in the Moments domain
- `WeeklyGrid` and `MonthlyGrid` switch behaviour based on mode, leaking config concerns into layout components
- `Moments/Create.tsx` and `Moments/Edit.tsx` exist but redirect back to `/weekly` — they're underutilised

---

## Target Mental Model

| Layer | View | Primary Intent |
|---|---|---|
| **Execution** | Daily | Action moments — swipe to complete, progress tracking |
| **Review** | Weekly | Pattern recognition — consistency, streaks, gaps over 7 days |
| **Review** | Monthly | Rhythm & trends — heatmap-style, what's working over time |
| **Configuration** | Moments | Create, edit, recurrence, cues, rewards |

---

## Phase 1 — Moments as Configuration Hub

### 1.1 Add a Moments index page

Create `Pages/Moments/Index.tsx` — a list of all user moments with their recurrence summary, streak, and quick-edit link.

```
/moments           → Moments/Index.tsx   (list)
/moments/create    → Moments/Create.tsx  (create — already exists)
/moments/edit/:id  → Moments/Edit.tsx    (edit — already exists)
```

**Backend:** `MomentsController@index` needs to return the user's moments with schedule summary. A lightweight DTO is sufficient — no slot data needed here.

### 1.2 Fix Create/Edit redirects

Currently `Moments/Create.tsx` and `Edit.tsx` redirect back to `/weekly` on close/success. Change these to redirect to `/moments` so the user stays in the configuration context.

### 1.3 Promote Moments in nav

Add Moments to the nav/sidebar as a first-class destination alongside Daily / Weekly / Monthly.

---

## Phase 2 — Strip Scheduling from Weekly & Monthly

### 2.1 Weekly page

**Remove:**
- `WeekMode` type (`'overview' | 'configure'`)
- `mode` state and `setMode` calls
- `scheduling` state and all `handleScheduling*` handlers
- `handleConfirmSchedule` function
- `FrequencyBar` import and render
- `handleStartScheduling` — replace with a simple route to `/moments/create`

**Keep:**
- `WeeklyGrid` with click-on-empty-slot triggering `router.visit(route('moments.create', { ...defaults }))`
- `MomentModal` for **editing existing moments** only (quick edit without leaving the view) — or remove this too and route to Edit page for consistency

**Result:** Weekly page drops from ~205 lines to ~80 lines.

### 2.2 Monthly page

Same removals as 2.1. Monthly had the same duplicated scheduling pattern.

**Keep:**
- `MonthlyGrid` click-a-day → `router.visit(route('daily', { date }))` — this is correct and stays
- Optional: click a moment name → `router.visit(route('moments.edit', { moment: id }))`

**Result:** Monthly page drops from ~145 lines to ~60 lines.

### 2.3 Shared `SchedulingState` type

Once scheduling is removed from Weekly/Monthly, `SchedulingState` in `features/weekly/types.ts` can be moved to `features/moments/types.ts` where it belongs. Monthly imports it from weekly currently — that cross-feature dependency goes away.

---

## Phase 3 — Calendar Architecture (from prior plan)

This phase implements the shared calendar structure agreed in `calendar-component-plan.md`.

```
<CalendarNav />          ← shared prev/current/next date nav (already partially done)
<CalendarBody>
  ├── <DailyLayout />    ← single column, 20-min slots, swipe cells
  ├── <WeeklyLayout />   ← multi-day columns, slot cells (read-only mode post-refactor)
  └── <MonthlyLayout />  ← day grid, summary/heatmap cells
```

### 3.1 Slot cell separation (already correct, formalise it)

- `DailyTimeSlotCell` — swipe-to-complete interaction → stays in `features/daily`
- `TimeSlotCell` (weekly) — read-only display, click opens edit modal or routes to edit → stays in `features/weekly`
- Monthly day cell — summary dot/count, click → daily → stays in `features/monthly`

No unified "mega cell" — these are genuinely different interactions.

### 3.2 CalendarNav formalisation

`CalendarNav` is already shared in `shared/components/calendar`. Ensure it handles daily, weekly, and monthly navigation without mode-specific logic leaking in.

### 3.3 3-way view toggle

Replace the current daily ↔ weekly toggle with a 3-button toggle: Daily | Weekly | Monthly. This lives in `AuthenticatedLayout` or a shared `CalendarHeader` component. The active view is determined by the current route.

---

## Phase 4 — Data & Types Cleanup

### 4.1 Move `SchedulingState` to moments feature

`features/moments/types.ts` — remove from `features/weekly/types.ts`.  
Update all imports.

### 4.2 Enum for slot status

`SlotStatus = 'completed' | 'missed' | 'pending' | null` in `features/weekly/types.ts` should become a shared type in `shared/types` or a generated PHP enum via `typescript:transform`. Same for `'once' | 'recurring'`.

### 4.3 Monthly DTO optimisation

`MonthlyPageData` should not include full slot arrays per day. A lighter shape:

```typescript
interface MonthlyDayData {
    date: string;
    completedCount: number;
    totalCount: number;
    moments: { id: number; name: string; icon: string | null; }[];
}
```

This is a backend task — new or updated `MonthlyPageData` DTO + `CalendarService` method.

---

## Execution Order

1. **Phase 1** — Moments index page + fix redirects + nav link *(unblocks a clean config UX immediately)*
2. **Phase 2** — Strip scheduling from Weekly + Monthly *(biggest line-count reduction, removes duplication)*
3. **Phase 4.1 + 4.2** — Type cleanup *(low risk, do alongside Phase 2)*
4. **Phase 3** — Calendar architecture formalisation *(build on the now-clean page components)*
5. **Phase 4.3** — Monthly DTO optimisation *(backend, can be done in parallel with Phase 3)*

---

## Files Affected

### Modified
- `resources/js/Pages/Weekly/Index.tsx`
- `resources/js/Pages/Monthly/Index.tsx`
- `resources/js/Pages/Moments/Create.tsx` — fix redirect
- `resources/js/Pages/Moments/Edit.tsx` — fix redirect
- `resources/js/features/weekly/types.ts` — remove `SchedulingState`
- `resources/js/features/moments/types.ts` — add `SchedulingState`
- `resources/js/Layouts/AuthenticatedLayout.tsx` — 3-way toggle

### Created
- `resources/js/Pages/Moments/Index.tsx`
- `resources/js/features/moments/components/MomentList.tsx`
- `app/Http/Controllers/MomentsController.php` — `index` method (may already exist)
- `app/Data/MomentListItemData.php` — lightweight DTO for list view

### Removed / Deprecated
- Scheduling state + handlers from `Weekly/Index.tsx`
- Scheduling state + handlers from `Monthly/Index.tsx`
- `FrequencyBar` usage in Weekly/Monthly pages (stays in moments feature for use in `MomentForm`)
- `.bak` files: `TimeSlotCell.pivot.tsx.bak`, `WeeklyGrid.pivot.tsx.bak`

---

## Out of Scope (this refactor)

- Swipe gesture changes on Daily
- 20-min slot granularity change (separate task)
- SSR changes
- Any new moment fields or scheduling options
