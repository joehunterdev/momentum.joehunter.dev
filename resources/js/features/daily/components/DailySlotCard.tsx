import ConsistencyBar from '@/features/weekly/components/ConsistencyBar';
import MomentDetailTicker from '@/features/weekly/components/MomentDetailTicker';
import SlotMomentIcon from '@/features/weekly/components/SlotMomentIcon';
import type { SlotMoment } from '@/shared/components/calendar';

interface Props {
    moment: SlotMoment;
    date: string;
    isNext?: boolean;
    onToggle: (momentId: number, instanceId: number | null, date: string) => void;
    onSwipeProgress?: (progress: number) => void;
}

/**
 * Daily variant of the slot moment card.
 * Shows consistency bar, swipeable icon, name, and a rotating detail ticker.
 */
export default function DailySlotCard({ moment, date, isNext, onToggle, onSwipeProgress }: Props) {
    return (
        <div className={`slot-moment-card${isNext ? ' slot-moment-card--next' : ''}`}>
            {moment.consistency !== null && (
                <div className="slot-moment-card__top">
                    <ConsistencyBar score={moment.consistency} />
                    <span className="slot-moment-card__score">{moment.consistency}%</span>
                </div>
            )}
            <div className="slot-moment-card__row">
                <SlotMomentIcon
                    moment={moment}
                    date={date}
                    onToggle={onToggle}
                    onSwipeProgress={onSwipeProgress}
                />
                <div className="slot-moment-card__body">
                    <div className="slot-moment-card__name-row">
                        <span className="slot-moment-card__name">{moment.name}</span>
                        {isNext && <MomentDetailTicker moment={moment} part="badge" />}
                    </div>
                    {isNext ? (
                        <MomentDetailTicker moment={moment} part="track" />
                    ) : (
                        moment.description && (
                            <span className="slot-moment-card__desc">
                                {moment.description}
                            </span>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
