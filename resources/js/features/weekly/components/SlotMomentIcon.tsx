import { useSwipeComplete } from '../hooks/useSwipeComplete';
import type { SlotMoment } from '../types';

interface Props {
    moment: SlotMoment;
    date: string;
    onToggle: (momentId: number, instanceId: number | null, date: string) => void;
    onSwipeProgress?: (progress: number) => void;
    /** When true: renders icon with status colour but no swipe interaction */
    isStatic?: boolean;
}

export default function SlotMomentIcon({ moment, date, onToggle, onSwipeProgress, isStatic = false }: Props) {
    const isCompleted = moment.status === 'completed';
    const isPast = moment.status === 'completed' || moment.status === 'missed';

    const { dragX, isDragging, isDone, handlers } = useSwipeComplete({
        onComplete: () => onToggle(moment.id, moment.instance_id, date),
        onProgressChange: onSwipeProgress,
        threshold: isPast ? 180 : 100,
        disabled: isStatic,
    });

    const statusClass = moment.status
        ? `slot-icon--${moment.status}`
        : 'slot-icon--future';

    const swipeClass = !isStatic && (isDone
        ? 'slot-icon--done'
        : isDragging || dragX > 0
            ? 'slot-icon--swiping'
            : '');

    return (
        <div
            className="slot-icon-track"
            title={`${moment.name ?? 'Untitled Moment'}${moment.status ? ` (${moment.status})` : ''}`}
        >
            {!isStatic && <span className="slot-icon-track__check" aria-hidden>✓</span>}
            <div
                className={['slot-icon', statusClass, swipeClass].filter(Boolean).join(' ')}
                style={isStatic
                    ? undefined
                    : { transform: `translateX(${dragX}px)`, cursor: 'grab' }
                }
                {...(!isStatic ? handlers : {})}
                role={isStatic ? undefined : 'button'}
                tabIndex={isStatic ? undefined : 0}
                onKeyDown={isStatic ? undefined : (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        onToggle(moment.id, moment.instance_id, date);
                    }
                }}
            >
                {moment.icon ?? (moment.name ?? 'U').charAt(0).toUpperCase()}
            </div>
        </div>
    );
}
