import { format, parseISO } from 'date-fns';
import type { TimeSlot, WeekDay, WeeklyConfig } from '../types';
import DayRowShell from '@/shared/components/schedule/DayRowShell';
import TimeSlotCell from './TimeSlotCell';

interface Props {
    day: WeekDay;
    config: WeeklyConfig;
    onAddMoment: (date: string, time: string) => void;
    windowStart: number;
}

const VISIBLE_SLOTS = 6;

function getWindowedSlots(slots: TimeSlot[], windowStart: number): TimeSlot[] {
    const hourly = slots.filter((s) => s.time.endsWith(':00'));
    return hourly.slice(windowStart, windowStart + VISIBLE_SLOTS);
}

export default function DaySection({ day, config, onAddMoment, windowStart }: Props) {
    const dateObj = parseISO(day.date);
    const visibleSlots = getWindowedSlots(day.slots, windowStart);

    return (
        <DayRowShell
            label={day.dayName}
            sublabel={format(dateObj, 'd MMM')}
            badge={day.isToday ? 'Today' : undefined}
            isToday={day.isToday}
            isWeekend={day.isWeekend}
            slotsLayout="vertical"
        >
            {visibleSlots.map((slot) => (
                <TimeSlotCell
                    key={`${day.date}-${slot.time}`}
                    slot={slot}
                    date={day.date}
                    config={config}
                    onAddMoment={onAddMoment}
                    isWeekend={day.isWeekend}
                    isToday={day.isToday}
                />
            ))}
        </DayRowShell>
    );
}

