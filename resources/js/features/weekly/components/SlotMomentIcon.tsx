import { useSwipeComplete } from '../hooks/useSwipeComplete';
import type { SlotMoment } from '../types';

interface Props {
    moment: SlotMoment;
    date: string;
    onToggle: (momentId: number, instanceId: number | null, date: string) => void;
    onSwipeProgress?: (progress: number) => void;
}

export default function SlotMomentIcon({ moment, date, onToggle, onSwipeProgress }: Props) {
    const isCompleted = moment.status === 'completed';
    const isPast = moment.status === 'completed' || moment.status === 'missed';

    const { dragX, isDragging, isDone, handlers } = useSwipeComplete({
        onComplete: () => onToggle(moment.id, moment.instance_id, date),
        onProgressChange: onSwipeProgress,
        threshold: isPast ? 130 : 100, // past slots need 30% more drag
    });

    const statusClass = moment.status
        ? `slot-icon--${moment.status}`
        : 'slot-icon--future';

    const swipeClass = isDone
        ? 'slot-icon--done'
        : isDragging || dragX > 0
            ? 'slot-icon--swiping'
            : '';

    return (
        <div
            className="slot-icon-track"
            title={`${moment.name}${moment.status ? ` (${moment.status})` : ''} — swipe right to ${isCompleted ? 'uncheck' : 'complete'}`}
        >
            <span className="slot-icon-track__check" aria-hidden>✓</span>
            <div
                className={`slot-icon ${statusClass} ${swipeClass}`.trim()}
                style={{ transform: `translateX(${dragX}px)`, cursor: 'grab' }}
                {...handlers}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        onToggle(moment.id, moment.instance_id, date);
                    }
                }}
            >
                {moment.icon ?? moment.name.charAt(0).toUpperCase()}
            </div>
        </div>
    );
}
