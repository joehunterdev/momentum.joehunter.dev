# Calendar Components — Implementation Spec

Companion to `calendar-components-refactor-plan.md`. Reads top to bottom as
the actual build doc: every new file's contents, every move, every rename,
in the order to do them. After this is signed off, no architectural calls
should need to be made mid-build.

---

## 0 · Decisions locked in (recap)

From §10 of the plan:

1. **CSS rename.** Class names rename in lockstep with components — full
   domain-aligned set.
2. **State sharing.** React Context inside `<Calendar>`. **No Zustand, no
   event bus.** Reasoning above; revisit only if we need cross-tree state.
3. **`useScheduling()` owns the POST.** Takes `redirectTo`.
4. **`MonthlyGrid` (desktop)** is commented out, not rebuilt. Vertical
   view is used at all breakpoints. Follow-up ticket later.
5. **`SchedulingState` becomes a discriminated union** — `one-off` vs
   `recurring`. Contradictory shapes are unrepresentable.
6. **`CalendarMomentCard` variants** are `read` / `edit` / `draft`.

---

## 1 · Final type model

`features/scheduling/types.ts` (new):

```ts
// Day-of-week ISO numbers: 1 = Mon … 7 = Sun
export type IsoDayNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// Common to both variants
interface SchedulingBase {
    name: string;
    icon: string | null;
}

// "Schedule once at this exact date+optional-time"
export interface OneOffScheduling extends SchedulingBase {
    kind: 'one-off';
    date: string;             // YYYY-MM-DD
    time: string | null;      // HH:mm — null when timeless (monthly)
}

// "Schedule recurring on these weekdays at optional time"
export interface RecurringScheduling extends SchedulingBase {
    kind: 'recurring';
    daysOfWeek: IsoDayNumber[];
    time: string | null;
    anchorDate: string;       // the date the user clicked — used as a back-link
}

export type SchedulingState = OneOffScheduling | RecurringScheduling;

// Helper: type-level guarantee against overlap.
// Trying to put daysOfWeek on a one-off state, or date on a recurring
// state, is a compile error.
```

`features/scheduling/transition.ts` (new):

```ts
// Flip kind without losing the shared fields the user already filled in.
export function transitionKind(
    current: SchedulingState,
    next: 'one-off' | 'recurring',
    fallbackDate: string,                  // anchor for new recurring state
): SchedulingState {
    if (current.kind === next) { return current; }

    if (next === 'one-off') {
        return {
            kind: 'one-off',
            date: current.kind === 'recurring' ? current.anchorDate : fallbackDate,
            time: current.time,
            name: current.name,
            icon: current.icon,
        };
    }

    return {
        kind: 'recurring',
        daysOfWeek: [],                    // user picks via MomentFrequencyConfig
        time: current.time,
        anchorDate: current.kind === 'one-off' ? current.date : fallbackDate,
        name: current.name,
        icon: current.icon,
    };
}
```

---

## 2 · `useScheduling` hook — full implementation

`features/scheduling/useScheduling.ts` (new):

```ts
import { router } from '@inertiajs/react';
import { useState } from 'react';
import type {
    IsoDayNumber,
    SchedulingState,
} from './types';
import { transitionKind } from './transition';

export type CalendarMode = 'overview' | 'configure';

interface UseSchedulingOptions {
    /** Where to redirect after a successful POST. */
    redirectTo: string;
    /** Optional callback after a successful save. */
    onConfirm?: () => void;
}

export function useScheduling({ redirectTo, onConfirm }: UseSchedulingOptions) {
    const [mode, setMode] = useState<CalendarMode>('overview');
    const [state, setState] = useState<SchedulingState | null>(null);

    function start(seed: SchedulingState) {
        setMode('configure');
        setState(seed);
    }

    function setKind(next: 'one-off' | 'recurring', fallbackDate: string) {
        setState((prev) => prev && transitionKind(prev, next, fallbackDate));
    }

    function setDaysOfWeek(days: IsoDayNumber[]) {
        setState((prev) => {
            if (!prev || prev.kind !== 'recurring') { return prev; }
            return { ...prev, daysOfWeek: days };
        });
    }

    function setTime(time: string | null) {
        setState((prev) => prev && { ...prev, time });
    }

    function setName(name: string) {
        setState((prev) => prev && { ...prev, name });
    }

    function setIcon(icon: string | null) {
        setState((prev) => prev && { ...prev, icon });
    }

    function confirm() {
        if (!state) { return; }

        const payload =
            state.kind === 'one-off'
                ? {
                      name: state.name.trim() || null,
                      frequency: 'once',
                      days_of_week: null,
                      preferred_time: state.time,
                      icon: state.icon,
                      scheduled_date: state.date,
                  }
                : {
                      name: state.name.trim() || null,
                      // 'recurring' maps to 'daily' if all 7 days, else 'custom'
                      frequency: state.daysOfWeek.length === 7 ? 'daily' : 'custom',
                      days_of_week: state.daysOfWeek,
                      preferred_time: state.time,
                      icon: state.icon,
                      scheduled_date: null,
                  };

        router.post(
            route('moments.store'),
            { ...payload, _redirect: redirectTo },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setState(null);
                    setMode('overview');
                    onConfirm?.();
                },
            },
        );
    }

    function cancel() {
        setState(null);
    }

    function exit() {
        setMode('overview');
        setState(null);
    }

    return {
        mode,
        setMode,
        state,
        start,
        setKind,
        setDaysOfWeek,
        setTime,
        setName,
        setIcon,
        confirm,
        cancel,
        exit,
    };
}

export type UseSchedulingReturn = ReturnType<typeof useScheduling>;
```

