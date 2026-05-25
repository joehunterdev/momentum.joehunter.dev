/**
 * momentDragStore — module-level pub/sub store for broadcasting drag progress
 * across all MomentAction instances that share the same momentId.
 *
 * No React dependency: just a Map + subscriber Set so it stays zero-overhead
 * when nothing is dragging.
 */

type Listener = (progress: number) => void;

const listeners = new Map<number, Set<Listener>>();

/** Called by useMomentComplete as the user drags. */
export function broadcastDragProgress(momentId: number, progress: number): void {
    listeners.get(momentId)?.forEach((fn) => fn(progress));
}

/** Subscribe to drag progress for a specific momentId. Returns an unsubscribe fn. */
export function subscribeDragProgress(momentId: number, listener: Listener): () => void {
    if (!listeners.has(momentId)) {
        listeners.set(momentId, new Set());
    }
    listeners.get(momentId)!.add(listener);
    return () => {
        listeners.get(momentId)?.delete(listener);
        if (listeners.get(momentId)?.size === 0) {
            listeners.delete(momentId);
        }
    };
}
