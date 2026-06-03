import { useCallback, useEffect, useRef, useState } from 'react';

/** Drag past this fraction of the travel to arm the commit on release. */
export const DEFAULT_COMMIT_THRESHOLD = 0.85;

interface UseDragToCompleteOptions {
    /** Commit fraction (0–1) the drag must reach. */
    threshold?: number;
    /**
     * Friction: how long the pointer must dwell at/after the wall before the
     * commit unlocks. 0 = no friction (arm immediately at threshold).
     */
    requiredHoldMs?: number;
    /** Fired once on release when drag + hold thresholds are both satisfied. */
    onCommit: () => void;
}

interface UseDragToCompleteReturn {
    /** Hold fraction (0–1) — wire into the friction arc / `--hold-progress`. */
    holdProgress: number;
    /** True once both drag-threshold and hold are satisfied (commit is armed). */
    isArmed: boolean;
    /** Feed the live drag fraction (0–1) here on every Motion drag tick. */
    reportProgress: (drag: number) => void;
    /** Call on drag end. Returns whether the gesture should commit. */
    settle: () => boolean;
    /** Reset hold/armed state (e.g. on spring-back). */
    reset: () => void;
}

/**
 * Engine-agnostic commit-rule brain for a drag-to-complete gesture.
 *
 * Motion (in `DragToComplete`) owns the *visual* drag; this hook owns the
 * *rules*: the friction hold timer and the commit decision. Ported from the
 * legacy `useMomentComplete` so behaviour (threshold + hold) is preserved.
 *
 * - `reportProgress(drag)` on each drag tick: starts/cancels the hold timer as
 *   the drag crosses the threshold.
 * - `settle()` on release: returns true only when armed (drag past threshold
 *   AND hold satisfied).
 */
export function useDragToComplete({
    threshold = DEFAULT_COMMIT_THRESHOLD,
    requiredHoldMs = 0,
    onCommit,
}: UseDragToCompleteOptions): UseDragToCompleteReturn {
    const [holdProgress, setHoldProgress] = useState(0);
    const [isArmed, setIsArmed] = useState(false);

    const holdStartedRef = useRef(false);
    const holdRef = useRef(0);
    const startTimeRef = useRef(0);
    const rafRef = useRef<number | null>(null);

    const stopTimer = useCallback(() => {
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    }, []);

    const reset = useCallback(() => {
        stopTimer();
        holdStartedRef.current = false;
        holdRef.current = 0;
        setHoldProgress(0);
        setIsArmed(false);
    }, [stopTimer]);

    const reportProgress = useCallback(
        (drag: number) => {
            // No friction → armed the moment drag passes the threshold.
            if (requiredHoldMs <= 0) {
                const armed = drag >= threshold;
                holdRef.current = armed ? 1 : 0;
                setHoldProgress(armed ? 1 : 0);
                setIsArmed(armed);
                return;
            }

            // Friction → start the hold timer when the drag first hits the wall;
            // cancel + reset if the user drags back below the threshold.
            if (drag >= threshold && !holdStartedRef.current) {
                holdStartedRef.current = true;
                startTimeRef.current = performance.now();
                const tick = () => {
                    const elapsed = performance.now() - startTimeRef.current;
                    const next = Math.max(0, Math.min(1, elapsed / requiredHoldMs));
                    holdRef.current = next;
                    setHoldProgress(next);
                    if (next < 1) {
                        rafRef.current = requestAnimationFrame(tick);
                    } else {
                        rafRef.current = null;
                        setIsArmed(true);
                    }
                };
                rafRef.current = requestAnimationFrame(tick);
            } else if (drag < threshold && holdStartedRef.current) {
                holdStartedRef.current = false;
                stopTimer();
                holdRef.current = 0;
                setHoldProgress(0);
                setIsArmed(false);
            }
        },
        [requiredHoldMs, threshold, stopTimer],
    );

    const settle = useCallback((): boolean => {
        const shouldCommit = holdRef.current >= 1;
        if (shouldCommit) {
            onCommit();
        }
        reset();
        return shouldCommit;
    }, [onCommit, reset]);

    useEffect(() => stopTimer, [stopTimer]);

    return { holdProgress, isArmed, reportProgress, settle, reset };
}
