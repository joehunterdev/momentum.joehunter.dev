import type { SchedulingState } from './types';
import { SchedulingKind } from '@/shared/types/enums';

/**
 * Transition between one-off and recurring scheduling modes, preserving
 * relevant fields and clearing contradictory ones.
 *
 * @param current - Current scheduling state
 * @param next - Desired scheduling kind
 * @param fallbackDate - Date to use if current state doesn't have a suitable date
 * @returns New scheduling state with appropriate fields for the new kind
 */
export function transitionKind(
    current: SchedulingState,
    next: SchedulingKind,
    fallbackDate: string,
): SchedulingState {
    if (next === SchedulingKind.OneOff) {
        return {
            kind: SchedulingKind.OneOff,
            date: current.kind === SchedulingKind.Recurring ? current.anchorDate : fallbackDate,
            time: current.time,
            name: current.name,
            icon: current.icon,
        };
    }

    return {
        kind: SchedulingKind.Recurring,
        daysOfWeek: [],
        time: current.time,
        anchorDate: current.kind === SchedulingKind.OneOff ? current.date : fallbackDate,
        name: current.name,
        icon: current.icon,
    };
}