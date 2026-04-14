import { format, parseISO } from 'date-fns';
import type { TimeSlot, WeekDay, WeeklyConfig } from '../types';
import TimeSlotCell from './TimeSlotCell';

interface Props {
    day: WeekDay;
    config: WeeklyConfig;
    onAddMoment: (date: string, time: string, mode: 'once' | 'recurring') => void;
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

    const sectionCls = [
        'weekly-day-section',
        day.isToday ? 'weekly-day-section--today' : '',
        day.isWeekend ? 'weekly-day-section--weekend' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <section className={sectionCls}>
            <header className="weekly-day-header">
                <span className="weekly-day-header__name">{day.dayName}</span>
                <span className="weekly-day-header__date">{format(dateObj, 'd MMM')}</span>
                {day.isToday && <span className="weekly-day-header__badge">Today</span>}
            </header>

            <div className="weekly-day-slots">
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
            </div>
        </section>
    );
}
