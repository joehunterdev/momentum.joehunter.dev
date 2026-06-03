import { router } from '@inertiajs/react';
import Icon from '@/shared/components/Icon';

interface Props {
    momentId: number;
    momentName: string;
    className?: string;
}

/**
 * The single edit affordance for a moment row — a pencil that opens the moment
 * editor. It captures the current view (path + query) as a `return` param so
 * the editor sends the user back to exactly where they were on save/close.
 * Reused by every moment row (read + edit variants) so editing is consistent
 * across views, with no separate "configure mode" needed.
 */
export default function MomentEditButton({ momentId, momentName, className }: Props) {
    return (
        <button
            type="button"
            className={['moment-action__edit-btn', className].filter(Boolean).join(' ')}
            title={`Edit ${momentName}`}
            aria-label={`Edit ${momentName}`}
            onClick={(e) => {
                e.stopPropagation();
                const returnTo = window.location.pathname + window.location.search;
                router.get(route('moments.edit', { moment: momentId, return: returnTo }));
            }}
        >
            <Icon name="edit" size={18} aria-hidden />
        </button>
    );
}
