# Calendar Component — Implementation Plan

## Overview

Unify daily, weekly, and monthly views into a composable `<Calendar>` architecture. Each view has genuinely different interactions — daily is action-focused (swipe-to-complete), weekly/monthly are configuration-focused (tap to schedule). The React way: **shared layout shell, pluggable per-view renderers**.

---

## Architecture

```
shared/components/calendar/
├── Calendar.tsx                 ← Shell: nav + mode switch + body delegation
├── CalendarNav.tsx              ← Unified prev/current/next navigation
├── CalendarViewToggle.tsx       ← 3-way toggle: 📅 daily | 📊 weekly | 📆 monthly
├── types.ts                     ← Shared type aliases (already exists, extend)
├── utils.ts                     ← Slot math: snap, windowing, office hours, isScheduled
├── index.ts                     ← Public API barrel
│
features/daily/
├── components/
│   ├── DailyLayout.tsx          ← Single column, 20-min slots, wake→sleep
│   ├── DailySlotCell.tsx        ← Swipe-to-complete interaction
│   ├── DailySlotCard.tsx        ← Moment card within a daily slot
│   ├── DailyProgressBar.tsx     ← Completion progress (exists)
│   └── DailyGrid.tsx            ← DEPRECATED → replaced by DailyLayout
│
features/weekly/
├── components/
│   ├── WeeklyLayout.tsx         ← Multi-day columns, hourly slots, windowed
│   ├── WeeklySlotCell.tsx       ← Ghost/configure interaction (rename from TimeSlotCell)
│   ├── FrequencyBar.tsx         ← Schedule configuration bar (exists)
│   └── WeeklyGrid.tsx           ← DEPRECATED → replaced by WeeklyLayout
│
features/monthly/                ← NEW
├── components/
│   ├── MonthlyLayout.tsx        ← 7-col day grid (Mon→Sun rows)
│   ├── MonthlyDayCell.tsx       ← Day summary: dots/counts, tap to configure
│   └── MonthlyFrequencyBar.tsx  ← Optional: reuse FrequencyBar or specialise
├── types.ts
└── index.ts
```

### Component Tree

```tsx
<Calendar mode="daily | weekly | monthly">
  <CalendarViewToggle />
  <CalendarNav mode={mode} />
  {mode === 'daily'   && <DailyLayout />}
  {mode === 'weekly'  && <WeeklyLayout />}
  {mode === 'monthly' && <MonthlyLayout />}
</Calendar>
```

`Calendar.tsx` is NOT a god component. It's a thin shell that:
1. Renders the shared nav/toggle chrome
2. Delegates to the correct layout via children or a render map
3. Passes through Inertia page props — no internal state duplication

Each `Page/Daily/Index.tsx`, `Page/Weekly/Index.tsx`, `Page/Monthly/Index.tsx` continues to own its Inertia props and mode-specific state (scheduling, swipe, etc.). The layouts are composed within those pages.

---

## Slot Granularity

| View    | Slot size | Display time? | Filter                              |
|---------|-----------|---------------|--------------------------------------|
| Daily   | 20 min    | Yes           | wake→sleep, smart anchor to "now"    |
| Weekly  | 60 min    | Yes           | windowed (6 visible), centred on now |
| Monthly | Per day   | No            | Full month grid (28–31 cells)        |

### Daily 20-min slots

Backend `CalendarService::buildTimeSlots()` currently creates 30-min slots. Change to accept a `$intervalMinutes` param:

```php
public function buildTimeSlots(string $wakeTime, string $sleepTime, int $intervalMinutes = 30): array
```

`DailyController` passes `intervalMinutes: 20`. `WeeklyController` keeps `30` (snapped to hourly on the frontend). The snap logic in `snapToSlot()` also needs the interval param.

---

## Shared Components

### `CalendarNav`

Replaces both `DateSelectorBar` and `WeekSelectorBar` with a single component:

```tsx
interface CalendarNavProps {
  mode: 'day' | 'week' | 'month';
  /** The anchor date string (current day, week start, or month start) */
  current: string;
  /** Labels for prev / current / next */
  prevLabel: string;
  currentLabel: string;
  nextLabel: string;
  /** URL generation */
  prevHref: string;
  nextHref: string;
}
```

Each page computes the labels and hrefs from its Inertia props — the nav itself is dumb. This is mid-flexibility: one component, no complicated date logic inside.

### `CalendarViewToggle`

Three buttons. Uses `<Link>` to navigate between `/daily`, `/weekly`, `/monthly`.

```tsx
function CalendarViewToggle() {
  const isDaily = route().current('daily');
  const isWeekly = route().current('weekly');
  const isMonthly = route().current('monthly');
  // render 3 icon buttons with active state
}
```

Replaces the existing `ViewToggle` in `AuthenticatedLayout.tsx`.

### `utils.ts` — Shared slot utilities

Extract from existing code:
- `snapToSlot(time: string, intervalMinutes: number): string`
- `isOutOfOffice(time: string, config: CalendarConfig): boolean`
- `computeWindowStart(days: WeekDay[], visibleCount: number): number`
- `jsToIsoDay(d: number): number`

Currently duplicated across DailyGrid, DaySection, TimeSlotCell.

---

## Backend

### New `MonthlyPageData` DTO

