# SCSS + Markup Refactor — Plan

Companion to `scss-markup-refactor.md` (your brief), `anatomy-of-a-calendar.png`,
and the executed `calendar-components-refactor-plan.md` (React side, already
shipped). This plan finishes the job the React refactor started: collapse the
duplicated styles and markup across Daily / Weekly / Monthly so there is one
hierarchy that matches the diagram, no per-view forks of the same block, no
inline CSS in TSX, and the SCSS file map matches the component anatomy.

Decisions taken (from the brief): unified moment row is **`MomentAction`** with
`read | edit | draft` variants; page headers collapse into one shared
`.calendar-page-header`; this plan covers React markup dedup, not SCSS-only.

---

## 1 · Problems this refactor fixes

1. **`_weekly.scss` is misnamed and overloaded** (1273 lines). It owns blocks
   used by every view: `.calendar-section`, `.moment-frequency-config`,
   `.moment-card`, `.slot-icon`, `.slot-popover`, draft/swipe/highlight states.
   Anyone reading the filename assumes "weekly-only" and is wrong.
2. **Two parallel "moment inner" BEM trees** for the same idea:
   - `.moment-action-item` (in `_moment-action.scss`) — used by overview mode
     via `MomentAction.tsx`.
   - `.moment-card` (in `_weekly.scss`) — used by configure / draft via
     `CalendarMomentCard.tsx`.
   Same data, same anatomy (icon + name + description + extras), different
   class roots and different React components.
3. **Three byte-identical page-header blocks** — `.weekly-header`,
   `.monthly-header`, `.daily-header`, plus their `__row` and `__mode-btn`
   children. Copy/pasted three times.
4. **Three parallel cell wrappers** for the same `.calendar-article` slot:
   - `TimeSlotCell.tsx` (Daily + Weekly)
   - `CalendarSectionArticle.tsx` (Monthly configure)
   - Inline `<div className="calendar-article weekly-slot weekly-slot--monthly-day …">`
     inside `MonthlyContainer.tsx`
   Branching logic is ~80% identical; the `MonthlyContainer` inline version is
   the most surprising — it duplicates `CalendarSectionArticle`'s job.
5. **Half-finished class migration.** `CalendarSectionArticle` emits dual
   classnames (`calendar-article weekly-slot`) "until the cross-cutting CSS
   sweep". This plan **is** that sweep.
6. **Inline CSS in TSX.** `style={{ position: 'relative' }}` in two cell
   components — pure styling that belongs in SCSS. (`style={{ '--moment-progress':
   pct }}` is fine; CSS-var passthrough is the correct pattern.)
7. **Hardcoded colours scattered everywhere.** `#e5e7eb`, `#f3f4f6`, `#6b7280`,
   `#fafafa`, `#9ca3af`, `#374151` repeat dozens of times despite design tokens
   in `_variables.scss`.
8. **Dead code (CSS + React).**
   - React: `DayRow.tsx`, `MonthlyDayCell.tsx` (no importers).
   - CSS: `.week-selector`, `.moment-detail-ticker`, `.consistency-bar`,
     `.daily-grid` (legacy), `.monthly-grid` (the 7-col desktop one — already
     decided dead per `calendar-components-refactor-plan.md` §10.4).

---

## 2 · Target anatomy (matches `anatomy-of-a-calendar.png`)

```
.calendar                              ← page-level container (Daily/Weekly/Monthly Index)
  .calendar-page-header                ← was {weekly,monthly,daily}-header
    .calendar-page-header__row
      .calendar-nav
      .calendar-page-header__mode-btn  ← was {weekly,monthly}-header__mode-btn
    .calendar-progress                 ← already shared

  .calendar-frequency-config           ← was .moment-frequency-config
                                         (only when scheduling.mode === 'configure')

  .calendar-section [--today --weekend]
    .calendar-section__header
      .calendar-section__label
      .calendar-section__sublabel
      .calendar-section__badge
    .calendar-section__articles [--horizontal]
      .calendar-article [--today --weekend --ooo --empty --completed --conflict --no-time]
        .calendar-article__key         ← was __time (now neutral, can hold time OR day label)
        .calendar-article__content
          .moment-action [--read --edit --draft]
            .moment-action__icon       (or .moment-action__icon-picker for draft)
            .moment-action__body
              .moment-action__name
              .moment-action__desc
            .moment-action__edit-btn   (edit variant only)
            .moment-action__progress-bg (read variant only)
          OR
          .calendar-article__add-btn   (when empty)
          OR
          .calendar-article__ooo-dot   (when out-of-office)
```

