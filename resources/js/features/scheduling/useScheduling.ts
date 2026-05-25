import { router } from '@inertiajs/react';
import { useState } from 'react';
import { transitionKind } from './transition';
import type { IsoDayNumber, SchedulingState } from './types';
import { SchedulingKind } from '@/shared/types/enums';

export type CalendarMode = 'overview' | 'configure';

interface UseSchedulingOptions {
    redirectTo: string;
    onConfirm?: () => void;
}

/**
 * Derive the storage Frequency from a recurring day selection.
 * 7 days = daily; anything else = recurring (the days_of_week carry the detail).
 * One-off scheduling is handled separately in confirm().
 */
function deriveFrequency(days: IsoDayNumber[]): 'daily' | 'recurring' {
    return days.length === 7 ? 'daily' : 'recurring';
}

export function useScheduling({ redirectTo, onConfirm }: UseSchedulingOptions) {
    const [mode, setMode] = useState<CalendarMode>('overview');
    const [state, setState] = useState<SchedulingState | null>(null);

    function start(seed: SchedulingState) {
        setMode('configure');
        setState(seed);
    }

    function setKind(next: SchedulingKind, fallbackDate: string) {
        setState((prev) => (prev ? transitionKind(prev, next, fallbackDate) : prev));
    }

    function setDaysOfWeek(days: IsoDayNumber[]) {
        setState((prev) => {
            if (!prev || prev.kind !== SchedulingKind.Recurring) {
                return prev;
            }
            return { ...prev, daysOfWeek: days };
        });
    }

    /** Remove an isoDay from the recurring set — used by ghost-row X buttons. */
    function excludeDay(day: IsoDayNumber) {
        setState((prev) => {
            if (!prev || prev.kind !== SchedulingKind.Recurring) {
                return prev;
            }
            return { ...prev, daysOfWeek: prev.daysOfWeek.filter((d) => d !== day) };
        });
    }

    function setTime(time: string | null) {
        setState((prev) => (prev ? { ...prev, time } : prev));
    }

    function setName(name: string) {
        setState((prev) => (prev ? { ...prev, name } : prev));
    }

    function setIcon(icon: string | null) {
        setState((prev) => (prev ? { ...prev, icon } : prev));
    }

    function post(payload: Record<string, unknown>) {
        router.post(
            route('moments.store'),
            { ...payload, _redirect: redirectTo },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setState(null);
                    setMode('overview');
                    onConfirm?.();
                },
                onError: () => {
                    // Failed POST: clear state so the next + click starts fresh
                    // rather than inheriting half-edited days/excludes.
                    setState(null);
                },
            },
        );
    }

    function confirm() {
        if (!state) {
            return;
        }

        if (state.kind === SchedulingKind.OneOff) {
            post({
                name: state.name.trim() || null,
                frequency: 'once' as const,
                days_of_week: null,
                preferred_time: state.time,
                icon: state.icon,
                scheduled_date: state.date,
            });
        } else {
            const derivedFreq = deriveFrequency(state.daysOfWeek);
            post({
                name: state.name.trim() || null,
                frequency: derivedFreq,
                days_of_week: derivedFreq === 'daily' ? null : state.daysOfWeek,
                preferred_time: state.time,
                icon: state.icon,
                scheduled_date: null,
                end_date: state.endDate,
            });
        }
    }

    /**
     * Commit only the source slot as a one-off, regardless of the current
     * scheduling kind. For Recurring states, anchorDate becomes the scheduled
     * date — ghosts on other days are discarded.
     */
    function applySourceOnly() {
        if (!state) {
            return;
        }
        const scheduledDate = state.kind === SchedulingKind.OneOff ? state.date : state.anchorDate;
        post({
            name: state.name.trim() || null,
            frequency: 'once' as const,
            days_of_week: null,
            preferred_time: state.time,
            icon: state.icon,
            scheduled_date: scheduledDate,
        });
    }

    function cancel() {
        setState(null);
    }

    function exit() {
        setMode('overview');
        setState(null);
    }

    return {
        mode,
        setMode,
        state,
        start,
        setKind,
        setDaysOfWeek,
        excludeDay,
        setTime,
        setName,
        setIcon,
        confirm,
        applySourceOnly,
        cancel,
        exit,
    };
}

export type UseSchedulingReturn = ReturnType<typeof useScheduling>;
