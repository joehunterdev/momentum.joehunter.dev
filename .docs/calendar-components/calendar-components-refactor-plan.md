# Calendar Components — Refactor Plan

Companion to `calendar-components-plan.md` (your brief) and
`anatomy-of-a-calendar.png`. This document is the architect's plan; the
follow-up `calendar-components-brief.md` will turn it into an implementation
spec once §3, §4, and §10 are signed off.

---

## 1 · Current state — what exists today

### Pages (data owners — what works)

Each of `Pages/Daily/Index.tsx`, `Pages/Weekly/Index.tsx`,
`Pages/Monthly/Index.tsx` already plays the role the brief describes: it
owns the data set coming in from Inertia and the scheduling state machine.
**That part is correct.**

### Already-shared primitives

| Component | Location | Role |
|---|---|---|
| `CalendarNav` | `shared/components/calendar/` | Generic prev / current / next nav. Pages pass labels + params + route name. **Already correct.** |
| `FrequencyBar` | `features/weekly/components/` | The "MomentFrequencyConfig" in the diagram. Used by Daily, Weekly, Monthly. **Lives in the wrong feature folder.** |
| `DayRowShell` | `shared/components/schedule/` | The "CalendarSection" + "CalendarSectionHeader" from the diagram. Used by Daily, Weekly, Monthly-vertical, Monthly-schedule. **Already correct in spirit, undersized in API.** |
| `SlotMomentCard` | `features/weekly/components/` | The leaf "moment article". Has `overview` / `configure` / `ghost` variants. Used cross-feature. **Lives in the wrong feature folder.** |

### Where the duplication is

1. **Scheduling state machine is copy-pasted three times.** Every page
   declares the same `mode`, `scheduling`, `handleStartScheduling`,
   `handleSchedulingChange`, `handleSchedulingNameChange`,
   `handleSchedulingIconChange`, `handleConfirmSchedule`, and an
   exit/cancel handler. Only the `_redirect` URL and the seed values
   differ.

2. **Three near-identical "cell" components**:
   - `features/daily/components/DailyTimeSlotCell.tsx`
   - `features/weekly/components/TimeSlotCell.tsx`
   - `features/monthly/components/MomentSlotCell.tsx`

   Each handles: overview render, configure render, ghost render, conflict
   badge, OOO render, add-button. The branching logic and class-name salad
   is ~80% identical. Daily layers on swipe-to-complete; monthly layers on
   horizontal layout; weekly layers on a popover.

3. **Cross-feature imports.** Daily and Monthly both reach into
   `features/weekly/components/SlotMomentCard` and
   `features/weekly/types` (`SchedulingState`). Weekly is acting as a
   de-facto shared folder, but it isn't one. Anything weekly-specific is
   now welded to things that aren't.

4. **Monthly has two parallel overview views** — `MonthlyGrid` (desktop,
   true 7-col calendar) and `MonthlyVerticalView` (mobile, day-row stack).
   Vertical reuses `DayRowShell`; grid doesn't. The brief explicitly says
   ignore the desktop grid for now — fine — but the vertical view *should*
   be indistinguishable from a "Weekly with 30 sections" from the
   component's point of view.

5. **No shared vocabulary.** Components are named after the *page* they
   were built for (`DailyTimeSlotCell`, `MomentSlotCell`,
   `MonthlyScheduleRow`), not the *role* they play. That makes the reuse
   story muddy.

---

## 2 · Goals

In priority order:

1. **One vocabulary, three views.** Daily, Weekly, and Monthly-vertical
   should all be expressed as compositions of the same primitives, with
   the page picking the data shape and the section count.
2. **No cross-feature reaching.** `features/daily` should not import from
   `features/weekly`. Everything shared lives in
   `shared/components/calendar/` and `features/scheduling/` (new).
3. **One scheduling state machine.** It is page-agnostic and lives once.
4. **Articles carry behavior, not pages.** Swipe-to-complete, ghost
   editing, icon picker, conflict badge — all on the article, configured
   by feature flags, not duplicated per cell variant.
5. **Composition over configuration.** Pages compose the calendar with JSX
   children, not by passing a 12-prop config object.

---

## 3 · Target vocabulary (matches `anatomy-of-a-calendar.png`)

```
<Calendar>                          (container — layout, context provider)
  <CalendarNav … />                 (prev / current / next)
  <MomentFrequencyConfig … />       (renamed FrequencyBar — only in configure mode)

  <CalendarSection … >              (one per day or one per day-of-week)
    <CalendarSectionHeader … />     (renders inside Section automatically)
    <CalendarSectionArticle … />    (one per slot or per moment)
    <CalendarSectionArticle … />
    …
  </CalendarSection>
  <CalendarSection> … </CalendarSection>
</Calendar>
```

