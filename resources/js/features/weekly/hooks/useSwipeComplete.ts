import { useCallback, useRef, useState } from 'react';

const BASE_THRESHOLD = 80;   // px for a perfect habit (resistanceFactor = 0)
const MAX_THRESHOLD = 240;   // px cap for a new/failing habit (resistanceFactor = 1)
const MAX_DRAG = 300;        // hard px cap on visual translation
const MAX_HOLD_MS = 700;     // ms the user must hold at threshold (scales with resistance)

interface UseSwipeCompleteOptions {
    onComplete: () => void;
    onProgressChange?: (progress: number) => void;
    disabled?: boolean;
    resistanceFactor?: number; // 0 (frictionless) → 1 (maximum resistance)
}

export interface UseSwipeCompleteResult {
    dragX: number;
    dragProgress: number; // 0–1, drag position relative to threshold
    holdProgress: number; // 0–1, hold-to-confirm fill (only > 0 when at threshold)
    isDragging: boolean;
    isDone: boolean;
    handlers: {
        onPointerDown: (e: React.PointerEvent) => void;
        onPointerMove: (e: React.PointerEvent) => void;
        onPointerUp: (e: React.PointerEvent) => void;
        onPointerCancel: (e: React.PointerEvent) => void;
    };
}

/**
 * Ease-out: fast start, decelerates toward threshold.
 * Higher resistanceFactor = heavier deceleration curve.
 */
function applyEasing(raw: number, threshold: number, resistanceFactor: number): number {
    const t = Math.min(raw / threshold, 1);
    const exponent = 1 + resistanceFactor * 2; // 1 → 3
    const eased = threshold * (1 - Math.pow(1 - t, exponent));
    // Beyond threshold: map additional travel linearly with heavy damping
    const overflow = Math.max(0, raw - threshold) * 0.15;
    return eased + overflow;
}

/** RAF-based spring snap-back. Returns a cancel fn. */
function springDecay(startVal: number, setter: (v: number) => void): () => void {
    let current = startVal;
    let rafId = 0;
    const step = () => {
        current *= 0.65;
        if (Math.abs(current) < 0.5) {
            setter(0);
            return;
        }
        setter(current);
        rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
}

function vibrate(pattern: number | number[]) {
    try { navigator.vibrate?.(pattern); } catch { /* noop */ }
}

export function useSwipeComplete({
    onComplete,
    onProgressChange,
    disabled = false,
    resistanceFactor = 0,
}: UseSwipeCompleteOptions): UseSwipeCompleteResult {
    const threshold = BASE_THRESHOLD + resistanceFactor * (MAX_THRESHOLD - BASE_THRESHOLD);
    const holdDuration = resistanceFactor * MAX_HOLD_MS;

    const [dragX, setDragX] = useState(0);
    const [dragProgress, setDragProgress] = useState(0);
    const [holdProgress, setHoldProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isDone, setIsDone] = useState(false);

    // All mutable drag state lives in refs — never stale inside handlers
    const startX = useRef(0);
    const triggered = useRef(false);
    const halfPulsed = useRef(false);
    const inHoldZone = useRef(false);
    const holdRafId = useRef(0);
    const holdStartTime = useRef(0);
    const currentEased = useRef(0);
    const cancelDecay = useRef<(() => void) | null>(null);
    const capturedElement = useRef<Element | null>(null);
    const capturedPointerId = useRef<number>(-1);

    const stopHold = useCallback(() => {
        cancelAnimationFrame(holdRafId.current);
        inHoldZone.current = false;
        holdStartTime.current = 0;
        setHoldProgress(0);
    }, []);

    const triggerComplete = useCallback(() => {
        if (triggered.current) return;
        triggered.current = true;
        vibrate([30, 10, 30]);
        capturedElement.current?.releasePointerCapture(capturedPointerId.current);
        capturedElement.current = null;
        setIsDone(true);
        setDragX(0);
        setDragProgress(0);
        setHoldProgress(0);
        setIsDragging(false);
        inHoldZone.current = false;
        onProgressChange?.(0);
        onComplete();
        setTimeout(() => setIsDone(false), 600);
    }, [onComplete, onProgressChange]);

    const onPointerDown = useCallback((e: React.PointerEvent) => {
        if (disabled) return;
        e.preventDefault();
        cancelDecay.current?.();
        cancelDecay.current = null;
        const el = e.currentTarget as Element;
        el.setPointerCapture(e.pointerId);
        capturedElement.current = el;
        capturedPointerId.current = e.pointerId;
        startX.current = e.clientX;
        triggered.current = false;
        halfPulsed.current = false;
        inHoldZone.current = false;
        currentEased.current = 0;
        setIsDragging(true);
        setDragX(0);
        setDragProgress(0);
        setHoldProgress(0);
    }, [disabled]);

    const onPointerMove = useCallback((e: React.PointerEvent) => {
        if (triggered.current) return;
        if (!(e.currentTarget as Element).hasPointerCapture(e.pointerId)) return;

        const rawDelta = Math.max(0, Math.min(e.clientX - startX.current, MAX_DRAG));
        const eased = applyEasing(rawDelta, threshold, resistanceFactor);
        const progress = Math.min(rawDelta / threshold, 1);

        currentEased.current = eased;
        setDragX(eased);
        setDragProgress(progress);
        onProgressChange?.(progress);

        if (progress >= 0.5 && !halfPulsed.current) {
            halfPulsed.current = true;
            vibrate(10);
        }

        const atThreshold = rawDelta >= threshold;

        if (atThreshold && !inHoldZone.current) {
            inHoldZone.current = true;
            holdStartTime.current = performance.now();

            if (holdDuration <= 0) {
                triggerComplete();
                return;
            }

            const tick = () => {
                if (!inHoldZone.current) return;
                const hp = Math.min((performance.now() - holdStartTime.current) / holdDuration, 1);
                setHoldProgress(hp);
                if (hp >= 1) {
                    triggerComplete();
                } else {
                    holdRafId.current = requestAnimationFrame(tick);
                }
            };
            holdRafId.current = requestAnimationFrame(tick);

        } else if (!atThreshold && inHoldZone.current) {
            stopHold();
        }
    }, [threshold, resistanceFactor, holdDuration, onProgressChange, triggerComplete, stopHold]);

    const onPointerUp = useCallback((e: React.PointerEvent) => {
        if (!(e.currentTarget as Element).hasPointerCapture(e.pointerId)) return;
        (e.currentTarget as Element).releasePointerCapture(e.pointerId);
        capturedElement.current = null;
        stopHold();
        setIsDragging(false);
        setDragProgress(0);
        setHoldProgress(0);
        onProgressChange?.(0);
        triggered.current = false;
        halfPulsed.current = false;
        cancelDecay.current = springDecay(currentEased.current, setDragX);
    }, [stopHold, onProgressChange]);

    const onPointerCancel = useCallback((_e: React.PointerEvent) => {
        stopHold();
        cancelDecay.current?.();
        capturedElement.current = null;
        setIsDragging(false);
        setDragX(0);
        setDragProgress(0);
        setHoldProgress(0);
        triggered.current = false;
    }, [stopHold]);

    return {
        dragX,
        dragProgress,
        holdProgress,
        isDragging,
        isDone,
        handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
    };
}
