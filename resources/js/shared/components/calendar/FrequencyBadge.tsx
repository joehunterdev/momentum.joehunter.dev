import {
    SCHEDULE_PRESETS,
    WEEK_DAYS,
    type SchedulePreset,
} from '@/shared/constants/moments';
import Icon from '@/shared/components/Icon';

interface Props {
    time?: string | null;
    preset: SchedulePreset;
    daysOfWeek: number[];
    /** Optional override labels for day pills — defaults to WEEK_DAYS constants */
    dayLabels?: string[];
    conflictCount?: number;
    onChange: (preset: SchedulePreset, days: number[]) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

const ALL_DAYS = WEEK_DAYS.map((d) => d.value) as number[];
const WEEKDAYS = [1, 2, 3, 4, 5];

export default function FrequencyBadge({
    time,
    preset,
    daysOfWeek,
    conflictCount = 0,
    onChange,
    onConfirm,
    onCancel,
}: Props) {
    function handlePreset(next: SchedulePreset) {
        if (next === 'daily') {
            onChange('daily', ALL_DAYS);
        } else if (next === 'weekdays') {
            onChange('weekdays', WEEKDAYS);
        } else if (next === 'once') {
            onChange('once', []);
        } else {
            onChange('custom', daysOfWeek);
        }
    }

    function toggleDay(day: number) {
        if (preset !== 'custom') { return; }
        const next = daysOfWeek.includes(day)
            ? daysOfWeek.filter((d) => d !== day)
            : [...daysOfWeek, day].sort((a, b) => a - b);
        onChange('custom', next);
    }

    return (
        <div className="frequency-bar">
            {time && <span className="frequency-bar__time">{time}</span>}

            <div className="frequency-bar__freq-group" role="group" aria-label="Frequency">
                {SCHEDULE_PRESETS.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        className={[
                            'frequency-bar__freq-btn',
                            preset === opt.value ? 'frequency-bar__freq-btn--active' : '',
                        ].filter(Boolean).join(' ')}
                        onClick={() => handlePreset(opt.value)}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            <div
                className="frequency-bar__days"
                role="group"
                aria-label="Days of week"
                aria-hidden={preset === 'once'}
                style={preset === 'once' ? { display: 'none' } : undefined}
            >
                {WEEK_DAYS.map((day) => (
                    <button
                        key={day.value}
                        type="button"
                        className={[
                            'frequency-bar__day-pill',
                            daysOfWeek.includes(day.value) ? 'frequency-bar__day-pill--active' : '',
                        ].filter(Boolean).join(' ')}
                        aria-label={day.full}
                        aria-pressed={daysOfWeek.includes(day.value)}
                        disabled={preset !== 'custom'}
                        onClick={() => toggleDay(day.value)}
                    >
                        {day.label}
                    </button>
                ))}
            </div>

            {conflictCount > 0 && (
                <span className="frequency-bar__conflicts" title={`${conflictCount} time slot(s) already have a moment`}>
                    <Icon name="warning" size={16} aria-hidden /> {conflictCount} conflict{conflictCount > 1 ? 's' : ''}
                </span>
            )}

            <div className="frequency-bar__actions">
                <button type="button" className="frequency-bar__cancel" onClick={onCancel}>
                    <Icon name="close" size={18} aria-hidden />
                </button>
                <button type="button" className="frequency-bar__confirm" onClick={onConfirm}>
                    <Icon name="check" size={18} aria-hidden /> Confirm
                </button>
            </div>
        </div>
    );
}
