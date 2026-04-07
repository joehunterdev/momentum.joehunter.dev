import { useCallback, useRef, useState } from 'react';

const THRESHOLD = 48; // px right to trigger completion
const MAX_DRAG = 56;  // px cap on visual translation

interface UseSwipeCompleteOptions {
    onComplete: () => void;
    disabled?: boolean;
}

interface UseSwipeCompleteResult {
    dragX: number;
    isDragging: boolean;
    isDone: boolean;
    handlers: {
        onPointerDown: (e: React.PointerEvent) => void;
    };
}

export function useSwipeComplete({ onComplete, disabled = false }: UseSwipeCompleteOptions): UseSwipeCompleteResult {
    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isDone, setIsDone] = useState(false);

    const startX = useRef(0);
    const triggered = useRef(false);
    const elementRef = useRef<EventTarget | null>(null);

    const onPointerMove = useCallback((e: PointerEvent) => {
        const delta = Math.max(0, Math.min(e.clientX - startX.current, MAX_DRAG));
        setDragX(delta);

        if (delta >= THRESHOLD && !triggered.current) {
            triggered.current = true;
            setIsDone(true);
            setDragX(0);
            setIsDragging(false);

            // Release pointer capture
            if (elementRef.current) {
                (elementRef.current as Element).releasePointerCapture((e as PointerEvent).pointerId);
            }

            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);

            onComplete();

            // Reset done flash after animation
            setTimeout(() => setIsDone(false), 600);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onComplete]);

    const onPointerUp = useCallback(() => {
        setDragX(0);
        setIsDragging(false);
        triggered.current = false;
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onPointerMove]);

    const onPointerDown = useCallback((e: React.PointerEvent) => {
        if (disabled) {
            return;
        }

        startX.current = e.clientX;
        triggered.current = false;
        elementRef.current = e.currentTarget;
        (e.currentTarget as Element).setPointerCapture(e.pointerId);

        setIsDragging(true);
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
    }, [disabled, onPointerMove, onPointerUp]);

    return { dragX, isDragging, isDone, handlers: { onPointerDown } };
}