| Component | Replaces | Notes |
|---|---|---|
| `Calendar` | new | Layout + context. Children-only API. |
| `CalendarNav` | `CalendarNav` | Already correct. No change. |
| `MomentFrequencyConfig` | `weekly/FrequencyBar` | Move to `shared/components/calendar/`, rename. |
| `CalendarSection` | `DayRowShell` | Grow API; rename. Header is a sub-component. |
| `CalendarSectionHeader` | inline in `DayRowShell` | Extract so pages can override (e.g. monthly day-number badge). |
| `CalendarSectionArticle` | `DailyTimeSlotCell` + `weekly/TimeSlotCell` + `monthly/MomentSlotCell` | **The big unification.** |
| `CalendarMomentCard` | `weekly/SlotMomentCard` | Move out of `features/weekly/`. The card itself stays a separate concern from the article wrapper — the article is the *slot*, the card is the *moment inside the slot*. |

---

## 4 · Component contracts (the spec we'll harden in the brief)

### 4.1 `<Calendar>`

```tsx
<Calendar
    mode="overview" | "configure"
    onModeChange={(m) => void}        // optional — pages opt in
    scheduling={SchedulingState | null}
    onSchedulingChange={(s) => void}
>
    {children}
</Calendar>
```

- Renders a flex/grid container.
- Provides `CalendarContext` so descendants (sections, articles, frequency
  bar) can read `mode` and `scheduling` without prop-drilling.
- Children are arbitrary — the page decides what goes inside. This is the
  "child props" pattern the brief asks for.

### 4.2 `<CalendarNav>` — unchanged

Already takes generic pagination props. No work needed beyond a re-export.

### 4.3 `<MomentFrequencyConfig>`

Same as today's `FrequencyBar`. Just move + rename. Optional props it
already supports (`time`, `conflictCount`, `dayLabels`) stay.

When mounted inside a `<Calendar mode="configure">`, it could pick up
`scheduling` from context — but I'd keep it controlled (the page still
passes props) for clarity. Context-aware would be sugar to consider
later.

### 4.4 `<CalendarSection>`

```tsx
<CalendarSection
    isToday?={boolean}
    isWeekend?={boolean}
    layout?="vertical" | "horizontal"
    header={<CalendarSectionHeader … />}   // or render-prop
>
    {articles}
</CalendarSection>
```

- The shell. Same as `DayRowShell` today but with the header extracted to
  its own component so monthly-style headers (with day-number badge) can
  replace it.

### 4.5 `<CalendarSectionHeader>`

```tsx
<CalendarSectionHeader
    label="MONDAY"
    sublabel?="19 Apr"
    badge?="Today"
/>
```

Optional. Pages can also pass any JSX as `header` to `<CalendarSection>`.

### 4.6 `<CalendarSectionArticle>` — the heart of the refactor

This is what the brief calls out as where "complex logic will live" but
where the behavior is "common across Mobile and Row views." The
unification is about behavior *capabilities*, configured per view.

```tsx
<CalendarSectionArticle
    // Identity / data
    slotKey={string}                       // "date:time" or "dayOfWeek:momentId"
    date?={string}                         // null for monthly-schedule rows
    time?={string}                         // null for monthly views

    // Moment payload (null = empty slot)
    moment={SlotMoment | null}

    // Behavior capabilities — feature flags, not new components
    capabilities={{
        swipeToComplete?: boolean,         // Daily
        addOnEmpty?: boolean,              // All
        ghostEdit?: boolean,               // Configure mode
        conflictBadge?: boolean,           // Configure mode w/ collisions
        editButton?: boolean,              // Weekly/Daily overview
        outOfOffice?: boolean,             // Weekly/Daily — shades OOO times
    }}

    // Callbacks (only fire if matching capability is on)
    onToggleComplete?={(momentId, instanceId, date) => void}
    onStartScheduling?={() => void}
    onGhostNameChange?={(name) => void}
    onGhostIconChange?={(icon) => void}
/>
```

Reads `mode` and `scheduling` from `CalendarContext`. Internally it
decides which sub-render to use — `<CalendarMomentCard variant="…">` for
filled slots, an add button for empty slots, a ghost card when scheduling
targets this slot, a conflict badge when both. Swipe wrapper applies when
`swipeToComplete` is on.

This replaces the three duplicate cell components with **one** component +
flags.

### 4.7 `<CalendarMomentCard>`

Today's `SlotMomentCard`, moved to `shared/components/calendar/`. No
behavior change — it already handles `overview` / `configure` / `ghost`
variants well.

---

## 5 · Scheduling — single state machine

New module: `features/scheduling/` (not "weekly").

```
features/scheduling/
    types.ts                  (SchedulingState, Frequency)
    useScheduling.ts          (the hook — see below)
    index.ts
```

