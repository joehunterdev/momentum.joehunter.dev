import ConsistencyBar from './ConsistencyBar';
import MomentDetailTicker from './MomentDetailTicker';
import SlotMomentIcon from './SlotMomentIcon';
import type { SlotMoment } from '@/shared/components/calendar';

interface Props {
    moment: SlotMoment;
    date: string;
    isNext?: boolean;
    onToggle: (momentId: number, instanceId: number | null, date: string) => void;
    onSwipeProgress?: (progress: number) => void;
    swipeProgress?: number;
}

/**
 * Daily variant of the slot moment card.
 * Shows consistency bar, swipeable icon, name, and a rotating detail ticker.
 */
export default function DailySlotCard({ moment, date, isNext, onToggle, onSwipeProgress, swipeProgress = 0 }: Props) {
    return (
        <div
            className={`moment-card${isNext ? ' moment-card--next' : ''}`}
            style={{ '--drag-progress': swipeProgress } as React.CSSProperties}
        >
            {moment.consistency !== null && (
                <div className="moment-card__top">
                    <ConsistencyBar score={moment.consistency} />
                    <span className="moment-card__score">{moment.consistency}%</span>
                </div>
            )}
            <div className="moment-card__row">
                <SlotMomentIcon
                    moment={moment}
                    date={date}
                    onToggle={onToggle}
                    onSwipeProgress={onSwipeProgress}
                />
                <div className="moment-card__body">
                    <div className="moment-card__name-row">
                        <span className="moment-card__name">{moment.name}</span>
                        {isNext && <MomentDetailTicker moment={moment} part="badge" />}
                    </div>
                    {isNext ? (
                        <MomentDetailTicker moment={moment} part="track" />
                    ) : (
                        moment.description && (
                            <span className="moment-card__desc">
                                {moment.description}
                            </span>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
