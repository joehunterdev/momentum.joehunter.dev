import Icon from '@/shared/components/Icon';
import { useSwipeComplete } from '@/features/calendar/hooks/useSwipeComplete';
import type { CalendarMoment } from './types';
import { MomentStatus } from '@/shared/types/enums';

interface Props {
    moment: CalendarMoment;
    date: string;
    onToggle: (momentId: number, instanceId: number | null, date: string) => void;
    onSwipeProgress?: (progress: number) => void;
    /** When true: renders icon with status colour but no swipe interaction */
    isStatic?: boolean;
}

export default function MomentIcon({ moment, date, onToggle, onSwipeProgress, isStatic = false }: Props) {
    const isPast = moment.status === MomentStatus.Completed || moment.status === MomentStatus.Missed;

    // 0 = frictionless (perfect habit), 1 = maximum resistance (new/failing habit)
    const resistanceFactor = moment.consistency !== null
        ? Math.max(0, Math.min(1, 1 - moment.consistency / 100))
        : 1;

    const { dragX, dragProgress: _dragProgress, holdProgress, isDragging, isDone, handlers } = useSwipeComplete({
        onComplete: () => onToggle(moment.id, moment.instance_id, date),
        onProgressChange: onSwipeProgress,
        resistanceFactor: isPast ? 0.5 : resistanceFactor,
        disabled: isStatic,
    });

    const statusClass = moment.status
        ? `slot-icon--${moment.status}`
        : 'slot-icon--future';

    const swipeClass = !isStatic && (isDone
        ? 'slot-icon--done'
        : holdProgress > 0
            ? 'slot-icon--holding'
            : isDragging || dragX > 0
                ? 'slot-icon--swiping'
                : '');

    return (
        <div
            className="slot-icon-track"
            title={`${moment.name ?? 'Untitled Moment'}${moment.status ? ` (${moment.status})` : ''}`}
        >
            {!isStatic && <span className="slot-icon-track__check" aria-hidden><Icon name="check" /></span>}
            <div
                className={['slot-icon', statusClass, swipeClass].filter(Boolean).join(' ')}
                style={isStatic
                    ? undefined
                    : {
                        transform: `translateX(${dragX}px)`,
                        cursor: isDragging ? 'grabbing' : 'grab',
                        ['--hold-progress' as string]: holdProgress,
                    }
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
                {moment.icon ? (
                    <Icon name={moment.icon} />
                ) : (
                    <img src="/logo.png" alt="" className="slot-icon__default-logo" />
                )}
            </div>
        </div>
    );
}