Three rules drop out of this:

- **One block per concept.** `.calendar-article` is the slot. `.moment-action`
  is whatever lives inside it. No per-view forks of either.
- **Variants are modifiers, not new blocks.** Daily vs Weekly vs Monthly differs
  only in *how many sections* the page renders and *what data* each section
  holds — not in class names.
- **Names describe role, not view.** `.calendar-article__key` instead of
  `__time` (because monthly-vertical uses it for the day label, not a time).

---

## 3 · Target SCSS file layout

Restructure `resources/css/` to mirror the anatomy. Each file owns exactly one
block (with its modifiers + child elements).

```
resources/css/
  app.scss                             manifest (order matters)
  _variables.scss                      design tokens (unchanged)
  _drop-border.scss                    mixin (unchanged)
  _animations.scss                     keyframes (unchanged)
  _base.scss                           resets + body (unchanged)

  calendar/                            ← new sub-folder
    _calendar.scss                     .calendar (page container)
    _calendar-page-header.scss         .calendar-page-header + __row + __mode-btn
    _calendar-nav.scss                 .calendar-nav (moved out of _components.scss)
    _calendar-view-toggle.scss         .calendar-view-toggle (moved out)
    _calendar-progress.scss            .calendar-progress (moved from _daily.scss)
    _calendar-frequency-config.scss    .calendar-frequency-config (moved from _weekly.scss)
    _calendar-section.scss             .calendar-section + header + articles
    _calendar-article.scss             .calendar-article (the slot)
    _moment-action.scss                .moment-action (was .moment-action-item + .moment-card)
    _slot-icon.scss                    .slot-icon (shared swipe/draft/etc.)
    _slot-popover.scss                 .slot-popover (add-popover)
    _draft.scss                        .draft-* (icon picker, name input)

  forms/                               ← optional grouping for non-calendar stuff
    _icon-picker.scss                  (moved out of _components.scss)
    _moment-modal.scss                 (moved out of _components.scss)
    _config-form.scss                  (.config-* from _components.scss)
    _flash.scss                        .mm-flash
    _sleep-helper.scss

  _components.scss                     shrinks: .mm-card, .mm-toggle, .mm-day-toggle,
                                       .mm-swatch, .mm-accordion, .mm-input,
                                       .mm-form-card, .mm-btn-primary, .mm-streak,
                                       .mm-empty, .mm-nav  (generic primitives only)

  _welcome.scss                        (page — unchanged)
  _content.scss                        (page — unchanged)

  # DELETED
  _weekly.scss
  _daily.scss
  _monthly.scss
  _pages.scss
```

**Why the `calendar/` sub-folder.** One scroll one block. Open
`_calendar-article.scss` and you see *everything* an article does — modifiers,
hover states, swipe wash, conflict badge, ooo, completed. Today an article's
behaviour is spread across `_weekly.scss`, `_daily.scss`, and `_monthly.scss`.

`app.scss` becomes a clear ordered manifest reflecting the cascade:

```scss
@tailwind base;
@tailwind components;
@tailwind utilities;

@import 'variables';
@import 'drop-border';
@import 'animations';
@import 'base';

// Calendar — anatomy order, outer → inner
@import 'calendar/calendar';
@import 'calendar/calendar-page-header';
@import 'calendar/calendar-nav';
@import 'calendar/calendar-view-toggle';
@import 'calendar/calendar-progress';
@import 'calendar/calendar-frequency-config';
@import 'calendar/calendar-section';
@import 'calendar/calendar-article';
@import 'calendar/moment-action';
@import 'calendar/slot-icon';
@import 'calendar/slot-popover';
@import 'calendar/draft';

// Form / modal primitives
@import 'forms/icon-picker';
@import 'forms/moment-modal';
@import 'forms/config-form';
@import 'forms/flash';
@import 'forms/sleep-helper';

// Generic component utilities
@import 'components';

// Page-specific
@import 'welcome';
@import 'content';
```

---

## 4 · BEM block specs (target)

### 4.1 `.calendar-page-header`  *(new, replaces 3 dup blocks)*