```ts
// useScheduling.ts
export function useScheduling(opts: {
    redirectTo: string;                          // page-specific
    defaults?: Partial<SchedulingState>;         // page-specific seed
    onConfirm?: () => void;
}) {
    const [mode, setMode]             = useState<'overview' | 'configure'>('overview');
    const [state, setState]           = useState<SchedulingState | null>(null);

    const start    = (seed: Partial<SchedulingState>) => { … };
    const change   = (frequency, daysOfWeek) => { … };
    const setName  = (name) => { … };
    const setIcon  = (icon) => { … };
    const confirm  = () => { router.post(...); };
    const cancel   = () => { setState(null); };
    const exit     = () => { setMode('overview'); setState(null); };

    return { mode, setMode, state, start, change, setName, setIcon, confirm, cancel, exit };
}
```

Each page goes from **~90 lines** of scheduling boilerplate to **~5**:

```tsx
const scheduling = useScheduling({ redirectTo: route('weekly') });
```

Pages still own the *seed shape* (Daily seeds `frequency: 'once'`; Weekly
seeds weekdays; Monthly seeds all-days) — they pass that into `start(...)`
when the user clicks an empty slot.

---

## 6 · Composition examples (what each page becomes)

### 6.1 Daily

```tsx
<Calendar mode={scheduling.mode} scheduling={scheduling.state}>
    <CalendarNav … />
    {scheduling.mode === 'configure' && <MomentFrequencyConfig … />}

    <CalendarSection header={<CalendarSectionHeader label="Today" sublabel="19 Apr" badge="Today" />}>
        {todaySlots.map(slot => (
            <CalendarSectionArticle
                key={slot.time}
                slotKey={`${date}:${slot.time}`}
                date={date}
                time={slot.time}
                moment={slot.moment}
                capabilities={{
                    swipeToComplete: true,
                    addOnEmpty: true,
                    ghostEdit: true,
                    conflictBadge: true,
                    outOfOffice: true,
                }}
                onToggleComplete={handleToggle}
                onStartScheduling={() => scheduling.start({ date, time: slot.time, frequency: 'once' })}
                onGhostNameChange={scheduling.setName}
                onGhostIconChange={scheduling.setIcon}
            />
        ))}
    </CalendarSection>

    {nextDay && <CalendarSection … >…</CalendarSection>}
</Calendar>
```

### 6.2 Weekly — same component tree, just more sections.

### 6.3 Monthly (vertical) — same component tree, one section per day.

### 6.4 Monthly (configure / schedule rows) — same component tree, one
section per day-of-week, `layout="horizontal"`, `time` omitted, articles
only render the card body. The same `<CalendarSectionArticle>` handles it
because the behavior flags differ — not the component.

The desktop monthly grid is out of scope per the brief — it remains
`MonthlyGrid` for now, called as a sibling to `<Calendar>`.

---

## 7 · Naming-only mapping (rename + move table)

| Old path | New path |
|---|---|
| `shared/components/schedule/DayRowShell.tsx` | `shared/components/calendar/CalendarSection.tsx` (+ extract `CalendarSectionHeader`) |
| `features/weekly/components/FrequencyBar.tsx` | `shared/components/calendar/MomentFrequencyConfig.tsx` |
| `features/weekly/components/SlotMomentCard.tsx` | `shared/components/calendar/CalendarMomentCard.tsx` |
| `features/weekly/types.ts` (`SchedulingState`) | `features/scheduling/types.ts` |
| `features/weekly/components/TimeSlotCell.tsx` | merged into `shared/components/calendar/CalendarSectionArticle.tsx` |
| `features/daily/components/DailyTimeSlotCell.tsx` | merged into `CalendarSectionArticle.tsx` |
| `features/monthly/components/MomentSlotCell.tsx` | merged into `CalendarSectionArticle.tsx` |
| (new) | `features/scheduling/useScheduling.ts` |
| (new) | `shared/components/calendar/Calendar.tsx` (+ `CalendarContext`) |

`WeeklyGrid`, `DailyGrid`, `MonthlyScheduleGrid`, `MonthlyVerticalView`
all become **thin wrappers** over `<Calendar>` (or removed entirely —
pages can build the tree inline).

---

## 8 · Reference patterns (why this shape)

- **react-day-picker** uses a *components* prop and exposes `DayPicker.Day`,
  `DayPicker.Caption`, etc. — that's the same composition pattern we want
  with `CalendarSection` and `CalendarSectionArticle`. Pages can swap any
  level.
- **FullCalendar** has a plugin/`Event` model where a single event
  component handles many display modes (timeGrid, dayGrid, list) — that's
  the `capabilities` flag model on `CalendarSectionArticle`. One
  component, many surfaces.
