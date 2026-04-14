import { WEEK_DAYS } from '@/shared/constants/moments';

type Frequency = 'daily' | 'weekly' | 'custom' | 'once';

interface Props {
    time: string;
    frequency: Frequency;
    daysOfWeek: number[];
    /** Optional override labels for day pills — defaults to WEEK_DAYS constants */
    dayLabels?: string[];
    conflictCount?: number;
    onChange: (frequency: Frequency, days: number[]) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

const FREQ_OPTIONS: { label: string; value: Frequency }[] = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekdays', value: 'weekly' },
    { label: 'Custom', value: 'custom' },
    { label: 'Once', value: 'once' },
];

const ALL_DAYS = WEEK_DAYS.map((d) => d.value) as number[];
const WEEKDAYS = [1, 2, 3, 4, 5];

export default function RecurrenceBar({
    time,
    frequency,
    daysOfWeek,
    conflictCount = 0,
    onChange,
    onConfirm,
    onCancel,
}: Props) {
    function handleFrequency(freq: Frequency) {
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
        <div className="recurrence-bar">
            <span className="recurrence-bar__time">{time}</span>

            <div className="recurrence-bar__freq-group" role="group" aria-label="Frequency">
                {FREQ_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        className={[
                            'recurrence-bar__freq-btn',
                            frequency === opt.value ? 'recurrence-bar__freq-btn--active' : '',
                        ].filter(Boolean).join(' ')}
                        onClick={() => handleFrequency(opt.value)}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            <div className="recurrence-bar__days" role="group" aria-label="Days of week" aria-hidden={frequency === 'once'} style={frequency === 'once' ? { display: 'none' } : undefined}>
                {WEEK_DAYS.map((day) => (
                    <button
                        key={day.value}
                        type="button"
                        className={[
                            'recurrence-bar__day-pill',
                            daysOfWeek.includes(day.value) ? 'recurrence-bar__day-pill--active' : '',
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
                <span className="recurrence-bar__conflicts" title={`${conflictCount} time slot(s) already have a moment`}>
                    ⚠️ {conflictCount} conflict{conflictCount > 1 ? 's' : ''}
                </span>
            )}

            <div className="recurrence-bar__actions">
                <button type="button" className="recurrence-bar__cancel" onClick={onCancel}>
                    ✕
                </button>
                <button type="button" className="recurrence-bar__confirm" onClick={onConfirm}>
                    ✓ Confirm
                </button>
            </div>
        </div>
    );
}
