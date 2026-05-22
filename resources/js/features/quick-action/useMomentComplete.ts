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
    /** Current state. Drives gesture direction: false → swipe right; true → swipe left to undo. */
    isCompleted: boolean;
    /** Element whose width normalises the drag distance. */
    rowRef: React.RefObject<HTMLElement>;
    /**
     * Optional friction: how long the user must keep the pointer down before
     * commit unlocks. 0 = no friction (normal swipe). > 0 = hold + drag.
     */
    requiredHoldMs?: number;
}

interface UseMomentCompleteReturn {
    /** Current drag fraction (0–1), always positive — magnitude only. */
    dragProgress: number;
    /** Current hold fraction (0–1). Wire into --hold-progress on the icon. */
    holdProgress: number;
    /** True while the toggle POST is in flight. */
    isCommitting: boolean;
    /** Keyboard activation (Enter/Space). Spread alongside bindHandlers. */
    onActivate: () => void;
    /** Spread onto the swipe-target element (the icon). */
    bindHandlers: {
        onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
    };
}

/**
 * Swipe gesture for toggling a moment's completion in place.
 *
 * - Incomplete moments: swipe **right** to mark complete.
 * - Completed moments: swipe **left** to undo.
 *
 * The drag progress (0–1, magnitude only) drives the visual wash via
 * --drag-progress. On release at >= COMMIT_THRESHOLD, the toggle endpoint is
 * hit. Releasing earlier resets. Vertical-dominant gestures abort so the page
 * can still scroll.
 *
 * With requiredHoldMs > 0 (Phase 4 friction), holdProgress climbs 0→1 in
 * parallel; commit requires both thresholds. Keyboard activation skips
 * friction since pressing Enter is already deliberate — the gesture-friction
 * is for haptic reinforcement on touch.
 */
export function useMomentComplete({
    momentId,
    date,
    time,
    isCompleted,
    rowRef,
    requiredHoldMs = 0,
}: UseMomentCompleteOptions): UseMomentCompleteReturn {
    const { toggleMoment } = useCalendarActions();

    const [dragProgress, setDragProgress] = useState(0);
    const [holdProgress, setHoldProgress] = useState(0);
    const [isCommitting, setIsCommitting] = useState(false);

    const startXRef = useRef<number | null>(null);
    const startYRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);
    const rowWidthRef = useRef<number>(0);
    const progressRef = useRef<number>(0);
    const holdRef = useRef<number>(0);
    const rafRef = useRef<number | null>(null);
    const abortedRef = useRef<boolean>(false);
    // Track which direction this gesture expects, captured at pointerdown so
    // it doesn't flip mid-gesture if isCompleted changes.
    const expectedDirRef = useRef<1 | -1>(1);

    const stopHoldTimer = useCallback(() => {
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    }, []);

    const reset = useCallback(() => {
        stopHoldTimer();
        startXRef.current = null;
        startYRef.current = null;
        progressRef.current = 0;
        holdRef.current = 0;
        abortedRef.current = false;
        setDragProgress(0);
        setHoldProgress(0);
    }, [stopHoldTimer]);

    const commit = useCallback(() => {
        setIsCommitting(true);
        toggleMoment({ momentId, date, time })
            .catch(() => { /* swallow — partial reload reflects server truth */ })
            .finally(() => {
                setIsCommitting(false);
                reset();
            });
    }, [toggleMoment, momentId, date, time, reset]);

    const onPointerMove = useCallback((e: PointerEvent) => {
        if (startXRef.current === null || startYRef.current === null) {
            return;
        }
        if (abortedRef.current) {
            return;
        }
        const dx = e.clientX - startXRef.current;
        const dy = e.clientY - startYRef.current;
        const dir = expectedDirRef.current;
        const signedDx = dx * dir; // positive when moving in the expected direction

        if (Math.abs(dy) - Math.abs(dx) > VERTICAL_DOMINANCE_PX && progressRef.current < 0.1) {
            abortedRef.current = true;
            setDragProgress(0);
            progressRef.current = 0;
            return;
        }

        const width = rowWidthRef.current || 1;
        const next = Math.max(0, Math.min(1, signedDx / width));
        progressRef.current = next;
        setDragProgress(next);
    }, []);

    const onPointerUp = useCallback(() => {
        const dragReady = progressRef.current >= COMMIT_THRESHOLD;
        const holdReady = holdRef.current >= 1;
        const shouldCommit = !abortedRef.current && dragReady && holdReady;

        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        document.removeEventListener('pointercancel', onPointerUp);
        stopHoldTimer();

        if (shouldCommit) {
            commit();
        } else {
            reset();
        }
    }, [onPointerMove, commit, reset, stopHoldTimer]);

    const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
        if (isCommitting) {
            return;
        }
        if (e.button !== undefined && e.button !== 0) {
            return;
        }
        startXRef.current = e.clientX;
        startYRef.current = e.clientY;
        startTimeRef.current = performance.now();
        rowWidthRef.current = rowRef.current?.getBoundingClientRect().width ?? 0;
        progressRef.current = 0;
        abortedRef.current = false;
        // Incomplete: gesture goes right (+1). Completed: gesture goes left (-1).
        expectedDirRef.current = isCompleted ? -1 : 1;
        holdRef.current = requiredHoldMs > 0 ? 0 : 1;

        if (requiredHoldMs > 0) {
            setHoldProgress(0);
            const tick = () => {
                const elapsed = performance.now() - startTimeRef.current;
                const next = Math.max(0, Math.min(1, elapsed / requiredHoldMs));
                holdRef.current = next;
                setHoldProgress(next);
                if (next < 1) {
                    rafRef.current = requestAnimationFrame(tick);
                } else {
                    rafRef.current = null;
                }
            };
            rafRef.current = requestAnimationFrame(tick);
        } else {
            setHoldProgress(1);
        }

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
        document.addEventListener('pointercancel', onPointerUp);
    }, [isCommitting, isCompleted, rowRef, requiredHoldMs, onPointerMove, onPointerUp]);

    /** Keyboard activation (Enter/Space). Toggles immediately. */
    const onActivate = useCallback(() => {
        if (isCommitting) {
            return;
        }
        commit();
    }, [isCommitting, commit]);

    useEffect(() => () => {
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        document.removeEventListener('pointercancel', onPointerUp);
        stopHoldTimer();
    }, [onPointerMove, onPointerUp, stopHoldTimer]);

    return {
        dragProgress,
        holdProgress,
        isCommitting,
        onActivate,
        bindHandlers: { onPointerDown },
    };
}
