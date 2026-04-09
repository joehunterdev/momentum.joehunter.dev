# Weekly View — Moment Creation Flow

> Extends `weekly-implementation.md` §4.7 "Add moment flow".
> Covers the popover interaction, recurring preview highlights, and two-step creation.

---

## 1. Interaction Summary

Empty slots show a `+` button. Tapping it opens a **popover** with two options:

1. **📌 Just once** — create a one-off moment for this specific day + time
2. **🔁 Weekdays** — create a recurring moment (Mon–Fri) at this time

Choosing "Weekdays" highlights all matching weekday slots across the grid before opening the modal, so the user can see exactly where the moment will land.

---

## 2. Popover Design

```
┌─────────────────────────────┐
│  📌  Just once              │
├─────────────────────────────┤
│  🔁  Weekdays               │
└─────────────────────────────┘
```

- Appears directly adjacent to the `+` button (above on mobile, below on desktop)
- Closes on outside click / tap or `Escape`
- No drag, no long-press — single tap to open, single tap to choose
- Compact: two rows, full-width of the slot cell

---

## 3. Two-Step Flow

The user can approach moment creation from **either direction**:

### Step A → B: Create moment first, then schedule

1. Tap `+` → popover appears
2. Tap **"Just once"**
3. Modal opens with:
   - Schedule section **collapsed** (not the focus)
   - `preferred_time` pre-filled from the slot (e.g. `09:00`)
   - `frequency` = `daily` (default, but only one instance will exist)
   - `days_of_week` = `[]` (empty — daily means every day)
4. User fills in name, icon, colour etc.
5. Submit → moment created with a single instance for that date

### Step A → C: Create recurrence first, then moment