```scss
.calendar-page-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    width: 100%;
    min-width: 0;
    overflow: hidden;

    > :first-child {                   // CalendarNav owns remaining width
      flex: 1 1 0;
      min-width: 0;
      overflow: hidden;
    }
  }

  &__mode-btn {
    /* identical rules — was {weekly,monthly}-header__mode-btn */
    &--done { /* … */ }
  }
}
```

### 4.2 `.calendar-section` + `__header` + `__articles`

Move from `_weekly.scss` as-is — already cleanly named. Drop the `weekly-grid`
wrapper (page container is `.calendar`, not a per-view grid).

### 4.3 `.calendar-article`  *(was `.weekly-slot`)*

Move and rename. Modifiers stay: `--today --weekend --ooo --empty --completed
--conflict --no-time --highlight --swiping --swipe-done --monthly-day`.

- Mobile (default): row layout — `__key` (time / day) left, `__content` right.
- Tablet/desktop ≥768px: column layout — `__key` top, `__content` below.
- `--no-time` hides `__key`.
- `--monthly-day` widens `__key` (currently `weekly-slot--monthly-day`) and
  stacks moments vertically in `__content`.

### 4.4 `.calendar-section__articles--horizontal`

Already exists. Becomes the only "horizontal flow of articles" variant — used
by monthly configure. Trim the redundant inner overrides (currently re-states
`.weekly-slot` rules) by leaning on `--no-time`.

### 4.5 `.moment-action`  *(NEW unified block — replaces `.moment-action-item` + `.moment-card`)*

```scss
.moment-action {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.75rem 0.875rem;
  background: #fff;
  overflow: hidden;
  isolation: isolate;

  &__progress-bg {                     // read variant only
    position: absolute;
    inset: 0;
    z-index: 0;
    width: var(--moment-progress, 0%);
    background: rgba(var(--mm-primary-rgb), 0.10);
    pointer-events: none;
    transition: width 0.3s ease;
  }

  &__icon {
    position: relative; z-index: 1;
    flex-shrink: 0;
    /* … unified icon styles … */
  }

  &__body { … }
  &__name { … }
  &__desc { … }
  &__edit-btn { … }                    // edit variant only

  // Variants
  &--read   { /* swipe-to-complete affordance + progress wash */ }
  &--edit   { /* shows edit pencil, no progress wash */ }
  &--draft  { /* icon picker trigger + name input, dashed border */ }
}
```

This is the answer to your "why is the moment action inner different for each
view?". It isn't — it's different *per mode* (read vs edit vs draft). Once
expressed as variants on one block, all three views render the exact same
markup, choosing the variant from `scheduling.mode` + slot state.

### 4.6 `.calendar-frequency-config`  *(was `.moment-frequency-config`)*

Move from `_weekly.scss`. Rename root to reflect that this is a *calendar*
control, not a moment one. Keep all sub-elements as-is.

### 4.7 Design tokens — replace hardcoded values

Add these to `_variables.scss` and replace the inlined hex values everywhere:

```scss
--mm-border:        #e5e7eb;
--mm-border-light:  #f3f4f6;
--mm-surface-alt:   #fafafa;
--mm-text-strong:   #111827;
--mm-text-body:     #374151;
--mm-text-mute:     #6b7280;
--mm-text-faint:    #9ca3af;
--mm-text-ghost:    #d1d5db;
```

