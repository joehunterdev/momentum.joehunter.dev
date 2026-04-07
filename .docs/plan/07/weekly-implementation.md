# Weekly View — Implementation Plan

> Based on `07-information-architecture.md` §Weekly View.
> Builds on the existing Daily feature patterns (`DailyController`, `features/daily/`, `MomentSchedule`, `UserConfig`).

---

## 1. Overview

A full **Monday → Sunday** weekly calendar grid.

- **Y-axis** — Days (Monday top, Sunday bottom)
- **X-axis** — 30-minute time slots spanning the user's `wake_time` → `sleep_time`
- **Cells** — show the moment icon if scheduled, or an empty "+" slot for adding a new moment
- Current day row and current time slot are highlighted
- Past moments are colour-coded: ✅ green (done), 🔴 red (missed), ⬜ grey (needs action)
- Out-of-office hours dimmed (⅓ opacity grey overlay)
- Weekend rows get a subtle background tint (½ opacity grey)

---

## 2. Frontend Dependency — `date-fns`

Install [`date-fns`](https://date-fns.org/) for all client-side date logic:

```
npm install date-fns
```

**Why:** tree-shakeable (only imports what's used, ~3–5 KB gzipped), zero sub-dependencies, mirrors Carbon patterns already used on the backend.

**Functions needed across the app:**

| Function             | Used in                          | Purpose                                  |
|----------------------|----------------------------------|------------------------------------------|
| `startOfISOWeek`     | `WeeklyGrid`                     | Get Monday of current week               |
| `endOfISOWeek`       | `WeeklyGrid`                     | Get Sunday of current week               |
| `eachDayOfInterval`  | `WeeklyGrid`                     | Generate Mon–Sun array                   |
| `format`             | `WeeklyGrid`, `DayRow`, header   | Format dates for display                 |
| `isSameDay`          | `DayRow`                         | Highlight today's row                    |
| `isWeekend`          | `DayRow`                         | Apply weekend tint                       |
| `isAfter` / `isBefore` | `TimeSlotCell`                | Determine past/future status             |
| `parse` / `set`      | `SleepHelper` (config)           | 8-hour sleep time calculation            |
| `addMinutes`         | Slot generation                  | Build 30-min time slot array             |

> **Convention:** import individually — `import { format, isSameDay } from 'date-fns'` — never import the whole library.

---

## 3. Data Requirements

### Already exists

| Model            | Relevant columns                                                   |
|------------------|--------------------------------------------------------------------|
| `Moment`         | `id`, `name`, `icon`, `color`, `is_active`, `sort_order`          |
| `MomentSchedule` | `moment_id`, `frequency`, `days_of_week` (JSON), `preferred_time` |
| `MomentInstance` | `moment_id`, `date`, `completed_at`                               |
| `UserConfig`     | `wake_time`, `sleep_time`, `week_starts_on`                       |

### What the controller needs to build

For the current week (Mon–Sun):

```
[
  weekStart: '2026-04-06',          // always Monday
  weekEnd:   '2026-04-12',          // always Sunday
  config: { wake_time, sleep_time },
  days: [
    {
      date: '2026-04-06',
      dayName: 'Monday',
      isToday: true,
      isWeekend: false,
      slots: [
        {
          time: '08:00',
          moment: { id, name, icon, color, status: 'completed'|'missed'|'pending'|null } | null,
        },
        ...
      ]
    },
    ...
  ]
]
```

- **status logic** for each moment in a slot:
  - `date < today && completed_at != null` → `'completed'`
  - `date < today && completed_at == null` → `'missed'`
  - `date == today` → `'pending'`
  - `date > today` → `null` (future — no state yet)

---

## 4. Backend

### 3.1 Route

```php
// routes/web.php — inside auth middleware group
Route::get('/weekly', [WeeklyController::class, 'index'])->name('weekly');
```

### 3.2 Controller — `app/Http/Controllers/WeeklyController.php`

```
php artisan make:controller WeeklyController --no-interaction
```

Responsibilities:
1. Determine current week boundaries (Mon–Sun) — always ISO week format.
2. Load user's `UserConfig` for `wake_time` / `sleep_time`.
3. Load all active `Moment`s with `schedule` and `instances` (filtered to this week's date range).
4. For each day (Mon–Sun), generate 30-min time slots from `wake_time` to `sleep_time`.
5. Place moments into their `preferred_time` slot; mark status per the logic above.
6. Return `Inertia::render('Weekly/Index', [...])`.

### 3.3 Props contract (TypeScript mirror)

```ts
// resources/js/features/weekly/types.ts

export type SlotStatus = 'completed' | 'missed' | 'pending' | null;

export interface SlotMoment {
    id: number;
    name: string;
    icon: string | null;
    color: string | null;
    status: SlotStatus;
}

export interface TimeSlot {
    time: string;          // 'HH:mm'
    moment: SlotMoment | null;
}

export interface WeekDay {
    date: string;          // 'YYYY-MM-DD'
    dayName: string;       // 'Monday', 'Tuesday', etc.
    isToday: boolean;
    isWeekend: boolean;
    slots: TimeSlot[];
}

export interface WeeklyPageProps {
    weekStart: string;
    weekEnd: string;
    config: {
        wake_time: string;
        sleep_time: string;
    };
    days: WeekDay[];
}
```

---

## 5. Frontend

### 4.1 File structure

```
resources/js/
├── features/
│   └── weekly/
│       ├── index.ts                     # barrel export
│       ├── types.ts                     # interfaces above
│       └── components/
│           ├── WeeklyGrid.tsx           # main grid layout
│           ├── DayRow.tsx               # single day row
│           ├── TimeSlotCell.tsx         # individual 30-min cell
│           └── SlotMomentIcon.tsx       # icon + status indicator
├── Pages/
│   └── Weekly/
│       └── Index.tsx                    # Inertia page
```

### 4.2 Page — `Pages/Weekly/Index.tsx`

- Uses `AuthenticatedLayout`
- Header: current week range as text ("7 – 13 April 2026")
- Renders `<WeeklyGrid>` with all `days` / `config` props

### 4.3 `WeeklyGrid.tsx`

**Layout:**

```
             | 08:00 | 08:30 | 09:00 | ... | 22:00 | 22:30 |
  Monday     | [cell] | [cell] | [cell] | ... | [cell] | [cell] |
  Tuesday    | ...
  ...
  Sunday     | ...
```

- Horizontal scroll container for time slots (overflow-x-auto)
- Time header row fixed at top
- Day labels column sticky on the left
- Tailwind for grid structure: `grid`, `sticky`, `overflow-x-auto`
- SCSS classes for: grid cell sizing, out-of-office overlay, weekend row tint, today highlight

### 4.4 `DayRow.tsx`

- Receives `WeekDay` props
- Applies SCSS classes:
  - `.weekly-day-row--today` → highlighted background
  - `.weekly-day-row--weekend` → 50% grey tint
- Maps `slots` → `<TimeSlotCell>` for each

### 4.5 `TimeSlotCell.tsx`

- If `slot.moment` exists → render `<SlotMomentIcon>`
- If empty → render an "add" button that links to `route('moments.create')`
  - Could open the create-moment modal (future: Inertia modal)
- Out-of-office slots (before `wake_time` or after `sleep_time`) get `.weekly-slot--ooo` (⅓ grey overlay)

### 4.6 `SlotMomentIcon.tsx`

- Shows the moment's emoji icon
- Status-based SCSS class:
  - `.slot-icon--completed` → green ring / background
  - `.slot-icon--missed` → red ring / background
  - `.slot-icon--pending` → grey ring (needs action today)

### 4.7 Add moment flow

- Clicking an empty slot navigates to `route('moments.create')` (existing route)
- Future enhancement: pass `?day=monday&time=09:00` as query params to pre-fill the schedule

---

## 6. SCSS

All component-specific styling in `resources/css/` partials per the project convention (Tailwind for layout, SCSS for component styling).

### New partial: `_weekly.scss`

```scss
// resources/css/_weekly.scss

// ─── Grid container ───
.weekly-grid {
    // scrollable container, cell sizing, sticky headers
}

// ─── Day row ───
.weekly-day-row {
    &--today {
        background: rgba(99, 102, 241, 0.08);   // subtle indigo highlight
        border-left: 3px solid var(--mm-primary);
    }

    &--weekend {
        background: rgba(100, 116, 139, 0.05);  // slate-500 at 5%
    }
}

// ─── Time slot cell ───
.weekly-slot {
    // base cell styling, border, hover

    &--ooo {
        background: rgba(100, 116, 139, 0.12);  // out-of-office dim
        pointer-events: none;
        opacity: 0.33;
    }

    &--current {
        border: 2px solid var(--mm-primary);     // current time highlight
    }

    &--empty:hover {
        background: rgba(99, 102, 241, 0.06);
        cursor: pointer;
    }
}

// ─── Slot moment icon ───
.slot-icon {
    &--completed {
        color: var(--mm-accent);                 // green
    }

    &--missed {
        color: var(--mm-danger);                 // red
    }

    &--pending {
        color: var(--mm-text-dimmed);            // grey
    }
}
```

Import in `app.scss`:
```scss
@import 'weekly';
```

---

## 7. Nav update

Add "Weekly" link to `AuthenticatedLayout.tsx` nav (between Daily and Settings):

```tsx
<NavLink href={route('weekly')} active={route().current('weekly')}>
    Weekly
</NavLink>
```

---

## 8. Testing

### Feature tests — `tests/Feature/WeeklyControllerTest.php`

```
php artisan make:test WeeklyControllerTest --phpunit --no-interaction
```

| Test                                           | Asserts                                                      |
|------------------------------------------------|--------------------------------------------------------------|
| `testWeeklyPageRendersForAuthenticatedUser`    | GET `/weekly` returns 200, renders `Weekly/Index`            |
| `testWeeklyPageRedirectsGuestsToLogin`         | GET `/weekly` unauthenticated → redirect to login            |
| `testWeeklyReturnsCorrectWeekBoundaries`       | `weekStart` is Monday, `weekEnd` is Sunday of current week   |
| `testWeeklyReturnsSevenDays`                   | `days` has exactly 7 entries, Monday first                   |
| `testMomentsPlacedInCorrectSlots`              | A moment with `preferred_time = '09:00'` appears in the 09:00 slot on its scheduled days |
| `testCompletedMomentsShowCorrectStatus`        | Past day with `completed_at` → status `'completed'`          |
| `testMissedMomentsShowCorrectStatus`           | Past day without `completed_at` → status `'missed'`          |
| `testTodayMomentsShowPendingStatus`            | Current day → status `'pending'`                             |
| `testFutureMomentsHaveNullStatus`              | Future day → status `null`                                   |
| `testWeekendDaysMarkedCorrectly`               | Saturday and Sunday have `isWeekend: true`                   |
| `testTodayDayMarkedCorrectly`                  | Current date has `isToday: true`                             |
| `testSlotsRespectUserWakeAndSleepTime`         | Slots start at `wake_time` and end at `sleep_time`           |

---

## 9. Implementation order

1. **Dependency** — `npm install date-fns`
2. **Types** — create `features/weekly/types.ts`
3. **Controller** — `WeeklyController` with full slot-building logic
4. **Route** — add `GET /weekly` to `web.php`
5. **Tests** — write all feature tests, run green
6. **SCSS** — create `_weekly.scss`, import in `app.scss`
7. **Components** — build `WeeklyGrid`, `DayRow`, `TimeSlotCell`, `SlotMomentIcon` (using `date-fns`)
8. **Page** — create `Pages/Weekly/Index.tsx`
9. **Nav** — add Weekly link to layout + responsive nav
10. **Manual QA** — verify grid layout, scrolling, status colours, today highlight
