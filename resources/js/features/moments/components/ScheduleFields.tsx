import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import {
    WEEK_DAYS,
    RECURRING_SCHEDULE_PRESETS,
    presetFromSchedule,
    scheduleFromPreset,
} from '@/shared/constants/moments';
import { addMonths, addWeeks, addYears, format, parseISO } from 'date-fns';

interface ScheduleFieldsProps {
    frequency: App.Enums.Frequency;
    daysOfWeek: number[];
    preferredTime: string;
    /** Start date — when the habit begins; null = today (created_at). */
    startDate: string | null;
    /** Horizon — ISO date the habit stops after; null = ongoing. */
    endDate: string | null;
    errors: Partial<Record<string, string>>;
    onChange: (field: string, value: string | number[] | null) => void;
}

// Quick horizons, anchored to today. `null` = ongoing (no end date).
const HORIZON_PRESETS: { label: string; build: () => string | null }[] = [
    { label: '1 Week', build: () => format(addWeeks(new Date(), 1), 'yyyy-MM-dd') },
    { label: '1 Month', build: () => format(addMonths(new Date(), 1), 'yyyy-MM-dd') },
    { label: '1 Year', build: () => format(addYears(new Date(), 1), 'yyyy-MM-dd') },
    { label: 'Ongoing', build: () => null },
];

export default function ScheduleFields({
    frequency,
    daysOfWeek,
    preferredTime,
    startDate,
    endDate,
    errors,
    onChange,
}: ScheduleFieldsProps) {
    const activePreset = presetFromSchedule(frequency, daysOfWeek);

    function selectPreset(preset: typeof activePreset) {
        const next = scheduleFromPreset(preset, daysOfWeek);
        onChange('frequency', next.frequency);
        onChange('days_of_week', next.days_of_week);
    }

    function toggleDay(day: number) {
        const next = daysOfWeek.includes(day)
            ? daysOfWeek.filter((d) => d !== day)
            : [...daysOfWeek, day].sort((a, b) => a - b);
        onChange('days_of_week', next);
    }

    return (
        <div className="space-y-4">
            <div>
                <InputLabel value="Frequency" />
                <div className="mt-1 inline-flex border border-gray-200 bg-gray-50 p-1">
                    {RECURRING_SCHEDULE_PRESETS.map((preset) => (
                        <button
                            key={preset.value}
                            type="button"
                            onClick={() => selectPreset(preset.value)}
                            className={`px-4 py-1.5 text-sm font-medium transition-all ${activePreset === preset.value
                                ? 'bg-white text-[var(--mm-secondary)] shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
                <InputError message={errors.frequency} className="mt-1" />
            </div>

            {frequency === 'recurring' && (
                <div>
                    <InputLabel value="Days of the week" />
                    <div className="mt-1 flex gap-2">
                        {WEEK_DAYS.map((day) => (
                            <button
                                key={day.value}
                                type="button"
                                onClick={() => toggleDay(day.value)}
                                aria-label={`Toggle ${day.full}`}
                                aria-pressed={daysOfWeek.includes(day.value)}
                                className={`flex h-9 w-9 items-center justify-center text-sm font-semibold transition-all ${daysOfWeek.includes(day.value)
                                    ? 'bg-[var(--mm-secondary)] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {day.label}
                            </button>
                        ))}
                    </div>
                    <InputError message={errors.days_of_week} className="mt-1" />
                </div>
            )}

            <div>
                <InputLabel htmlFor="preferred_time" value="Preferred time (optional)" />
                <input
                    id="preferred_time"
                    type="time"
                    value={preferredTime}
                    onChange={(e) => onChange('preferred_time', e.target.value)}
                    className="mm-input mt-1 block border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <InputError message={errors.preferred_time} className="mt-1" />
            </div>

            {frequency !== 'once' && (
                <div>
                    <InputLabel htmlFor="start_date" value="Starts (optional)" />
                    <input
                        id="start_date"
                        type="date"
                        value={startDate || ''}
                        onChange={(e) => onChange('start_date', e.target.value || null)}
                        className="mm-input mt-1 block border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                        {startDate
                            ? `Starts ${format(parseISO(startDate), 'EEE d MMM yyyy')}`
                            : 'Defaults to today'}
                    </p>
                    <InputError message={errors.start_date} className="mt-1" />
                </div>
            )}

            {frequency !== 'once' && (
                <div>
                    <InputLabel value="Horizon" />
                    <div className="mt-1 grid grid-cols-4 gap-1">
                        {HORIZON_PRESETS.map((preset) => {
                            const value = preset.build();
                            const active = value === endDate;
                            return (
                                <button
                                    key={preset.label}
                                    type="button"
                                    onClick={() => onChange('end_date', value)}
                                    aria-pressed={active}
                                    className={`border px-2 py-1.5 text-xs font-medium transition-all ${active
                                        ? 'border-[var(--mm-secondary)] bg-white text-[var(--mm-secondary)] shadow-sm'
                                        : 'border-gray-200 bg-gray-50 text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {preset.label}
                                </button>
                            );
                        })}
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                        {endDate
                            ? `Ends ${format(parseISO(endDate), 'EEE d MMM yyyy')}`
                            : 'No end date — runs ongoing'}
                    </p>
                    <InputError message={errors.end_date} className="mt-1" />
                </div>
            )}
        </div>
    );
}