`features/scheduling/index.ts`:

```ts
export { useScheduling } from './useScheduling';
export { transitionKind } from './transition';
export type {
    CalendarMode,
    UseSchedulingReturn,
} from './useScheduling';
export type {
    IsoDayNumber,
    OneOffScheduling,
    RecurringScheduling,
    SchedulingState,
} from './types';
```

**Note on frequency mapping:** the old `App.Enums.Frequency` allowed
`daily | weekly | custom | once`. The new union folds `daily` / `weekly` /
`custom` all into `recurring`. The mapping happens at the API boundary in
`confirm()` — server-side payload stays compatible. No backend changes
required for v1.

---

## 3 · `<Calendar>` container + context

`shared/components/calendar/CalendarContext.ts` (new):

```ts
import { createContext, useContext } from 'react';
import type { CalendarMode, SchedulingState } from '@/features/scheduling';

export interface CalendarContextValue {
    mode: CalendarMode;
    scheduling: SchedulingState | null;
}

export const CalendarContext = createContext<CalendarContextValue | null>(null);

export function useCalendar(): CalendarContextValue {
    const ctx = useContext(CalendarContext);
    if (!ctx) {
        throw new Error('useCalendar must be used within <Calendar>');
    }
    return ctx;
}
```

`shared/components/calendar/Calendar.tsx` (new):

```tsx
import React from 'react';
import type { CalendarMode, SchedulingState } from '@/features/scheduling';
import { CalendarContext } from './CalendarContext';

interface Props {
    mode: CalendarMode;
    scheduling: SchedulingState | null;
    children: React.ReactNode;
}

/**
 * Calendar container. Provides mode + scheduling state to descendants via
 * context and renders children in a flex column. Page-agnostic.
 */
export default function Calendar({ mode, scheduling, children }: Props) {
    return (
        <CalendarContext.Provider value={{ mode, scheduling }}>
            <div className="calendar">
                {children}
            </div>
        </CalendarContext.Provider>
    );
}
```

---

## 4 · `<CalendarSection>` + `<CalendarSectionHeader>`

`shared/components/calendar/CalendarSectionHeader.tsx` (new — extracted from
`DayRowShell`):

```tsx
interface Props {
    label: string;
    sublabel?: string;
    badge?: string;
}

export default function CalendarSectionHeader({ label, sublabel, badge }: Props) {
    return (
        <header className="calendar-section__header">
            <span className="calendar-section__label">{label}</span>
            {sublabel && <span className="calendar-section__sublabel">{sublabel}</span>}
            {badge && <span className="calendar-section__badge">{badge}</span>}
        </header>
    );
}
```

`shared/components/calendar/CalendarSection.tsx` (new — renamed
`DayRowShell`):

