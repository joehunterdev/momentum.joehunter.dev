// ISO day-of-week numbers: 1 = Monday … 7 = Sunday.
export type IsoDayNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface SchedulingBase {
    name: string;
    icon: string | null;
}

// "Schedule once on this exact date, optionally at this time."
export interface OneOffScheduling extends SchedulingBase {
    kind: 'one-off';
    date: string;
    time: string | null;
}

// "Schedule recurring on these weekdays, optionally at this time."
export interface RecurringScheduling extends SchedulingBase {
    kind: 'recurring';
    daysOfWeek: IsoDayNumber[];
    time: string | null;
    anchorDate: string;
}

// Discriminated union — contradictory shapes (e.g. one-off with daysOfWeek)
// are unrepresentable at the type level.
export type SchedulingState = OneOffScheduling | RecurringScheduling;

export type SchedulingKind = SchedulingState['kind'];