1. Tap `+` → popover appears
2. Tap **"Weekdays"**
3. **Before modal opens:** all Mon–Fri slots at that time across the grid get a pulsing highlight (preview)
4. Modal opens with:
   - Schedule section **open by default** (it's the focus)
   - `frequency` = `weekly`
   - `days_of_week` = `[1, 2, 3, 4, 5]` (Mon–Fri)
   - `preferred_time` pre-filled from the slot
   - User can **tweak days** (toggle Sat/Sun on, toggle individual weekdays off)
5. As user toggles days, the grid highlights update live (stretch goal)
6. User fills in name, icon, colour etc.
7. Submit → recurring moment created with schedule

---

## 4. Slot Highlight Preview

When "Weekdays" is selected:

- All **empty** slots on Mon–Fri at the selected time get class `weekly-slot--highlight`
- Visual: pulsing indigo border + light indigo background
- Slots that already have a moment are **not** highlighted (conflict indicator could come later)
- Highlight clears when:
  - Modal is closed (cancel)
  - Modal is submitted (success)
  - User navigates away

### State flow

```
Index.tsx state:
  highlightTime: string | null     // e.g. '09:00' or null

  ┌──────────┐   tap "Weekdays"   ┌────────────────────┐
  │ null      │ ────────────────► │ '09:00'            │
  └──────────┘                    └────────────────────┘
                                         │
                              modal close / submit
                                         │
                                         ▼
                                  ┌──────────┐
                                  │ null      │
                                  └──────────┘
```

Prop chain: `Index → WeeklyGrid → DaySection → TimeSlotCell`

`TimeSlotCell` receives `highlightTime` and applies `.weekly-slot--highlight` when:
- `slot.time === highlightTime`
- `!slot.moment` (slot is empty)
- `!isWeekend` (Mon–Fri only)

---

## 5. Component Changes

### `AddSlotPopover.tsx` (new)

```
features/weekly/components/AddSlotPopover.tsx
```

- Props: `isOpen`, `onClose`, `onSelectOnce`, `onSelectRecurring`
- Renders two button rows
- Uses `useEffect` for outside-click dismiss
- Positioned via CSS (relative parent)

### `TimeSlotCell.tsx` (updated)

- `+` button onClick → sets local `popoverOpen` state
- Passes `onSelectOnce` / `onSelectRecurring` up to parent
- Accepts `highlightTime?: string` prop
- Applies `.weekly-slot--highlight` when matching

### `DaySection.tsx` (updated)

- Passes `highlightTime` through to `TimeSlotCell`

### `WeeklyGrid.tsx` (updated)

- Passes `highlightTime` through to `DaySection`

### `Index.tsx` (updated)

- New state: `highlightTime`
- `onAddMoment` callback now receives `(date, time, mode: 'once' | 'recurring')`
- Sets `highlightTime` for recurring, clears on modal close

### `MomentModal.tsx` + `MomentForm.tsx` (updated)

- Accept optional `defaultValues?: Partial<MomentFormData>`
- `MomentForm` merges defaults into initial form state
- When `defaultValues.frequency` is provided, open the schedule section by default

---

## 6. SCSS Additions

```scss
// ── Popover ───────────────────────────────────────────────
.slot-popover {
    position: absolute;
    z-index: 30;
    background: #fff;
    border: 1px solid $border;
    border-radius: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    min-width: 10rem;

    &__option {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
        padding: 0.625rem 0.875rem;
        font-size: 0.8125rem;
        font-weight: 500;
        color: #374151;
        border: none;
        background: none;
        cursor: pointer;
        transition: background 0.1s;

        &:hover {
            background: rgba(99, 102, 241, 0.06);
            color: var(--mm-primary, #6366f1);
        }

        & + & {
            border-top: 1px solid $border-light;
        }
    }
}

// ── Recurring preview highlight ───────────────────────────
.weekly-slot--highlight {
    background: rgba(99, 102, 241, 0.08);
    animation: slot-pulse 1.5s ease-in-out infinite;

    .weekly-slot__time {
        color: var(--mm-primary, #6366f1);
    }

    .weekly-slot__content::after {
        content: '🔁';
        font-size: 0.875rem;
        opacity: 0.5;
    }
}

@keyframes slot-pulse {
    0%, 100% { background: rgba(99, 102, 241, 0.06); }
    50%      { background: rgba(99, 102, 241, 0.14); }
}
```

---

## 7. MomentModal Default Values

```ts
// Passed from Index.tsx when opening the modal

// "Just once" tap at Tuesday 09:00:
defaultValues = {
    preferred_time: '09:00',
}

// "Weekdays" tap at Tuesday 09:00:
defaultValues = {
    frequency: 'weekly',
    days_of_week: [1, 2, 3, 4, 5],
    preferred_time: '09:00',
}
```

`MomentForm` checks if `defaultValues` includes schedule fields → if so, opens the schedule accordion section by default instead of basics.

---

## 8. Implementation Order

1. `AddSlotPopover` component + SCSS
2. Update `TimeSlotCell` — popover trigger + highlight class
3. Thread `highlightTime` through `DaySection` → `WeeklyGrid`
4. Update `Index.tsx` — two-mode `onAddMoment`, `highlightTime` state
5. Update `MomentModal` / `MomentForm` — accept `defaultValues`, auto-open schedule section
6. SCSS — highlight pulse animation
7. Build + manual QA

---

## 9. Stretch Goals

- **Live day-toggle sync:** as user toggles days in the modal, highlights update in the grid behind it (requires lifting form state or using a portal + callback)
- **Conflict indicator:** if a slot already has a moment, show a warning icon instead of highlight
- **"Every day" option:** third popover pill for daily recurrence (all 7 days)


## Quick Action Moment
- So some of the logic i would like to immplement now on the weekley view
is to take the icon and drag it right to considering it done and checkinc it off

On the right currently we could also add a bit of a descrpotion and other usefull stuff to sumarize the current moment

A minor bug is that the moment create from this view neeeds to close the modal and just return to it not redirect to daily view

Lets also make the view almost full width of the cards to utilize full space on mobile theres still a bit of margin to use. essentially the outer card weekly grid can go full width

so additionally the user might want to cross of or drag future icons and passed ones too

potentially have a floating card with rotation

https://reactbits.dev/components/scroll-stack?stackPosition=30%25

so here going back to the drag right its still getting hidden to promptly behind container lets add more space for that

lets also add a bit of moment consistency information in the way of maby a donut to highlight the current consistency score. for now just add the ui and dummy some info integration can happen later to calculate the data

so for the moment right of the row, can we flip through wiht an animation, the  Description | Cue x3 inpuits | Habit x 3 inputs | Environment | 