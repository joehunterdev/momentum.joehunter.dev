import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import {
    WEEK_DAYS,
    RECURRING_SCHEDULE_PRESETS,
    presetFromSchedule,
    scheduleFromPreset,
} from '@/shared/constants/moments';

interface ScheduleFieldsProps {
    frequency: App.Enums.Frequency;
    daysOfWeek: number[];
    preferredTime: string;
    errors: Partial<Record<string, string>>;
    onChange: (field: string, value: string | number[]) => void;
}

export default function ScheduleFields({
    frequency,
    daysOfWeek,
    preferredTime,
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
                                ? 'bg-white text-indigo-600 shadow-sm'
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
                                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all ${daysOfWeek.includes(day.value)
                                    ? 'bg-indigo-600 text-white'
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
        </div>
    );
}
