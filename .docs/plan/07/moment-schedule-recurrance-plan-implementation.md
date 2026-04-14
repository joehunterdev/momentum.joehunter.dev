# Moment Schedule & Recurrence — Implementation Plan

> Step-by-step implementation guide for the schedule-first creation flow.
> Derived from `moment-schedule-recurrance-plan.md`.
>
> Each step is a single, testable deliverable. Steps within a phase can be done sequentially.
> A ✅ checkbox is provided for progress tracking.

---

## Pre-Implementation Checklist

- [ ] Confirm branch: `feature/schedule-recurrance`
- [ ] Run existing test suite — green baseline: `php artisan test --compact`
- [ ] Run `npm run build` — confirm no frontend build errors
- [ ] Verify current weekly page loads: `GET /weekly`

---

## Phase 1A — Weekly Mode Toggle (Overview ↔ Configure)

> **Goal:** The weekly page has two visual modes. Overview is read-only. Configure is interactive.
> No new creation flow yet — just the mode switch and conditional rendering.

### Step 1: Add `mode` state to `Weekly/Index.tsx`

- [ ] **File:** `resources/js/Pages/Weekly/Index.tsx`
- [ ] Add state: `const [mode, setMode] = useState<'overview' | 'configure'>('overview');`
- [ ] Pass `mode` down to `<WeeklyGrid>`
- [ ] Keep existing `handleAddMoment`, `showingModal`, etc. — they'll still be used in configure mode

