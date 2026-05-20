# Moment Action — Refactor Plan

## Context

The calendar pages (Daily, Weekly, Monthly) have drifted into three feature folders
(`features/daily`, `features/weekly`, `features/monthly`) with cross-feature imports
(Daily reaches into Weekly for `SlotMomentIcon`, `MomentDetailTicker`, `ConsistencyBar`),
two near-duplicate cell components (`DailyTimeSlotCell` ≈ `TimeSlotCell`), and a
`CalendarMomentCard` whose `read` variant is dense and hard to skim — small icon, name
in a nested card, a 5% consistency sliver on the right, orange tick marks top and bottom.

Goals:
1. Collapse the three feature folders into `features/calendar/`.
2. Replace the dense `read`-variant row with a clean `MomentActionItem`: large icon on
   the left, title + description on the right, and the row's **whole background** as a
   progress fill (no more sliver).
3. Keep the refactor scoped — no swipe, no edit pencil, no draft picker rebuild. Just
   the static read display done well.

Locked decisions:
- **Folder shape**: flat `features/calendar/` — no `views/{daily,weekly,monthly}/`
  subfolders.
- **Replacement scope**: `MomentActionItem` replaces `CalendarMomentCard variant="read"`
  only. `draft` and `edit` variants stay.
- **Progress source**: per-view completion aggregate, **not** the rolling 28-day
  `consistency` field.
  - **Daily** row → today's status: 100 if completed, else 0.
  - **Weekly** row → completed-this-week ÷ scheduled-this-week (0–100).
  - **Monthly** row → completed-this-month ÷ scheduled-this-month (0–100).
  - Source of truth: a new nullable `progress` field on `SlotMomentData`, computed
    per-view by each controller.
- **Old row pieces** (`SlotMomentIcon`, `MomentDetailTicker`, `ConsistencyBar`): parked
  in place during this PR. They move with the folder consolidation but stay dormant.
  Cleanup is a follow-up once nothing imports them.

## Outcome

- `features/calendar/` is the single home for view-specific calendar components.
- `features/{daily,weekly,monthly}/` are deleted.
- `SlotMomentData` carries a new `progress` field (`?int`, 0–100) populated per-view.
- A new `MomentActionItem` renders every overview-mode moment row across Daily,
  Weekly, Monthly with a consistent icon + title + description layout. Background fill
  width = `moment.progress`.
- `CalendarSectionArticle`'s overview branch renders `MomentActionItem`. Configure
  mode still uses `CalendarMomentCard variant="edit"` and draft mode still uses
  `variant="draft"` — untouched.
- `npx tsc --noEmit` clean. No regressions in the scheduling flow.

---

## Phase 1 — Folder consolidation

### Delete (dead code; do first so we don't move trash)

- `resources/js/features/daily/components/MomentCard.tsx` — legacy, never imported.
- `resources/js/features/daily/components/StreakBadge.tsx` — only used by the dead `MomentCard`.

### Move (path change only; no logic changes in this phase)

Target: `resources/js/features/calendar/components/`.

| From | To |
|---|---|
| `features/daily/components/DailySlotCard.tsx` | `features/calendar/components/DailySlotCard.tsx` |
| `features/daily/components/DailyTimeSlotCell.tsx` | `features/calendar/components/DailyTimeSlotCell.tsx` |
| `features/weekly/components/TimeSlotCell.tsx` | `features/calendar/components/TimeSlotCell.tsx` |
| `features/weekly/components/SlotMomentIcon.tsx` | `features/calendar/components/SlotMomentIcon.tsx` |
| `features/weekly/components/MomentDetailTicker.tsx` | `features/calendar/components/MomentDetailTicker.tsx` |
| `features/weekly/components/ConsistencyBar.tsx` | `features/calendar/components/ConsistencyBar.tsx` |
| `features/weekly/components/DaySection.tsx` | `features/calendar/components/DaySection.tsx` |
| `features/weekly/components/FrequencyBar.tsx` | `features/calendar/components/FrequencyBar.tsx` |
| `features/weekly/components/AddSlotPopover.tsx` | `features/calendar/components/AddSlotPopover.tsx` |
| `features/weekly/components/DayRow.tsx` | `features/calendar/components/DayRow.tsx` |
| `features/weekly/components/WeeklyGrid.tsx` | `features/calendar/components/WeeklyGrid.tsx` |
| `features/monthly/components/MonthlyDayCell.tsx` | `features/calendar/components/MonthlyDayCell.tsx` |
| `features/monthly/components/MonthlyScheduleRow.tsx` | `features/calendar/components/MonthlyScheduleRow.tsx` |
| `features/monthly/components/MonthlyVerticalView.tsx` | `features/calendar/components/MonthlyVerticalView.tsx` |
| `features/weekly/hooks/useSwipeComplete.ts` | `features/calendar/hooks/useSwipeComplete.ts` |
| `features/weekly/types.ts` | `features/calendar/types.ts` |

