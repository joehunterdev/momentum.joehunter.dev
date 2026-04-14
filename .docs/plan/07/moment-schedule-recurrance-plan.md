# Moment Schedule & Recurrence — Visual Planning UI

## Problem

The current moment creation flow is modal-based:

1. Click "+" on a weekly slot → popover ("Just once" / "Recurring") → modal form opens
2. Schedule section buried in an accordion — frequency, day pickers, preferred time
3. User clicks "Create" → moment appears on the grid

**What's missing:** there's no visual confirmation step. The user can't see *where* the moment will land across the week before committing. If two moments clash on the same time slot, there's no warning. The experience is blind — fill form fields, hope it looks right.

## Vision

Replace the hidden-accordion scheduling with a **visual schedule preview** that paints the moment onto the weekly grid *before* the user saves. The user sees exactly which slots they're committing to, and any conflicts are highlighted immediately.

---

## Design Principles

1. **Show, don't tell** — recurrence is spatial, not textual. The grid IS the schedule picker.
2. **Stay on the weekly page** — no new routes. The weekly grid doubles as the scheduling canvas.
3. **Progressive disclosure** — simple flows stay simple. Only show the overlay when scheduling complexity demands it.
4. **Conflict resolution is informational** — warn, don't block. Multiple moments per slot is valid (e.g. "Meditate" and "Morning hydration" both at 07:00).

---

## Architecture Decision: Weekly Page as Scheduling Canvas

**Why weekly (not a separate monthly/scheduling page):**

- The weekly grid already visualises time × days — it's the natural surface for "where will this land?"
- Adding another route fragments the experience. Users already navigate daily ↔ weekly — a third view adds cognitive load.
- Monthly view loses time granularity. A month grid can show *which days*, but not *which hour*. The weekly grid shows both.
- The data model (`moment_schedules.days_of_week` + `preferred_time`) maps directly to the weekly grid's axes (columns = days, rows = hours).

**The trade-off:** monthly visibility of recurrence patterns is sacrificed. This is acceptable because:
- Most habits recur weekly (daily, weekdays, MWF) — a single week shows the full pattern.
- A future "Schedule overview" panel (Phase 3) can show a compact monthly dot-calendar without a full route.

---

## Phases

### Phase 1 — Schedule Preview Overlay (MVP)

**Trigger:** When the MomentModal is open and the schedule section has valid data (frequency + days + time), the weekly grid behind the modal renders ghost/preview slots showing where the moment will appear.

#### UX Flow

```
1. User clicks "+" on Monday 08:00 → popover → "Recurring"
2. Modal opens — schedule section auto-expanded (already works today)
3. As user selects frequency / days / time:
   → Weekly grid (behind modal) shows ghost slots in real-time
   → Ghost = semi-transparent card with the moment colour + icon
4. User clicks "Create Moment"
   → Ghost slots replaced with real moment cards
```

#### Implementation

**New component: `SchedulePreviewOverlay`**
- Lives inside `WeeklyGrid`, renders conditionally when scheduling is active
- Receives: `{ frequency, days_of_week, preferred_time, color, icon, name }` via React context or lifted state
- Computes affected slots: iterates over the 7 visible days, applies `isScheduledFor()` logic client-side
- Renders ghost `SlotMomentCard` with `.slot-moment-card--ghost` modifier (opacity 0.4, dashed border, pulse animation)

**State flow:**
```
Weekly/Index.tsx
  ├── schedulePreview state: { frequency, days_of_week, preferred_time, color, icon, name } | null
  ├── MomentModal
  │     └── MomentForm → onScheduleChange callback → updates schedulePreview
  └── WeeklyGrid
        └── SchedulePreviewOverlay (reads schedulePreview)
              └── For each matching day+time: render ghost card in that TimeSlotCell
```

**Key detail — modal backdrop:** The modal currently uses Headless UI `Dialog` with a backdrop. For the preview to be visible, either:
- **(A)** Reduce backdrop opacity from default ~50% to ~15% so the grid is visible behind
- **(B)** Switch to a side panel / drawer instead of a centred modal — schedule fields on the right, grid on the left

Recommendation: **(A)** for Phase 1. It's the smallest change and the ghost slots will glow through. Phase 2 can explore (B).

**CSS:**
```scss
.slot-moment-card--ghost {
  opacity: 0.45;
  border: 2px dashed currentColor;
  animation: ghostPulse 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes ghostPulse {
  0%, 100% { opacity: 0.45; }
  50% { opacity: 0.25; }
}
```

#### Files Changed

| File | Change |
|------|--------|
| `Weekly/Index.tsx` | Add `schedulePreview` state, wire `onScheduleChange` to MomentModal |
| `MomentForm.tsx` | Accept `onScheduleChange` prop, call it when schedule fields change |
| `ScheduleFields.tsx` | Emit schedule data up via `onScheduleChange` on every field change |
| `WeeklyGrid.tsx` | Accept `schedulePreview` prop, pass to `DaySection` |
| `DaySection.tsx` | Accept `schedulePreview`, compute ghost slots for this day |
| `TimeSlotCell.tsx` | Render ghost `SlotMomentCard` when a preview matches this slot |
| `SlotMomentCard.tsx` | Add `--ghost` variant styling |
| `_weekly.scss` | Ghost card styles |
| `Modal.tsx` | Reduce backdrop opacity when `transparent` prop is true |

