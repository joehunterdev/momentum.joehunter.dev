# Monthly View — Configure Mode Implementation

## Overview

The monthly view currently shows a calendar grid (overview mode). We want to add a **configure mode** — accessible via a second tap on the monthly calendar icon (or ⚙️ button like weekly) — that displays a **day-of-week planner**. Each row is a day (Monday → Sunday) instead of an hour, and each row shows the moments scheduled for that day. Users can tap an empty row to start scheduling a new moment, with the same `FrequencyBar` + ghost-card flow as the weekly view.

---

## UX Flow

1. **First tap** on the monthly icon → overview calendar grid (current behaviour).
2. **Second tap** (or ⚙️ button in header) → configure mode: 7 rows (Mon–Sun), each showing its scheduled moments.
3. Tap an empty area in a day-row → ghost card appears, `FrequencyBar` slides in at top.
4. User picks frequency, toggles day pills, names/icons the moment → **Confirm** → `POST /moments`.
5. **✕ Done** → back to overview grid.

---

## Backend Changes

### No new controller/route needed

The existing `MonthlyController@index` already loads all active moments with their schedules. We just need to ensure the **full moment list with schedule data** is available to configure mode (not just the per-day grid summary).

### 1. New DTO: `MonthlyScheduleRowData`

**File:** `app/Data/MonthlyScheduleRowData.php`

```php
#[TypeScript]
class MonthlyScheduleRowData extends Data
{
    public function __construct(
        public int $isoDayNumber,     // 1 (Mon) – 7 (Sun)
        public string $dayLabel,       // "Monday", "Tuesday", etc.
        /** @var MomentData[] */
        public array $moments,         // moments scheduled for this ISO day
    ) {}
}
```

### 2. Update `MonthlyPageData`

Add a `scheduleRows` field alongside the existing `days` array:

```php
class MonthlyPageData extends Data
{
    public function __construct(
        public string $month,
        public string $monthStart,
        public string $monthEnd,
        public UserConfigData $config,
        /** @var MonthlyDayData[] */
        public array $days,
        /** @var MonthlyScheduleRowData[] */
        public array $scheduleRows,   // ← NEW: 7 rows for configure mode
    ) {}
}
```

### 3. Update `MonthlyController@index`

After building `$days`, also build schedule rows:

```php
$scheduleRows = [];
$dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

foreach (range(1, 7) as $iso) {
    $dayMoments = $moments->filter(function (Moment $m) use ($iso) {
        $schedule = $m->schedule;
        if (!$schedule) return true;  // daily = appears every day
        return match ($schedule->frequency) {
            'daily'  => true,
            'weekly' => $iso >= 1 && $iso <= 5,
            'custom' => in_array($iso, $schedule->days_of_week ?? [], true),
            default  => false,  // 'once' not shown in weekly planner
        };
    })->map(fn (Moment $m) => MomentData::fromModel($m))
      ->values()
      ->all();

    $scheduleRows[] = new MonthlyScheduleRowData(
        isoDayNumber: $iso,
        dayLabel: $dayNames[$iso - 1],
        moments: $dayMoments,
    );
}
```

### 4. Run TypeScript transform

```bash
php artisan typescript:transform
```

---

## Frontend Changes

### 1. Monthly Index — mode toggle

**File:** `resources/js/Pages/Monthly/Index.tsx`

Add the same `overview` / `configure` mode pattern from `Weekly/Index.tsx`:

- State: `mode`, `scheduling` (reuse `SchedulingState` type from weekly).
- Header: `⚙️` / `✕ Done` toggle button.
- When `mode === 'configure'` → render `<MonthlyScheduleGrid>` instead of `<MonthlyGrid>`.
- When `scheduling` is active → render `<FrequencyBar>` (reused from weekly, already generic).
- `handleStartScheduling(isoDay)` — no `time` needed; set `preferred_time` to `null` or user's default.
- `handleConfirmSchedule()` → `POST /moments` with `preferred_time: null`, same as weekly.

### 2. New component: `MonthlyScheduleGrid`

**File:** `resources/js/features/monthly/components/MonthlyScheduleGrid.tsx`

```
┌──────────────────────────────────────────────┐
│  MONDAY                                      │
│  🏃 Running   🧘 Yoga   [+]                  │
├──────────────────────────────────────────────┤
│  TUESDAY                                     │
│  🏃 Running   🧘 Yoga   📖 Read   [+]       │
├──────────────────────────────────────────────┤
│  ...                                         │
├──────────────────────────────────────────────┤
│  SUNDAY                                      │
│  🏃 Running   [+]                            │
└──────────────────────────────────────────────┘
```