### Update imports

Search-and-replace across `resources/js/`:

- `@/features/daily` → `@/features/calendar`
- `@/features/weekly` → `@/features/calendar`
- `@/features/monthly` → `@/features/calendar`

Pages and files that need direct edits:
- `resources/js/Pages/Daily/Index.tsx`
- `resources/js/Pages/Weekly/Index.tsx`
- `resources/js/Pages/Monthly/Index.tsx`
- `resources/js/shared/components/calendar/CalendarMomentCard.tsx` — imports
  `SlotMoment` from `@/features/weekly/types` and `SlotMomentIcon` from
  `@/features/weekly/components/SlotMomentIcon`. Both move targets.

### Barrels

- New `resources/js/features/calendar/index.ts` — barrel re-exporting all the components
  above plus `MomentActionItem`. Keep export names identical to current.
- Delete `resources/js/features/{daily,weekly,monthly}/index.ts` and
  `…/components/index.ts`.
- Delete now-empty `features/{daily,weekly,monthly}/` directories.

### Boundary clarification (documented intent, no code enforcement)

- `shared/components/calendar/` = **generic primitives** — `CalendarSection`,
  `CalendarSectionArticle`, `CalendarNav`, `CalendarProgressBar`, `CalendarViewToggle`,
  `MomentFrequencyConfig`, `CalendarMomentCard`. Domain-aware but not page-coupled.
- `features/calendar/` = **page-composition layer** — `MomentActionItem`,
  `DailyTimeSlotCell`, `WeeklyGrid`, `MonthlyVerticalView`, etc. Composes primitives to
  deliver the daily/weekly/monthly view experience.

---

## Phase 2 — Backend: `progress` on `SlotMomentData`

### `app/Data/SlotMomentData.php`

Add a nullable `?int $progress` to the constructor. Document the semantic:

```php
/**
 * Completion percentage (0–100) over the current view's timespan.
 * Daily  = 100 if this moment instance is completed today, else 0.
 * Weekly = ratio across the visible Mon–Sun week.
 * Monthly = ratio across the current month's days.
 */
public ?int $progress,
```

Same field also added to `app/Data/MonthlyMomentData.php`.

### Controller updates

Compute `progress` once per moment per view and inject when building each `SlotMomentData`.

- **`DailyController`** — per-slot: `progress = slot->moment->status === 'completed' ? 100 : 0`.
- **`WeeklyController`** — per moment: across the 7 days of the week, count completed
  slots and total scheduled slots for that moment id. Inject the same `progress` into
  every `SlotMomentData` that references the moment.
- **`MonthlyController`** — per moment: across current-month days
  (`isCurrentMonth = true`), count completed and total. Inject into every
  `MonthlyMomentData` for that moment id.

Fold the aggregation into the existing day/slot iteration; the data set is small.

### Type regeneration

After PHP changes:
- `php artisan typescript:transform` — regenerates `resources/js/types/generated.d.ts`.
- Confirm `App.Data.SlotMomentData` and `App.Data.MonthlyMomentData` both grow the
  `progress?: number | null` field.

---

## Phase 3 — The new component

### `features/calendar/components/MomentActionItem.tsx`

```tsx
import type { SlotMoment } from '@/features/calendar/types';

interface Props {
    moment: SlotMoment;
    /** Override fill (0–100). Defaults to `moment.progress ?? 0`. */
    progress?: number;
}

export default function MomentActionItem({ moment, progress }: Props) {
    const pct = Math.max(0, Math.min(100, progress ?? moment.progress ?? 0));
    const name = moment.name ?? 'Untitled Moment';

    return (
        <div
            className="moment-action-item"
            style={{ '--moment-progress': `${pct}%` } as React.CSSProperties}
        >
            <span className="moment-action-item__progress-bg" aria-hidden />
            <span className="moment-action-item__icon">{moment.icon ?? '📌'}</span>
            <div className="moment-action-item__body">
                <span className="moment-action-item__title">{name}</span>
                {moment.description && (
                    <span className="moment-action-item__description">
                        {moment.description}
                    </span>
                )}
            </div>
        </div>
    );
}
```

Decisions baked in:
- `MomentIcon`/`MomentTitle`/`MomentDescription` stay **inline JSX**, not separate
  components. The mockup labels them but they're one-line primitives — premature to
  extract.
