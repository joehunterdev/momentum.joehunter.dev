// Types are generated from PHP DTOs — do not edit manually.
// Run `php artisan typescript:transform` to regenerate.

export type SlotStatus = 'completed' | 'missed' | 'pending' | null;

// Re-export generated types under the names the feature uses
export type SlotMoment = App.Data.SlotMomentData;
export type TimeSlot = App.Data.TimeSlotData;
export type WeekDay = App.Data.WeekDayData;
export type WeeklyConfig = App.Data.UserConfigData;
export type WeeklyPageProps = App.Data.WeeklyPageData;

export interface SchedulingState {
    date: string;
    time: string;
    frequency: App.Enums.Frequency;
    daysOfWeek: number[];
    name: string;
    icon: string | null;
}
