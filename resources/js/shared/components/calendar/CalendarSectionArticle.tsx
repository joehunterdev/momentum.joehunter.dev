import { useRef, useState } from 'react';
import type { CalendarMode, IsoDayNumber, SchedulingState } from '@/features/scheduling';
import { isOutOfOffice, jsToIsoDay } from '@/features/calendar/utils';
import { MomentStatus, SchedulingKind } from '@/shared/types/enums';
import { format, parseISO, startOfDay } from 'date-fns';
import { WEEK_DAYS } from '@/shared/constants/moments';
import Icon from '@/shared/components/Icon';
import type { CalendarConfig, CalendarMoment } from './types';
import MomentAction from '@/features/calendar/components/MomentAction';

export interface ArticleCapabilities {
    /** Daily — swipe right to complete (PR #9 wires this in). */
    swipeToComplete?: boolean;
    /** Empty article is clickable to start scheduling. */
    addOnEmpty?: boolean;
    /** When scheduling targets an empty article, render the draft card. */
    draftEdit?: boolean;
    /** Show ⚠️ when scheduling collides with an existing moment in this article. */
    conflictBadge?: boolean;
    /** Render the moment row's edit button. (Currently always shown by MomentAction edit variant.) */
    editButton?: boolean;
    /** Shade out-of-office times. */
    outOfOffice?: boolean;
}

interface Props {
    /** Stable identifier for this article — used for keys and debugging. */
    slotKey: string;

    /** Date this article belongs to (omit for monthly-schedule rows). */
    date?: string;
    /** Time slot for this article (omit when timeless). */
    time?: string;
    /** ISO day-of-week — used by monthly-schedule rows for recurring targeting. */
    isoDayNumber?: number;

    /** Moment payload — null = empty article. */
    moment: CalendarMoment | null;

    /** Calendar config — required when capabilities.outOfOffice is set. */
    config?: CalendarConfig;

    capabilities: ArticleCapabilities;

    /** Current calendar mode. PR #10 will lift this to context. */
    mode: CalendarMode;
    /** Current scheduling state. PR #10 will lift this to context. */
    scheduling: SchedulingState | null;

    onToggleComplete?: (momentId: number, instanceId: number | null, date: string) => void;
    onStartScheduling?: () => void;
    onDraftNameChange?: (name: string) => void;
    onDraftIconChange?: (icon: string | null) => void;
    /** Draft source row — commit just the source slot as a one-off. */
    onDraftApply?: () => void;
    /** Draft source row — commit source + all matching ghosts (recurring). */
    onDraftApplyAll?: () => void;
    /** Draft source row — discard the in-progress scheduling. */
    onDraftCancel?: () => void;
    /** Draft ghost row — exclude this isoDay from the recurrence. */
    onGhostExclude?: (isoDay: IsoDayNumber) => void;

    isToday?: boolean;
    isWeekend?: boolean;
    isNext?: boolean;
}

function articleTargetsScheduling(
    scheduling: SchedulingState | null,
    date?: string,
    time?: string,
    isoDayNumber?: number,
): boolean {
    if (!scheduling) { return false; }

    // Time gate: if both sides have a time, they must match.
    if (time !== undefined && scheduling.time !== null && scheduling.time !== time) {
        return false;
    }

    if (scheduling.kind === 'one-off') {
        if (date !== undefined && scheduling.date !== date) { return false; }
        // If the article carries no date (monthly schedule row), a one-off
        // schedule cannot target it.
        return date !== undefined;
    }

    // recurring
    if (isoDayNumber !== undefined) {
        return scheduling.daysOfWeek.includes(isoDayNumber as IsoDayNumber);
    }
    if (date !== undefined) {
        const iso = jsToIsoDay(new Date(date).getDay()) as IsoDayNumber;
        return scheduling.daysOfWeek.includes(iso);
    }
    return false;
}

/**
 * True for date-bearing slots whose moment in time has already passed. Used
 * to both hide the + button (no backdating) and suppress non-source ghost
 * rendering (the pattern fires forward from the anchor, never backwards).
 * Articles without a date (Monthly configure rows = templates) are never past.
 */
function isSlotInPast(date?: string, time?: string): boolean {
    if (!date) { return false; }
    const now = new Date();
    const slotDay = startOfDay(parseISO(date));
    const today = startOfDay(now);
    if (slotDay.getTime() < today.getTime()) { return true; }
    if (slotDay.getTime() > today.getTime()) { return false; }
    if (!time) { return false; }
    const [h, m] = time.split(':').map(Number);
    const slotMoment = new Date(slotDay);
    slotMoment.setHours(h, m, 0, 0);
    return slotMoment.getTime() <= now.getTime();
}

