import { useCallback, useEffect, useRef, useState } from 'react';
import { useCalendarActions } from '@/features/calendar/hooks/useCalendarActions';

/** Drag past this fraction of the row width to commit on release. */
const COMMIT_THRESHOLD = 0.85;
/** Ignore the gesture if vertical movement dominates by this many pixels. */
const VERTICAL_DOMINANCE_PX = 8;

interface UseMomentCompleteOptions {
    momentId: number;
    /** ISO date (YYYY-MM-DD) the gesture targets. */
    date: string;
    /** Optional time slot — passed to toggle endpoint for partial reload context. */
    time?: string;
    /** Skip the gesture entirely when the moment is already completed today. */
    isCompleted: boolean;
    /** Element whose width normalises the drag distance. */
    rowRef: React.RefObject<HTMLElement>;
}

interface UseMomentCompleteReturn {
    /** Current drag fraction (0–1). Wire into --drag-progress on the row. */
    dragProgress: number;
    /** True while the toggle POST is in flight. */
    isCommitting: boolean;
    /** Spread onto the swipe-target element (the icon). */
    bindHandlers: {
        onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
    };
}

/**
 * Swipe-right gesture for completing a moment in place.
 *
 * The user presses on the moment's icon and drags horizontally. The drag
 * progress (0–1) drives the visual wash via the --drag-progress CSS variable
 * on the row. On release at >= COMMIT_THRESHOLD, the toggle endpoint is hit
 * and the calendar partial-reloads with the new status. Releasing earlier
 * snaps progress back to 0 with no commit.
 *
 * Vertical scrolling is preserved: if vertical movement dominates the early
 * gesture, the swipe aborts so the page can scroll.
 */
export function useMomentComplete({
    momentId,
    date,
    time,
    isCompleted,
    rowRef,
}: UseMomentCompleteOptions): UseMomentCompleteReturn {
    const { toggleMoment } = useCalendarActions();

    const [dragProgress, setDragProgress] = useState(0);
    const [isCommitting, setIsCommitting] = useState(false);

    // Gesture state — refs so the listeners attached to document see fresh
    // values without re-binding on every render.
    const startXRef = useRef<number | null>(null);
    const startYRef = useRef<number | null>(null);
    const rowWidthRef = useRef<number>(0);
    const progressRef = useRef<number>(0);
    const abortedRef = useRef<boolean>(false);

    const reset = useCallback(() => {
        startXRef.current = null;
        startYRef.current = null;
        progressRef.current = 0;
        abortedRef.current = false;
        setDragProgress(0);
    }, []);

    const onPointerMove = useCallback((e: PointerEvent) => {
        if (startXRef.current === null || startYRef.current === null) {
            return;
        }
        if (abortedRef.current) {
            return;
        }
        const dx = e.clientX - startXRef.current;
        const dy = e.clientY - startYRef.current;

        // If vertical movement dominates early, give up so the page can scroll.
        if (Math.abs(dy) - Math.abs(dx) > VERTICAL_DOMINANCE_PX && progressRef.current < 0.1) {
            abortedRef.current = true;
            setDragProgress(0);
            progressRef.current = 0;
            return;
        }

        const width = rowWidthRef.current || 1;
        const next = Math.max(0, Math.min(1, dx / width));
        progressRef.current = next;
        setDragProgress(next);
    }, []);

    const onPointerUp = useCallback(() => {
        const commit = !abortedRef.current && progressRef.current >= COMMIT_THRESHOLD;
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        document.removeEventListener('pointercancel', onPointerUp);

        if (commit) {
            setIsCommitting(true);
            toggleMoment({ momentId, date, time })
                .catch(() => { /* swallow — partial reload will reflect server truth */ })
                .finally(() => {
                    setIsCommitting(false);
                    reset();
                });
        } else {
            reset();
        }
    }, [onPointerMove, toggleMoment, momentId, date, time, reset]);

    const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
        if (isCompleted || isCommitting) {
            return;
        }
        if (e.button !== undefined && e.button !== 0) {
            return; // ignore non-primary buttons
        }
        startXRef.current = e.clientX;
        startYRef.current = e.clientY;
        rowWidthRef.current = rowRef.current?.getBoundingClientRect().width ?? 0;
        progressRef.current = 0;
        abortedRef.current = false;
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
        document.addEventListener('pointercancel', onPointerUp);
    }, [isCompleted, isCommitting, rowRef, onPointerMove, onPointerUp]);

    // Cleanup on unmount: detach any lingering document listeners.
    useEffect(() => () => {
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        document.removeEventListener('pointercancel', onPointerUp);
    }, [onPointerMove, onPointerUp]);

    return {
        dragProgress,
        isCommitting,
        bindHandlers: { onPointerDown },
    };
}