- **react-big-calendar** uses compound components (`<Calendar>` with
  `views={{ month, week, day }}`) and lets the consumer override the cell
  renderer. Same spirit — pages own data, library owns composition.

What we are *not* copying:
- We don't need a plugin system. Three views are enough.
- We don't need a render-prop API. JSX children are enough.
- We don't need a context-based event bus. Direct callbacks are fine.

---

## 9 · Migration plan (incremental — no big-bang)

Each step ships independently; nothing breaks until cutover.

| # | Step | Risk | Effort |
|---|---|---|---|
| 1 | Create `features/scheduling/` and move `SchedulingState` there. Re-export from `features/weekly/types` for backwards compat. | low | S |
| 2 | Extract `useScheduling()`. Migrate Daily first (smallest). Verify behavior. | low | M |
| 3 | Migrate Weekly + Monthly to `useScheduling()`. Delete duplicated handlers. | low | S |
| 4 | Move `SlotMomentCard` → `shared/components/calendar/CalendarMomentCard.tsx`. Update imports. Cosmetic. | low | S |
| 5 | Move `FrequencyBar` → `shared/components/calendar/MomentFrequencyConfig.tsx`. Update imports. | low | S |
| 6 | Extract `CalendarSectionHeader` out of `DayRowShell`. Rename `DayRowShell` → `CalendarSection`. Wide rename. | medium (CSS class names live in `weekly-day-section` etc. — see §10) | M |
| 7 | Build `CalendarSectionArticle` with `capabilities` flags. Port the three cells one by one — start with the simplest (monthly), then weekly, then daily (swipe is hardest). | **highest** | L |
| 8 | Build `<Calendar>` container + `CalendarContext`. Migrate pages to JSX-composition style. | medium | M |
| 9 | Delete old cell files + grid wrappers. | low | S |

We can stop after any step and ship — there's no flag-day commit.

---

## 10 · Open questions / decisions for the brief

1. **CSS class names.** Today's CSS leans on `weekly-slot`,
   `weekly-day-section`, etc. — names tied to one feature. Do we rename
   CSS in lockstep with the component move (recommended; gets it done
   once), or keep the old class names and let CSS lag? I'd vote rename,
   but it adds scope.
    - No lets do it properly to match domain and architecture

2. **Context vs prop-drilling.** Should `CalendarSectionArticle` read
   `mode` and `scheduling` from `<Calendar>` context, or take them as
   props? Context means less prop-drilling but harder to override.
   **Recommend: context**, with props as escape hatch.
    - Lets do context, do u think its worth levaraging zustand / dispatch of events for moments creation, freequency and calendar section nav ?

3. **Should `useScheduling()` own the POST?** It calls `router.post(...)`
   today on each page. Centralizing it removes duplication but couples
   the hook to Inertia + the `_redirect` convention. **Recommend: yes —
   pass `redirectTo` as an option.**
    - yes redirect to

4. **`MonthlyGrid` (desktop) — leave alone or rebuild later?** Brief says
   skip for now. **Recommend: leave alone, plan a follow-up.** It's a
   real 7×N grid, not a list of sections; a different shape.
    - Lets completly comment this out i dont want it getting in the way. Grid view sadly is completley useless for this mobile first. But ofcourse this will be a factor later on that permeates all of the views

5. **`SchedulingState.time`** is sometimes `null` (monthly) and sometimes
   a `string` (daily/weekly). Worth tightening the type into a
   discriminated union (`{ kind: 'timeless' } | { kind: 'timed', time:
   string }`) while we're touching it. Small change, removes a class of
   bug.
    - Lets get into type discriomitatoin yes. It might be *one off*, *recurring* (this will depend or preconfiged by the page so daily views frequency or scheduling will configure just a one of rigth ?) Can we also check between the entitites to ensure the scheduling and freequency dont overlap logically.

6. **Variant naming on `CalendarMomentCard`.** Today it's
   `overview` / `configure` / `ghost`. Is that right going forward, or
   should we say `read` / `edit` / `draft`? Cosmetic but worth picking
   once.
    - I like read edit and draft i think so its closer to a laravel controller no ? what do u think ?
---

## 11 · What this buys us

- **One source of truth** for scheduling. Bugs fix in one place.
- **One source of truth** for slot behavior. Swipe, ghost, conflict — one
  component.
- **Adding a fourth view** (e.g. "Quarterly") becomes: define data shape
  on the page, compose `<Calendar>` with the right sections, done. No new
  components.
- **No more `features/x` reaching into `features/y`.**
- **Page files shrink by ~60%.** Daily goes from 164 lines to maybe 70.

---

## 12 · Next step

Sign off on §3 (vocabulary), §4 (contracts), §10 (open questions). Then
I'll write the full brief — file-level diffs, exact prop types, CSS
rename map, test plan — ready to hand to whoever implements (you or me).