Props:
```ts
interface Props {
    rows: App.Data.MonthlyScheduleRowData[];
    scheduling: SchedulingState | null;
    onStartScheduling: (isoDay: number) => void;
    onGhostNameChange: (name: string) => void;
    onGhostIconChange: (icon: string | null) => void;
}
```

Each row:
- Day header (left-aligned label + weekend fade).
- Horizontal list of moment chips (icon + name).
- `[+]` dashed button on empty/configure slots — triggers `onStartScheduling(isoDay)`.
- Ghost card when `scheduling.daysOfWeek.includes(row.isoDayNumber)` and mode is active.

### 3. New component: `MonthlyScheduleRow`

**File:** `resources/js/features/monthly/components/MonthlyScheduleRow.tsx`

Single day-of-week row. Displays:
- Day label header.
- Moment chips (reuse `SlotMomentCard` variant or a simpler `MomentChip`).
- Add button (dashed circle `+`).
- Ghost card when scheduling targets this day.

### 4. Adapt `FrequencyBar` (no changes needed)

`FrequencyBar` already accepts generic `daysOfWeek` and `frequency` props. It renders day pills (Mon–Sun) and frequency options. No changes required — just pass it from Monthly Index the same way Weekly Index does.

### 5. CalendarViewToggle — second-tap behaviour

**File:** `resources/js/shared/components/calendar/CalendarViewToggle.tsx`

When already on the monthly route, a second tap toggles configure mode instead of re-navigating. Two options:

**Option A (simple):** Don't change the toggle. Use the ⚙️ button in the monthly header (same pattern as weekly). This is the recommended approach for consistency.

**Option B (second-tap):** If the monthly icon is already active, fire a custom event or use a callback prop to toggle configure mode instead of navigating:

```tsx
// In CalendarViewToggle
onClick={(e) => {
    if (isMonthly) {
        e.preventDefault();
        onMonthlySecondTap?.();  // callback from parent
    }
}}
```

**Recommendation:** Use **Option A** (⚙️ button) for consistency with weekly. The second-tap can be added later as a UX shortcut.

---

## SCSS

### New file section in `_monthly.scss`

```scss
// ─── Monthly Schedule Grid (configure mode) ─────────────────────────────────

.monthly-schedule-grid {
    background: #fff;
    border-radius: 0;
    overflow: hidden;
}

.monthly-schedule-row {
    border-top: 1px solid $border;
    padding: 0.75rem 1rem;

    &--weekend {
        opacity: 0.6;
    }

    &__header {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #6b7280;
        margin-bottom: 0.5rem;
    }

    &__moments {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
    }

    &__add-btn {
        // Same dashed circle as weekly empty-slot add button
    }
}

.monthly-schedule-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.625rem;
    border: 1px solid $border;
    font-size: 0.8125rem;
    font-weight: 500;

    &__icon { font-size: 1rem; }
    &__name { color: #374151; }
}
```

---

## Data Flow Summary

```
MonthlyController
  ├── builds `days[]` (MonthlyDayData) → MonthlyGrid (overview)
  └── builds `scheduleRows[]` (MonthlyScheduleRowData) → MonthlyScheduleGrid (configure)

Monthly/Index.tsx
  ├── mode === 'overview'  → <MonthlyGrid>
  └── mode === 'configure' → <FrequencyBar> + <MonthlyScheduleGrid>

POST /moments (on confirm) → same endpoint as weekly
```

---

## Task Checklist

1. [ ] Create `MonthlyScheduleRowData` DTO
2. [ ] Update `MonthlyPageData` with `scheduleRows`
3. [ ] Update `MonthlyController` to build schedule rows
4. [ ] `php artisan typescript:transform`
5. [ ] Update `Monthly/Index.tsx` — add mode toggle, scheduling state, FrequencyBar
6. [ ] Create `MonthlyScheduleGrid` component
7. [ ] Create `MonthlyScheduleRow` component
8. [ ] Add SCSS for schedule grid/row/chip
9. [ ] Wire ⚙️/✕ Done button in monthly header
10. [ ] Test: create moment from monthly configure → verify appears in weekly + daily
11. [ ] Test: frequency/day-pill changes reflect ghost cards across rows
12. [ ] `npm run build` + manual QA
13. [ ] `php artisan test --compact`
