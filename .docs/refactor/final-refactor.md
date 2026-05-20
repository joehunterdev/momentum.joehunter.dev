# Final Architecture Refactor Plan

## Overview

This refactor aligns frontend and backend around a clean, DRY domain model for the calendar feature. The driving goal is **one canonical row component** (`MomentAction`) reused across Daily, Weekly, and Monthly views — so adding a new view never means duplicating row markup again.

**What changes:**
1. **Frontend:** `features/calendar/` reorganizes into per-view subfolders (`daily/`, `weekly/`, `monthly/`) with a shared `components/` directory for reusables.
2. **Frontend:** `MomentDisplay` is renamed/rebuilt as `MomentAction` — the single source of truth for rendering a moment in any view's row.
3. **Frontend:** Row wrappers (`DailyTimeSlotCell`, `TimeSlotCell`) collapse into a single cell that hosts `MomentAction`.
4. **Backend:** Already done — `CalendarService` + FormRequests + DTOs are in place.

**Why:** The current state mixes terminology (Cell / Card / Grid / Slot / Vertical / Row) and splits row UI across `MomentDisplay`, `DailyTimeSlotCell`, `TimeSlotCell`, and `DailySlotCard`. The app's purpose is to demonstrate clean React reusability, so the row UI must collapse to one component.

---

## Locked-in decisions

| Decision | Choice | Rationale |
|---|---|---|
| **View folder layout** | `features/calendar/{daily,weekly,monthly}/` subfolders | Keeps calendar as the domain home; view-specific containers grouped by view; shared row UI stays at calendar root. |
| **Row component name** | `MomentAction` | Reflects the app's purpose (act on a moment). Replaces `MomentDisplay` / `MomentActionItem`. |
| **DTO name** | `SlotMomentData` (unchanged) | "Slot" is the backend domain term for a time bucket; DTO shape is independent of UI naming. |
| **Backend FormRequests** | Already extracted | `StoreMomentRequest`, `UpdateMomentRequest`, `UpdateUserConfigRequest` — done. |

---

## End-state target

### Frontend file tree

```
resources/js/
├── Pages/                              # Thin Inertia containers
│   ├── Daily/Index.tsx                 # Renders <DailyContainer />
│   ├── Weekly/Index.tsx                # Renders <WeeklyContainer />
│   ├── Monthly/Index.tsx               # Renders <MonthlyContainer />
│   ├── Moments/{Create,Edit}.tsx
│   └── Config/Edit.tsx
│
├── features/
│   ├── calendar/
│   │   ├── daily/
│   │   │   └── DailyContainer.tsx      # Orchestrates daily slot list
│   │   ├── weekly/
│   │   │   ├── WeeklyContainer.tsx     # Orchestrates 7-day grid
│   │   │   ├── DayRow.tsx              # Weekly-specific layout helper
│   │   │   └── DaySection.tsx          # Weekly-specific layout helper
│   │   ├── monthly/
│   │   │   ├── MonthlyContainer.tsx    # Orchestrates monthly layout
│   │   │   ├── MonthlyDayCell.tsx
│   │   │   └── MonthlyScheduleRow.tsx
│   │   ├── components/                 # Shared across all views
│   │   │   ├── MomentAction.tsx        # ⭐ Canonical row component
│   │   │   └── TimeSlotCell.tsx        # Single cell wrapper (merged daily/weekly)
│   │   ├── hooks/
│   │   │   ├── useCalendarActions.ts
│   │   │   └── useSwipeComplete.ts
│   │   ├── utils.ts                    # Pure calendar helpers
│   │   ├── types.ts
│   │   └── index.ts                    # Barrel
│   │
│   ├── moments/                        # ✅ unchanged
│   ├── config/                         # ✅ unchanged
│   └── scheduling/                     # ✅ unchanged
│
└── shared/components/calendar/         # Cross-feature calendar UI framework
    ├── CalendarNav.tsx
    ├── CalendarSection.tsx
    ├── CalendarSectionArticle.tsx
    ├── CalendarSectionHeader.tsx
    ├── CalendarProgressBar.tsx
    ├── CalendarViewToggle.tsx
    ├── CalendarMomentCard.tsx          # Distinct from MomentAction — used in modals/lists
    ├── MomentFrequencyConfig.tsx
    ├── MomentIcon.tsx
    ├── FrequencyBadge.tsx
    ├── AddMomentPopover.tsx
    ├── types.ts
    └── utils.ts                        # OR move to features/calendar/utils.ts (see Phase D)
```

### Naming convention

| Concept | Name | Where |
|---|---|---|
| View orchestrator | `{Daily,Weekly,Monthly}Container` | `features/calendar/{view}/` |
| **Canonical moment row** | **`MomentAction`** | `features/calendar/components/` |
| Cell wrapper (handles swipe, scheduling, etc.) | `TimeSlotCell` | `features/calendar/components/` |
| View-specific layout helper | `DayRow`, `DaySection`, `MonthlyDayCell`, `MonthlyScheduleRow` | `features/calendar/{view}/` |
| Calendar UI framework (nav, progress, sections) | `Calendar*` | `shared/components/calendar/` |
| Backend DTO | `SlotMomentData` | `app/Data/` |