```php
#[TypeScript]
class MonthlyDayData extends Data
{
    public function __construct(
        public string $date,
        public string $dayName,
        public bool $isToday,
        public bool $isWeekend,
        public bool $isCurrentMonth,
        public int $completedCount,
        public int $totalCount,
        /** @var SlotMomentData[] — lightweight: id, name, color, icon, status only */
        public array $moments,
    ) {}
}

#[TypeScript]
class MonthlyPageData extends Data
{
    public function __construct(
        public string $monthStart,
        public string $monthEnd,
        public UserConfigData $config,
        /** @var MonthlyDayData[] */
        public array $days,
    ) {}
}
```

No time slots in monthly — just per-day summaries. Much lighter payload.

### New `MonthlyController`

- Queries moments for the full month range + consistency window
- Groups by day, counts completions
- Returns `MonthlyPageData`

### Route

```php
Route::get('/monthly', [MonthlyController::class, 'index'])->name('monthly');
```

### `CalendarService` changes

- `buildTimeSlots()` → add `int $intervalMinutes = 30` parameter
- `snapToSlot()` → add `int $intervalMinutes = 30` parameter
- New `buildMonthlyDayData()` method — lightweight, no slot breakdown
- Existing `buildWeekDayData()` unchanged

---

## Monthly View — Interaction Model

Monthly mirrors weekly's interaction: empty day cells are tappable, opening the `FrequencyBar`. The key difference is granularity — you're scheduling at the day level, not the time-slot level.

- **Tap empty day** → enter configure mode, show `FrequencyBar`
- **Day cell** shows: coloured dots for each moment, completion count badge
- **Tap filled day** → navigate to that day's daily view (drill down)

---

## Migration Steps

Ordered to keep the app working at each step.

### Phase 1 — Extract shared utilities (no visual change)
1. Create `shared/components/calendar/utils.ts` — extract duplicated functions
2. Update DailyGrid, DaySection, TimeSlotCell to import from utils
3. Run existing tests

### Phase 2 — CalendarNav + ViewToggle
4. Create `CalendarNav.tsx` — generic prev/current/next nav
5. Create `CalendarViewToggle.tsx` — 3-way mode toggle
6. Update `AuthenticatedLayout.tsx` — replace 2-way ViewToggle
7. Update Daily/Index.tsx and Weekly/Index.tsx to use `CalendarNav`
8. Delete `DateSelectorBar.tsx` and `WeekSelectorBar.tsx`

### Phase 3 — Daily 20-min slots
9. Update `CalendarService::buildTimeSlots()` with `$intervalMinutes` param
10. Update `CalendarService::snapToSlot()` with `$intervalMinutes` param
11. Update `DailyController` to pass `intervalMinutes: 20`
12. Update `DailyLayout` to show all slots (not just `:00`)
13. Write/update tests for 20-min slot generation and snapping

### Phase 4 — Monthly backend
14. Create `MonthlyDayData` and `MonthlyPageData` DTOs
15. Create `MonthlyController`
16. Add route
17. Run `php artisan typescript:transform`
18. Write controller tests

### Phase 5 — Monthly frontend
19. Create `features/monthly/` — `MonthlyLayout`, `MonthlyDayCell`
20. Create `Pages/Monthly/Index.tsx`
21. Wire configure mode + FrequencyBar reuse
22. SCSS for monthly grid (`.monthly-grid`, `.monthly-day-cell`)

### Phase 6 — Cleanup
23. Deprecate/remove old `DailyGrid.tsx`, `WeeklyGrid.tsx` if fully replaced
24. Remove dead CSS
25. Final test run

---

## Types — Single Source of Truth

All from PHP DTOs via `php artisan typescript:transform`:

| PHP DTO             | Generated TS type              | Used by          |
|---------------------|-------------------------------|------------------|
| `WeekDayData`       | `App.Data.WeekDayData`        | Daily, Weekly    |
| `TimeSlotData`      | `App.Data.TimeSlotData`       | Daily, Weekly    |
| `SlotMomentData`    | `App.Data.SlotMomentData`     | All views        |
| `MonthlyDayData`    | `App.Data.MonthlyDayData`     | Monthly          |
| `Frequency` enum    | `App.Enums.Frequency`         | All views        |

Frontend feature types re-export these with friendly aliases. No manual union types.

---

## SCSS Structure

Following the style-react skill — co-located with components:

```
features/daily/components/DailyLayout/DailyLayout.scss
features/weekly/components/WeeklyLayout/WeeklyLayout.scss
features/monthly/components/MonthlyLayout/MonthlyLayout.scss
features/monthly/components/MonthlyDayCell/MonthlyDayCell.scss
shared/components/calendar/CalendarNav/CalendarNav.scss
shared/components/calendar/CalendarViewToggle/CalendarViewToggle.scss
```

BEM naming: `.daily-layout`, `.weekly-layout`, `.monthly-grid`, `.monthly-day-cell`, `.calendar-nav`, `.calendar-view-toggle`.

---

## Key Decisions

1. **No god `<Calendar>` component** — each page owns its layout. Shared pieces (nav, toggle, utils) are composed in, not abstracted over.
2. **Separate slot cells per view** — swipe ≠ ghost/configure ≠ day summary. Three genuinely different interactions.
3. **Backend drives granularity** — 20-min slots for daily, 30-min for weekly, no slots for monthly. Frontend doesn't compute this.
4. **Frequency is the scheduling model** — monthly's configure mode reuses `FrequencyBar` and `SchedulingState`.
5. **Progressive migration** — each phase is independently deployable and testable.