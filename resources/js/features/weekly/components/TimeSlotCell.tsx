import type { TimeSlot, WeeklyConfig } from '../types';
import { isOutOfOffice } from '@/shared/components/calendar';
import SlotMomentCard from './SlotMomentCard';

interface Props {
    slot: TimeSlot;
    date: string;
    config: WeeklyConfig;
    onAddMoment: (date: string, time: string) => void;
    isWeekend?: boolean;
    isToday?: boolean;
}

export default function TimeSlotCell({ slot, date, config, onAddMoment, isWeekend, isToday }: Props) {
    const ooo = isOutOfOffice(slot.time, config);

    const cls = [
        'weekly-slot',
        ooo && !slot.moment ? 'weekly-slot--ooo' : '',
        isWeekend ? 'weekly-slot--weekend' : '',
        isToday ? 'weekly-slot--today' : '',
        !slot.moment && !ooo ? 'weekly-slot--overview-empty' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={cls}>
            <span className="weekly-slot__time">{slot.time}</span>
            <div className="weekly-slot__content">
                {slot.moment
                    ? <SlotMomentCard moment={slot.moment} variant="overview" />
                    : (
                        <button
                            type="button"
                            className="weekly-slot__add-btn weekly-slot__add-btn--always-visible"
                            title={`Add moment at ${slot.time}`}
                            onClick={() => onAddMoment(date, slot.time)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onAddMoment(date, slot.time); } }}
                        >
                            +
                        </button>
                    )
                }
            </div>
        </div>
    );
}
