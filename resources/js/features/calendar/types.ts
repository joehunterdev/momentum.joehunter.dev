// Types are generated from PHP DTOs — do not edit manually.
// Run `php artisan typescript:transform` to regenerate.

import { MomentStatus } from '@/shared/types/enums';

export type SlotStatus = MomentStatus.Completed | MomentStatus.Missed | MomentStatus.Pending | null;

// Re-export generated types under the names the feature uses
export type CalendarMoment = App.Data.SlotMomentData;
export type TimeSlot = App.Data.TimeSlotData;
export type WeekDay = App.Data.WeekDayData;
export type WeeklyConfig = App.Data.UserConfigData;
export type WeeklyPageProps = App.Data.WeeklyPageData;
