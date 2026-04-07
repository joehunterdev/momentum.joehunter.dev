import SlotMomentIcon from './SlotMomentIcon';
import ConsistencyBar from './ConsistencyBar';
import type { SlotMoment } from '../types';

interface Props {
    moment: SlotMoment;
    date: string;
    onToggle: (momentId: number, instanceId: number | null, date: string) => void;
    onSwipeProgress?: (progress: number) => void;
}

export default function SlotMomentCard({ moment, date, onToggle, onSwipeProgress }: Props) {
    return (
        <div className="slot-moment-card">
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
                    <span className="slot-moment-card__name">{moment.name}</span>
                    {moment.description && (
                        <span className="slot-moment-card__desc">{moment.description}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