(Names match what they're already used as, just not via a token.) These pair
with the existing `--mm-primary`, `--mm-secondary`, etc.

---

## 5 · React markup dedup

### 5.1 One cell wrapper to rule them all

Delete `TimeSlotCell.tsx` and the inline article markup in
`MonthlyContainer.tsx`. **`CalendarSectionArticle.tsx` is the only cell
wrapper** — used by Daily, Weekly, and both Monthly modes.

Today's `CalendarSectionArticle` already has the `capabilities` flag system the
refactor brief specced. It just needs to:

- Drop the dual classnames (`calendar-article weekly-slot`) → emit only
  `calendar-article`.
- Drop inline `style={{ position: 'relative' }}` → live in
  `_calendar-article.scss` on `&__content { position: relative; }`.
- Accept an optional `keyLabel` prop so monthly-vertical can pass `"MON 6"`
  instead of a time string. Today monthly's inline version uses
  `<span className="calendar-article__time">{dayLabel}</span>` — once `__time`
  is renamed `__key` and the prop accepts any string, the inline version isn't
  needed.

### 5.2 One `MomentAction` to rule them all

Merge `CalendarMomentCard.tsx` into `MomentAction.tsx`:

```tsx
type Variant = 'read' | 'edit' | 'draft';

<MomentAction
  moment={moment}
  variant="read" | "edit" | "draft"
  progress={number}                    // read only — defaults to moment.progress
  onDraftNameChange={…}                // draft only
  onDraftIconChange={…}                // draft only
/>
```

- `variant="read"` → icon + name + desc + `__progress-bg` (what
  `MomentAction.tsx` does today).
- `variant="edit"` → icon + name + desc + `__edit-btn` (what
  `CalendarMomentCard variant="edit"` does today).
- `variant="draft"` → icon-picker-button + name input (what
  `CalendarMomentCard variant="draft"` does today).

`CalendarSectionArticle` picks the variant from `mode` + slot state, exactly
like it picks today between `<MomentAction>` and `<CalendarMomentCard>`.

### 5.3 Container-level cleanup

- **`MonthlyContainer.tsx`**: replace the inline article JSX (lines 90–126)
  with `<CalendarSectionArticle>` calls. The `weekly-slot--monthly-day`
  modifier becomes `--monthly-day` on `.calendar-article` and is selected via
  a `layout="day-vertical"` (or similar) prop on the article — or simpler,
  via the `keyLabel` being a day-label string and a new capability flag
  `monthlyDay: true`.
- **`WeeklyContainer.tsx`** + **`DaySection.tsx`**: swap `TimeSlotCell` for
  `CalendarSectionArticle`.
- **`DailyContainer.tsx`**: same swap.
- **`Pages/Daily/Index.tsx`, `Pages/Weekly/Index.tsx`, `Pages/Monthly/Index.tsx`**:
  swap the wrapping `<div className="{weekly,monthly,daily}-header">` for
  `<div className="calendar-page-header">` and update the inner row/btn
  classes.

### 5.4 Delete dead React

- `resources/js/features/calendar/weekly/DayRow.tsx` — not imported.
- `resources/js/features/calendar/monthly/MonthlyDayCell.tsx` — not imported.
  (Per `calendar-components-refactor-plan.md` §10.4 it was the desktop grid;
  decision was "comment out". Going further: just delete and keep the SCSS
  reference in git history. Re-add when a desktop grid view is on the
  roadmap.)
- `resources/js/features/calendar/components/TimeSlotCell.tsx` — superseded by
  `CalendarSectionArticle`.

### 5.5 Delete dead CSS

- `.week-selector` (not referenced in any TSX)
- `.moment-detail-ticker` (not referenced)
- `.consistency-bar` (not referenced)
- `.daily-grid` (page-specific legacy, unused after `.calendar` wrapper)
- `.monthly-grid` + `.monthly-day-cell` (the 7-col desktop grid; tied to dead
  `MonthlyDayCell.tsx`)
- `.page-daily__progress` in `_pages.scss` (unused — `.calendar-progress`
  replaces it)
- `.weekly-grid`, `.monthly-vertical-view`, `.monthly-schedule-grid` — page
  wrappers; replaced by `.calendar`.

---

## 6 · Class-rename map (TSX side)

| Old | New |
|---|---|
| `weekly-header`, `monthly-header`, `daily-header` | `calendar-page-header` |
| `weekly-header__row`, `monthly-header__row` | `calendar-page-header__row` |
| `weekly-header__mode-btn`, `monthly-header__mode-btn` | `calendar-page-header__mode-btn` |
| `weekly-header__mode-btn--done`, `monthly-header__mode-btn--done` | `calendar-page-header__mode-btn--done` |
| `weekly-grid`, `monthly-vertical-view`, `monthly-schedule-grid` | `calendar` (page wrapper) |
| `weekly-slot` and modifiers | `calendar-article` + same modifiers |
| `weekly-slot__time` | `calendar-article__key` |
| `weekly-slot__content` | `calendar-article__content` |
| `weekly-slot__add-btn` | `calendar-article__add-btn` |
| `weekly-slot__ooo-dot` | `calendar-article__ooo-dot` |
| `weekly-slot__conflict-badge` | `calendar-article__conflict-badge` |
| `weekly-slot--monthly-day` | `calendar-article--monthly-day` |
| `moment-frequency-config` | `calendar-frequency-config` |
| `moment-action-item` (overview) | `moment-action` + `moment-action--read` |
| `moment-card` (edit) | `moment-action` + `moment-action--edit` |
| `moment-card--draft-edit` (draft) | `moment-action` + `moment-action--draft` |
| `moment-card__row`, `moment-card__body`, `moment-card__name`, etc. | `moment-action__row`, `__body`, `__name`, etc. |
| `moment-card__edit-btn` | `moment-action__edit-btn` |
| `daily-grid` | (deleted) |
| `monthly-grid`, `monthly-day-cell*` | (deleted) |

`.calendar-section` and children (`__header`, `__label`, `__sublabel`,
`__badge`, `__articles`) stay as-is — already in target shape.

---

## 7 · Migration plan (incremental, no flag day)

Each step is independently shippable. Order matters because some steps unblock
the next.

| # | Step | Risk | Effort | Notes |
|---|---|---|---|---|
| 1 | Add the seven design tokens (§4.7) to `_variables.scss`. | low | XS | No behaviour change. |
| 2 | Create `resources/css/calendar/` and move blocks one-at-a-time **with no rename**: `.calendar-section`, `.moment-frequency-config`, `.calendar-nav`, `.calendar-view-toggle` first. Update `app.scss` imports. Verify visually. | low | S | Pure file move. |
| 3 | Delete dead CSS (§5.5). | low | XS | Verify nothing breaks. |
| 4 | Delete dead React (`DayRow.tsx`, `MonthlyDayCell.tsx`). | low | XS | Both unimported — confirmed. |
| 5 | Replace hardcoded hex values with the new tokens across the new `calendar/` files. | low | S | Mechanical search/replace. |
| 6 | Introduce `.calendar-page-header` (new file). Switch the three Index.tsx pages to it. Delete `.weekly-header`, `.monthly-header`, `.daily-header` blocks. | low | S | Visual regression risk: low — rules are identical. |
| 7 | Unify `MomentAction`: write the new `.moment-action` block (read/edit/draft variants). Update `MomentAction.tsx` to accept `variant` and absorb `CalendarMomentCard`'s render branches. Delete `CalendarMomentCard.tsx`. Update `CalendarSectionArticle` to render `<MomentAction variant=…>`. | **highest** | M | Biggest visual surface. Test all three views in both modes (overview/configure) + scheduling/draft flow. |
| 8 | Rename `.weekly-slot*` → `.calendar-article*` cluster-wise (one file at a time): emit only the new class from React, then rename the SCSS. The dual-class transitional period in `CalendarSectionArticle` collapses. Also rename `__time` → `__key`. | medium | M | Each rename is search-and-replace inside the new `calendar/` folder + the few TSX files. |
| 9 | Rename `.moment-frequency-config` → `.calendar-frequency-config` (SCSS + the one TSX file `MomentFrequencyConfig.tsx`). | low | XS | One TSX, one SCSS. |
| 10 | Collapse `TimeSlotCell.tsx` into `CalendarSectionArticle.tsx`. Update `DailyContainer`, `DaySection`, `WeeklyContainer` to use `CalendarSectionArticle`. | medium | M | Behaviour is the same; capabilities flags already exist. |
| 11 | Inline-markup cleanup: `MonthlyContainer.tsx` overview branch swaps its hand-rolled `<div className="calendar-article weekly-slot …">` for `<CalendarSectionArticle>` with `keyLabel={dayLabel}` and a `monthlyDay` capability. | medium | S | Verify the day-row vertical layout. |
| 12 | Inline `style={{ position: 'relative' }}` → SCSS (`.calendar-article__content { position: relative; }`). | low | XS | Two files. |
| 13 | Final pass: delete `_weekly.scss`, `_daily.scss`, `_monthly.scss`, `_pages.scss`, `_moment-action.scss` (now under `calendar/`). | low | XS | Just removal — content already moved. |

Stop after any step; nothing relies on the next.

---

## 8 · What stays out of scope (deferred, on purpose)

1. **Desktop grid views.** Per the brief: no horizontal large-desktop layout
   yet. The naming and file layout above leave room — when a `MonthlyGrid` or
   `WeeklyGrid` view returns, it becomes a sibling block (`.calendar-grid`)
   under `calendar/`, consuming the same `.calendar-article` cells via a
   grid container. The 7×N desktop calendar is *not* the same component as
   the section list — it'll be its own block when needed.
2. **Light theme.** Tokens exist (`[data-theme="light"]` in `_variables.scss`)
   but no UI surfaces it. Not in scope.
3. **`.slot-icon` rename to `.moment-icon`.** Tempting but: it's used by the
   `MomentIcon` React component, by `.slot-icon-track` swipe machinery, and by
   the draft picker. Rename would be a sweep of its own. Leave for a follow-up.
4. **`features/calendar/{daily,weekly,monthly}/` folder restructure.** The
   moment-action brief asked about this. Out of scope here — this plan is
   CSS + cell-wrapper dedup, not the feature-folder shape.

---

## 9 · Decisions (open for sign-off before step 7)

1. **`.calendar-article--monthly-day` modifier vs a separate component.** The
   day-as-article in monthly-vertical (`weekly-slot--monthly-day` today) is
   genuinely a different layout — wider key, stacked moments. Stays a
   modifier? Or graduates to its own block `.calendar-article-day` once
   horizontal grid views land? **Recommend: modifier for now; promote later.**

2. **Should `MomentAction` own the swipe-to-complete handler?** Currently
   `useSwipeComplete` is wired in `MomentIcon`/`TimeSlotCell`. With the unified
   `MomentAction`, the read variant is the natural home — keeps interaction
   colocated with presentation. **Recommend: yes, but as a separate step
   after step 7 lands.**

3. **`MomentAction` body min-height.** Today's `.moment-action-item` (overview)
   uses bigger padding/icons than `.moment-card` (configure). Unifying means
   picking one. **Recommend: keep the larger overview sizing as default
   (`.moment-action`), and let `--edit` and `--draft` shrink via modifier — the
   data is the same in all three.**

4. **`.calendar` page wrapper styles.** Today's three views each use a Tailwind
   wrapper (`mx-auto max-w-{2xl,7xl,5xl} sm:px-6 lg:px-8`). Stays Tailwind, or
   becomes a `.calendar--{daily,weekly,monthly}` modifier in SCSS?
   **Recommend: stays Tailwind.** It's layout, the views legitimately differ
   in max-width, and pulling it into SCSS just to "have no Tailwind" trades a
   utility for a one-shot rule. The "no CSS in React" rule applies to inline
   `style={{}}` and hardcoded SCSS-shaped values, not to layout utilities.

---

## 10 · Verification

Per step:

- **After each file move (step 2)**, build (`npm run build`) and visually
  check all three views in both modes — no rule should change.
- **After token replacement (step 5)**, diff the compiled CSS against `main`
  to confirm only colour-source changes.
- **After the `moment-action` unification (step 7)**, manual walkthrough:
  - Daily overview: read variant, progress wash, swipe-to-complete still
    works.
  - Weekly overview: read variant on small slot, body hidden on desktop.
  - Monthly overview (vertical): read variant rendered per moment in
    day-articles.
  - Daily / Weekly configure: edit variant + edit pencil + click-through.
  - Configure with empty target slot: draft variant + icon picker + name
    input.
  - Monthly configure (schedule rows): edit variant in horizontal articles
    layout; draft article when scheduling targets a day-of-week.
- **Final check**: `grep -r "weekly-slot\|moment-card\|weekly-grid\|monthly-grid\|moment-action-item\|moment-frequency-config\|daily-header\|weekly-header\|monthly-header" resources/` returns nothing.

---

## 11 · What this buys

- **One block per concept.** `.calendar-article` and `.moment-action` instead
  of `weekly-slot` / `moment-card` / `moment-action-item` / `monthly-day-cell` /
  inline monthly markup.
- **File map matches anatomy.** Open `_calendar-article.scss` and read the
  whole story of an article.
- **~600 fewer lines of SCSS** (deduplication of the three headers, two
  moment-inner trees, dead `.week-selector` / `.daily-grid` / `.monthly-grid`
  / `.monthly-day-cell` / `.consistency-bar` / `.moment-detail-ticker`).
- **One TSX cell wrapper** (`CalendarSectionArticle`) and **one moment
  component** (`MomentAction`). React file count drops by ~3.
- **No more dual classnames.** Migration of `weekly-slot` → `calendar-article`
  completes.
- **Tokens enforce themeability.** Light mode (future) only needs to override
  `_variables.scss`.
- **Adding a fourth view** ("Quarterly", desktop grid, …) becomes a data-shape
  and a wrapper — no new article or moment classes.

---

## 12 · Next step

Sign off on §3 (file layout), §4.5 (`.moment-action` shape), §9 (decisions).
Then step 1 of §7 starts.
