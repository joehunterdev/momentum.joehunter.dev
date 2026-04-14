# Moment Schedule & Recurrence — Visual Planning UI

## Core Insight

> The habit is the schedule, not the label.
>
> A user saying "I want to meditate Mon–Fri at 07:00" is making a **commitment to show up**. The name "Meditate", the icon, the cue — those are details that refine the commitment. They can come later.
>
> The creation flow should mirror this: **claim your slots first, name them later.**

## Problem

The current moment creation flow is detail-first:

1. Click "+" on a weekly slot → popover ("Just once" / "Recurring") → modal form opens
2. First accordion: name, description, icon, colour (required before anything else)
3. Schedule section buried in second accordion — frequency, day pickers, preferred time
4. User clicks "Create" → moment appears on the grid

**What's wrong:**
- The schedule — the most important part — is secondary to naming
- No visual feedback of where the moment will land before saving
- No awareness of conflicts with existing moments
- The modal blocks the grid, so the user can't see the calendar while scheduling

## Vision

Two modes on the weekly page, toggled by a ⚙️ config button:

| Mode | Purpose | Grid shows |
|------|---------|------------|
| **Overview** (default) | See this week's progress at a glance | Existing moments with status dots |
| **Configure** | Schedule & manage moments | Editable grid — click slots to add, drag to reschedule, ghost previews |

In Configure mode, the flow is **schedule-first**:

```
1. User clicks ⚙️ → grid enters Configure mode
2. User clicks an empty slot (or drags across slots)
   → Ghost card appears immediately — "New Moment" placeholder
   → Recurrence controls appear inline or in a minimal side panel
3. As user adjusts frequency/days, ghost cards update in real-time
4. User sees the full pattern → clicks "Confirm"
   → Moment is created with schedule locked in
   → A toast/prompt says "Add details?" — user can name it, add icon, etc. now or later
5. Unnamed moments appear as "Untitled Moment" with a subtle "✏️ add details" nudge
```

---

## Design Principles

1. **Schedule first, details later** — the commitment to show up is the primary action. Name, icon, cue, reward are refinements.
2. **Show, don't tell** — recurrence is spatial. The grid IS the schedule picker. No hidden form fields.
3. **Two modes, one page** — Overview for progress, Configure for management. No new routes.
4. **Conflict resolution is informational** — warn, don't block. Multiple moments per slot is valid.
5. **Unnamed is valid** — a moment without a name still has a schedule. Nudge but don't require.

---

## Architecture: Weekly Page with Mode Toggle

### Overview Mode (default)
- Current weekly grid behaviour — read-only progress view
- Shows existing moments with status dots (completed/pending/missed)
- No "+" buttons, no popover — this is the "how did my week go?" view
- Header: `DateSelectorBar` + ⚙️ Configure button

### Configure Mode
- Same weekly grid structure, but interactive
- Empty slots show dashed "+" affordance (as they do today)
- Clicking a slot starts the schedule-first creation flow
- Existing moments show edit/delete controls
- Ghost preview overlay for new/edited schedules
- Header: `DateSelectorBar` + ✕ Exit / "Done" button

### Mode toggle

```
[Overview mode]                    [Configure mode]
┌──────────────────────┐          ┌──────────────────────┐
│ 13 Apr – 19 Apr  ⚙️  │    →    │ 13 Apr – 19 Apr  ✕   │
├──────────────────────┤          ├──────────────────────┤
│  Mon  Tue  Wed  Thu  │          │  Mon  Tue  Wed  Thu  │
│  ●    ●    ○    ·    │          │  ✏️   ✏️   +    +    │
│  ●    ○    ·    ·    │          │  ✏️   +    +    +    │
│  status dots only    │          │  ghost slots, edit,  │
│                      │          │  add, drag           │
└──────────────────────┘          └──────────────────────┘
```

---

## Phases

### Phase 1 — Mode Toggle + Schedule-First Creation (MVP)

#### 1A: Weekly mode toggle

- Add `mode` state to `Weekly/Index.tsx`: `'overview' | 'configure'`
- ⚙️ button in the header toggles mode
- In overview mode: strip the "+" buttons and popover from `TimeSlotCell` — read-only
- In configure mode: show "+" affordances and enable the creation flow
- Existing moment cards: overview shows status dot only; configure shows edit ✏️ button

#### 1B: Schedule-first creation flow

