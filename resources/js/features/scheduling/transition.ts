import type { SchedulingKind, SchedulingState } from './types';

/**
 * Flip a scheduling state between one-off and recurring without losing
 * the fields that carry across (name, icon, time).
 *
 * `fallbackDate` is used to anchor the new state when there isn't a date
 * to inherit (e.g. transitioning recurring → recurring, or seeding from
 * a one-off without a date).
 */
export function transitionKind(
    current: SchedulingState,
    next: SchedulingKind,
    fallbackDate: string,
): SchedulingState {
    if (current.kind === next) {
        return current;
    }

    if (next === 'one-off') {
        return {
            kind: 'one-off',
            date: current.kind === 'recurring' ? current.anchorDate : fallbackDate,
            time: current.time,
            name: current.name,
            icon: current.icon,
        };
    }

    return {
        kind: 'recurring',
        daysOfWeek: [],
        time: current.time,
        anchorDate: current.kind === 'one-off' ? current.date : fallbackDate,
        name: current.name,
        icon: current.icon,
    };
}
