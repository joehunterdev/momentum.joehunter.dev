import type { CalendarMode, IsoDayNumber, SchedulingState } from '@/features/scheduling';
import MomentAction from '@/features/calendar/components/MomentAction';
import type { CalendarMoment } from '@/shared/components/calendar/types';
import { WEEK_DAYS } from '@/shared/constants/moments';
import { SchedulingKind } from '@/shared/types/enums';

interface Props {
    row: App.Data.MonthlyScheduleRowData;
    mode: CalendarMode;
    scheduling: SchedulingState | null;
    onStartScheduling: (isoDay: number) => void;
    onDraftNameChange: (name: string) => void;
    onDraftIconChange: (icon: string | null) => void;
    onDraftApply: () => void;
    onDraftApplyAll: () => void;
    onDraftCancel: () => void;
    onGhostExclude: (isoDay: IsoDayNumber) => void;
}

const WEEKEND_ISO_DAYS = [6, 7];
const WEEKDAY_SET: IsoDayNumber[] = [1, 2, 3, 4, 5];
const WEEKEND_SET: IsoDayNumber[] = [6, 7];

/**
 * Converts full MomentData (entity with schedule/cue/reward) to SlotMomentData.
 * Used for recurring schedule rows where we show moment templates, not instances.
 */
function toCalendarMoment(m: App.Data.MomentData): App.Data.SlotMomentData {
    return {
        id: m.id,
        name: m.name,
        description: m.description ?? null,
        icon: m.icon ?? null,
        color: m.color ?? null,
        frequency: m.schedule?.frequency ?? null,
        consistency: null,
        status: null,
        instance_id: null,
        implementation_intention: m.cue?.implementation_intention ?? null,
        habit_stack_after: m.cue?.habit_stack_after ?? null,
        environment_prompt: m.cue?.environment_prompt ?? null,
        progress: null,
    };
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

function sameSet(a: IsoDayNumber[], b: IsoDayNumber[]): boolean {
    if (a.length !== b.length) { return false; }
    return b.every((d) => a.includes(d));
}

function formatRecurrenceLabel(scheduling: SchedulingState | null): string | null {
    if (!scheduling || scheduling.kind !== SchedulingKind.Recurring) { return null; }
    const timePart = scheduling.time ? ` at ${scheduling.time}` : '';
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

function jsToIso(jsDay: number): IsoDayNumber {
    return (jsDay === 0 ? 7 : jsDay) as IsoDayNumber;
}

export default function MonthlyScheduleRow({
    row,
    mode,
    scheduling,
    onStartScheduling,
    onDraftNameChange,
    onDraftIconChange,
    onDraftApply,
    onDraftApplyAll,
    onDraftCancel,
    onGhostExclude,
}: Props) {
    const isWeekend = WEEKEND_ISO_DAYS.includes(row.isoDayNumber);
    const isoDayNumber = row.isoDayNumber as IsoDayNumber;
    const fullDayName = WEEK_DAYS[row.isoDayNumber - 1].full;
    const dayLabel = fullDayName.toUpperCase();

    const isRecurring = scheduling !== null && scheduling.kind === SchedulingKind.Recurring;
    const targetsThisDay = isRecurring && scheduling.daysOfWeek.includes(isoDayNumber);
    const isSource = isRecurring
        && jsToIso(new Date(scheduling.anchorDate).getDay()) === isoDayNumber
        && targetsThisDay;

    const cls = [
        'calendar-article',
        'calendar-article--monthly-day',
        'calendar-article--monthly-schedule',
        isWeekend && 'calendar-article--weekend',
    ].filter(Boolean).join(' ');

    return (
        <div className={cls}>
            <span className="calendar-article__key">{dayLabel}</span>
            <div className="calendar-article__content">
                {row.moments.map((m) => (
                    <MomentAction
                        key={m.id}
                        moment={toCalendarMoment(m)}
                        variant={mode === 'configure' ? 'edit' : 'read'}
                    />
                ))}

                {targetsThisDay && (
                    <MomentAction
                        moment={makeDraftMoment(scheduling)}
                        variant="draft"
                        isSource={isSource}
                        canApplyAll
                        recurrenceLabel={isSource ? formatRecurrenceLabel(scheduling) : null}
                        onDraftNameChange={onDraftNameChange}
                        onDraftIconChange={onDraftIconChange}
                        onDraftApply={onDraftApply}
                        onDraftApplyAll={onDraftApplyAll}
                        onDraftCancel={onDraftCancel}
                        onGhostExclude={!isSource ? () => onGhostExclude(isoDayNumber) : undefined}
                    />
                )}

                {!targetsThisDay && (
                    <button
                        type="button"
                        className="calendar-article__add-btn calendar-article__add-btn--always-visible"
                        title={`Add moment on ${fullDayName}`}
                        onClick={() => onStartScheduling(row.isoDayNumber)}
                    >
                        +
                    </button>
                )}
            </div>
        </div>
    );
}
