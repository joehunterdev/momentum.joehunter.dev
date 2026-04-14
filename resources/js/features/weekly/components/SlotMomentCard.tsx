import { router } from '@inertiajs/react';
import SlotMomentIcon from './SlotMomentIcon';
import type { SlotMoment } from '../types';

interface Props {
    moment: SlotMoment;
    date: string;
    isNext?: boolean;
    onToggle: (momentId: number, instanceId: number | null, date: string) => void;
    onSwipeProgress?: (progress: number) => void;
}

export default function SlotMomentCard({ moment, date, isNext, onToggle, onSwipeProgress }: Props) {
    return (
        <div className={`slot-moment-card${isNext ? ' slot-moment-card--next' : ''}`}>
            <div className="slot-moment-card__row">
                <SlotMomentIcon
                    moment={moment}
                    date={date}
                    onToggle={onToggle}
                    onSwipeProgress={onSwipeProgress}
                />
                <div className="slot-moment-card__body">
                    <span className="slot-moment-card__name">{moment.name}</span>
                    {moment.description && (
                        <span className="slot-moment-card__desc">
                            {moment.description}
                        </span>
                    )}
                </div>
                <button
                    type="button"
                    className="slot-moment-card__edit-btn"
                    title={`Edit ${moment.name}`}
                    onClick={() =>
                        router.get(route('moments.edit', { moment: moment.id }))
                    }
                    aria-label={`Edit ${moment.name}`}
                >
                    ✏️
                </button>
            </div>
        </div>
    );
}
