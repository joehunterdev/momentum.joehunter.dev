import type {
    IsoDayNumber,
    SchedulingKind,
    SchedulingState,
} from '@/features/scheduling';
import { WEEK_DAYS } from '@/shared/constants/moments';

const ALL_DAYS: IsoDayNumber[] = [1, 2, 3, 4, 5, 6, 7];
const WEEKDAYS: IsoDayNumber[] = [1, 2, 3, 4, 5];

interface Props {
    state: SchedulingState;
    onKindChange: (next: SchedulingKind) => void;
    onDaysChange: (days: IsoDayNumber[]) => void;
    time?: string | null;
    conflictCount?: number;
    /** Optional override for the M/T/W… pill labels. Defaults to WEEK_DAYS. */
    dayLabels?: string[];
    onConfirm: () => void;
    onCancel: () => void;
}

function sameSet(a: IsoDayNumber[], b: IsoDayNumber[]): boolean {
    if (a.length !== b.length) { return false; }
    return b.every((d) => a.includes(d));
}

export default function MomentFrequencyConfig({
    state,
    onKindChange,
    onDaysChange,
    time,
    conflictCount = 0,
    dayLabels,
    onConfirm,
    onCancel,
}: Props) {
    const kind = state.kind;
    const daysOfWeek: IsoDayNumber[] = state.kind === 'recurring' ? state.daysOfWeek : [];

    const isAllDays = sameSet(daysOfWeek, ALL_DAYS);
    const isWeekdays = sameSet(daysOfWeek, WEEKDAYS);

    function toggleDay(day: IsoDayNumber) {
        if (kind !== 'recurring') { return; }
        const next = daysOfWeek.includes(day)
            ? daysOfWeek.filter((d) => d !== day)
            : [...daysOfWeek, day].sort((a, b) => a - b);
        onDaysChange(next);
    }

    function kindBtnCls(active: boolean) {
        return [
            'moment-frequency-config__kind-btn',
            active ? 'moment-frequency-config__kind-btn--active' : '',
        ].filter(Boolean).join(' ');
    }

    function presetBtnCls(active: boolean) {
        return [
            'moment-frequency-config__preset',
            active ? 'moment-frequency-config__preset--active' : '',
        ].filter(Boolean).join(' ');
    }

    function dayPillCls(active: boolean) {
        return [
            'moment-frequency-config__day-pill',
            active ? 'moment-frequency-config__day-pill--active' : '',
        ].filter(Boolean).join(' ');
    }

    return (
        <div className="moment-frequency-config">
            {time && <span className="moment-frequency-config__time">{time}</span>}

            <div className="moment-frequency-config__kind-group" role="group" aria-label="Schedule kind">
                <button
                    type="button"
                    className={kindBtnCls(kind === 'one-off')}
                    onClick={() => onKindChange('one-off')}
                >
                    Once
                </button>
                <button
                    type="button"
                    className={kindBtnCls(kind === 'recurring')}
                    onClick={() => onKindChange('recurring')}
                >
                    Recurring
                </button>
            </div>

            {kind === 'recurring' && (
                <>
                    <div className="moment-frequency-config__presets" role="group" aria-label="Preset day patterns">
                        <button
                            type="button"
                            className={presetBtnCls(isAllDays)}
                            onClick={() => onDaysChange([...ALL_DAYS])}
                        >
                            All days
                        </button>
                        <button
                            type="button"
                            className={presetBtnCls(isWeekdays)}
                            onClick={() => onDaysChange([...WEEKDAYS])}
                        >
                            Weekdays
                        </button>
                    </div>

                    <div className="moment-frequency-config__days" role="group" aria-label="Days of week">
                        {WEEK_DAYS.map((day, i) => (
                            <button
                                key={day.value}
                                type="button"
                                className={dayPillCls(daysOfWeek.includes(day.value))}
                                aria-label={day.full}
                                aria-pressed={daysOfWeek.includes(day.value)}
                                onClick={() => toggleDay(day.value)}
                            >
                                {dayLabels?.[i] ?? day.label}
                            </button>
                        ))}
                    </div>
                </>
            )}

            {conflictCount > 0 && (
                <span
                    className="moment-frequency-config__conflicts"
                    title={`${conflictCount} time slot(s) already have a moment`}
                >
                    ⚠️ {conflictCount} conflict{conflictCount > 1 ? 's' : ''}
                </span>
            )}

            <div className="moment-frequency-config__actions">
                <button
                    type="button"
                    className="moment-frequency-config__cancel"
                    onClick={onCancel}
                >
                    ✕
                </button>
                <button
                    type="button"
                    className="moment-frequency-config__confirm"
                    onClick={onConfirm}
                >
                    ✓ Confirm
                </button>
            </div>
        </div>
    );
}
