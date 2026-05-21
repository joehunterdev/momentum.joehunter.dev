# Copilot Instructions – React + TypeScript (Feature-Based Architecture)

## Goal

Build a maintainable, scalable React + TypeScript application using:

* Feature-based structure
* KISS (Keep It Simple)
* DRY (Don't Repeat Yourself, but not prematurely)

---

## Project Structure

This is a **Laravel Breeze + Inertia** app. Frontend lives under `resources/js/`.
Breeze scaffolding stays capitalised (`Pages/`, `Components/`, `Layouts/`); our
domain code under `features/` and `shared/` is lowercase — the casing split is
intentional, it distinguishes framework scaffolding from app code.

```
resources/js/
├── app.tsx                          # Inertia entry point
├── ssr.tsx                          # SSR entry
├── bootstrap.ts                     # Axios + Ziggy setup
├── types/
│   ├── generated.d.ts               # ⚠️ Generated from PHP DTOs — do not edit
│   ├── index.d.ts                   # Global types (User, PageProps)
│   └── ziggy.d.ts
├── Layouts/                         # Breeze layouts (AuthenticatedLayout, GuestLayout)
├── Components/                      # Breeze UI primitives (TextInput, Modal, etc.) — don't modify
├── Pages/                           # Inertia pages (thin, 1:1 with routes)
│   ├── Daily/Index.tsx
│   ├── Weekly/Index.tsx
│   ├── Monthly/Index.tsx
│   ├── Moments/{Create,Edit}.tsx
│   ├── Config/Edit.tsx
│   └── Auth/                        # Breeze (don't modify)
│
├── features/                        # Business domains (our code)
│   ├── calendar/
│   │   ├── daily/
│   │   │   └── DailyContainer.tsx
│   │   ├── weekly/
│   │   │   ├── WeeklyContainer.tsx
│   │   │   ├── DayRow.tsx
│   │   │   └── DaySection.tsx
│   │   ├── monthly/
│   │   │   ├── MonthlyContainer.tsx
│   │   │   ├── MonthlyDayCell.tsx
│   │   │   └── MonthlyScheduleRow.tsx
│   │   ├── components/              # Cross-view reusables ONLY
│   │   │   ├── MomentAction.tsx     # Canonical row (pure presentation)
│   │   │   └── TimeSlotCell.tsx     # Single cell wrapper (handles mode/swipe/scheduling)
│   │   ├── hooks/
│   │   │   ├── useCalendarActions.ts
│   │   │   └── useSwipeComplete.ts
│   │   ├── utils.ts                 # Pure calendar helpers (getVisibleTimeSlots, snapToSlot…)
│   │   ├── types.ts                 # Re-exports generated DTO types under feature aliases
│   │   └── index.ts                 # Barrel
│   │
│   ├── moments/                     # Create/Edit form components + useMomentForm hook
│   ├── config/                      # ConfigForm + SleepHelper
│   └── scheduling/                  # useScheduling state machine + transition.ts
│
└── shared/
    ├── components/
    │   ├── calendar/                # Cross-feature calendar UI framework
    │   │   ├── CalendarNav.tsx
    │   │   ├── CalendarSection.tsx
    │   │   ├── CalendarSectionArticle.tsx
    │   │   ├── CalendarSectionHeader.tsx
    │   │   ├── CalendarProgressBar.tsx
    │   │   ├── CalendarViewToggle.tsx
    │   │   ├── CalendarMomentCard.tsx       # Draft/edit card — distinct from MomentAction
    │   │   ├── MomentFrequencyConfig.tsx
    │   │   ├── MomentIcon.tsx
    │   │   ├── FrequencyBadge.tsx
    │   │   └── AddMomentPopover.tsx
    │   ├── EmptyState.tsx
    │   ├── FlashMessage.tsx
    │   └── Cubes.tsx
    ├── constants/
    ├── types/
    │   └── enums.ts                 # MomentStatus, SchedulingKind
    └── utils/
```

---

## Architecture Principles

### 1. Feature-Based Organization

Group code by **business domain**, not by type. Each feature is self-contained.

### 2. Separation of Responsibilities

| Layer | Role |
|---|---|
| **Components** | UI rendering only |
| **Hooks** | UI/business logic |
| **Containers** | Orchestrate a view, manage local state, call hooks |
| **Pages** | Thin Inertia shells — compose features |

### 3. View Containers vs. Shared Row Components

The calendar feature follows a strict layering:

* **View containers** (`features/calendar/{daily,weekly,monthly}/`) orchestrate one view.
* **Shared row components** (`features/calendar/components/`) are reused by all three views — exactly two files: `MomentAction.tsx` (pure row presentation) and `TimeSlotCell.tsx` (cell wrapper with interaction modes).
* **View-specific helpers** (`DayRow`, `DaySection`, `MonthlyDayCell`, `MonthlyScheduleRow`) live alongside their container, never in `components/`.

If you add a fourth view, you should not need to create a new row component — reuse `MomentAction` + `TimeSlotCell`.

---

## Naming Conventions

| Concept | Pattern | Example |
|---|---|---|
| View orchestrator | `{Daily,Weekly,Monthly}Container` | `WeeklyContainer.tsx` |
| Canonical moment row | `MomentAction` | `features/calendar/components/MomentAction.tsx` |
| Cell wrapper | `TimeSlotCell` | `features/calendar/components/TimeSlotCell.tsx` |
| View-specific layout helper | Descriptive noun | `DayRow`, `MonthlyDayCell` |
| Cross-feature calendar UI framework | `Calendar*` prefix | `CalendarNav`, `CalendarProgressBar` |
| Hook | `useSomething` | `useCalendarActions`, `useSwipeComplete` |
| Component file | `Something.tsx` | one component per file |

**Do not** reintroduce these old names: `MomentDisplay`, `MomentActionItem`, `DailyTimeSlotCell`, `WeeklyGrid`, `MonthlyVerticalView`, `DailySlotCard`, `ConsistencyBar`, `CalendarMomentIcon`, `FrequencyBar`, `AddSlotPopover`.

---

## Rules

### Feature Isolation (STRICT)

Features must not import from other features.

```ts
// ❌ Bad
import { useMomentForm } from '@/features/moments';   // inside features/calendar/
```

Exception: `features/scheduling` exports type-only contracts (`SchedulingState`, `IsoDayNumber`) that calendar containers consume. Type-only imports across features are tolerated; runtime imports are not.

If something is needed by 2+ features and isn't a type contract, promote it to `shared/`.

### Components Stay Simple

Components render UI from props. No data fetching, no heavy state management inside a presentation component.

### Hooks for Logic

Business logic lives in custom hooks under `features/{name}/hooks/`.

### API Calls (Inertia Context)

With Inertia there's **no separate API service layer**:

* **Form mutations** → `useForm` from `@inertiajs/react`, or `router.post/put/delete`.
* **JSON endpoints** (e.g. toggle completion) → `router.post(...)` with `only: [...]` partial reload — see `useCalendarActions.toggleMoment`.
* **Don't** create `api.ts` wrappers for Inertia page routes.
* **Don't** use `fetch()` — axios is preconfigured with CSRF for the few cases that need raw JSON.

### Pages Are Thin

Pages compose features and layouts. They:
- Receive `App.Data.*PageData` props
- Render layout + container(s) + modals
- Wire shared hooks (`useScheduling`, `useMomentForm`)

No business logic inline.

### Types Come from Generated DTOs

Backend DTOs generate `resources/js/types/generated.d.ts` under the `App.Data.*` namespace. Frontend types should:

* Consume generated types directly: `props: App.Data.DailyPageData`
* Or re-export through `features/{name}/types.ts` under a domain alias (see `features/calendar/types.ts` for the pattern)

**Never** redefine a shape that already exists as a DTO. Regenerate types with:

```bash
php artisan typescript:transform
```

### Two Moment Shapes — Don't Mix Them

* `App.Data.SlotMomentData` — moment **as rendered in a calendar slot** (has `progress`, `status`, `instance_id`). Consumed by `MomentAction`, `TimeSlotCell`, containers.
* `App.Data.MomentData` — moment **for CRUD** (has `is_active`, `sort_order`, nested schedule/cue/reward). Consumed by `MomentForm`, edit/create pages.

A page never converts one to the other on the frontend — the backend decides which shape to send based on the route's purpose.

### Barrel Files

Each feature exposes a clean public API via `index.ts`:

```ts
export { default as DailyContainer } from './daily/DailyContainer';
export { default as MomentAction } from './components/MomentAction';
export { useCalendarActions } from './hooks/useCalendarActions';
export type * from './types';
```

Page imports should come from the barrel:

```ts
// ✅
import { DailyContainer, MomentAction, useCalendarActions } from '@/features/calendar';

// ❌ Deep path bypasses the barrel
import DailyContainer from '@/features/calendar/daily/DailyContainer';
```

### Shared Folder Discipline

Put code in `shared/` only if it's used by 2+ features AND generic (not domain-bound).

* `shared/components/calendar/` is the cross-feature UI framework — calendar layout primitives (Nav, Section, ProgressBar, etc.) and pure display helpers (`MomentIcon`, `FrequencyBadge`).
* `shared/components/calendar/CalendarMomentCard.tsx` is the draft/edit card. It's distinct from `MomentAction` (the canonical row) — different shape, different purpose, both kept.

### DRY (Use Carefully)

Duplicate 1–2 times → OK. Extract once the pattern is stable. Don't pre-abstract.

### Dependency Direction

```
types/  →  shared/  →  features/  →  Pages/  →  Layouts/
```

`Pages` import from `features/` and `shared/`, never the reverse. `features/` import from `shared/` and `types/`, never from sibling features (except type-only contracts, see above).

---

## React Gotchas

### ❌ Overusing `useEffect`

Don't sync Inertia props to state.

```ts
// ❌
useEffect(() => setMoments(props.day.slots), [props.day.slots]);

// ✅
const slots = props.day.slots;
```

### ❌ Derived State

Compute, don't store.

### ❌ Massive Components

Components over ~200 lines should be split. Containers can be a bit larger because they orchestrate; presentation components should be small.

---

## Copilot Guidance

When generating code:

* Place new domain logic in the right `features/{name}/` folder
* Pages stay thin — they compose feature containers
* Calendar row UI: reuse `MomentAction` — do not duplicate row markup
* Calendar cell wrappers: use `TimeSlotCell` with the appropriate `mode` prop
* Use `useForm` from `@inertiajs/react` for forms
* Use `route()` (Ziggy) for URLs — never hardcode paths
* Type everything from `App.Data.*` or feature `types.ts`
* No cross-feature runtime imports
* Keep code readable over clever

---

## Anti-Patterns to Avoid

* Fetching data inside components
* Syncing Inertia props into `useState` via `useEffect`
* Using `fetch()` instead of `axios`/`router.*` (CSRF is preconfigured on both)
* Hardcoding URL strings instead of `route()`
* Creating API service files for Inertia routes
* Putting domain components in `Components/` (Breeze generics only)
* Reintroducing the old calendar component names (see Naming Conventions)
* Duplicating row UI per view — always reuse `MomentAction`
* Cross-feature runtime imports
* Defining TypeScript shapes that duplicate a `App.Data.*` DTO

---

This document is the **default standard**. Deviations should be intentional and justified in the PR description.
