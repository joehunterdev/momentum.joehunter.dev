import type { CSSProperties } from 'react';
import type { TimeSlot, WeeklyConfig } from '../types';
import SlotMomentIcon from './SlotMomentIcon';

interface Props {
    slot: TimeSlot;
    date: string;
    config: WeeklyConfig;
    onAddMoment: (date: string, time: string) => void;
    style?: CSSProperties;
    isWeekend?: boolean;
    isToday?: boolean;
}

function isOutOfOffice(time: string, config: WeeklyConfig): boolean {
    return time < config.office_start || time >= config.office_end;
}

export default function TimeSlotCell({ slot, date, config, onAddMoment, style, isWeekend, isToday }: Props) {
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

    if (slot.moment) {
        return (
            <div className={cls} style={style}>
                <SlotMomentIcon moment={slot.moment} />
            </div>
        );
    }

    if (ooo) {
        return <div className={cls} style={style} />;
    }

    return (
        <div className={cls} style={style}>
            <button
                type="button"
                className="weekly-slot__add-btn"
                title={`Add moment at ${slot.time}`}
                onClick={() => onAddMoment(date, slot.time)}
            >
                +
            </button>
        </div>
    );
}
