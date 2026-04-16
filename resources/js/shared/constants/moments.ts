/**
 * Shared constants for moment-related UI.
 * Used by ScheduleFields, ColorPicker, MomentForm, ConfigForm.
 */
//TODO: unify with color palette in Tailwind config
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

// TODO: Can be in enums or dto laravel side
export const WEEK_DAYS = [
    { label: 'M', value: 1, full: 'Monday' },
    { label: 'T', value: 2, full: 'Tuesday' },
    { label: 'W', value: 3, full: 'Wednesday' },
    { label: 'T', value: 4, full: 'Thursday' },
    { label: 'F', value: 5, full: 'Friday' },
    { label: 'S', value: 6, full: 'Saturday' },
    { label: 'S', value: 7, full: 'Sunday' },
] as const;

//TODO: Could be refactored to enums
export const SCHEDULE_FREQUENCIES = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Custom', value: 'custom' },
] as const;

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
