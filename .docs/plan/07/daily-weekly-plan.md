

# Daily / Weekly View Separation — Implementation Plan

## Overview

Split the current monolithic weekly view into two focused calendar views:

| View     | Route      | Purpose                                | Slot Size |
|----------|------------|----------------------------------------|-----------|
| **Daily**  | `/daily`   | Action moments (swipe, ticker, progress) | 30 min    |
| **Weekly** | `/weekly`  | Schedule & manage moments (create, edit) | 60 min    |

A toggle in the header switches between views. Both reuse a shared calendar/slot component system.

---

## Phase 1 — Extract Shared Components

Move reusable pieces from `features/weekly/` → `shared/components/calendar/`.

### Components to extract

| Component              | Current Location                        | Notes                                        |
|------------------------|-----------------------------------------|----------------------------------------------|
| `TimeSlotCell`         | `features/weekly/components/`           | Add `variant` prop: `'daily' \| 'weekly'`     |
| `SlotMomentCard`       | `features/weekly/components/`           | Split into daily & weekly card variants       |
| `SlotMomentIcon`       | `features/weekly/components/`           | Shared — swipe only enabled when daily        |
| `ConsistencyBar`       | `features/weekly/components/`           | Shared — used by daily                        |
| `MomentDetailTicker`   | `features/weekly/components/`           | Shared — daily only (next-up)                 |
| `DaySection`           | `features/weekly/components/`           | Shared — parameterize slot windowing          |
| `DateSelectorBar`      | New (generalised from `WeekSelectorBar`)| Reusable prev/current/next navigator          |
| `ViewToggle`           | New                                     | Grid/list icon to switch daily ↔ weekly       |
| `useSwipeComplete`     | `features/weekly/hooks/`                | Shared — daily only                           |

### New shared structure

```
resources/js/shared/
├── components/
│   └── calendar/
│       ├── TimeSlotCell.tsx        ← parameterized (variant, showSwipe, showPopover)
│       ├── SlotMomentIcon.tsx      ← swipe enabled via prop
│       ├── ConsistencyBar.tsx
│       ├── MomentDetailTicker.tsx
│       ├── DaySection.tsx          ← accepts slotFilter ('hourly' | 'half-hourly')
│       ├── DateSelectorBar.tsx     ← generalised: prev/current/next with configurable unit
│       └── ViewToggle.tsx          ← icon button, daily ↔ weekly
├── hooks/
│   └── useSwipeComplete.ts
└── types/
    └── calendar.ts                 ← shared SlotMoment, TimeSlot, WeekDay, Config types
```

### `DateSelectorBar` design

Generalised from `WeekSelectorBar`. Accepts:

```ts
interface DateSelectorBarProps {
    mode: 'day' | 'week';
    currentDate: string;        // YYYY-MM-DD (start of week for weekly, date for daily)
    routeName: string;          // 'daily' | 'weekly'
    paramName: string;          // 'date' | 'week'
}
```

- **Day mode**: shows `← 13 Apr | 14 Apr | 15 Apr →` with prev/next day navigation
- **Week mode**: shows `← 7–13 Apr | 14–20 Apr | 21–27 Apr →` (existing behaviour)

### `ViewToggle` design

A small icon-button pair in the header next to the `DateSelectorBar`:

```
[📅] [📋]        ← calendar grid (weekly) vs list (daily)
```

- Navigates between `/daily?date=YYYY-MM-DD` and `/weekly?week=YYYY-MM-DD`
- Preserves the current date context when switching

---

## Phase 2 — Rebuild Daily View

New route: `GET /daily` → `DailyController@index`

### Backend: `DailyController`

Rewrite to return the same DTO structure as weekly but for a single day with 30-min slots:

```php
// Accepts ?date=YYYY-MM-DD (defaults to today)
// Returns DailyPageData:
//   - date: string
//   - day: WeekDayData (single day with 30-min TimeSlotData[])
//   - config: UserConfigData
//   - progress: { completed: int, total: int }
```

**Key differences from weekly:**
- Single day, not 7
- All 30-min slots from wake→sleep (no windowing/collapsing)
- Includes `progress` count for the header bar
- Reuses `WeeklyController::buildTimeSlots()` (already 30-min) and `snapToSlot()`
- Extract shared slot-building logic into a `Trait` or `Service` class

### Backend: Shared `CalendarService`

Extract from `WeeklyController` into `App\Services\CalendarService`:

```php
class CalendarService
{
    public function buildTimeSlots(string $wake, string $sleep): array;
    public function snapToSlot(string $time): string;
    public function buildSlotMoment(Moment $match, string $dateStr, ...): SlotMomentData;
    public function calculateConsistency(Moment $moment, Carbon $windowStart, Carbon $today): ?int;
}
```

Both `DailyController` and `WeeklyController` use this service.

### Frontend: `Pages/Daily/Index.tsx`

```tsx
// Props: DailyPageData
// - DateSelectorBar mode="day"
// - ViewToggle
// - Progress bar (completed/total) in header
// - Single DaySection with all 30-min slots
// - Swipe-to-complete enabled
// - MomentDetailTicker on next-up slot
// - No AddSlotPopover (no creating from daily)
// - No MomentModal
```

### Frontend: `features/daily/` (rebuilt)