```tsx
import React from 'react';

interface Props {
    isToday?: boolean;
    isWeekend?: boolean;
    /**
     * 'vertical' — stack of articles (daily, weekly, monthly-vertical).
     * 'horizontal' — flex row of articles (monthly-schedule).
     */
    layout?: 'vertical' | 'horizontal';
    /** Slot for a header — typically <CalendarSectionHeader> but any JSX accepted. */
    header?: React.ReactNode;
    children: React.ReactNode;
}

export default function CalendarSection({
    isToday = false,
    isWeekend = false,
    layout = 'vertical',
    header,
    children,
}: Props) {
    const sectionCls = [
        'calendar-section',
        isToday && 'calendar-section--today',
        isWeekend && 'calendar-section--weekend',
    ].filter(Boolean).join(' ');

    const articlesCls = [
        'calendar-section__articles',
        layout === 'horizontal' && 'calendar-section__articles--horizontal',
    ].filter(Boolean).join(' ');

    return (
        <section className={sectionCls}>
            {header}
            <div className={articlesCls}>
                {children}
            </div>
        </section>
    );
}
```

---

## 5 · `<CalendarMomentCard>`

`shared/components/calendar/CalendarMomentCard.tsx` — moved from
`features/weekly/components/SlotMomentCard.tsx`. Two changes besides the
move:

1. Rename the `variant` prop values: `overview` → `read`, `configure` →
   `edit`, `ghost` → `draft`.
2. CSS class names follow the move (see §8).

Otherwise the component is identical. The icon picker, name input, and
edit-button behavior stay as-is.

```tsx
type Variant = 'read' | 'edit' | 'draft';

interface Props {
    moment: SlotMoment;
    variant?: Variant;
    onDraftNameChange?: (name: string) => void;
    onDraftIconChange?: (icon: string | null) => void;
}
```

`SlotMoment` type stays where it is for now — it travels with the moment
data shape, not the calendar UI. We don't need to move it.

---

## 6 · `<MomentFrequencyConfig>`

`shared/components/calendar/MomentFrequencyConfig.tsx` — moved from
`features/weekly/components/FrequencyBar.tsx`. **Important behavior change**
to fit the new discriminated union:

Old prop signature:

```ts
{ frequency: App.Enums.Frequency, daysOfWeek: number[], onChange(frequency, days) }
```

New prop signature:

```ts
interface Props {
    state: SchedulingState;              // the whole discriminated union
    onKindChange: (next: 'one-off' | 'recurring') => void;
    onDaysChange: (days: IsoDayNumber[]) => void;
    time?: string | null;
    conflictCount?: number;
    dayLabels?: string[];
    onConfirm: () => void;
    onCancel: () => void;
}
```

The internal `FREQ_OPTIONS` collapses from 4 → 2 visible buttons (`Once` /
`Recurring`). Selecting `Recurring` opens day-pills; selecting `Once` hides
them. The page-level shortcut ("Weekdays" / "All days" presets) becomes
internal state of `MomentFrequencyConfig` — preset buttons that call
`onDaysChange([1..5])` or `onDaysChange([1..7])`.

> Open: do we keep `Daily` and `Weekdays` as preset *chips* inside
> Recurring, or just rely on day-pill multi-select? My vote: keep both as
> presets — it's the existing affordance, and one extra tap to get to the
> common case matters.

---

## 7 · `<CalendarSectionArticle>` — the unified cell

`shared/components/calendar/CalendarSectionArticle.tsx` (new). Replaces:

- `features/daily/components/DailyTimeSlotCell.tsx`
- `features/weekly/components/TimeSlotCell.tsx`
- `features/monthly/components/MomentSlotCell.tsx`

