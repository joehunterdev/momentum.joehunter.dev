import { router } from '@inertiajs/react';
import { useState } from 'react';
import { transitionKind } from './transition';
import type { IsoDayNumber, SchedulingKind, SchedulingState } from './types';

export type CalendarMode = 'overview' | 'configure';

interface UseSchedulingOptions {
    redirectTo: string;
    onConfirm?: () => void;
}

const WEEKDAYS: IsoDayNumber[] = [1, 2, 3, 4, 5];

function inferLegacyFrequency(days: IsoDayNumber[]): 'daily' | 'weekly' | 'custom' {
    if (days.length === 7) {
        return 'daily';
    }
    if (
        days.length === WEEKDAYS.length
        && WEEKDAYS.every((d) => days.includes(d))
    ) {
        return 'weekly';
    }
    return 'custom';
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
            if (!prev || prev.kind !== 'recurring') {
                return prev;
            }
            return { ...prev, daysOfWeek: days };
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

    function confirm() {
        if (!state) {
            return;
        }

        const payload = state.kind === 'one-off'
            ? {
                name: state.name.trim() || null,
                frequency: 'once' as const,
                days_of_week: null,
                preferred_time: state.time,
                icon: state.icon,
                scheduled_date: state.date,
            }
            : {
                name: state.name.trim() || null,
                frequency: inferLegacyFrequency(state.daysOfWeek),
                days_of_week: state.daysOfWeek,
                preferred_time: state.time,
                icon: state.icon,
                scheduled_date: null,
            };

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
            },
        );
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
        setTime,
        setName,
        setIcon,
        confirm,
        cancel,
        exit,
    };
}

export type UseSchedulingReturn = ReturnType<typeof useScheduling>;
