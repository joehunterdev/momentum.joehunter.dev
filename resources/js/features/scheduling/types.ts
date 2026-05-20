import { SchedulingKind } from '@/shared/types/enums';

// ISO day-of-week numbers: 1 = Monday … 7 = Sunday.
export type IsoDayNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface SchedulingBase {
    name: string;
    icon: string | null;
}

// "Schedule once on this exact date, optionally at this time."
export interface OneOffScheduling extends SchedulingBase {
    kind: SchedulingKind.OneOff;
    date: string;
    time: string | null;
}

// "Schedule recurring on these weekdays, optionally at this time."
export interface RecurringScheduling extends SchedulingBase {
    kind: SchedulingKind.Recurring;
    daysOfWeek: IsoDayNumber[];
    time: string | null;
    anchorDate: string;
}

// Discriminated union — contradictory shapes (e.g. one-off with daysOfWeek)
// are unrepresentable at the type level.
export type SchedulingState = OneOffScheduling | RecurringScheduling;

// Re-export for convenience
export { SchedulingKind };
