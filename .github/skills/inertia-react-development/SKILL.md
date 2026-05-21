---
name: inertia-react-development
description: "Develops the Momentum app's Inertia.js v2 + React frontend. Activates when creating or editing files under resources/js/Pages, resources/js/features/, or resources/js/shared/components/; when working with calendar views (Daily/Weekly/Monthly), moment forms, or scheduling; when using <Link>, <Form>, useForm, router; or when the user mentions React pages, forms, calendar containers, or MomentAction/TimeSlotCell."
license: MIT
metadata:
  author: project
---

# Inertia React Development — Momentum Project

This skill captures the patterns that apply to **this specific codebase**. For generic Inertia v2 docs, use `search-docs` with a relevant query.

## When to Apply

Activate when:
- Creating or modifying anything under `resources/js/Pages/`, `resources/js/features/`, or `resources/js/shared/components/`
- Adding calendar functionality (Daily/Weekly/Monthly views, slot rendering, moment toggling)
- Touching moment CRUD forms (Create/Edit moments)
- Wiring scheduling state, swipe gestures, or completion toggles
- Adding a new Inertia page

---

## Project Layout (post-refactor)

```
resources/js/
├── Pages/                        # Thin Inertia shells, 1:1 with routes
│   ├── Daily/Index.tsx
│   ├── Weekly/Index.tsx
│   ├── Monthly/Index.tsx
│   ├── Moments/{Create,Edit}.tsx
│   └── Config/Edit.tsx
├── features/
│   ├── calendar/
│   │   ├── daily/DailyContainer.tsx
│   │   ├── weekly/{WeeklyContainer,DayRow,DaySection}.tsx
│   │   ├── monthly/{MonthlyContainer,MonthlyDayCell,MonthlyScheduleRow}.tsx
│   │   ├── components/
│   │   │   ├── MomentAction.tsx        # Canonical row — used by all 3 views
│   │   │   └── TimeSlotCell.tsx        # Cell wrapper (mode/swipe/scheduling)
│   │   ├── hooks/{useCalendarActions,useSwipeComplete}.ts
│   │   ├── utils.ts                    # getVisibleTimeSlots, snapToSlot, …
│   │   ├── types.ts                    # Re-exports App.Data.* under aliases
│   │   └── index.ts                    # Barrel
│   ├── moments/                        # MomentForm, MomentModal, useMomentForm
│   ├── config/                         # ConfigForm, SleepHelper
│   └── scheduling/                     # useScheduling, transition.ts
├── shared/components/calendar/         # CalendarNav, CalendarSection, MomentIcon, …
├── types/generated.d.ts                # ⚠️ DTO-generated — do not edit
└── Layouts/, Components/               # Breeze (don't modify)
```

**Casing convention:** Breeze scaffolding (`Pages/`, `Components/`, `Layouts/`) is capitalised; our code (`features/`, `shared/`) is lowercase. Keep this split.

---

## Core Patterns

### Pages are thin

A page composes layout + container + modals, nothing more.

```tsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { DailyContainer, useCalendarActions } from '@/features/calendar';
import { CalendarNav, CalendarProgressBar } from '@/shared/components/calendar';

export default function DailyIndex(props: App.Data.DailyPageData) {
    const { toggleMoment } = useCalendarActions();

    return (
        <AuthenticatedLayout>
            <Head title="Daily" />
            <CalendarNav view="daily" date={props.date} />
            <CalendarProgressBar completed={props.completedCount} total={props.totalCount} />
            <DailyContainer day={props.day} config={props.config} onToggle={toggleMoment} />
        </AuthenticatedLayout>
    );
}
```

### View containers orchestrate

Containers live in `features/calendar/{view}/`. They:
- Receive typed props from the page
- Compute visible slots (`getVisibleTimeSlots` from `features/calendar/utils.ts`)
- Map slots to `<TimeSlotCell />`
- Never reach across to other features (except type-only imports from `scheduling`)

### Calendar row UI is canonical

The shared row UI is exactly **two files** in `features/calendar/components/`:

| File | Purpose | Props |
|---|---|---|
| `MomentAction.tsx` | Pure presentation row | `moment: App.Data.SlotMomentData`, optional `progress` |
| `TimeSlotCell.tsx` | Cell wrapper | `slot`, `date`, `config`, `mode: 'overview' \| 'configure'`, scheduling flags & callbacks |

