import { router } from '@inertiajs/react';
import { useCallback } from 'react';

interface ToggleMomentOptions {
    momentId: number;
    date: string;
    time?: string;
    reloadOnly?: string[];
}

export function useCalendarActions() {
    /**
     * Toggle moment completion status (complete/incomplete)
     * Uses Inertia router for proper CSRF handling and partial reloads
     */
    const toggleMoment = useCallback(
        async ({ momentId, date, time, reloadOnly }: ToggleMomentOptions) => {
            return new Promise<void>((resolve, reject) => {
                router.post(
                    route('moments.toggle', { moment: momentId }),
                    { date, time },
                    {
                        only: reloadOnly ?? ['day', 'days', 'completedCount', 'totalCount'],
                        preserveScroll: true,
                        onSuccess: () => resolve(),
                        onError: () => reject(new Error('Failed to toggle moment')),
                    }
                );
            });
        },
        []
    );

    return {
        toggleMoment,
    };
}

export type UseCalendarActionsReturn = ReturnType<typeof useCalendarActions>;