```tsx
import { useState } from 'react';
import type { SlotMoment } from '@/features/weekly/types';  // SlotMoment stays where it is
import { isOutOfOffice, type CalendarConfig } from './utils';
import { useCalendar } from './CalendarContext';
import CalendarMomentCard from './CalendarMomentCard';
import { jsToIsoDay } from './utils';

export interface ArticleCapabilities {
    /** Daily — swipe right to complete. */
    swipeToComplete?: boolean;
    /** All views — clicking an empty article starts scheduling. */
    addOnEmpty?: boolean;
    /** Configure mode — show ghost card when this article is the scheduling target. */
    draftEdit?: boolean;
    /** Configure mode — show ⚠️ when scheduling collides with an existing moment. */
    conflictBadge?: boolean;
    /** Read mode — show ✏️ edit button on filled articles. (handled inside CalendarMomentCard) */
    editButton?: boolean;
    /** Weekly/Daily — shade out-of-office times. */
    outOfOffice?: boolean;
}

interface Props {
    /** Stable key — used for "is this the article scheduling targets?" comparisons. */
    slotKey: string;

    /** Date this article belongs to (null for monthly-schedule rows). */
    date?: string;
    /** Time slot for this article (null when timeless). */
    time?: string;
    /** Day-of-week (ISO) — only set for monthly-schedule rows. */
    isoDayNumber?: number;

    /** Moment payload — null = empty slot. */
    moment: SlotMoment | null;

    /** Calendar config — used for out-of-office shading. */
    config?: CalendarConfig;

    capabilities: ArticleCapabilities;

    onToggleComplete?: (momentId: number, instanceId: number | null, date: string) => void;
    onStartScheduling?: () => void;
    onDraftNameChange?: (name: string) => void;
    onDraftIconChange?: (icon: string | null) => void;

    /** Layout hints from parent section. */
    isToday?: boolean;
    isWeekend?: boolean;
    /** When true, this article is rendered as the next-pending article. */
    isNext?: boolean;
}

export default function CalendarSectionArticle({
    slotKey,
    date,
    time,
    isoDayNumber,
    moment,
    config,
    capabilities,
    onToggleComplete,
    onStartScheduling,
    onDraftNameChange,
    onDraftIconChange,
    isToday,
    isWeekend,
    isNext,
}: Props) {
    const { mode, scheduling } = useCalendar();
    const [swipeProgress, setSwipeProgress] = useState(0);
    const [swipeDone, setSwipeDone] = useState(false);

    // ── Compute scheduling targeting ─────────────────────────────────────
    const targetsThisArticle = (() => {
        if (!scheduling) return false;
        if (scheduling.kind === 'one-off') {
            return scheduling.date === date && scheduling.time === (time ?? null);
        }
        // recurring
        if (time !== undefined && scheduling.time !== time) return false;
        if (isoDayNumber !== undefined) {
            return scheduling.daysOfWeek.includes(isoDayNumber as IsoDayNumber);
        }
        if (date !== undefined) {
            const iso = jsToIsoDay(new Date(date).getDay());
            return scheduling.daysOfWeek.includes(iso);
        }
        return false;
    })();

    const isDraft    = capabilities.draftEdit    && targetsThisArticle && !moment;
    const isConflict = capabilities.conflictBadge && targetsThisArticle && !!moment;
    const isOoo      = capabilities.outOfOffice  && !moment && time && config
                       ? isOutOfOffice(time, config)
                       : false;

    // ── Build class names ────────────────────────────────────────────────
    const cls = [
        'calendar-article',
        isToday && 'calendar-article--today',
        isWeekend && 'calendar-article--weekend',
        isOoo && 'calendar-article--ooo',
        !moment && !isOoo && mode === 'configure' && 'calendar-article--empty',
        moment?.status === 'completed' && 'calendar-article--completed',
        isConflict && 'calendar-article--conflict',
        capabilities.swipeToComplete && swipeProgress > 0 && 'calendar-article--swiping',
        capabilities.swipeToComplete && swipeDone && 'calendar-article--swipe-done',
    ].filter(Boolean).join(' ');

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <div
            className={cls}
            style={swipeProgress > 0 ? ({ '--swipe-progress': swipeProgress } as React.CSSProperties) : undefined}
        >
            {time && (
                <span
                    className={`calendar-article__time${
                        capabilities.addOnEmpty && !moment ? ' calendar-article__time--clickable' : ''
                    }`}
                    onClick={
                        capabilities.addOnEmpty && !moment && onStartScheduling
                            ? onStartScheduling
                            : undefined
                    }
                >
                    {time}
                </span>
            )}
            <div className="calendar-article__content">
                {isDraft ? (
                    <CalendarMomentCard
                        moment={makeDraftMoment(scheduling)}
                        variant="draft"
                        onDraftNameChange={onDraftNameChange}
                        onDraftIconChange={onDraftIconChange}
                    />
                ) : moment ? (
                    <>
                        <CalendarMomentCard
                            moment={moment}
                            variant={mode === 'configure' ? 'edit' : 'read'}
                        />
                        {isConflict && (
                            <span className="calendar-article__conflict-badge" title="Scheduling conflict">
                                ⚠️
                            </span>
                        )}
                    </>
                ) : isOoo ? (
                    <span className="calendar-article__ooo-dot" aria-hidden />
                ) : capabilities.addOnEmpty && onStartScheduling ? (
                    <button
                        type="button"
                        className="calendar-article__add-btn"
                        title={time ? `Add moment at ${time}` : 'Add moment'}
                        onClick={onStartScheduling}
                    >
                        +
                    </button>
                ) : null}
            </div>
        </div>
    );
}

function makeDraftMoment(scheduling: SchedulingState | null): SlotMoment {
    return {
        id: 0,
        name: scheduling?.name || 'New Moment',
        description: null,
        status: null,
        color: null,
        icon: scheduling?.icon ?? null,
        frequency: null,
        consistency: null,
        instance_id: null,
        implementation_intention: null,
        habit_stack_after: null,
        environment_prompt: null,
    };
}
```