If you find yourself writing a third row component, stop — extend `MomentAction` or `TimeSlotCell` instead. Adding a new view should require **zero** new row UI.

### Types come from DTOs

Source of truth: `resources/js/types/generated.d.ts`. Consume via `App.Data.*`:

```ts
function MyContainer({ day }: { day: App.Data.WeekDayData }) { … }
```

Regenerate after backend DTO changes:

```bash
php artisan typescript:transform
```

**Never** redefine a shape that exists as a DTO. Re-export under a feature alias if you want a domain-friendly name:

```ts
// features/calendar/types.ts
export type CalendarMoment = App.Data.SlotMomentData;
export type TimeSlot = App.Data.TimeSlotData;
```

---

## Forms

### Use `useForm` for moment/config forms

The project standard is `useForm` (programmatic control, fits the multi-section MomentForm pattern). The `<Form>` component is fine for simple cases but not the established pattern here.

```tsx
import { useForm } from '@inertiajs/react';

const { data, setData, post, processing, errors } = useForm<App.Data.MomentData>({
    name: '',
    description: '',
    icon: '',
    color: '',
    // …
});

function submit(e: React.FormEvent) {
    e.preventDefault();
    post(route('moments.store'));
}
```

Errors come back from the matching `FormRequest` (`StoreMomentRequest`, `UpdateMomentRequest`, `UpdateUserConfigRequest`). Don't duplicate validation client-side.

---

## Mutations & Partial Reloads

### Toggle completion (canonical pattern)

```ts
// features/calendar/hooks/useCalendarActions.ts
router.post(
    route('moments.toggle', { moment: momentId }),
    { date, time },
    {
        only: ['day', 'days', 'completedCount', 'totalCount'],
        preserveScroll: true,
    }
);
```

Note the `only: [...]` — partial reloads keep the UI snappy and avoid full page re-renders.

### Navigation

- `<Link href={route('weekly')}>` for internal navigation
- `router.visit(route('weekly'))` for programmatic navigation
- Always use `route()` (Ziggy) — never hardcode URLs

### When to use `axios`

Only when a route returns raw JSON (no Inertia redirect). CSRF is preconfigured. The toggle uses `router.post` with partial reload — that's almost always the better choice.

---

## Hooks Reference

| Hook | Location | Purpose |
|---|---|---|
| `useCalendarActions` | `features/calendar/hooks/` | `toggleMoment({ momentId, date, time?, reloadOnly? })` |
| `useSwipeComplete` | `features/calendar/hooks/` | Drag-to-confirm gesture (returns pointer handlers + drag state) |
| `useScheduling` | `features/scheduling/` | Scheduling state machine (mode, kind transitions, day/time selection) |
| `useMomentForm` | `features/moments/hooks/` | Moment create/edit form state |

Cross-feature **type-only** imports from `scheduling` are allowed (e.g. `SchedulingState`, `IsoDayNumber`). Runtime cross-feature imports are not.

---

## Naming — Don't Reintroduce Old Names

These were removed in the refactor. Don't bring them back:

`MomentDisplay`, `MomentActionItem`, `DailyTimeSlotCell`, `WeeklyGrid`, `MonthlyVerticalView`, `DailySlotCard`, `ConsistencyBar`, `CalendarMomentIcon`, `FrequencyBar`, `AddSlotPopover`, `MomentDetailTicker`.

Use: `MomentAction`, `TimeSlotCell`, `WeeklyContainer`, `MonthlyContainer`, `DailyContainer`, `MomentIcon`, `FrequencyBadge`, `AddMomentPopover`.

---

## v2 Features in Use

- **Partial reloads** (`only: [...]`) — used heavily for toggle/scheduling actions
- **`<Head>`** — set per page
- **Ziggy `route()`** — required for all URLs

Deferred props, prefetching, polling, and `<WhenVisible>` are **not** currently used. If you reach for them, justify it — they add complexity that hasn't been needed.

---

## Common Pitfalls

- Syncing Inertia props into `useState` via `useEffect` — derive instead
- Hardcoding URL strings — always `route('name')`
- Duplicating row UI per view — reuse `MomentAction`
- Cross-feature runtime imports — promote to `shared/` if it's truly shared
- Redefining a DTO shape in TypeScript — consume `App.Data.*`
- Using `fetch()` — use `router.*` or `axios`
- Putting domain components in `Components/` — that's Breeze generics only
- Skipping the barrel: `import X from '@/features/calendar/daily/DailyContainer'` — import from `@/features/calendar` instead