**The key change:** when the user clicks "+" in configure mode, don't open a full form modal. Instead:

1. **Inline ghost card** appears in the clicked slot — "New Moment" placeholder with the slot's time as `preferred_time`
2. **Recurrence bar** appears (floating or pinned below the header):
   - Frequency toggle: `Daily | Weekdays | Custom`
   - Day pills: `M T W T F S S` — toggle on/off
   - As the user toggles, ghost cards appear/disappear across the grid in real-time
3. **Confirm button** on the recurrence bar → creates the moment with:
   - `name: null` (or "Untitled Moment")
   - `preferred_time`: from clicked slot
   - `frequency` + `days_of_week`: from recurrence bar
   - All other fields blank
4. **Post-creation nudge**: inline "Name this moment?" prompt on the card, or a toast linking to edit

**Why this works:**
- The user's eyes never leave the grid — they see the spatial impact of their schedule choice
- The recurrence bar is minimal — 2 controls (frequency + days) vs the full 4-accordion modal
- Details (name, icon, cue, reward) are deferred — accessible via the edit flow when the user is ready

#### Component design

**New: `RecurrenceBar`**
```tsx
interface RecurrenceBarProps {
    time: string;                    // from clicked slot
    frequency: string;               // 'daily' | 'weekly' | 'custom'
    daysOfWeek: number[];
    onChange: (frequency: string, days: number[]) => void;
    onConfirm: () => void;
    onCancel: () => void;
}
```
- Pinned below the header or floating above the grid
- Compact horizontal layout: `[Daily] [Weekdays] [Custom]  [M][T][W][T][F][S][S]  [✓ Confirm] [✕]`
- Only visible when actively scheduling a new moment

**Updated: `TimeSlotCell`**
- Accepts `mode: 'overview' | 'configure'`
- Overview: no click handler, no "+", just status display
- Configure: "+" button, click → starts schedule flow

**Updated: `SlotMomentCard`**
- Accepts `variant: 'overview' | 'configure' | 'ghost'`
- Overview: status dot + name (read-only)
- Configure: status dot + name + ✏️ edit + 🗑️ delete
- Ghost: dashed border, pulsing opacity, "New Moment" placeholder text

#### State flow

```
Weekly/Index.tsx
  ├── mode: 'overview' | 'configure'
  ├── scheduling: { time, frequency, daysOfWeek } | null   ← active when placing a new moment
  │
  ├── Header
  │     ├── DateSelectorBar
  │     └── mode === 'overview' ? ⚙️ ConfigureButton : ✕ DoneButton
  │
  ├── scheduling !== null ? <RecurrenceBar .../> : null
  │
  ├── WeeklyGrid
  │     └── DaySection → TimeSlotCell
  │           ├── mode === 'overview': read-only card
  │           ├── mode === 'configure' && has moment: editable card
  │           ├── mode === 'configure' && empty && matches scheduling: ghost card
  │           └── mode === 'configure' && empty: "+" button
  │
  └── (no MomentModal for creation — only for editing details later)
```

#### Files changed

| File | Change |
|------|--------|
| `Weekly/Index.tsx` | Add `mode` + `scheduling` state, RecurrenceBar, mode toggle |
| `WeeklyGrid.tsx` | Accept `mode` + `scheduling` props, pass down |
| `DaySection.tsx` | Accept `mode` + `scheduling`, compute ghost slots |
| `TimeSlotCell.tsx` | Accept `mode` + `isGhost`, conditionally render + / ghost / read-only |
| `SlotMomentCard.tsx` | Accept `variant` prop for overview / configure / ghost rendering |
| **New:** `RecurrenceBar.tsx` | Compact frequency + days toggle bar |
| `_weekly.scss` | Ghost card styles, recurrence bar styles, mode transitions |
| `MomentController.php` | Allow `name` to be nullable on store (for schedule-first creation) |
| `moments` migration | Make `name` column nullable (or default to 'Untitled Moment') |

---

### Phase 2 — Ghost Preview + Conflict Detection

Once Phase 1 is working (mode toggle + recurrence bar + ghost slots), layer on:

#### 2A: Ghost preview polish
- Ghost cards show the moment's colour (if set) or a default indigo
- Smooth CSS transitions when ghost cards appear/disappear as days are toggled
- Ghost slots gently pulse to draw attention