**Swipe-to-complete** is currently inlined in `DailyTimeSlotCell`. For v1
of this refactor we keep that logic — wrap the `<div className=cls>` with
the existing swipe handler from `features/weekly/hooks/useSwipeComplete`
(move that hook to `shared/components/calendar/hooks/`). The handler is
gated by `capabilities.swipeToComplete`.

**`AddSlotPopover`** (today's weekly-only "popover" with once/recurring
choices) is no longer needed — the discriminated union + always-on
`MomentFrequencyConfig` covers both kinds. Delete it in step 9.

---

## 8 · CSS rename map

This is the spreadsheet-ish part. Old → new in lockstep with the rename.

| Old class | New class |
|---|---|
| `weekly-day-section` | `calendar-section` |
| `weekly-day-section--today` | `calendar-section--today` |
| `weekly-day-section--weekend` | `calendar-section--weekend` |
| `weekly-day-header` | `calendar-section__header` |
| `weekly-day-header__name` | `calendar-section__label` |
| `weekly-day-header__date` | `calendar-section__sublabel` |
| `weekly-day-header__badge` | `calendar-section__badge` |
| `weekly-day-slots` | `calendar-section__articles` |
| `weekly-day-slots--horizontal` | `calendar-section__articles--horizontal` |
| `weekly-slot` | `calendar-article` |
| `weekly-slot--today` | `calendar-article--today` |
| `weekly-slot--weekend` | `calendar-article--weekend` |
| `weekly-slot--ooo` | `calendar-article--ooo` |
| `weekly-slot--empty` | `calendar-article--empty` |
| `weekly-slot--completed` | `calendar-article--completed` |
| `weekly-slot--conflict` | `calendar-article--conflict` |
| `weekly-slot--swiping` | `calendar-article--swiping` |
| `weekly-slot--swipe-done` | `calendar-article--swipe-done` |
| `weekly-slot--overview-empty` | `calendar-article--read-empty` |
| `weekly-slot--configure-empty` | `calendar-article--edit-empty` |
| `weekly-slot__time` | `calendar-article__time` |
| `weekly-slot__time--clickable` | `calendar-article__time--clickable` |
| `weekly-slot__content` | `calendar-article__content` |
| `weekly-slot__add-btn` | `calendar-article__add-btn` |
| `weekly-slot__add-btn--always-visible` | `calendar-article__add-btn--always-visible` |
| `weekly-slot__ooo-dot` | `calendar-article__ooo-dot` |
| `weekly-slot__conflict-badge` | `calendar-article__conflict-badge` |
| `slot-moment-card` | `moment-card` |
| `slot-moment-card--ghost` | `moment-card--draft` |
| `slot-moment-card--ghost-edit` | `moment-card--draft-edit` |
| `slot-moment-card__row` | `moment-card__row` |
| `slot-moment-card__body` | `moment-card__body` |
| `slot-moment-card__name` | `moment-card__name` |
| `slot-moment-card__desc` | `moment-card__desc` |
| `slot-moment-card__edit-btn` | `moment-card__edit-btn` |
| `frequency-bar` | `moment-frequency-config` |
| `frequency-bar__time` | `moment-frequency-config__time` |
| `frequency-bar__freq-group` | `moment-frequency-config__kind-group` |
| `frequency-bar__freq-btn` | `moment-frequency-config__kind-btn` |
| `frequency-bar__freq-btn--active` | `moment-frequency-config__kind-btn--active` |
| `frequency-bar__days` | `moment-frequency-config__days` |
| `frequency-bar__day-pill` | `moment-frequency-config__day-pill` |
| `frequency-bar__day-pill--active` | `moment-frequency-config__day-pill--active` |
| `frequency-bar__conflicts` | `moment-frequency-config__conflicts` |
| `frequency-bar__actions` | `moment-frequency-config__actions` |
| `frequency-bar__cancel` | `moment-frequency-config__cancel` |
| `frequency-bar__confirm` | `moment-frequency-config__confirm` |
| `weekly-grid` | `calendar__sections` |
| `weekly-header` | `calendar-header` |
| `weekly-header__mode-btn` | `calendar-header__mode-btn` |
| `weekly-header__mode-btn--done` | `calendar-header__mode-btn--done` |

