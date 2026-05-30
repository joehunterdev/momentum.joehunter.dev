import { useCallback, useEffect, useRef, useState } from 'react';

interface UseMomentDetailCycleOptions {
    /** Already-filtered, non-empty strings to rotate through (description first). */
    items: string[];
    /** Auto-advance on a timer — true only for the next-up row. */
    auto: boolean;
    /** Dwell time per item before auto-advancing. */
    intervalMs?: number;
    /** Crossfade duration — must match the CSS opacity transition. */
    fadeMs?: number;
}

interface UseMomentDetailCycleReturn {
    /** The text to display for the current rotation item. */
    text: string;
    /** Opacity flag — wire to `data-visible`; false during the fade-out swap. */
    visible: boolean;
    /** Advance to the next item (manual tap). Restarts the auto dwell. */
    advance: () => void;
    /** True when there's more than one item, i.e. rotation is meaningful. */
    canCycle: boolean;
}

const prefersReducedMotion = () =>
    typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Rotates a moment row's detail line through its populated behavioural fields
 * (description → implementation intention → habit stack → environment prompt)
 * with a fade-out/swap/fade-in crossfade.
 *
 * The "next up" row auto-advances on a timer; any row can be advanced by a tap.
 * Rows with 0–1 items never animate.
 */
export function useMomentDetailCycle({
    items,
    auto,
    intervalMs = 3000,
    fadeMs = 250,
}: UseMomentDetailCycleOptions): UseMomentDetailCycleReturn {
    const len = items.length;
    const canCycle = len > 1;

    const [index, setIndex] = useState(0);
    const [visible, setVisible] = useState(true);
    // Bumped on a manual tap so the auto-interval effect restarts its dwell.
    const [resetKey, setResetKey] = useState(0);

    const fadeTimer = useRef<number | null>(null);

    // One crossfade step: fade out → swap to next index → fade in. Stable across
    // index changes (functional setState) so the auto-interval never needs to be
    // torn down just to advance — that was the bug that froze it after one step.
    const step = useCallback(() => {
        if (len <= 1) { return; }

        if (prefersReducedMotion()) {
            setIndex((i) => (i + 1) % len);
            setVisible(true);
            return;
        }

        if (fadeTimer.current !== null) { clearTimeout(fadeTimer.current); }
        setVisible(false);
        fadeTimer.current = window.setTimeout(() => {
            setIndex((i) => (i + 1) % len);
            setVisible(true);
            fadeTimer.current = null;
        }, fadeMs);
    }, [len, fadeMs]);

    const advance = useCallback(() => {
        step();
        setResetKey((k) => k + 1); // restart dwell so a tap isn't instantly overridden
    }, [step]);

    // Auto loop — the interval calls step() (not advance()), so it keeps ticking.
    // resetKey in deps means a manual tap restarts the dwell window.
    useEffect(() => {
        if (!auto || len <= 1) { return; }
        const id = window.setInterval(step, intervalMs);
        return () => clearInterval(id);
    }, [auto, len, intervalMs, step, resetKey]);

    // Clear any pending fade on unmount.
    useEffect(() => () => {
        if (fadeTimer.current !== null) { clearTimeout(fadeTimer.current); }
    }, []);

    const safeIndex = len ? index % len : 0;

    return {
        text: items[safeIndex] ?? '',
        visible,
        advance,
        canCycle,
    };
}