/**
 * True when this article is the SOURCE slot for the current scheduling — the
 * one the user clicked. For one-off, that's the only matching slot. For
 * recurring, it's the slot whose date/isoDay matches the anchorDate.
 */
function isSourceSlot(
    scheduling: SchedulingState | null,
    date?: string,
    time?: string,
    isoDayNumber?: number,
): boolean {
    if (!scheduling) { return false; }
    if (scheduling.kind === SchedulingKind.OneOff) {
        if (date !== undefined && date !== scheduling.date) { return false; }
        if (time !== undefined && scheduling.time !== null && time !== scheduling.time) { return false; }
        return date !== undefined;
    }
    // recurring
    if (time !== undefined && scheduling.time !== null && time !== scheduling.time) { return false; }
    if (date !== undefined) {
        return date === scheduling.anchorDate;
    }
    if (isoDayNumber !== undefined) {
        const anchorIso = jsToIsoDay(new Date(scheduling.anchorDate).getDay()) as IsoDayNumber;
        return isoDayNumber === anchorIso;
    }
    return false;
}

const WEEKDAY_SET: IsoDayNumber[] = [1, 2, 3, 4, 5];
const WEEKEND_SET: IsoDayNumber[] = [6, 7];

function sameSet(a: IsoDayNumber[], b: IsoDayNumber[]): boolean {
    if (a.length !== b.length) { return false; }
    return b.every((d) => a.includes(d));
}

/**
 * Human-readable summary of what Apply All will commit, e.g.
 * "every weekday at 09:30", "every Monday", "once on Wed 22 May".
 * Returned null when there's nothing meaningful to say.
 */
function formatRecurrenceLabel(scheduling: SchedulingState | null): string | null {
    if (!scheduling) { return null; }
    const timePart = scheduling.time ? ` at ${scheduling.time}` : '';

    if (scheduling.kind === SchedulingKind.OneOff) {
        const datePart = scheduling.date
            ? format(parseISO(scheduling.date), 'EEE d MMM')
            : '';
        return `once on ${datePart}${timePart}`.trim();
    }

    const days = [...scheduling.daysOfWeek].sort((a, b) => a - b) as IsoDayNumber[];
    if (days.length === 0) { return null; }
    if (days.length === 7) { return `every day${timePart}`; }
    if (sameSet(days, WEEKDAY_SET)) { return `every weekday${timePart}`; }
    if (sameSet(days, WEEKEND_SET)) { return `every weekend${timePart}`; }
    if (days.length === 1) {
        return `every ${WEEK_DAYS[days[0] - 1].full}${timePart}`;
    }
    const names = days.map((d) => WEEK_DAYS[d - 1].full.slice(0, 3)).join(', ');
    return `${names}${timePart}`;
}

function makeDraftMoment(scheduling: SchedulingState | null): CalendarMoment {
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
        progress: null,
    };
}