Files affected: `resources/css/app.css` (or wherever these live — needs
audit; likely a few `.scss`/`.css` partials in `resources/`). Approach:
single PR per logical group (sections, articles, moment card, frequency
config, page-shells) so review is tractable.

---

## 9 · Page rewrites

### 9.1 Daily

`Pages/Daily/Index.tsx` after refactor (≈ 70 lines, down from 164):

```tsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DailyProgressBar } from '@/features/daily';
import { Head } from '@inertiajs/react';
import {
    Calendar,
    CalendarNav,
    CalendarSection,
    CalendarSectionHeader,
    CalendarSectionArticle,
    MomentFrequencyConfig,
} from '@/shared/components/calendar';
import { useScheduling } from '@/features/scheduling';
import { addDays, format, parseISO, subDays } from 'date-fns';
import type { PageProps } from '@/types';

interface Props extends PageProps, App.Data.DailyPageData {}

export default function Index({ date, day, nextDay, config, completedCount, totalCount }: Props) {
    const scheduling = useScheduling({ redirectTo: route('daily', { date }) });

    function handleStartScheduling(time: string) {
        scheduling.start({
            kind: 'one-off',
            date,
            time,
            name: '',
            icon: null,
        });
    }

    async function handleToggle(momentId: number, _instanceId: number | null, date: string) {
        // … existing fetch+reload logic, unchanged …
    }

    const currentDate = parseISO(date);
    const prevDate = subDays(currentDate, 1);
    const nextDate = addDays(currentDate, 1);

    return (
        <AuthenticatedLayout
            header={
                <div className="calendar-header">
                    <CalendarNav
                        prevLabel={format(prevDate, 'EEE d MMM')}
                        currentLabel={format(currentDate, 'EEE d MMM')}
                        nextLabel={format(nextDate, 'EEE d MMM')}
                        prevParam={{ date: format(prevDate, 'yyyy-MM-dd') }}
                        nextParam={{ date: format(nextDate, 'yyyy-MM-dd') }}
                        routeName="daily"
                    />
                    {scheduling.mode === 'overview' && totalCount > 0 && (
                        <DailyProgressBar completedCount={completedCount} totalCount={totalCount} />
                    )}
                </div>
            }
        >
            <Head title="Daily" />

            <Calendar mode={scheduling.mode} scheduling={scheduling.state}>
                {scheduling.mode === 'configure' && scheduling.state && (
                    <MomentFrequencyConfig
                        state={scheduling.state}
                        time={scheduling.state.time}
                        onKindChange={(next) => scheduling.setKind(next, date)}
                        onDaysChange={scheduling.setDaysOfWeek}
                        onConfirm={scheduling.confirm}
                        onCancel={scheduling.cancel}
                    />
                )}

                {/* Today */}
                <CalendarSection
                    isToday={day.isToday}
                    header={
                        <CalendarSectionHeader
                            label={day.dayName}
                            sublabel={format(parseISO(day.date), 'd MMMM yyyy')}
                            badge={day.isToday ? 'Today' : undefined}
                        />
                    }
                >
                    {visibleSlotsFor(day, config).map((slot) => (
                        <CalendarSectionArticle
                            key={`${day.date}-${slot.time}`}
                            slotKey={`${day.date}:${slot.time}`}
                            date={day.date}
                            time={slot.time}
                            moment={slot.moment}
                            config={config}
                            capabilities={{
                                swipeToComplete: true,
                                addOnEmpty: true,
                                draftEdit: true,
                                conflictBadge: true,
                                editButton: true,
                                outOfOffice: true,
                            }}
                            onToggleComplete={handleToggle}
                            onStartScheduling={() => handleStartScheduling(slot.time)}
                            onDraftNameChange={scheduling.setName}
                            onDraftIconChange={scheduling.setIcon}
                            isToday={day.isToday}
                        />
                    ))}
                </CalendarSection>

                {/* Next day, if any */}
                {nextDay && /* same shape */ null}
            </Calendar>
        </AuthenticatedLayout>
    );
}
```

`visibleSlotsFor` is today's `getTodaySlots` / `getNextDaySlots` —
extracted into a small helper, not changed.

### 9.2 Weekly

