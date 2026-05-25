/**
 * Shared constants for moment-related UI.
 * Used by ScheduleFields, ColorPicker, MomentForm, ConfigForm, FrequencyBadge.
 */
export const MOMENT_COLOR_PALETTE: string[] = [
    '#8B5CF6', // brand violet
    '#00CFA0', // brand teal
    '#60A5FA', // sky blue
    '#22D3EE', // cyan
    '#34D399', // mint
    '#A78BFA', // soft lavender
    '#F472B6', // rose
    '#FB923C', // warm orange
    '#FBBF24', // amber gold
    '#F87171', // coral
];

export const WEEK_DAYS = [
    { label: 'M', value: 1, full: 'Monday' },
    { label: 'T', value: 2, full: 'Tuesday' },
    { label: 'W', value: 3, full: 'Wednesday' },
    { label: 'T', value: 4, full: 'Thursday' },
    { label: 'F', value: 5, full: 'Friday' },
    { label: 'S', value: 6, full: 'Saturday' },
    { label: 'S', value: 7, full: 'Sunday' },
] as const;

/**
 * UX schedule presets — what the user picks in the buttons. Distinct from the
 * storage enum `App.Enums.Frequency` (daily/recurring/once).
 *
 *   daily    → frequency=daily,     days_of_week=[]
 *   weekdays → frequency=recurring, days_of_week=[1,2,3,4,5]
 *   custom   → frequency=recurring, days_of_week=user-picked
 *   once     → frequency=once,      scheduled_date=X
 */
export type SchedulePreset = 'daily' | 'weekdays' | 'custom' | 'once';

export interface SchedulePresetOption {
    value: SchedulePreset;
    label: string;
    /** Whether this preset represents a recurring schedule (false = one-off). */
    recurring: boolean;
}

export const SCHEDULE_PRESETS: readonly SchedulePresetOption[] = [
    { value: 'daily', label: 'Daily', recurring: true },
    { value: 'weekdays', label: 'Weekdays', recurring: true },
    { value: 'custom', label: 'Custom', recurring: true },
    { value: 'once', label: 'Once', recurring: false },
] as const;

export const RECURRING_SCHEDULE_PRESETS: readonly SchedulePresetOption[] =
    SCHEDULE_PRESETS.filter((o) => o.recurring);

const WEEKDAYS_DAYS = [1, 2, 3, 4, 5];

/** Derive the active UX preset from stored (frequency, daysOfWeek). */
export function presetFromSchedule(
    frequency: App.Enums.Frequency,
    daysOfWeek: number[],
): SchedulePreset {
    if (frequency === 'once') {
        return 'once';
    }
    if (frequency === 'daily') {
        return 'daily';
    }
    if (
        daysOfWeek.length === WEEKDAYS_DAYS.length
        && WEEKDAYS_DAYS.every((d) => daysOfWeek.includes(d))
    ) {
        return 'weekdays';
    }
    return 'custom';
}

/** Translate a UX preset into the storable (frequency, daysOfWeek) shape. */
export function scheduleFromPreset(
    preset: SchedulePreset,
    currentDays: number[],
): { frequency: App.Enums.Frequency; days_of_week: number[] } {
    switch (preset) {
        case 'daily':
            return { frequency: 'daily', days_of_week: [] };
        case 'weekdays':
            return { frequency: 'recurring', days_of_week: [1, 2, 3, 4, 5] };
        case 'custom':
            return { frequency: 'recurring', days_of_week: currentDays };
        case 'once':
            return { frequency: 'once', days_of_week: [] };
    }
}

export interface MomentFormSection {
    id: string;
    label: string;
    emoji: string;
}

export const MOMENT_FORM_SECTIONS: MomentFormSection[] = [
    { id: 'basics', label: 'Basics', emoji: 'edit_note' },
    { id: 'cue', label: 'Cue', emoji: 'notifications' },
    { id: 'reward', label: 'Reward', emoji: 'emoji_events' },
    { id: 'schedule', label: 'Schedule', emoji: 'event' },
];