- Default icon (`📌`) and default title (`Untitled Moment`) match existing behavior.
- Description is conditional — hidden when null/empty.
- Progress source is `moment.progress` (BE-computed per-view aggregate), with an
  explicit `progress` prop override for special cases.

### CSS

New partial `resources/css/_moment-action.scss`, imported alongside the existing partials.

```scss
.moment-action-item {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 0.75rem 0.875rem;
    overflow: hidden;
    background: #fff;
    isolation: isolate;

    &__progress-bg {
        position: absolute;
        inset: 0;
        z-index: 0;
        width: var(--moment-progress, 0%);
        background: rgba(99, 102, 241, 0.10);
        transition: width 0.3s ease;
        pointer-events: none;
    }

    &__icon {
        position: relative;
        z-index: 1;
        flex-shrink: 0;
        width: 2.75rem;
        height: 2.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.5rem;
        background: rgba(0, 0, 0, 0.03);
        font-size: 1.5rem;
        line-height: 1;
    }

    &__body {
        position: relative;
        z-index: 1;
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
    }

    &__title {
        font-weight: 600;
        font-size: 0.9375rem;
        color: #111827;
        line-height: 1.25;
    }

    &__description {
        font-size: 0.8125rem;
        color: #6b7280;
        line-height: 1.25;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
```

The `--moment-progress` custom property is the public knob.

---

## Phase 4 — Wire-up

### `shared/components/calendar/CalendarSectionArticle.tsx`

Current:
```tsx
moment ? (
    <>
        <CalendarMomentCard
            moment={moment}
            variant={mode === 'configure' ? 'edit' : 'read'}
        />
        {isConflict && <span … />}
    </>
)
```

After:
```tsx
moment ? (
    <>
        {mode === 'configure'
            ? <CalendarMomentCard moment={moment} variant="edit" />
            : <MomentActionItem moment={moment} />}
        {isConflict && <span … />}
    </>
)
```

### Other read-variant call sites

`MonthlyVerticalView.tsx` (recently rebuilt) renders `CalendarMomentCard variant="read"`
directly inside day rows — swap to `MomentActionItem` there too. Verify no other
direct uses of `variant="read"`.

### `CalendarMomentCard.tsx`

Leave the `read` branch present but dead in this PR (no consumers). Follow-up commit
removes it once the new path is confirmed in the browser.

---

## Phase 5 — Sanity

1. `npx tsc --noEmit` — clean.
2. `grep -r '@/features/daily\|@/features/weekly\|@/features/monthly' resources/js/` —
   zero matches.
3. Reload `/daily`, `/weekly`, `/monthly` on a mobile viewport (375px):
   - Each filled row shows large icon + title + (optional) description.
   - **Daily**: completed moment rows fill 100%, uncompleted fill 0%.
   - **Weekly**: pick a moment scheduled on M/T/W/T/F, mark 2 instances completed,
     expect a ~40% fill width on every row referencing that moment.
   - **Monthly**: same idea over a month — 5 completions of a daily moment ≈ 16% fill
     mid-month.
   - No icon picker, no pencil, no swipe affordance in overview mode.
   - Clicking an empty slot still opens the configure flow (draft/edit untouched).

---

## Critical files

**New**
- `resources/js/features/calendar/components/MomentActionItem.tsx`
- `resources/js/features/calendar/index.ts`
- `resources/js/features/calendar/types.ts`
- `resources/css/_moment-action.scss`

**Modified — backend**
- `app/Data/SlotMomentData.php`
- `app/Data/MonthlyMomentData.php`
- `app/Http/Controllers/DailyController.php`
- `app/Http/Controllers/WeeklyController.php`
- `app/Http/Controllers/MonthlyController.php`
- `resources/js/types/generated.d.ts` (regenerated)

**Modified — frontend**
- `resources/js/shared/components/calendar/CalendarSectionArticle.tsx`
- `resources/js/shared/components/calendar/CalendarMomentCard.tsx` (import fixes only)
- `resources/js/Pages/{Daily,Weekly,Monthly}/Index.tsx`
- `resources/js/features/calendar/components/MonthlyVerticalView.tsx`
- All moved components — relative-import fixes only

**Deleted**
- `resources/js/features/daily/`
- `resources/js/features/weekly/`
- `resources/js/features/monthly/`

---

## Out of scope

- Removing the `read` branch from `CalendarMomentCard` (follow-up commit).
- Rebuilding swipe-to-complete on `MomentActionItem` (separate ticket).
- Renaming `weekly-slot*` CSS classes (spec PR #12).
- Building a `<Calendar>` container + context (spec PR #10).
- Underused `CalendarSectionArticle` capabilities audit.