```
features/daily/
├── components/
│   ├── DailyGrid.tsx           ← single-day wrapper, finds next moment
│   ├── DailySlotCard.tsx       ← daily variant: swipe + ticker + consistency
│   └── DailyProgressBar.tsx    ← "X of Y done" bar at top
├── types.ts                    ← re-exports from shared/types/calendar
└── index.ts
```

**`DailySlotCard`** (daily variant of `SlotMomentCard`):
- Shows `SlotMomentIcon` with swipe enabled
- Shows `ConsistencyBar`
- Shows `MomentDetailTicker` when `isNext`
- Green completed state styling

**`DailyProgressBar`**:
- Moved from weekly's `ConsistencyBar` concept
- Shows "3 of 5 moments completed" with a fill bar
- Lives in the header area

### New DTO: `DailyPageData`

```php
#[TypeScript]
class DailyPageData extends Data
{
    public function __construct(
        public string $date,
        public WeekDayData $day,
        public UserConfigData $config,
        public int $completedCount,
        public int $totalCount,
    ) {}
}
```

---

## Phase 3 — Simplify Weekly View

### Remove from weekly

1. **Swipe-to-complete** — remove `onSwipeProgress`, `useSwipeComplete` usage, swipe state from `TimeSlotCell`
2. **`MomentDetailTicker`** — remove from weekly `SlotMomentCard`
3. **`ConsistencyBar`** — remove from weekly (lives on daily now)
4. **Toggle handler** — remove `handleToggleMoment` and the fetch/reload logic from `Weekly/Index.tsx`
5. **Swipe CSS** — remove `.weekly-slot--swiping`, `.weekly-slot--swipe-done` from `_weekly.scss`

### Add to weekly

1. **Quick edit button** — on each moment card row, a small pencil icon that navigates to `route('moments.edit', moment.id)`
2. **`ViewToggle`** — in the header alongside `WeekSelectorBar`

### Weekly `SlotMomentCard` (simplified)

```tsx
// Weekly variant — no swipe, no ticker
<div className="slot-moment-card">
    <div className="slot-moment-card__row">
        <SlotMomentIcon moment={moment} /> {/* static icon, no swipe handlers */}
        <div className="slot-moment-card__body">
            <span className="slot-moment-card__name">{moment.name}</span>
            <span className="slot-moment-card__desc">{moment.description}</span>
        </div>
        <button className="slot-moment-card__edit" onClick={...}>
            ✏️
        </button>
    </div>
</div>
```

---

## Phase 4 — Routes & Navigation

### Routes (`routes/web.php`)

```php
Route::get('/daily', [DailyController::class, 'index'])->name('daily');
Route::get('/weekly', [WeeklyController::class, 'index'])->name('weekly');
```

### Auth redirects

Keep all auth controllers redirecting to `route('weekly')` (scheduling is the entry point). Users toggle to daily from there.

### Nav links (`AuthenticatedLayout.tsx`)

- Uncomment Daily nav link
- Both Daily and Weekly visible in nav
- Active state based on current route

---

## Phase 5 — Data Flow Summary

```
┌─────────────────────────────────────────────────────────┐
│                    CalendarService                       │
│  buildTimeSlots() · snapToSlot() · buildSlotMoment()    │
└──────────────┬──────────────────────┬───────────────────┘
               │                      │
        DailyController          WeeklyController
        (single day, 30min)      (7 days, 60min windowed)
               │                      │
        DailyPageData            WeeklyPageData
               │                      │
        Pages/Daily/Index        Pages/Weekly/Index
               │                      │
        ┌──────┴──────┐         ┌─────┴──────┐
        │ DailyGrid   │         │ WeeklyGrid │
        │ + swipe     │         │ + popover  │
        │ + ticker    │         │ + edit btn │
        │ + progress  │         │ no swipe   │
        └─────────────┘         └────────────┘
```

---

## Implementation Order

| Step | Task                                           | Files Changed                                  |
|------|------------------------------------------------|------------------------------------------------|
| 1    | Create `CalendarService`                       | `app/Services/CalendarService.php`             |
| 2    | Refactor `WeeklyController` to use service     | `WeeklyController.php`                         |
| 3    | Extract shared components to `shared/`         | Move & parameterize 7 components               |
| 4    | Create `DateSelectorBar` + `ViewToggle`        | New shared components                          |
| 5    | Create `DailyPageData` DTO                     | `app/Data/DailyPageData.php`                   |
| 6    | Rebuild `DailyController`                      | `DailyController.php`                          |
| 7    | Build daily feature components                 | `features/daily/components/*`                  |
| 8    | Build `Pages/Daily/Index.tsx`                  | New page                                       |
| 9    | Simplify weekly (remove swipe/ticker/bar)      | `features/weekly/components/*`                 |
| 10   | Add quick-edit button to weekly cards          | `WeeklySlotCard.tsx`                           |
| 11   | Uncomment `/daily` route + nav links           | `web.php`, `AuthenticatedLayout.tsx`           |
| 12   | Run `typescript:transform`, build, test        | Generated types + full test suite              |

---

## Out of Scope (for now)

- Delete button on weekly cards (just edit for now)
- Drag-to-reorder moments
- Per-moment progress (daily progress bar is aggregate only)
- Half-hour slots on weekly view (stays 60-min)