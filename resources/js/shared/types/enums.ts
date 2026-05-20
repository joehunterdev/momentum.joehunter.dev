/**
 * Shared TypeScript enums used across the application.
 * These mirror backend enum structures where applicable.
 */

/**
 * Status of a moment instance or slot.
 * Mirrors backend MomentInstance status values.
 */
export enum MomentStatus {
    Pending = 'pending',
    Completed = 'completed',
    Missed = 'missed',
    Skipped = 'skipped',
}

/**
 * Type of moment scheduling.
 * Used in scheduling flow to determine if moment is one-time or recurring.
 */
export enum SchedulingKind {
    OneOff = 'one-off',
    Recurring = 'recurring',
}