#### 2B: Conflict detection
- When a ghost slot overlaps an existing moment at the same day × time:
  - Slot gets `.weekly-slot--conflict` amber border
  - Small warning badge: `⚠️ overlaps "Go to the gym"`
  - RecurrenceBar shows: `⚠️ 3 conflicts` with hover detail
- Informational only — user can still confirm

#### CSS

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

.weekly-slot--conflict {
  border-left: 3px solid #f59e0b;
  background: rgba(245, 158, 11, 0.06);
}
```

#### Files changed

| File | Change |
|------|--------|
| `WeeklyGrid.tsx` | Compute conflicts array from `days` + `scheduling` |
| `TimeSlotCell.tsx` | Accept `conflict` prop, apply warning class |
| `RecurrenceBar.tsx` | Show conflict count + detail |
| `_weekly.scss` | Ghost + conflict styles |

---

### Phase 3 — Detail Enrichment + Schedule Overview

#### 3A: "Name this moment" inline prompt
- Newly created unnamed moments show an inline text input on the card
- User types a name → saves inline (no modal needed)
- Cards without a name show as "Untitled" with a subtle `✏️ name this` nudge
- Clicking the nudge or the edit button opens the full MomentModal for all details

#### 3B: Schedule overview panel
- ⓘ button in configure mode header → toggles a right-side panel
- Panel lists all moments: icon + name + frequency badge + day dots + time
- Clicking a moment highlights its slots on the grid
- Optional: mini monthly dot-grid per moment

---

## Revised Creation Flow (Summary)

### Before (detail-first)
```
Click "+" → Popover → Modal (name, desc, icon, colour, schedule, cue, reward) → Save
```
**7 form fields before the user sees where the moment lands.**

### After (schedule-first)
```
Click "+" → Ghost appears → Recurrence bar (frequency + days) → Confirm → Moment on grid
         → Later: "Name this?" → Optional: full detail edit
```
**2 controls (frequency + days) with real-time visual feedback. Details when ready.**

---

## Questions & Decisions

### Resolved

| # | Question | Decision |
|---|----------|----------|
| 1 | Where does scheduling live? | Weekly page — Configure mode |
| 2 | What's the primary action? | Claim the schedule (time + recurrence). Details are secondary. |
| 3 | Modal for creation? | No — inline RecurrenceBar + ghost cards. Modal only for editing details. |
| 4 | Block conflicting moments? | No — warn only. Stacking is valid. |
| 5 | Separate schedule page? | No — mode toggle on weekly keeps it one route. |
| 6 | Can moments be unnamed? | Yes — "Untitled Moment" with nudge to add details later. |

### Open (need your input)

| # | Question | Options |
|---|----------|---------|
| 1 | Ghost slot click — should clicking a ghost card remove that specific day from the schedule? | A) Yes — direct manipulation / B) No — only via day pills on RecurrenceBar |
| 2 | Multi-moment stacking — when 2+ moments share a time, how to show them? | A) Stack vertically (slot grows) / B) Badge count with expand / C) Horizontal mini-cards |
| 3 | Overview mode — should it show "+" buttons at all, or be purely read-only? | A) Purely read-only (current plan) / B) Keep "+" but it switches to configure mode first |
| 4 | Quick-add shortcut — in configure mode, should dragging across multiple slots on the same day set a time range? | A) Yes — drag Mon 07:00 to 09:00 = schedule for that block / B) No — one slot at a time (simpler) |

---

## Data Model Notes

**One change needed:** `moments.name` must become nullable (or default to `'Untitled Moment'`).

```sql
-- Migration
ALTER TABLE moments MODIFY name VARCHAR(255) NULL DEFAULT NULL;
```

Everything else stays the same:

```
moment_schedules
├── frequency: enum('daily', 'weekly', 'custom')
├── days_of_week: JSON array [0=Sun, 1=Mon, ..., 6=Sat]
└── preferred_time: TIME (HH:MM:SS)
```

---

## Effort Estimate

| Phase | Scope | Estimate |
|-------|-------|----------|
| Phase 1A | Mode toggle (overview ↔ configure) | ~2-3 hours |
| Phase 1B | Schedule-first flow (RecurrenceBar + ghost slots + backend) | ~4-5 hours |
| Phase 2 | Ghost polish + conflict detection | ~3-4 hours |
| Phase 3 | Inline naming + schedule overview panel | ~3-4 hours |

Phase 1 is the MVP: **toggle into configure mode, click a slot, set recurrence visually, confirm. Name it later.**
