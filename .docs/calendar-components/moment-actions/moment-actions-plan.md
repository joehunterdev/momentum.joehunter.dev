# Moment Action Scheduler — Implementation Plan

## Goal
Replace the top-floating `FrequencyBadge` configuration flow with an **inline, in-row** scheduling flow. The first row the user touches (the **source**) is configured in place; the other matching slots render as **ghost** previews that the user can X out before a single Apply All commits everything.

---

## Architecture grounding

### Components actually in the flow today
| Concern | File | Notes |
|---|---|---|
| Page-level orchestrator (Weekly) | `resources/js/Pages/Weekly/Index.tsx` | Owns `useScheduling`, mounts `FrequencyBadge`. |
| Page-level orchestrator (Monthly) | `resources/js/Pages/Monthly/Index.tsx` | Mirrors Weekly. |
| Page-level orchestrator (Daily) | `resources/js/Pages/Daily/Index.tsx` | No recurrence. |
| Floating bar to remove from flow | `resources/js/shared/components/calendar/FrequencyBadge.tsx` | **This** is the bar the user is scrolling to, *not* `MomentFrequencyConfig.tsx`. |
| Slot wrapper | `resources/js/shared/components/calendar/CalendarSectionArticle.tsx` | Already picks `read` / `edit` / `draft` via `articleTargetsScheduling()`. |
| Row variants | `resources/js/features/calendar/components/MomentAction.tsx` | Variants today: `read` / `edit` / `draft`. |
| Scheduling state machine | `resources/js/features/scheduling/useScheduling.ts` | Already has `start / setName / setIcon / confirm / cancel / exit`. |
| Scheduling types | `resources/js/features/scheduling/types.ts` | `SchedulingState` = OneOff | Recurring (with `anchorDate`). |
| Monthly configure rows | `resources/js/features/calendar/monthly/MonthlyContainer.tsx` + `MonthlyScheduleRow.tsx` | Per-isoDayNumber rows — same shape as Weekly. |

### Key insight: the ghost overlay is already half-built
`CalendarSectionArticle.tsx:120-122` calls `articleTargetsScheduling()` and, when `scheduling.daysOfWeek` matches the article's isoDayNumber and `scheduling.time` matches the article's time, renders a `MomentAction variant='draft'` inline. That means **every matching slot across the view is already rendering a synchronized draft today** — typing in any of them updates `SchedulingState.name`, which re-renders all of them.

What is missing is only:
1. Visual distinction between **source** slot (the one the user clicked) and the rest (**ghosts**).
2. **Per-slot exclusion** so the X on a ghost removes that one slot from the eventual POST.
3. The **Apply / Apply All** affordance on the source row (replacing the floating FrequencyBadge confirm).

We do *not* need a new `GhostMomentOverlay` component — we extend what already iterates the slots.

### Monthly's data shape is not a special case
`MonthlyContainer.tsx:43-69` already renders one row per ISO day-of-week in configure mode. So "recurring monthly at this time on this day-of-week" reuses the existing `RecurringScheduling { daysOfWeek, time, anchorDate }` shape. No new `frequency` value, no new payload field beyond the per-slot exclusion list.

---

## State extensions

Extend `SchedulingState` so excluded slots can be carried until commit:

```ts
// features/scheduling/types.ts
interface RecurringScheduling extends SchedulingBase {
    kind: SchedulingKind.Recurring;
    daysOfWeek: IsoDayNumber[];
    time: string | null;
    anchorDate: string;             // already exists — identifies the SOURCE
    excludedDays?: IsoDayNumber[];  // NEW — ghost slots the user X'd
}
```

`anchorDate` already exists and is set by `handleStartScheduling` in the page files — we will reuse it to mark the source. For Monthly, the source is identified by `anchorIsoDay` (we add it; Monthly clicks pass an isoDay not a date).

```ts
// useScheduling.ts — add
function excludeDay(day: IsoDayNumber) { … }
function includeDay(day: IsoDayNumber) { … }   // undo X
function applyAll() { … }                       // alias of confirm
```

`articleTargetsScheduling()` (in `CalendarSectionArticle.tsx`) gets two derived returns:
- `targets: boolean` (unchanged)
- `role: 'source' | 'ghost' | null` — `source` when the article matches `anchorDate`/`anchorIsoDay`, `ghost` otherwise, `null` if excluded.

