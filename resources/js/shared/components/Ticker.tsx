import { useRef } from 'react';
import { useMomentDescriptionMarquee } from '@/features/quick-action';

interface Props {
    /** The single line of text to display. */
    text: string;
    /** Scroll speed in px/sec used to derive the loop duration. */
    speed?: number;
    /** Extra class on the outer element. */
    className?: string;
}

/**
 * Single-line text that auto-scrolls left ("ticker") when it overflows its
 * container, and sits static when it fits. Re-measures on text change or
 * container resize, pauses on hover, and respects prefers-reduced-motion.
 *
 * Reuses the shared overflow-measurement hook (the same one the description
 * marquee uses) so behaviour stays consistent across the app.
 */
export default function Ticker({ text, speed = 40, className }: Props) {
    const outerRef = useRef<HTMLSpanElement>(null);
    const trackRef = useRef<HTMLSpanElement>(null);
    const { isOverflowing, overflowPx } = useMomentDescriptionMarquee(outerRef, trackRef, !!text, text);

    // A short pause is baked into the keyframes at each end; +2s covers it.
    const durationSec = overflowPx > 0 ? overflowPx / speed + 2 : 0;
    const style = isOverflowing
        ? ({
            '--ticker-distance': `${overflowPx}px`,
            '--ticker-duration': `${durationSec}s`,
        } as React.CSSProperties)
        : undefined;

    return (
        <span
            ref={outerRef}
            className={`ticker${isOverflowing ? ' ticker--scrolling' : ''}${className ? ` ${className}` : ''}`}
            style={style}
        >
            <span ref={trackRef} className="ticker__track">{text}</span>
        </span>
    );
}