---

### Phase 2 — Conflict Detection & Highlighting

**Trigger:** When a preview ghost slot overlaps an existing moment at the same day + time.

#### Conflict Definition

A "conflict" occurs when:
- An existing moment already occupies the same `day × time` slot
- The preview moment would also be placed there

This is **not necessarily an error** — some users stack habits at the same time (e.g. "Morning hydration" + "Take vitamins" both at 07:00). So we **warn, don't block**.

#### UX

- Conflicting slots get a `.weekly-slot--conflict` modifier
- The slot shows both the existing card and the ghost card, stacked vertically (or the ghost overlaps with a red/amber border)
- A small conflict badge appears: `⚠️ 2 moments at this time`
- The modal shows a summary line: "⚠️ 3 conflicts on Mon, Wed, Fri at 08:00 — overlaps with 'Go to the gym'"

#### Implementation

**Conflict computation (client-side):**
```ts
function findConflicts(
  days: WeekDay[],
  preview: SchedulePreview
): ConflictSlot[] {
  const conflicts: ConflictSlot[] = [];
  for (const day of days) {
    if (!isScheduledOnDay(day, preview)) continue;
    const slot = day.slots.find(s => s.time === preview.preferred_time);
    if (slot?.moment) {
      conflicts.push({
        date: day.date,
        time: slot.time,
        existingMoment: slot.moment,
      });
    }
  }
  return conflicts;
}
```

**No backend validation change needed** — the DB allows multiple moments at the same time (different moment IDs, same `preferred_time`). Conflict detection is purely a UX feature.

#### Files Changed

| File | Change |
|------|--------|
| `WeeklyGrid.tsx` | Compute conflicts from `days` + `schedulePreview`, pass down |
| `TimeSlotCell.tsx` | Accept `conflict` prop, apply `--conflict` class |
| `MomentForm.tsx` | Accept `conflicts` prop, show summary warning above submit button |
| `_weekly.scss` | `.weekly-slot--conflict` styles (amber left border, subtle background) |

---

### Phase 3 — Schedule Summary Panel (Post-MVP)

A compact read-only summary of all scheduled moments, shown as a toggleable panel on the weekly page.

#### UX

- A "📋 Schedule" button in the weekly header toggles a right-side panel
- Panel shows a compact list: each moment with icon, name, frequency badge, days dots, time
- Clicking a moment scrolls/highlights its slots on the grid
- Optional: a mini monthly dot-grid showing which days of the month the moment is active

This gives the "monthly visibility" without a separate route. The panel reads from the same data already loaded by `WeeklyController`.

---

## Questions & Decisions

### Resolved

| # | Question | Decision |
|---|----------|----------|
| 1 | Where does schedule preview live? | Weekly page — the grid is the canvas |
| 2 | Monthly view needed? | No — weekly shows the full recurrence pattern. Monthly dot-grid is Phase 3 panel |
| 3 | Block conflicting moments? | No — warn only. Stacking habits at the same time is valid |
| 4 | Modal or drawer for form? | Modal (Phase 1) with reduced backdrop. Drawer explored in Phase 2+ |

### Open (need your input)

| # | Question | Options |
|---|----------|---------|
| 1 | Ghost slot interaction — should clicking a ghost slot on the grid toggle that day on/off in the schedule? | A) Yes — clicking the grid toggles days (most intuitive, but more complex) / B) No — days only toggled via the modal form (simpler) |
| 2 | Multi-moment stacking — when 2+ moments share a time, how to show them? | A) Stack vertically (slot grows taller) / B) Horizontal tabs/dots / C) Badge count with click to expand |
| 3 | Should "Just once" moments show any preview? | A) No — they're instant, preview adds no value / B) Yes — single ghost slot for confirmation |
| 4 | When editing an existing moment's schedule, should the grid show both the current placement (solid) and the new placement (ghost)? | A) Yes — diff view / B) No — just show the new placement as ghost |

---

## Data Model Notes

The current schema fully supports this feature — no migrations needed:

```
moment_schedules
├── frequency: enum('daily', 'weekly', 'custom')
├── days_of_week: JSON array [0=Sun, 1=Mon, ..., 6=Sat]  
└── preferred_time: TIME (HH:MM:SS)
```

Client-side schedule preview logic mirrors `Moment::isScheduledFor()`:
```ts
function isScheduledOnDay(day: WeekDay, preview: SchedulePreview): boolean {
  if (preview.frequency === 'daily') return true;
  if (!preview.days_of_week) return false;
  const dow = new Date(day.date).getDay(); // 0=Sun
  return preview.days_of_week.includes(dow);
}
```

---

## Effort Estimate

| Phase | Scope | Estimate |
|-------|-------|----------|
| Phase 1 | Ghost preview overlay + reduced backdrop | ~4-6 hours |
| Phase 2 | Conflict detection + UI warnings | ~2-3 hours |
| Phase 3 | Schedule summary panel | ~3-4 hours |

Phase 1 is the MVP and delivers the core value: **see your schedule before you commit**.