---

## `MomentAction` variants — additive

Keep all current variants. Add two:

| Variant | When | Visual | Buttons |
|---|---|---|---|
| `draft` | Source slot, before name+icon set | Dashed primary border, name input, icon picker | (unchanged today) |
| `source` | NEW. Source slot, after name+icon set | Solid dark purple (`--mm-secondary`) | ✓ Apply, ☑ Apply All |
| `ghost` | NEW. Non-source matching slot | Lighter purple (`--mm-secondary-light`), no input, read-only label | ✕ exclude |
| `read` / `edit` | Unchanged | Unchanged | Unchanged |

The source row's two buttons replace the floating `FrequencyBadge` confirm. ✓ Apply commits **only the source slot** (one-off for the anchor date+time). ☑ Apply All commits the source + all non-excluded ghosts in a single POST.

---

## Phases

### Phase 1 — Inline source row + remove the floating bar
**Goal:** end the scroll-to-top. Source slot is fully usable in place.

- [ ] Stop rendering `FrequencyBadge` from `Pages/Weekly/Index.tsx`, `Pages/Monthly/Index.tsx`. Leave the component file in place for now.
- [ ] In `CalendarSectionArticle.tsx`, add the `role: 'source' | 'ghost'` derivation in `articleTargetsScheduling()`.
- [ ] In `MomentAction.tsx`, allow the `draft` variant to render the ✓ Apply / ☑ Apply All buttons once `name.trim() !== ''`. (Transition `draft` → `source` is purely visual — same component, two states.)
- [ ] Wire ✓ Apply to a new `useScheduling.applySourceOnly()` which posts a one-off for `anchorDate + time`.
- [ ] Wire ☑ Apply All to `useScheduling.confirm()` (existing).
- [ ] Cancel (✕) on source row calls `scheduling.cancel()`.

**Acceptance:** clicking + in any empty slot lets you fill the row in place and commit without ever scrolling.

---

### Phase 2 — Ghost rows + per-slot exclusion
**Goal:** the other matching slots render as lighter, dismissable ghosts.

- [ ] Add `excludedDays` to `RecurringScheduling` in `features/scheduling/types.ts`.
- [ ] Add `excludeDay` / `includeDay` to `useScheduling.ts`. `articleTargetsScheduling()` returns `null` for excluded days so the slot reverts to its empty `+`.
- [ ] Add `ghost` variant to `MomentAction.tsx`: read-only icon + name (mirrored from `SchedulingState`), ✕ button top-right.
- [ ] `CalendarSectionArticle.tsx` renders `MomentAction variant='ghost'` for `role === 'ghost'`.
- [ ] `useScheduling.confirm()` omits `excludedDays` from the posted `days_of_week`.

**Acceptance:** in Weekly, configuring 09:00 on a Tuesday shows a dark source row on Tue and light ghost rows on Mon/Wed/Thu/Fri (weekday default). Clicking ✕ on Wed removes it from the eventual POST. Apply All persists Mon/Tue/Thu/Fri.

---

### Phase 3 — Monthly parity
**Goal:** same flow on Monthly without a schema change.

- [ ] Confirm Monthly configure mode reuses the same `useScheduling` + `articleTargetsScheduling()` plumbing (it does — see `MonthlyContainer.tsx:53-69` + `MonthlyScheduleRow.tsx`).
- [ ] Page click handler for Monthly empty rows seeds Recurring with `daysOfWeek: [clickedIsoDay]` initially? **Decision needed:** brief says "monthly recurring item at that time" — interpret as *all 7 isoDays* by default (apply across the month), or *just the clicked isoDay* (apply only on matching weekdays)? Recommendation: default to all 7 to match the "fills the month" mental model.
- [ ] No new payload fields; existing `frequency: 'recurring' | 'daily'` + `days_of_week` already encodes it.

**Acceptance:** Monthly behaves identically to Weekly. ✕ on a day-of-week ghost row drops it from `days_of_week`.

---

### Phase 4 — Daily (no recurrence)
**Goal:** no-op, but verify.

- [ ] In `Daily/Index.tsx`, click `+` seeds `SchedulingKind.OneOff` only. No ghost slots can match (there are no other days in the view). ✓ Apply is the only button shown.
- [ ] Hide ☑ Apply All on the source row when `scheduling.kind === OneOff`.

