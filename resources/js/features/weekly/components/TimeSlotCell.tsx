import type { TimeSlot, WeeklyConfig } from '../types';
import SlotMomentIcon from './SlotMomentIcon';

interface Props {
    slot: TimeSlot;
    date: string;
    config: WeeklyConfig;
    onAddMoment: (date: string, time: string) => void;
    isWeekend?: boolean;
    isToday?: boolean;
}

function isOutOfOffice(time: string, config: WeeklyConfig): boolean {
    return time < config.office_start || time >= config.office_end;
}

export default function TimeSlotCell({ slot, date, config, onAddMoment, isWeekend, isToday }: Props) {
    const ooo = isOutOfOffice(slot.time, config);

    const cls = [
        'weekly-slot',
        ooo ? 'weekly-slot--ooo' : '',
        isWeekend ? 'weekly-slot--weekend' : '',
        isToday ? 'weekly-slot--today' : '',
        !slot.moment && !ooo ? 'weekly-slot--empty' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={cls}>
            <span className="weekly-slot__time">{slot.time}</span>
            <div className="weekly-slot__content">
                {slot.moment ? (
                    <SlotMomentIcon moment={slot.moment} />
                ) : ooo ? (
                    <span className="weekly-slot__ooo-dot" aria-hidden />
                ) : (
                    <button
                        type="button"
                        className="weekly-slot__add-btn"
                        title={`Add moment at ${slot.time}`}
                        onClick={() => onAddMoment(date, slot.time)}
                    >
                        +
                    </button>
                )}
            </div>
        </div>
    );
}
