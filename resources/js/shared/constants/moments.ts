/**
 * Shared constants for moment-related UI.
 * Used by ScheduleFields, ColorPicker, MomentForm, ConfigForm.
 */
export const MOMENT_COLOR_PALETTE: string[] = [
    '#3B82F6', // blue
    '#8B5CF6', // purple
    '#10B981', // emerald
    '#EF4444', // red
    '#F59E0B', // amber
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#84CC16', // lime
    '#6366F1', // indigo
    '#F97316', // orange
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

export interface FrequencyOption {
    value: App.Enums.Frequency;
    label: string;
    /** Whether this option represents a recurring schedule (false = one-off). */
    recurring: boolean;
}

export const FREQUENCY_OPTIONS: readonly FrequencyOption[] = [
    { value: 'daily', label: 'Daily', recurring: true },
    { value: 'weekly', label: 'Weekdays', recurring: true },
    { value: 'custom', label: 'Custom', recurring: true },
    { value: 'once', label: 'Once', recurring: false },
] as const;

export const RECURRING_FREQUENCY_OPTIONS: readonly FrequencyOption[] =
    FREQUENCY_OPTIONS.filter((o) => o.recurring);

export interface MomentFormSection {
    id: string;
    label: string;
    emoji: string;
}

export const MOMENT_FORM_SECTIONS: MomentFormSection[] = [
    { id: 'basics', label: 'Basics', emoji: '✏️' },
    { id: 'cue', label: 'Cue', emoji: '🔔' },
    { id: 'reward', label: 'Reward', emoji: '🏆' },
    { id: 'schedule', label: 'Schedule', emoji: '📅' },
];
