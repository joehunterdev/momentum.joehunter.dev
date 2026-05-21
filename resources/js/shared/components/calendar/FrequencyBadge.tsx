import { FREQUENCY_OPTIONS, WEEK_DAYS } from '@/shared/constants/moments';

interface Props {
    time?: string | null;
    frequency: App.Enums.Frequency;
    daysOfWeek: number[];
    /** Optional override labels for day pills — defaults to WEEK_DAYS constants */
    dayLabels?: string[];
    conflictCount?: number;
    onChange: (frequency: App.Enums.Frequency, days: number[]) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

const ALL_DAYS = WEEK_DAYS.map((d) => d.value) as number[];
const WEEKDAYS = [1, 2, 3, 4, 5];

export default function FrequencyBadge({
    time,
    frequency,
    daysOfWeek,
    conflictCount = 0,
    onChange,
    onConfirm,
    onCancel,
}: Props) {
    function handleFrequency(freq: App.Enums.Frequency) {
        if (freq === 'daily') {
            onChange('daily', ALL_DAYS);
        } else if (freq === 'weekly') {
            onChange('weekly', WEEKDAYS);
        } else if (freq === 'once') {
            onChange('once', []);
        } else {
            onChange('custom', daysOfWeek);
        }
    }

    function toggleDay(day: number) {
        if (frequency !== 'custom') { return; }
        const next = daysOfWeek.includes(day)
            ? daysOfWeek.filter((d) => d !== day)
            : [...daysOfWeek, day].sort((a, b) => a - b);
        onChange('custom', next);
    }

    return (
        <div className="frequency-bar">
            {time && <span className="frequency-bar__time">{time}</span>}

            <div className="frequency-bar__freq-group" role="group" aria-label="Frequency">
                {FREQUENCY_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        className={[
                            'frequency-bar__freq-btn',
                            frequency === opt.value ? 'frequency-bar__freq-btn--active' : '',
                        ].filter(Boolean).join(' ')}
                        onClick={() => handleFrequency(opt.value)}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            <div className="frequency-bar__days" role="group" aria-label="Days of week" aria-hidden={frequency === 'once'} style={frequency === 'once' ? { display: 'none' } : undefined}>
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
                        disabled={frequency !== 'custom'}
                        onClick={() => toggleDay(day.value)}
                    >
                        {day.label}
                    </button>
                ))}
            </div>

            {conflictCount > 0 && (
                <span className="frequency-bar__conflicts" title={`${conflictCount} time slot(s) already have a moment`}>
                    ⚠️ {conflictCount} conflict{conflictCount > 1 ? 's' : ''}
                </span>
            )}

            <div className="frequency-bar__actions">
                <button type="button" className="frequency-bar__cancel" onClick={onCancel}>
                    ✕
                </button>
                <button type="button" className="frequency-bar__confirm" onClick={onConfirm}>
                    ✓ Confirm
                </button>
            </div>
        </div>
    );
}