### Component responsibility matrix

| Type | Location | Examples | Purpose |
|---|---|---|---|
| **View Container** | `features/calendar/{view}/` | `DailyContainer`, `WeeklyContainer`, `MonthlyContainer` | Orchestrate layout, manage state, call hooks |
| **View-specific helper** | `features/calendar/{view}/` | `DayRow`, `MonthlyDayCell` | Layout primitives only used by one view |
| **Shared row component** | `features/calendar/components/` | `MomentAction`, `TimeSlotCell` | Reused across all views |
| **Cross-feature calendar UI** | `shared/components/calendar/` | `CalendarNav`, `CalendarProgressBar` | UI framework, no calendar business logic |
| **Business logic** | `features/calendar/hooks/` | `useCalendarActions`, `useSwipeComplete` | Toggle, complete, scheduling triggers |

---

## MomentAction — the canonical row

`MomentAction` is the single component that renders a moment inside any view's row. Start minimal — just data display — and add interactions later.

**Props (v1):**
```typescript
interface MomentActionProps {
    moment: SlotMomentData;      // backend DTO shape (App.Data.SlotMomentData)
    progress?: number;            // override; defaults to moment.progress
}
```

**Renders:**
- Icon (left)
- Title + optional description (body)
- Progress fill as background (`--moment-progress` CSS var)

**Explicitly out of scope for v1:**
- Swipe-to-complete (lives in `TimeSlotCell` via `useSwipeComplete`)
- Tap / click handlers (passed by parent if needed)
- Scheduling popover (lives in `TimeSlotCell`)

**Why split row content from cell behavior:** `MomentAction` becomes pure presentation. Every view can render it identically. `TimeSlotCell` adds view-specific interaction by wrapping `MomentAction`.

---

## Phases

### ✅ Completed

| Phase | Status | Outcome |
|---|---|---|
| Hook extraction | ✅ Done | `useCalendarActions` exists; Daily page consumes it |
| Display components → `shared/` | ✅ Done | `MomentDisplay`, `MomentIcon`, `FrequencyBadge`, `AddMomentPopover` relocated |
| Dead code removed | ✅ Done | `ConsistencyBar`, `MomentDetailTicker`, `DailySlotCard` deleted |
| View containers renamed | ✅ Done | `WeeklyView`, `MonthlyView` exist (will be re-renamed to `*Container` in Phase A) |
| Backend FormRequests | ✅ Done | `StoreMomentRequest`, `UpdateMomentRequest`, `UpdateUserConfigRequest` |

---

### Phase A: Restructure into view subfolders

**Goal:** Group view containers and their helpers by view.

**Moves:**

| From | To | Notes |
|---|---|---|
| `features/calendar/components/WeeklyView.tsx` | `features/calendar/weekly/WeeklyContainer.tsx` | Rename suffix `View` → `Container` |
| `features/calendar/components/MonthlyView.tsx` | `features/calendar/monthly/MonthlyContainer.tsx` | Rename suffix `View` → `Container` |
| `features/calendar/components/DayRow.tsx` | `features/calendar/weekly/DayRow.tsx` | Weekly-only helper |
| `features/calendar/components/DaySection.tsx` | `features/calendar/weekly/DaySection.tsx` | Weekly-only helper |
| `features/calendar/components/MonthlyDayCell.tsx` | `features/calendar/monthly/MonthlyDayCell.tsx` | Monthly-only helper |
| `features/calendar/components/MonthlyScheduleRow.tsx` | `features/calendar/monthly/MonthlyScheduleRow.tsx` | Monthly-only helper |

**Create:**
- `features/calendar/daily/DailyContainer.tsx` — extract orchestration currently inlined in `Pages/Daily/Index.tsx`

**Update:**
- `features/calendar/index.ts` — barrel exports point at new paths
- `Pages/{Daily,Weekly,Monthly}/Index.tsx` — render the new `*Container` components

**Success criteria:**
- `features/calendar/{daily,weekly,monthly}/` each contain their container + any view-specific helpers
- `features/calendar/components/` contains only cross-view reusables
- `npx tsc --noEmit` passes
- All three views render and function identically

---

### Phase B: Build MomentAction (the DRY win)

**Goal:** Replace `MomentDisplay` with `MomentAction` — the canonical row component.

**Steps:**
1. Create `features/calendar/components/MomentAction.tsx` with the v1 props/markup above.
2. Update all consumers to import `MomentAction` instead of `MomentDisplay`:
   - `DailyTimeSlotCell.tsx` → `TimeSlotCell.tsx` (Phase C will merge these)
   - `MonthlyScheduleRow.tsx`
   - `CalendarSectionArticle.tsx`
3. Delete `shared/components/calendar/MomentDisplay.tsx`.
4. Update `shared/components/calendar/index.ts` barrel.

**Decision point:** `MomentAction` consumes `SlotMomentData` directly from `App.Data.SlotMomentData` rather than a frontend `CalendarMoment` alias. This collapses the type indirection.

