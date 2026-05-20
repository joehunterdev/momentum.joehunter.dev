import type { CalendarMode, IsoDayNumber, SchedulingState } from '@/features/scheduling';
import { isOutOfOffice, jsToIsoDay } from './utils';
import type { CalendarConfig, CalendarMoment } from './types';
import CalendarMomentCard from './CalendarMomentCard';
import { MomentActionItem } from '@/features/calendar';

export interface ArticleCapabilities {
    /** Daily — swipe right to complete (PR #9 wires this in). */
    swipeToComplete?: boolean;
    /** Empty article is clickable to start scheduling. */
    addOnEmpty?: boolean;
    /** When scheduling targets an empty article, render the draft card. */
    draftEdit?: boolean;
    /** Show ⚠️ when scheduling collides with an existing moment in this article. */
    conflictBadge?: boolean;
    /** Render the moment card's edit button. (Currently always shown by CalendarMomentCard.) */
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
    isToday,
    isWeekend,
}: Props) {
    const targets = articleTargetsScheduling(scheduling, date, time, isoDayNumber);
    const isDraft = !!capabilities.draftEdit && targets && !moment;
    const isConflict = !!capabilities.conflictBadge && targets && !!moment;
    const ooo = capabilities.outOfOffice && time && config && !moment
        ? isOutOfOffice(time, config)
        : false;

    // Transitional dual classes: keep `weekly-slot*` aliases until the
    // cross-cutting CSS sweep (PR #12) so existing styles still apply.
    const cls = [
        'calendar-article',
        'weekly-slot',
        isToday && 'calendar-article--today weekly-slot--today',
        isWeekend && 'calendar-article--weekend weekly-slot--weekend',
        ooo && 'calendar-article--ooo weekly-slot--ooo',
        !moment && !ooo && mode === 'configure' && 'calendar-article--empty weekly-slot--empty',
        moment?.status === 'completed' && 'calendar-article--completed weekly-slot--completed',
        isConflict && 'calendar-article--conflict weekly-slot--conflict',
        time === undefined && 'weekly-slot--no-time',
    ].filter(Boolean).join(' ');

    const emptyClickable = capabilities.addOnEmpty && !moment && !isDraft && !ooo;

    return (
        <div className={cls}>
            {time !== undefined && (
                <span
                    className={`calendar-article__time weekly-slot__time${emptyClickable ? ' calendar-article__time--clickable weekly-slot__time--clickable' : ''
                        }`}
                    onClick={emptyClickable ? onStartScheduling : undefined}
                    title={emptyClickable ? `Add moment at ${time}` : undefined}
                >
                    {time}
                </span>
            )}
            <div className="calendar-article__content weekly-slot__content" style={{ position: 'relative' }}>
                {isDraft ? (
                    <CalendarMomentCard
                        moment={makeDraftMoment(scheduling)}
                        variant="draft"
                        onDraftNameChange={onDraftNameChange}
                        onDraftIconChange={onDraftIconChange}
                    />
                ) : moment ? (
                    <>
                        {mode === 'configure' ? (
                            <CalendarMomentCard
                                moment={moment}
                                variant="edit"
                            />
                        ) : (
                            <MomentActionItem moment={moment} />
                        )}
                        {isConflict && (
                            <span className="calendar-article__conflict-badge weekly-slot__conflict-badge" title="Scheduling conflict">
                                ⚠️
                            </span>
                        )}
                    </>
                ) : ooo ? (
                    <span className="calendar-article__ooo-dot weekly-slot__ooo-dot" aria-hidden />
                ) : emptyClickable ? (
                    <button
                        type="button"
                        className="calendar-article__add-btn weekly-slot__add-btn weekly-slot__add-btn--always-visible"
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
