import { useEffect, useState } from 'react';
import { subscribeDragProgress } from './momentDragStore';

/**
 * Returns the current drag progress (0–1) for a given momentId — driven by
 * whichever MomentAction instance for that moment is currently being swiped.
 * Returns 0 when nothing is dragging.
 */
export function useMomentDragPreview(momentId: number): number {
    const [preview, setPreview] = useState(0);

    useEffect(() => {
        return subscribeDragProgress(momentId, setPreview);
    }, [momentId]);

    return preview;
}