Same shape: `useScheduling`, `<Calendar>`, one `<CalendarSection>` per day,
each with `<CalendarSectionArticle>` per time slot. Capabilities turn
`swipeToComplete: false`, `outOfOffice: true`. The seed for
`scheduling.start()` is `kind: 'recurring'` with the clicked day's ISO
number — page logic that decides weekdays-vs-clicked-day stays in the page.

### 9.3 Monthly

Comment out `MonthlyGrid` (desktop). Always render the vertical view, which
becomes:

```tsx
<Calendar mode={scheduling.mode} scheduling={scheduling.state}>
    {scheduling.mode === 'configure' && /* MomentFrequencyConfig */}

    {scheduling.mode === 'overview'
        ? days.map((day) => (
              <CalendarSection key={day.date} header={…}>
                  {day.moments.map((m) => (
                      <CalendarSectionArticle
                          key={m.id}
                          slotKey={`${day.date}:${m.id}`}
                          date={day.date}
                          moment={m}
                          capabilities={{ editButton: true }}
                      />
                  ))}
                  {/* empty-state "+ Add moments" — handled by addOnEmpty */}
              </CalendarSection>
          ))
        : scheduleRows.map((row) => (
              <CalendarSection
                  key={row.isoDayNumber}
                  layout="horizontal"
                  header={<CalendarSectionHeader label={row.dayLabel} />}
              >
                  {row.moments.map((m) => (
                      <CalendarSectionArticle
                          key={m.id}
                          slotKey={`${row.isoDayNumber}:${m.id}`}
                          isoDayNumber={row.isoDayNumber}
                          moment={m}
                          capabilities={{}}
                      />
                  ))}
                  <CalendarSectionArticle
                      key="add"
                      slotKey={`${row.isoDayNumber}:add`}
                      isoDayNumber={row.isoDayNumber}
                      moment={null}
                      capabilities={{ addOnEmpty: true, draftEdit: true }}
                      onStartScheduling={() => /* start recurring with this row's day */}
                      onDraftNameChange={scheduling.setName}
                      onDraftIconChange={scheduling.setIcon}
                  />
              </CalendarSection>
          ))}
</Calendar>
```

In `Pages/Monthly/Index.tsx`, wrap the existing `MonthlyGrid` JSX with `{/*
… */}` (block comment) rather than deleting, so resurrecting it later for
desktop is a one-line revert.

---

## 10 · Migration order (PRs, in sequence)

Each row is one PR. Each is independently shippable.

| # | PR | Files touched | Risk |
|---|---|---|---|
| 1 | Add `features/scheduling/` types + `transitionKind`. Re-export old `SchedulingState` from `features/weekly/types` for compat. | new files only | none |
| 2 | Add `useScheduling()` hook. Migrate **Daily page only** to use it. Delete daily's local handlers. | `Pages/Daily/Index.tsx` | low — single page |
| 3 | Migrate **Weekly + Monthly pages** to `useScheduling()`. | `Pages/Weekly/Index.tsx`, `Pages/Monthly/Index.tsx` | low |
| 4 | Move `SlotMomentCard` → `CalendarMomentCard`; rename variants (`overview`→`read`, etc.). Update imports across daily/weekly/monthly. CSS class rename for moment card. | `shared/components/calendar/CalendarMomentCard.tsx`, page imports, `app.css` | low — pure rename |
| 5 | Move `FrequencyBar` → `MomentFrequencyConfig`. Switch its prop API to the discriminated union. CSS rename for frequency bar. | `shared/components/calendar/MomentFrequencyConfig.tsx`, all 3 pages, `app.css` | medium — API change |
| 6 | Extract `CalendarSectionHeader` from `DayRowShell`. Rename `DayRowShell` → `CalendarSection`. CSS rename for sections + headers. | `shared/components/calendar/CalendarSection*.tsx`, all consumers, `app.css` | medium — wide rename |
| 7 | Build `CalendarSectionArticle`. Port **monthly** `MomentSlotCell` first (simplest — no swipe, no OOO). Delete `MomentSlotCell`. | `shared/components/calendar/CalendarSectionArticle.tsx`, `Pages/Monthly/Index.tsx`, delete old | medium |
| 8 | Port **weekly** `TimeSlotCell` → `CalendarSectionArticle` (add `outOfOffice`, `conflictBadge`, popover removal). Delete `TimeSlotCell` + `AddSlotPopover`. | `Pages/Weekly/Index.tsx`, delete old | medium |
| 9 | Port **daily** `DailyTimeSlotCell` → `CalendarSectionArticle` (add `swipeToComplete`). Move `useSwipeComplete` hook into `shared/components/calendar/hooks/`. Delete daily cell. | `Pages/Daily/Index.tsx`, delete old, move hook | **high** — swipe is finicky |
| 10 | Build `<Calendar>` container + `CalendarContext`. Migrate all 3 pages to JSX-composition. Delete `WeeklyGrid` / `DailyGrid` / `MonthlyScheduleGrid` / `MonthlyVerticalView` if they have no remaining logic. | `shared/components/calendar/Calendar.tsx`, all 3 pages, deletes | medium |
| 11 | Comment out `MonthlyGrid` desktop in `Pages/Monthly/Index.tsx` per decision §0.4. Add a follow-up ticket. | `Pages/Monthly/Index.tsx`, optional `.docs/calendar-components/monthly-grid-followup.md` | none |
| 12 | CSS final sweep: remove any orphan `weekly-*` / `slot-moment-card-*` / `frequency-bar-*` rules. | `app.css` | low |