**Acceptance:**
- No visual change yet (mode isn't used downstream)
- TypeScript compiles, page loads

---

### Step 2: Add mode toggle button to the header

- [ ] **File:** `resources/js/Pages/Weekly/Index.tsx`
- [ ] In overview mode: render a ⚙️ button in the `header` prop (next to `DateSelectorBar`)
- [ ] In configure mode: render a ✕ "Done" button that switches back to overview
- [ ] Wrap header in a flex container: `DateSelectorBar` left, toggle button right

**Markup:**
```tsx
<AuthenticatedLayout
    header={
        <div className="weekly-header">
            <DateSelectorBar mode="week" weekStart={weekStart} />
            {mode === 'overview' ? (
                <button className="weekly-header__mode-btn" onClick={() => setMode('configure')} title="Configure schedule">
                    ⚙️
                </button>
            ) : (
                <button className="weekly-header__mode-btn weekly-header__mode-btn--done" onClick={() => { setMode('overview'); setScheduling(null); }}>
                    ✕ Done
                </button>
            )}
        </div>
    }
>
```

**CSS needed:** `.weekly-header` flex layout, `.weekly-header__mode-btn` styling

**Acceptance:**
- ⚙️ button visible in header
- Clicking toggles between ⚙️ and ✕ Done
- No grid change yet

---

### Step 3: Pass `mode` through `WeeklyGrid` → `DaySection` → `TimeSlotCell`

- [ ] **File:** `resources/js/features/weekly/components/WeeklyGrid.tsx`
  - Add `mode` to `Props` interface
  - Pass `mode` to each `<DaySection>`

- [ ] **File:** `resources/js/features/weekly/components/DaySection.tsx`
  - Add `mode` to `Props` interface
  - Pass `mode` to each `<TimeSlotCell>`

- [ ] **File:** `resources/js/features/weekly/components/TimeSlotCell.tsx`
  - Add `mode` to `Props` interface
  - No behaviour change yet — just accept the prop

**Acceptance:**
- TypeScript compiles
- `mode` is available in `TimeSlotCell`

---

### Step 4: Conditional rendering in `TimeSlotCell` by mode

- [ ] **File:** `resources/js/features/weekly/components/TimeSlotCell.tsx`
- [ ] **Overview mode:**
  - If slot has a moment → render `<SlotMomentCard>` (read-only, no edit button)
  - If slot is empty → render nothing (no "+" button, no popover)
  - OOO slots: show subtle time label only
- [ ] **Configure mode:**
  - Current behaviour: "+" button, popover, editable cards
  - This is the existing behaviour — make it the configure branch

**Logic sketch:**
```tsx
if (mode === 'overview') {
    return (
        <div className={cls}>
            <span className="weekly-slot__time">{slot.time}</span>
            <div className="weekly-slot__content">
                {slot.moment ? <SlotMomentCard moment={slot.moment} variant="overview" /> : null}
            </div>
        </div>
    );
}

// Configure mode — existing interactive rendering
return ( /* current JSX */ );
```

**Acceptance:**
- In overview mode: no "+" buttons visible, no popover, status dots visible
- In configure mode: current interactive behaviour
- Toggle between modes updates the grid in real-time

---

### Step 5: `SlotMomentCard` variant prop

- [ ] **File:** `resources/js/features/weekly/components/SlotMomentCard.tsx`
- [ ] Add prop: `variant?: 'overview' | 'configure' | 'ghost'` (default: `'configure'` for backward compat)
- [ ] **Overview variant:**
  - Show status dot + name (read-only)
  - Hide ✏️ edit button
- [ ] **Configure variant:**
  - Current behaviour: status dot + name + ✏️ edit button
- [ ] **Ghost variant:**
  - Dashed border, pulsing opacity, "New Moment" placeholder text
  - `pointer-events: none`
  - Implementation deferred to Phase 1B — just define the CSS class for now

**CSS needed:**
```scss
.slot-moment-card--ghost {
    opacity: 0.45;
    border: 2px dashed var(--mm-primary, #6366f1);
    animation: ghostPulse 2s ease-in-out infinite;
    pointer-events: none;
}
@keyframes ghostPulse {
    0%, 100% { opacity: 0.45; }
    50% { opacity: 0.25; }
}
```

**Acceptance:**
- Overview: cards are read-only, no edit button
- Configure: edit button visible
- Ghost class exists in CSS (not rendered yet)

---

### Step 6: CSS for mode toggle + header layout

- [ ] **File:** `resources/css/_weekly.scss`
- [ ] Add `.weekly-header` — flex container, `justify-content: space-between`, `align-items: center`
- [ ] Add `.weekly-header__mode-btn` — icon button styling, hover states
- [ ] Add `.weekly-header__mode-btn--done` — ✕ button with text
- [ ] Add `.slot-moment-card--ghost` — dashed border, pulse animation
- [ ] Add `.slot-moment-card--overview` — optional: slightly different padding or cursor

**Acceptance:**
- Header looks clean with DateSelectorBar + mode button
- No layout shifts when toggling modes

---

### Step 7: Tests for mode toggle

- [ ] **File:** `tests/Feature/WeeklyPageTest.php` (new)
- [ ] Create with `php artisan make:test --phpunit WeeklyPageTest`
- [ ] Test: authenticated user can view weekly page (status 200)
- [ ] Test: weekly page returns correct Inertia component name (`Weekly/Index`)
- [ ] Test: page props include `weekStart`, `config`, `days`
- [ ] (Frontend mode toggle is client-side state — no backend test needed)

**Acceptance:**
- `php artisan test --compact --filter=WeeklyPageTest` — all green

---

### Phase 1A Complete Checklist
- [ ] Mode toggle button visible in header
- [ ] Overview mode: read-only grid, status dots, no "+" buttons
- [ ] Configure mode: interactive grid with existing "+" / popover flow
- [ ] SlotMomentCard accepts `variant` prop
- [ ] Ghost card CSS exists
- [ ] WeeklyPageTest passing
- [ ] `vendor/bin/pint --dirty` — no formatting issues
- [ ] `npm run build` — no errors

---

## Phase 1B — Schedule-First Creation Flow

> **Goal:** Clicking "+" in configure mode shows an inline ghost card and a RecurrenceBar
> instead of opening the modal. The user picks frequency + days, sees ghost cards across
> the grid, then confirms to create the moment (name optional).

### Step 8: Create `RecurrenceBar` component

- [ ] **File:** `resources/js/features/weekly/components/RecurrenceBar.tsx` (new)
- [ ] Props:
  ```tsx
  interface RecurrenceBarProps {
      time: string;
      frequency: 'daily' | 'weekly' | 'custom';
      daysOfWeek: number[];
      onChange: (frequency: 'daily' | 'weekly' | 'custom', days: number[]) => void;
      onConfirm: () => void;
      onCancel: () => void;
  }
  ```
- [ ] Layout: compact horizontal bar pinned below the header
  ```
  [Daily] [Weekdays] [Custom]   M T W T F S S   [✓ Confirm] [✕ Cancel]
  ```
- [ ] Frequency toggle: 3 buttons, active state highlighted
  - "Daily" → sets `daysOfWeek` to `[1,2,3,4,5,6,7]`
  - "Weekdays" → sets `daysOfWeek` to `[1,2,3,4,5]`, frequency to `'weekly'`
  - "Custom" → user picks individual days
- [ ] Day pills: 7 circle buttons (`M T W T F S S`), togglable
  - Reuse `WEEK_DAYS` constant from `@/shared/constants/moments`
  - Active days: indigo fill; inactive: gray outline
  - Disabled (non-interactive) when frequency is "Daily"
- [ ] Time display: show the clicked time (e.g., "08:00") as a label
- [ ] Confirm button: primary style, calls `onConfirm`
- [ ] Cancel button: calls `onCancel`

**Acceptance:**
- Component renders in isolation
- Toggling frequency updates day pills
- Toggling individual days works in Custom mode
- Confirm/Cancel call their handlers

---

### Step 9: Add `scheduling` state to `Weekly/Index.tsx`

- [ ] **File:** `resources/js/Pages/Weekly/Index.tsx`
- [ ] Add state:
  ```tsx
  const [scheduling, setScheduling] = useState<{
      time: string;
      frequency: 'daily' | 'weekly' | 'custom';
      daysOfWeek: number[];
  } | null>(null);
  ```
- [ ] New handler: `handleStartScheduling(date: string, time: string)`
  - Sets `scheduling` to `{ time, frequency: 'weekly', daysOfWeek: [1,2,3,4,5] }` (default: weekdays)
  - Only works in configure mode
- [ ] Replace `handleAddMoment` in configure mode:
  - Instead of opening the modal, call `handleStartScheduling`
- [ ] When `scheduling !== null`, render `<RecurrenceBar>` between header and grid
- [ ] Pass `scheduling` to `<WeeklyGrid>`

**RecurrenceBar event handlers:**
```tsx
<RecurrenceBar
    time={scheduling.time}
    frequency={scheduling.frequency}
    daysOfWeek={scheduling.daysOfWeek}
    onChange={(freq, days) => setScheduling(prev => prev ? { ...prev, frequency: freq, daysOfWeek: days } : null)}
    onConfirm={handleConfirmSchedule}
    onCancel={() => setScheduling(null)}
/>
```

**Acceptance:**
- Clicking "+" in configure mode shows RecurrenceBar instead of modal
- RecurrenceBar controls update `scheduling` state
- Cancel dismisses the bar
- Grid continues to render below

---

### Step 10: Ghost cards in the grid

- [ ] **File:** `resources/js/features/weekly/components/WeeklyGrid.tsx`
  - Accept `scheduling` prop
  - Pass `scheduling` to each `<DaySection>`

- [ ] **File:** `resources/js/features/weekly/components/DaySection.tsx`
  - Accept `scheduling` prop
  - For each `TimeSlotCell`, determine if it should show a ghost:
    ```tsx
    const isGhost = scheduling !== null
        && slot.time === scheduling.time
        && !slot.moment
        && scheduling.daysOfWeek.includes(dayOfWeekIso);
    ```
  - Need `dayOfWeekIso` — derive from `day.date` (e.g., `parseISO(day.date).getDay()` mapped to ISO)
  - Pass `isGhost` to `<TimeSlotCell>`

- [ ] **File:** `resources/js/features/weekly/components/TimeSlotCell.tsx`
  - Accept `isGhost` prop
  - When `isGhost && !slot.moment`:
    - Render `<SlotMomentCard variant="ghost" moment={ghostMomentStub} />`
    - `ghostMomentStub`: `{ id: 0, name: 'New Moment', description: null, status: null, ... }`
  - When `isGhost && slot.moment`:
    - Render the real card + a conflict indicator (Phase 2 — skip for now)

- [ ] **File:** `resources/js/features/weekly/components/SlotMomentCard.tsx`
  - Implement the `ghost` variant rendering:
    - Add class `slot-moment-card--ghost`
    - Show "New Moment" as name, no edit button
    - Dashed border, pulsing animation (from CSS in Step 5)

**Acceptance:**
- Clicking "+" on e.g. Tuesday 09:00 with "Weekdays" selected →
  ghost cards appear at 09:00 on Mon, Tue, Wed, Thu, Fri
- Toggling days on/off in RecurrenceBar → ghost cards appear/disappear in real-time
- Switching to "Daily" → ghosts on all 7 days
- Ghost cards pulse gently and show "New Moment"

---

### Step 11: Backend — make `name` nullable

- [ ] **Migration:** Create new migration: `php artisan make:migration make_moment_name_nullable --table=moments`
  ```php
  public function up(): void
  {
      Schema::table('moments', function (Blueprint $table) {
          $table->string('name')->nullable()->change();
      });
  }

  public function down(): void
  {
      Schema::table('moments', function (Blueprint $table) {
          $table->string('name')->nullable(false)->change();
      });
  }
  ```
- [ ] Run migration: `php artisan migrate`

- [ ] **File:** `app/Http/Controllers/MomentController.php`
  - In `store()`: change validation from `'name' => ['required', 'string', 'max:255']` to `'name' => ['nullable', 'string', 'max:255']`
  - In `store()`: when saving, default to `'Untitled Moment'` if name is null:
    ```php
    'name' => $data['name'] ?? 'Untitled Moment',
    ```

- [ ] **File:** `app/Models/Moment.php`
  - No changes needed — `name` is already in `$fillable`

**Acceptance:**
- `php artisan migrate` runs clean
- Can create a moment via POST without a `name` field → saved as "Untitled Moment"
- Existing moments with names still work

---

### Step 12: Confirm schedule — create the moment

- [ ] **File:** `resources/js/Pages/Weekly/Index.tsx`
- [ ] Implement `handleConfirmSchedule()`:
  ```tsx
  function handleConfirmSchedule() {
      if (!scheduling) return;

      const formData = {
          name: null,  // schedule-first — no name yet
          description: '',
          color: null,
          icon: null,
          sort_order: 0,
          is_active: true,
          frequency: scheduling.frequency,
          days_of_week: scheduling.daysOfWeek,
          preferred_time: scheduling.time,
          implementation_intention: '',
          habit_stack_after: '',
          environment_prompt: '',
          reward_description: '',
          temptation_bundle: '',
          _redirect: route('weekly'),
      };

      router.post(route('moments.store'), formData, {
          preserveScroll: true,
          onSuccess: () => setScheduling(null),
      });
  }
  ```
- [ ] After confirm: `scheduling` resets to null, RecurrenceBar disappears
- [ ] New moment appears on the grid (via Inertia page reload)
- [ ] The new moment shows as "Untitled Moment" on each scheduled slot

**Acceptance:**
- Full flow: click "+" → RecurrenceBar → toggle days → Confirm → moment created
- Grid shows "Untitled Moment" at the correct time on the correct days
- No modal opened during creation

---

### Step 13: CSS for RecurrenceBar

- [ ] **File:** `resources/css/_weekly.scss`
- [ ] Add `.recurrence-bar` styles:
  ```scss
  .recurrence-bar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: #fff;
      border-bottom: 1px solid #e5e7eb;
      flex-wrap: wrap;

      &__time {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--mm-primary, #6366f1);
          min-width: 3rem;
      }

      &__freq-group {
          display: inline-flex;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          padding: 2px;
      }

      &__freq-btn {
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          border: none;
          background: none;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.15s;

          &--active {
              background: #fff;
              color: var(--mm-primary, #6366f1);
              box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          }
      }

      &__days {
          display: flex;
          gap: 0.25rem;
      }

      &__day-pill {
          width: 1.75rem;
          height: 1.75rem;
          border-radius: 50%;
          border: 1.5px solid #d1d5db;
          background: none;
          font-size: 0.6875rem;
          font-weight: 600;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;

          &--active {
              background: var(--mm-primary, #6366f1);
              border-color: var(--mm-primary, #6366f1);
              color: #fff;
          }

          &:disabled {
              opacity: 0.4;
              cursor: not-allowed;
          }
      }

      &__actions {
          display: flex;
          gap: 0.5rem;
          margin-left: auto;
      }

      &__confirm {
          padding: 0.375rem 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          background: var(--mm-primary, #6366f1);
          color: #fff;
          border: none;
          cursor: pointer;
          transition: background 0.15s;

          &:hover { background: #4f46e5; }
      }

      &__cancel {
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 500;
          background: none;
          border: 1px solid #d1d5db;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.15s;

          &:hover {
              border-color: #9ca3af;
              color: #374151;
          }
      }
  }
  ```

**Acceptance:**
- RecurrenceBar is visually compact, sits below the header
- Frequency buttons look like a segmented control
- Day pills are circular, active = indigo fill
- Confirm = indigo primary button, Cancel = ghost button
- Responsive: wraps on small screens

---

### Step 14: Export `RecurrenceBar` from feature barrel

- [ ] **File:** `resources/js/features/weekly/index.ts`
- [ ] Add: `export { default as RecurrenceBar } from './components/RecurrenceBar';`

**Acceptance:**
- Import works from `@/features/weekly`

---

### Step 15: Tests for schedule-first creation

- [ ] **File:** `tests/Feature/MomentControllerTest.php` (new)
- [ ] Create with `php artisan make:test --phpunit MomentControllerTest`
- [ ] Test: can create moment with all fields (happy path)
- [ ] Test: can create moment without a name (schedule-first) → stored as "Untitled Moment"
- [ ] Test: validation rejects invalid frequency
- [ ] Test: validation rejects invalid days_of_week values
- [ ] Test: moment schedule is created correctly (frequency, days, time)
- [ ] Test: unauthenticated user cannot create moment (redirects to login)
- [ ] Test: moment belongs to authenticated user

- [ ] **File:** `tests/Feature/WeeklyPageTest.php` (from Step 7)
- [ ] Add: test that moments without names display correctly in props

**Acceptance:**
- `php artisan test --compact --filter=MomentControllerTest` — all green
- `php artisan test --compact --filter=WeeklyPageTest` — all green

---

### Step 16: Create `MomentFactory`

- [ ] Run: `php artisan make:factory MomentFactory --model=Moment`
- [ ] **File:** `database/factories/MomentFactory.php`
  ```php
  public function definition(): array
  {
      return [
          'user_id' => \App\Models\User::factory(),
          'name' => fake()->words(3, true),
          'description' => fake()->optional()->sentence(),
          'color' => fake()->randomElement(['#3B82F6', '#8B5CF6', '#10B981', '#EF4444', '#F59E0B']),
          'icon' => fake()->randomElement(['🏃', '📚', '🧘', '💪', '🎯']),
          'is_active' => true,
          'sort_order' => fake()->numberBetween(0, 10),
      ];
  }

  public function untitled(): static
  {
      return $this->state(fn() => ['name' => 'Untitled Moment']);
  }

  public function inactive(): static
  {
      return $this->state(fn() => ['is_active' => false]);
  }
  ```
- [ ] Used in tests from Step 15

**Acceptance:**
- `Moment::factory()->create()` works in tests
- `Moment::factory()->untitled()->create()` creates an untitled moment

---

### Phase 1B Complete Checklist
- [ ] RecurrenceBar component created and styled
- [ ] Clicking "+" in configure mode → RecurrenceBar (not modal)
- [ ] Ghost cards appear/disappear as recurrence is adjusted
- [ ] Confirm → moment created with schedule, no name required
- [ ] "Untitled Moment" shown on grid for nameless moments
- [ ] Backend validates and stores nullable name
- [ ] Migration run
- [ ] MomentFactory created
- [ ] All tests green
- [ ] `vendor/bin/pint --dirty` clean
- [ ] `npm run build` clean

---

## Phase 2 — Ghost Polish + Conflict Detection

> **Goal:** Smooth ghost transitions, visual conflict warnings when scheduling over existing moments.

### Step 17: Ghost card CSS transitions

- [ ] **File:** `resources/css/_weekly.scss`
- [ ] Enhance `.slot-moment-card--ghost`:
  - Add `transition: opacity 0.3s ease, transform 0.3s ease`
  - Entry animation: slide in from slight offset + fade
  - Colour from moment's colour (future — for now default indigo)

**Acceptance:**
- Ghost cards animate in/out smoothly when toggling days

---

### Step 18: Conflict detection logic

- [ ] **File:** `resources/js/features/weekly/components/DaySection.tsx`
- [ ] When computing `isGhost`, also compute `isConflict`:
  ```tsx
  const isConflict = scheduling !== null
      && slot.time === scheduling.time
      && slot.moment !== null
      && scheduling.daysOfWeek.includes(dayOfWeekIso);
  ```
- [ ] Pass `isConflict` to `<TimeSlotCell>`

- [ ] **File:** `resources/js/features/weekly/components/TimeSlotCell.tsx`
  - Accept `isConflict` prop
  - When `isConflict`: add class `.weekly-slot--conflict` to the slot wrapper
  - Show a small `⚠️` badge next to the existing moment card

- [ ] **File:** `resources/css/_weekly.scss`
  ```scss
  .weekly-slot--conflict {
      border-left: 3px solid #f59e0b;
      background: rgba(245, 158, 11, 0.06);
  }
  .weekly-slot__conflict-badge {
      font-size: 0.625rem;
      color: #f59e0b;
      margin-left: 0.25rem;
  }
  ```

**Acceptance:**
- When scheduling overlaps an existing moment → amber left border + ⚠️ badge
- Multiple conflicts on different days all show
- Non-conflicting slots unaffected

---

### Step 19: Conflict count in RecurrenceBar

- [ ] **File:** `resources/js/Pages/Weekly/Index.tsx`
  - Compute `conflictCount` from `days` + `scheduling`:
    ```tsx
    const conflictCount = scheduling
        ? days.reduce((count, day) => {
            const iso = getIsoDay(day.date);
            if (!scheduling.daysOfWeek.includes(iso)) return count;
            const hasConflict = day.slots.some(s => s.time === scheduling.time && s.moment);
            return count + (hasConflict ? 1 : 0);
        }, 0)
        : 0;
    ```
  - Pass `conflictCount` to `<RecurrenceBar>`

- [ ] **File:** `resources/js/features/weekly/components/RecurrenceBar.tsx`
  - Accept optional `conflictCount` prop
  - When `conflictCount > 0`: show `⚠️ {n} conflict(s)` label between days and actions

**Acceptance:**
- RecurrenceBar shows "⚠️ 2 conflicts" when 2 days have existing moments at the same time
- Count updates in real-time as days are toggled
- 0 conflicts → label hidden

---

### Phase 2 Complete Checklist
- [ ] Ghost cards transition smoothly
- [ ] Conflicting slots have amber border + ⚠️
- [ ] RecurrenceBar shows conflict count
- [ ] All Phase 1 tests still green
- [ ] `vendor/bin/pint --dirty` clean
- [ ] `npm run build` clean

---

## Phase 3 — Detail Enrichment + Schedule Overview

> **Goal:** Users can name moments inline, and a schedule overview panel provides a birds-eye view.

### Step 20: Inline "Name this moment" prompt

- [ ] **File:** `resources/js/features/weekly/components/SlotMomentCard.tsx`
- [ ] When moment name is "Untitled Moment" in configure mode:
  - Show an inline text input instead of the name label
  - On blur / Enter: PATCH to update the name via `router.patch`
  - On Escape: revert to "Untitled Moment"
- [ ] Add a subtle `✏️ name this` nudge text below "Untitled Moment" in overview mode

**Endpoint:** Use existing `moments.update` route — just send `{ name: newName }`

**Acceptance:**
- Clicking on "Untitled Moment" in configure → inline editable text input
- Typing a name + Enter → saves, card updates
- Overview mode: "Untitled Moment ✏️" nudge (clicking switches to configure mode)

---

### Step 21: Quick-edit name via inline input on newly created moments

- [ ] **File:** `resources/js/Pages/Weekly/Index.tsx`
- [ ] After `handleConfirmSchedule` success, track the newly created moment's ID
- [ ] Pass `highlightMomentId` prop to grid → that card starts in edit-name mode
- [ ] This auto-focuses the inline name input so the user can immediately type

**Acceptance:**
- Create moment → card appears with name input focused → user types → saved
- Seamless flow: schedule → name in one action without a modal

---

### Step 22: Schedule overview panel

- [ ] **File:** `resources/js/features/weekly/components/ScheduleOverviewPanel.tsx` (new)
- [ ] Panel rendered as a right-side sliding drawer or collapsible section
- [ ] Toggle via ⓘ button in configure mode header
- [ ] Lists all moments in a compact format:
  ```
  🏃 Morning Run      Weekdays  07:00
  📚 Read             Daily     08:00
  🧘 Untitled Moment  M W F     09:00
  ```
- [ ] Each row: icon + name + frequency badge + day dots + time
- [ ] Clicking a moment highlights its slots on the grid (optional stretch)

**Acceptance:**
- Panel opens/closes smoothly
- Shows all active moments with their schedule
- Untitled moments show with "Untitled Moment" label

---

### Step 23: Tests for inline naming

- [ ] **File:** `tests/Feature/MomentControllerTest.php`
- [ ] Add: test updating just the name of a moment (PATCH with only `name`)
- [ ] Add: test updating name from "Untitled Moment" to a real name

**Acceptance:**
- `php artisan test --compact --filter=MomentControllerTest` — all green

---

### Phase 3 Complete Checklist
- [ ] Inline name editing works for untitled moments
- [ ] Newly created moments auto-focus the name input
- [ ] Schedule overview panel shows all moments
- [ ] All tests green
- [ ] `vendor/bin/pint --dirty` clean
- [ ] `npm run build` clean

---

## File Change Summary

### New Files
| File | Phase | Description |
|------|-------|-------------|
| `resources/js/features/weekly/components/RecurrenceBar.tsx` | 1B | Inline frequency + day picker bar |
| `resources/js/features/weekly/components/ScheduleOverviewPanel.tsx` | 3 | Right-side schedule summary panel |
| `database/migrations/xxxx_make_moment_name_nullable.php` | 1B | Make `moments.name` nullable |
| `database/factories/MomentFactory.php` | 1B | Factory for Moment model |
| `tests/Feature/WeeklyPageTest.php` | 1A | Weekly page feature tests |
| `tests/Feature/MomentControllerTest.php` | 1B | Moment CRUD feature tests |

### Modified Files
| File | Phase | Changes |
|------|-------|---------|
| `resources/js/Pages/Weekly/Index.tsx` | 1A, 1B | Mode state, scheduling state, RecurrenceBar, handlers |
| `resources/js/features/weekly/components/WeeklyGrid.tsx` | 1A, 1B | Accept mode + scheduling props |
| `resources/js/features/weekly/components/DaySection.tsx` | 1A, 1B, 2 | Accept mode + scheduling, compute ghost/conflict |
| `resources/js/features/weekly/components/TimeSlotCell.tsx` | 1A, 1B, 2 | Mode-conditional rendering, ghost/conflict |
| `resources/js/features/weekly/components/SlotMomentCard.tsx` | 1A, 1B, 3 | Variant prop, ghost rendering, inline edit |
| `resources/js/features/weekly/index.ts` | 1B | Export RecurrenceBar |
| `resources/css/_weekly.scss` | 1A, 1B, 2 | Header, RecurrenceBar, ghost, conflict styles |
| `app/Http/Controllers/MomentController.php` | 1B | Nullable name validation + default |

### Unchanged Files (for reference)
| File | Reason |
|------|--------|
| `AddSlotPopover.tsx` | Still used in configure mode (Phase 1A keeps it) |
| `WeeklyController.php` | No backend changes needed for mode/scheduling |
| `AuthenticatedLayout.tsx` | No changes — header slot handled in Weekly/Index |
| `MomentModal.tsx` | Still used for editing — not used for creation after Phase 1B |
| `ScheduleFields.tsx` | Still used inside MomentModal for edit flow |

---

## Execution Order

```
Phase 1A (Mode Toggle)
  Step 1:  mode state in Index.tsx
  Step 2:  mode toggle button in header
  Step 3:  pass mode through component tree
  Step 4:  conditional rendering by mode
  Step 5:  SlotMomentCard variant prop
  Step 6:  CSS for header + ghost placeholder
  Step 7:  WeeklyPageTest

Phase 1B (Schedule-First Creation)
  Step 8:  RecurrenceBar component
  Step 9:  scheduling state in Index.tsx
  Step 10: ghost cards in grid
  Step 11: backend — nullable name migration + controller
  Step 12: confirm handler (POST)
  Step 13: RecurrenceBar CSS
  Step 14: export from barrel
  Step 15: MomentControllerTest
  Step 16: MomentFactory

Phase 2 (Ghost Polish + Conflicts)
  Step 17: ghost CSS transitions
  Step 18: conflict detection logic
  Step 19: conflict count in RecurrenceBar

Phase 3 (Detail Enrichment)
  Step 20: inline name prompt
  Step 21: auto-focus after creation
  Step 22: schedule overview panel
  Step 23: inline naming tests
```

---

## Risk Notes

| Risk | Mitigation |
|------|------------|
| Ghost cards cause layout shifts on desktop (narrow columns) | Use absolute positioning / overlay within the slot, don't change grid flow |
| RecurrenceBar overlaps grid on small screens | Use `position: sticky` with z-index, or push grid down |
| Inline name editing feels janky on mobile | Test on mobile viewport; consider a bottom sheet alternative |
| Migration makes `name` nullable — existing unnamed moments? | Default "Untitled Moment" in controller, not in DB. Migration is safe. |
| Popover (`AddSlotPopover`) is redundant after RecurrenceBar | Phase 1B replaces the popover flow in configure mode; popover can be removed in a cleanup step |

---

## Open Questions (from plan)

Carry these forward — answers will shape specific implementation details:

1. **Ghost click → remove day?** Default: No — only via day pills on RecurrenceBar (simpler)
2. **Multi-moment stacking?** Default: Stack vertically (slot grows) — simplest visual
3. **Overview "+" buttons?** Default: Purely read-only (cleaner separation)
4. **Drag across slots for time range?** Default: No — one slot at a time (Phase 1 scope)
