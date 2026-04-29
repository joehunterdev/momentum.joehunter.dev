import { useCallback, useRef, useState } from 'react';

const BASE_THRESHOLD = 80;   // px for a perfect/high-consistency habit
const MAX_THRESHOLD = 240;  // px cap for a new/failing habit
const MAX_DRAG = 280;        // px cap on visual translation

interface UseSwipeCompleteOptions {
    onComplete: () => void;
    onProgressChange?: (progress: number) => void; // 0–1, drives row highlight
    disabled?: boolean;
    threshold?: number;       // hard override (skips resistance calculation)
    resistanceFactor?: number; // 0 (frictionless) → 1 (maximum resistance)
}

interface UseSwipeCompleteResult {
    dragX: number;
    dragProgress: number; // 0–1
    isDragging: boolean;
    isDone: boolean;
    handlers: {
        onPointerDown: (e: React.PointerEvent) => void;
    };
}

/** Ease-out curve: fast start, decelerates toward threshold. Exponent grows with resistance. */
function applyEasing(raw: number, threshold: number, resistanceFactor: number): number {
    const t = Math.min(raw / threshold, 1);
    const exponent = 1 + resistanceFactor * 2; // 1 (no friction) → 3 (heavy friction)
    return threshold * (1 - Math.pow(1 - t, exponent));
}

/** Decay dragX toward 0 with a spring, giving a snap-back feel on failed drag. */
function springDecay(
    current: number,
    setter: (v: number) => void,
): void {
    const step = () => {
        const next = current * 0.65;
        if (Math.abs(next) < 0.5) {
            setter(0);
            return;
        }
        setter(next);
        current = next;
        requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

/** Haptic pulse — silently ignored on desktop or unsupported devices. */
function vibrate(pattern: number | number[]) {
    try { navigator.vibrate?.(pattern); } catch { /* noop */ }
}

export function useSwipeComplete({
    onComplete,
    onProgressChange,
    disabled = false,
    threshold: thresholdOverride,
    resistanceFactor = 0,
}: UseSwipeCompleteOptions): UseSwipeCompleteResult {
    const threshold = thresholdOverride
        ?? BASE_THRESHOLD + resistanceFactor * (MAX_THRESHOLD - BASE_THRESHOLD);

    const [dragX, setDragX] = useState(0);
    const [dragProgress, setDragProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isDone, setIsDone] = useState(false);

    const startX = useRef(0);
    const triggered = useRef(false);
    const halfPulsed = useRef(false);
    const elementRef = useRef<EventTarget | null>(null);
    const lastRawDelta = useRef(0);

    const onPointerMove = useCallback((e: PointerEvent) => {
        const rawDelta = Math.max(0, Math.min(e.clientX - startX.current, MAX_DRAG));
        lastRawDelta.current = rawDelta;

        const easedDelta = applyEasing(rawDelta, threshold, resistanceFactor);
        const progress = Math.min(rawDelta / threshold, 1);

        setDragX(easedDelta);
        setDragProgress(progress);
        onProgressChange?.(progress);

        // Haptic at 50% travel
        if (progress >= 0.5 && !halfPulsed.current) {
            halfPulsed.current = true;
            vibrate(10);
        }

        if (rawDelta >= threshold && !triggered.current) {
            triggered.current = true;
            vibrate([30, 10, 30]);

            setIsDone(true);
            setDragX(0);
            setDragProgress(0);
            setIsDragging(false);
            onProgressChange?.(0);

            if (elementRef.current) {
                (elementRef.current as Element).releasePointerCapture((e as PointerEvent).pointerId);
            }
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);

            onComplete();
            setTimeout(() => setIsDone(false), 600);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onComplete, onProgressChange, threshold, resistanceFactor]);

    const onPointerUp = useCallback(() => {
        setIsDragging(false);
        setDragProgress(0);
        onProgressChange?.(0);
        triggered.current = false;
        halfPulsed.current = false;
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);

        // Spring snap-back instead of instant reset
        springDecay(lastRawDelta.current, setDragX);
        lastRawDelta.current = 0;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onPointerMove, onProgressChange]);

    const onPointerDown = useCallback((e: React.PointerEvent) => {
        if (disabled) return;

        startX.current = e.clientX;
        triggered.current = false;
        halfPulsed.current = false;
        lastRawDelta.current = 0;
        elementRef.current = e.currentTarget;
        (e.currentTarget as Element).setPointerCapture(e.pointerId);

        setIsDragging(true);
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
    }, [disabled, onPointerMove, onPointerUp]);

    return { dragX, dragProgress, isDragging, isDone, handlers: { onPointerDown } };
}