---

## 11 · Test plan

No unit tests today for these components (per current repo). For each PR
above, manual smoke covers:

**Daily**
- [ ] Empty slot click → ghost card appears + `MomentFrequencyConfig` shows.
- [ ] Switching `Once` ↔ `Recurring` in the config preserves name + icon.
- [ ] Recurring with weekdays preset (1–5) shows ghost across the correct days.
- [ ] Conflict ⚠️ shows when scheduling a recurring slot on a day that already has a moment at that time.
- [ ] Swipe right on a moment → marks complete; swipe again → uncompletes.
- [ ] OOO times are dimmed and clicking the time (not the +) starts scheduling.
- [ ] Confirm POST hits `/moments` and redirects to `/daily?date=…`.
- [ ] Cancel/exit closes the config without saving.
- [ ] Today badge + isToday styling unchanged.

**Weekly**
- [ ] All Daily checks, minus swipe.
- [ ] First click on a weekday seeds `daysOfWeek: [1,2,3,4,5]`; on a weekend seeds `[clickedDay]`.
- [ ] Conflict count in `MomentFrequencyConfig` matches number of collision cells.

**Monthly**
- [ ] Vertical view renders at all breakpoints (desktop grid commented out).
- [ ] Configure mode renders 7 horizontal day-of-week rows.
- [ ] Clicking `+ Add` on a row seeds a recurring schedule with that ISO day pre-selected.
- [ ] Day-number badge in the section header looks right at all breakpoints.

**Cross-cutting**
- [ ] CSS rename: search the repo for any remaining `weekly-slot`, `weekly-day-`, `slot-moment-card`, `frequency-bar` references — should be zero.
- [ ] No `features/daily` or `features/monthly` file imports from `features/weekly`.
- [ ] `app/Http/Controllers/MomentController@store` still receives the same payload shape (validated by manual create).

---

## 12 · Out of scope / follow-up tickets

- **MonthlyGrid desktop rebuild.** Becomes a real 7×N calendar widget,
  probably its own `<CalendarMonthGrid>` sibling to `<Calendar>`. Sized
  for a future ticket once the mobile-first refactor is stable.
- **Tests.** Adding unit/component tests for `CalendarSectionArticle` and
  `useScheduling` is a separate PR — desirable but out of scope here.
- **`SlotMoment` type relocation.** Currently in
  `features/weekly/types.ts`. Lives there fine for now; if it grows other
  consumers, move to `features/moments/types.ts`.
- **Keyboard navigation.** No tab/arrow-key support on articles currently.
  Add later as an a11y pass.

---

## 13 · Open questions still live

1. **Day-pill labels.** Where do `WEEK_DAYS` defaults vs page-overridden
   labels (Mon-first vs Sun-first) live now? Probably stay where they are
   (`shared/constants/moments`).
2. **`MomentFrequencyConfig` presets.** Confirm: keep `Daily` and
   `Weekdays` preset chips inside Recurring mode (§6 note).
3. **Empty-state add button on monthly day rows.** Today's
   `MonthlyVerticalView` renders a special "+ Add moments" button on
   empty days that navigates to `/daily?date=…`. New flow: should clicking
   that start scheduling inline (with `kind: 'one-off'` seeded to that
   date), or keep the navigate-to-daily behavior? Inline is more
   consistent; navigate is what exists today.

Confirm these three and I'll start at PR #1.