**Acceptance:** Daily creates a single one-off moment with no ghost rendering.

---

### Phase 5 — Re-skin existing conflict detection onto ghosts
**Goal:** reuse, don't reinvent.

`conflictCount` is already computed in `Pages/Weekly/Index.tsx:98-111`. `CalendarSectionArticle.tsx` already has a `conflictBadge` capability. We just route the same per-slot conflict information into ghost styling.

- [ ] Lift the per-slot conflict check out of the Index file's `reduce` into a small helper `hasSlotConflict(day, time)` in `features/scheduling/conflicts.ts`.
- [ ] In `CalendarSectionArticle.tsx`, when `role === 'ghost'` and the article already has a `moment`, render the ghost in amber (`--mm-warning`) with the existing conflict badge.
- [ ] Apply All offers two behaviours for conflicted slots: **Skip** (auto-exclude) or **Keep both** (post anyway). Replace is out of scope.

**Acceptance:** ghosts overlapping an existing moment render amber and are skipped by default on Apply All.

---

### Phase 6 — Cleanup
- [ ] Delete the `FrequencyBadge` import/mount sites once Phase 1 has shipped and stuck.
- [ ] Decide whether `FrequencyBadge.tsx` and `MomentFrequencyConfig.tsx` files remain. If unreferenced, delete them.
- [ ] Remove `onGhostNameChange` / `onGhostIconChange` prop names if they no longer make sense; the source row owns these now.

---

## SCSS

```scss
// Already exist
--mm-secondary: #8B5CF6;
--mm-warning:  #F59E0B;

// Add
--mm-secondary-light: #A78BFA;
--mm-secondary-rgb: 139, 92, 246;
--mm-secondary-light-rgb: 167, 139, 250;
--mm-warning-rgb: 245, 158, 11;

.moment-action--source {
    background: rgba(var(--mm-secondary-rgb), 0.14);
    border: 1px solid var(--mm-secondary);
}
.moment-action--ghost {
    background: rgba(var(--mm-secondary-light-rgb), 0.10);
    border: 1px dashed var(--mm-secondary-light);
}
.moment-action--ghost.moment-action--conflict {
    background: rgba(var(--mm-warning-rgb), 0.10);
    border-color: var(--mm-warning);
}
```

---

## Test plan

### Unit
- [ ] `articleTargetsScheduling()` returns `role: 'source'` for anchor, `'ghost'` for matching non-anchor, `null` for excluded.
- [ ] `useScheduling.excludeDay()` adds to `excludedDays`; `confirm()` omits them from `days_of_week`.
- [ ] `hasSlotConflict()` matches the current inline `conflictCount` logic.

### Integration
- [ ] Weekly: click empty Tue 09:00 → source Tue, ghosts Mon/Wed/Thu/Fri → X Wed → Apply All → 4 instances posted.
- [ ] Weekly: same flow → ✓ Apply (not All) → 1 one-off on Tue only.
- [ ] Monthly: click empty Mon row → source Mon, ghosts Tue–Sun → Apply All → recurring daily.
- [ ] Daily: click empty 09:00 → source only, no ghosts, no Apply All button → ✓ Apply commits one-off.
- [ ] Conflict: existing moment Wed 09:00 → start at Tue 09:00 → ghost Wed renders amber → Apply All defaults to Skip → Wed unchanged.

---

## Open questions (only what the brief did not answer)

1. **Monthly default day set.** All 7 isoDays (fills the month) or just the clicked isoDay (matches the weekly pattern semantics)? Recommendation: all 7.
2. **Conflict default action.** Skip vs Keep both as the default for Apply All. Recommendation: Skip.
3. **Source-row Cancel scope.** Does ✕ on the source row clear the whole scheduling state (current behaviour) or only undo the last edit? Recommendation: keep current — full cancel.

Items deferred by the brief (do not block Phase 1):
- Title min length, icon required, ghost cap for performance, keyboard shortcuts.

---

## Sequencing

Start at Phase 1 — it removes the scroll-to-top problem and lands the inline source row without touching state shape. Phases 2–4 are then incremental and independently mergeable. Phase 5 is a polish pass. Phase 6 deletes the floating bar files.