**Success criteria:**
- One row component (`MomentAction`) used by Daily, Weekly, Monthly
- No remaining references to `MomentDisplay` or `MomentActionItem`
- Visual parity with current row rendering
- Background progress bar visible on all three views

---

### Phase C: Merge cell wrappers

**Goal:** One `TimeSlotCell` for all views, replacing `DailyTimeSlotCell` + `TimeSlotCell`.

**Approach:**
```typescript
interface TimeSlotCellProps {
    slot: TimeSlotData;
    date: string;
    mode: 'overview' | 'configure';
    enableSwipe?: boolean;           // only true for Daily configure mode
    onToggle?: (momentId: number) => void;
    onSchedule?: (time: string) => void;
}
```

**Steps:**
1. Fold `DailyTimeSlotCell` logic into `TimeSlotCell` behind `enableSwipe` prop.
2. `useSwipeComplete` only attaches handlers when `enableSwipe={true}`.
3. Daily container passes `enableSwipe` based on `mode`; Weekly never enables swipe.
4. Delete `DailyTimeSlotCell.tsx`.

**Success criteria:**
- Single `TimeSlotCell` component
- Swipe still works in Daily configure mode
- Weekly view has no swipe behavior
- `features/calendar/components/` reaches **2 files**: `MomentAction.tsx` + `TimeSlotCell.tsx`

---

### Phase D: Reconcile utils.ts location

**Current state:** `getVisibleTimeSlots` lives in `shared/components/calendar/utils.ts` but is calendar business logic, not shared UI utility.

**Decision:** Move to `features/calendar/utils.ts` (matches backend's `CalendarService` helpers).

**Steps:**
1. Move pure calendar functions (`getVisibleTimeSlots`, time snapping, progress helpers) to `features/calendar/utils.ts`.
2. Leave only UI-formatting helpers in `shared/components/calendar/utils.ts` (if any remain — otherwise delete it).
3. Update imports.

**Success criteria:**
- Calendar business logic lives in `features/calendar/utils.ts`
- `shared/components/calendar/utils.ts` only holds cross-feature UI helpers (or is removed)

---

### Phase E: Client-side validation (deferred)

Defer until the structural refactor is stable. When implemented, add validation to `useMomentForm` mirroring backend `StoreMomentRequest` rules. Out of scope for this plan.

---

## Execution order

### Sprint 1 — Structural
1. **Phase A:** Restructure into view subfolders
2. **Phase B:** Build `MomentAction`

**Gate:** TypeScript clean, all three views render with the new row component.

### Sprint 2 — Consolidation
3. **Phase C:** Merge cell wrappers
4. **Phase D:** Move utils

**Gate:** `features/calendar/components/` = 2 files. Visual parity confirmed in browser.

### Sprint 3 — Polish (deferred)
5. **Phase E:** Client-side validation

---

## Success metrics

**End state:**
- `features/calendar/components/` has **2 files** (`MomentAction.tsx`, `TimeSlotCell.tsx`)
- `features/calendar/{daily,weekly,monthly}/` each hold one container + view-specific helpers
- Zero references to old names: `MomentDisplay`, `MomentActionItem`, `DailyTimeSlotCell`, `WeeklyGrid`, `MonthlyVerticalView`
- Backend unchanged from current state (FormRequests + `CalendarService` already aligned)
- One row component renders moments in all three views

**DRY check:** Adding a new calendar view should require:
1. A new `features/calendar/{newview}/{NewView}Container.tsx`
2. A new Page that renders it
3. **Zero** new row UI

If a future view needs to duplicate `MomentAction`, the refactor failed.

---

## Rollback strategy

- Phase A is mechanical (file moves + import updates) — easy to revert.
- Phase B is the only behavioral change — keep `MomentDisplay` in place until all consumers are migrated, then delete in a separate commit.
- Phase C touches interaction logic — test swipe in Daily configure mode before deleting `DailyTimeSlotCell`.

Commit per phase; do not bundle.

---

## Testing checklist (run after each phase)

### Daily View
- [ ] Page loads, slots render
- [ ] `MomentAction` displays icon, title, description, progress background
- [ ] Swipe-to-complete works in configure mode
- [ ] Day navigation works

### Weekly View
- [ ] 7-day layout renders
- [ ] `MomentAction` displays identically to Daily
- [ ] No swipe behavior
- [ ] Week navigation works

### Monthly View
- [ ] Month calendar renders
- [ ] `MomentAction` displays in schedule rows
- [ ] Month navigation works

### Moment CRUD
- [ ] Create / Edit / Delete moment
- [ ] Validation errors display (FormRequest behavior)

### Config
- [ ] Wake/sleep + office hours update
- [ ] Validation errors display

---

## References

- Brief: `.docs/calendar-components/moment-action/moment-action-brief.md`
- Frontend architecture: `.docs/architecture-diagrams/architecture-front.md`
- Backend architecture: `.docs/architecture-diagrams/architecture-back.md`
- Patterns to mirror: `features/moments/`, `features/config/`, `features/scheduling/`