export default function CalendarSectionArticle({
    date,
    time,
    isoDayNumber,
    moment,
    config,
    capabilities,
    mode,
    scheduling,
    onStartScheduling,
    onDraftNameChange,
    onDraftIconChange,
    onDraftApply,
    onDraftApplyAll,
    onDraftCancel,
    onGhostExclude,
    isToday,
    isWeekend,
}: Props) {
    const targets = articleTargetsScheduling(scheduling, date, time, isoDayNumber);
    const isSourceCandidate = isSourceSlot(scheduling, date, time, isoDayNumber);
    const isPast = isSlotInPast(date, time);
    // No backdating: ghosts don't render on past slots, source can't anchor
    // there either (past + is blocked below). Pattern fires forward only.
    const suppressPastGhost = targets && !isSourceCandidate && isPast;
    const isDraft = !!capabilities.draftEdit && targets && !moment && !suppressPastGhost;
    const isSource = isDraft && isSourceCandidate;
    const canApplyAll = scheduling?.kind === SchedulingKind.Recurring;
    const isConflict = !!capabilities.conflictBadge && targets && !!moment;

    // Off-hours (out-of-office) empty slots are gated: no + button, just a dot.
    // A long-press on the time key unlocks the row for this session so a moment
    // can still be scheduled there. `unlocked` flips the effective OOO off.
    const [unlocked, setUnlocked] = useState(false);
    const configOoo = !!capabilities.outOfOffice && !!time && !!config && !moment
        ? isOutOfOffice(time, config)
        : false;
    const ooo = configOoo && !unlocked;

    const cls = [
        'calendar-article',
        // isToday && 'calendar-article--today',
        isWeekend && 'calendar-article--weekend',
        ooo && 'calendar-article--ooo',
        isPast && !moment && 'calendar-article--past',
        !moment && !ooo && mode === 'configure' && 'calendar-article--empty',
        // moment?.status === MomentStatus.Completed && 'calendar-article--completed',
        isConflict && 'calendar-article--conflict',
        time === undefined && 'calendar-article--no-time',
    ].filter(Boolean).join(' ');

    // Past slots can't be anchored — habits start now, no backdating.
    const emptyClickable = capabilities.addOnEmpty && !moment && !isDraft && !ooo && !isPast;

    // A gated off-hours slot can be long-pressed (hold) on its time key to
    // unlock scheduling for that one row. Past slots stay locked (no backdating).
    const canUnlock = configOoo && !isPast;
    const keyInteractive = emptyClickable || canUnlock;
    const lpTimer = useRef<number | null>(null);
    const lpFired = useRef(false);

    const startLongPress = () => {
        if (!canUnlock) { return; }
        lpFired.current = false;
        lpTimer.current = window.setTimeout(() => {
            lpFired.current = true;
            setUnlocked((u) => !u);
        }, 500);
    };
    const cancelLongPress = () => {
        if (lpTimer.current !== null) {
            clearTimeout(lpTimer.current);
            lpTimer.current = null;
        }
    };
    const handleKeyClick = () => {
        // A completed long-press already toggled the row — don't also schedule.
        if (lpFired.current) { lpFired.current = false; return; }
        if (emptyClickable) { onStartScheduling?.(); }
    };

    const keyTitle = canUnlock
        ? (unlocked ? `Add moment at ${time} · hold to hide` : `Off-hours — hold to enable ${time}`)
        : (emptyClickable ? `Add moment at ${time}` : undefined);

    return (
        <div className={cls}>
            {time !== undefined && (
                <span
                    className={[
                        'calendar-article__key',
                        keyInteractive && 'calendar-article__key--clickable',
                        canUnlock && 'calendar-article__key--unlockable',
                        canUnlock && unlocked && 'calendar-article__key--unlocked',
                    ].filter(Boolean).join(' ')}
                    onClick={keyInteractive ? handleKeyClick : undefined}
                    onPointerDown={canUnlock ? startLongPress : undefined}
                    onPointerUp={canUnlock ? cancelLongPress : undefined}
                    onPointerLeave={canUnlock ? cancelLongPress : undefined}
                    onPointerCancel={canUnlock ? cancelLongPress : undefined}
                    title={keyTitle}
                >
                    {time}
                </span>
            )}
            <div className="calendar-article__content">
                {isDraft ? (
                    <MomentAction
                        moment={makeDraftMoment(scheduling)}
                        variant="draft"
                        isSource={isSource}
                        canApplyAll={canApplyAll}
                        recurrenceLabel={isSource ? formatRecurrenceLabel(scheduling) : null}
                        onDraftNameChange={onDraftNameChange}
                        onDraftIconChange={onDraftIconChange}
                        onDraftApply={onDraftApply}
                        onDraftApplyAll={onDraftApplyAll}
                        onDraftCancel={onDraftCancel}
                        onGhostExclude={onGhostExclude && !isSource ? () => {
                            const iso = (isoDayNumber
                                ?? (date ? jsToIsoDay(new Date(date).getDay()) : undefined)) as IsoDayNumber | undefined;
                            if (iso !== undefined) { onGhostExclude(iso); }
                        } : undefined}
                    />
                ) : moment ? (
                    <>
                        <MomentAction
                            moment={moment}
                            variant={mode === 'configure' ? 'edit' : 'read'}
                            date={date}
                            time={time}
                        />
                        {isConflict && (
                            <span className="calendar-article__conflict-badge" title="Scheduling conflict">
                                <Icon name="warning" size={14} aria-hidden />
                            </span>
                        )}
                    </>
                ) : ooo ? (
                    <span className="calendar-article__ooo-dot" aria-hidden />
                ) : emptyClickable ? (
                    <button
                        type="button"
                        className="calendar-article__add-btn calendar-article__add-btn--always-visible"
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
