import { useEffect, useRef } from 'react';
import {
    motion,
    useMotionValue,
    useTransform,
    animate,
    type PanInfo,
} from 'motion/react';
import { useDragToComplete, DEFAULT_COMMIT_THRESHOLD } from './useDragToComplete';

interface DragToCompleteProps {
    /** Max horizontal travel in px (magnitude). */
    maxTravel: number;
    /** Peak lean rotation in degrees at full travel. Default 45. */
    maxRotate?: number;
    /**
     * Extra degrees the icon keeps rotating *through* the hold phase, on top of
     * `maxRotate`. This is what stops the icon "freezing" at the wall while a
     * friction item is held — it winds on toward completion. Default 180.
     */
    holdSpin?: number;
    /** Commit fraction (0–1) the drag must reach. Default 0.85. */
    threshold?: number;
    /** Friction: ms the pointer must dwell at the wall before commit unlocks. */
    requiredHoldMs?: number;
    /** 1 = drag right (complete), -1 = drag left (undo). Default 1. */
    direction?: 1 | -1;
    /** Fired once both drag + hold thresholds are met and the pointer releases. */
    onCommit: () => void;
    /** Continuous progress (drag 0–1 magnitude, hold 0–1) for arc/fade/broadcast. */
    onProgress?: (drag: number, hold: number) => void;
    /** Disable the gesture (e.g. while committing). */
    disabled?: boolean;
    children: React.ReactNode;
    'aria-label'?: string;
}

function prefersReducedMotion(): boolean {
    return typeof window !== 'undefined'
        && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

/**
 * Reusable drag-to-confirm primitive (Motion-owned `drag="x"`).
 *
 * The child leans (rotates) toward the drag direction as it travels, maxing out
 * exactly as the commit threshold is reached. On release past the threshold —
 * and, for friction items, after the required hold — `onCommit` fires and the
 * child animates to full travel; otherwise it springs back to rest.
 *
 * Headless of any moment logic: drives a `useDragToComplete` brain for the
 * commit rules and reports raw progress out via `onProgress`. Reuse anywhere a
 * swipe/hold-to-confirm gesture is wanted.
 */
export default function DragToComplete({
    maxTravel,
    maxRotate = 45,
    holdSpin = 180,
    threshold = DEFAULT_COMMIT_THRESHOLD,
    requiredHoldMs = 0,
    direction = 1,
    onCommit,
    onProgress,
    disabled = false,
    children,
    'aria-label': ariaLabel,
}: DragToCompleteProps) {
    const x = useMotionValue(0);
    const reduceMotion = prefersReducedMotion();
    const lean = reduceMotion ? 0 : maxRotate;
    const spin = reduceMotion ? 0 : holdSpin;

    const { holdProgress, reportProgress, settle, reset } = useDragToComplete({
        threshold,
        requiredHoldMs,
        onCommit,
    });

    // Rotation = travel lean + hold wind-on. Travel rotates the icon as it slides;
    // once it reaches the wall (x clamps), the hold value takes over so the icon
    // keeps rotating *through* the friction hold instead of freezing in place.
    const holdMV = useMotionValue(0);
    const travelRotate = useTransform(x, [0, maxTravel * direction], [0, lean * direction]);
    const holdRotate = useTransform(holdMV, [0, 1], [0, spin * direction]);
    const rotate = useTransform(
        [travelRotate, holdRotate],
        ([t, h]: number[]) => t + h,
    );

    // Keep the hold rotation in sync with the friction timer. Friction items get
    // a smooth rAF-driven value (set directly); no-friction items flip 0↔1 at the
    // threshold, so spring it to soften the snap.
    useEffect(() => {
        if (requiredHoldMs > 0) {
            holdMV.set(holdProgress);
            return;
        }
        const controls = animate(holdMV, holdProgress, { type: 'spring', stiffness: 300, damping: 26 });
        return () => controls.stop();
    }, [holdProgress, holdMV, requiredHoldMs]);

    const dragRef = useRef(0);
    const onProgressRef = useRef(onProgress);
    onProgressRef.current = onProgress;

    // Report the current drag fraction (magnitude) on every x change.
    useEffect(() => {
        const unsub = x.on('change', (value) => {
            const drag = Math.max(0, Math.min(1, (value * direction) / (maxTravel || 1)));
            dragRef.current = drag;
            reportProgress(drag);
            onProgressRef.current?.(drag, 0);
        });
        return () => unsub();
    }, [x, direction, maxTravel, reportProgress]);

    // Friction arc fills while the pointer dwells at the wall (x is static there,
    // so surface holdProgress changes here rather than from the x listener).
    useEffect(() => {
        onProgressRef.current?.(dragRef.current, holdProgress);
    }, [holdProgress]);

    function handleDragEnd(_e: PointerEvent, _info: PanInfo) {
        const committed = settle();
        if (committed) {
            animate(x, maxTravel * direction, { type: 'spring', stiffness: 500, damping: 30 });
            // Final flourish: wind the rotation all the way on to its peak.
            animate(holdMV, 1, { type: 'spring', stiffness: 220, damping: 22 });
        } else {
            animate(x, 0, { type: 'spring', stiffness: 600, damping: 35 });
            animate(holdMV, 0, { type: 'spring', stiffness: 400, damping: 30 });
            reset();
        }
    }

    const constraints = direction === 1
        ? { left: 0, right: maxTravel }
        : { left: -maxTravel, right: 0 };

    return (
        <motion.div
            drag={disabled ? false : 'x'}
            dragDirectionLock
            dragConstraints={constraints}
            dragElastic={0.05}
            dragMomentum={false}
            style={{ x, rotate, touchAction: 'pan-y', display: 'inline-flex' }}
            onDragEnd={handleDragEnd}
            aria-label={ariaLabel}
        >
            {children}
        </motion.div>
    );
}
