import { useEffect, useState, type RefObject } from 'react';

interface MarqueeMeasurement {
    isOverflowing: boolean;
    /** Pixels the inner track exceeds the outer container by. */
    overflowPx: number;
}

const INITIAL: MarqueeMeasurement = { isOverflowing: false, overflowPx: 0 };

/**
 * Detect when the inner track is wider than its outer container so callers
 * can opt into a marquee animation. Re-measures whenever the text changes or
 * the outer container resizes.
 *
 * @param outerRef    The clipping container (typically the .moment-action__desc element).
 * @param innerRef    The text-bearing track inside it.
 * @param enabled     Skip measurement when false (e.g. no description present).
 * @param text        Included as a dep so re-renders with new copy re-measure.
 */
export function useMomentDescriptionMarquee(
    outerRef: RefObject<HTMLElement>,
    innerRef: RefObject<HTMLElement>,
    enabled: boolean,
    text?: string | null,
): MarqueeMeasurement {
    const [state, setState] = useState<MarqueeMeasurement>(INITIAL);

    useEffect(() => {
        if (!enabled) {
            setState(INITIAL);
            return;
        }

        const measure = () => {
            const outer = outerRef.current;
            const inner = innerRef.current;
            if (!outer || !inner) {
                return;
            }
            const px = Math.max(0, inner.scrollWidth - outer.clientWidth);
            setState((prev) =>
                prev.overflowPx === px && prev.isOverflowing === (px > 0)
                    ? prev
                    : { isOverflowing: px > 0, overflowPx: px });
        };

        measure();

        const outer = outerRef.current;
        if (typeof ResizeObserver !== 'undefined' && outer) {
            const ro = new ResizeObserver(measure);
            ro.observe(outer);
            return () => ro.disconnect();
        }
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [enabled, text, outerRef, innerRef]);

    return state;
}
