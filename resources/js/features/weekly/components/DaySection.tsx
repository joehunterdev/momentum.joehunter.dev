import { format, parseISO } from 'date-fns';
import type { TimeSlot, WeekDay, WeeklyConfig } from '../types';
import TimeSlotCell from './TimeSlotCell';

interface Props {
    day: WeekDay;
    config: WeeklyConfig;
    onAddMoment: (date: string, time: string, mode: 'once' | 'recurring') => void;
    highlightTime?: string;
}

const VISIBLE_SLOTS = 6;

/**
 * Filter to on-the-hour slots only, then window to VISIBLE_SLOTS.
 * Today: centred on the current hour. Other days: from wake time.
 */
function getWindowedSlots(slots: TimeSlot[], isToday: boolean): TimeSlot[] {
    const hourly = slots.filter((s) => s.time.endsWith(':00'));

    if (hourly.length <= VISIBLE_SLOTS) {
        return hourly;
    }

    if (!isToday) {
        return hourly.slice(0, VISIBLE_SLOTS);
    }

    const nowMins = new Date().getHours() * 60 + new Date().getMinutes();

    let nearestIdx = 0;
    let nearestDiff = Infinity;
    hourly.forEach((s, i) => {
        const [h] = s.time.split(':').map(Number);
        const diff = Math.abs(h * 60 - nowMins);
        if (diff < nearestDiff) {
            nearestDiff = diff;
            nearestIdx = i;
        }
    });

    const half = Math.floor(VISIBLE_SLOTS / 2);
    const start = Math.max(0, Math.min(nearestIdx - half, hourly.length - VISIBLE_SLOTS));

    return hourly.slice(start, start + VISIBLE_SLOTS);
}

export default function DaySection({ day, config, onAddMoment, highlightTime }: Props) {
    const dateObj = parseISO(day.date);
    const visibleSlots = getWindowedSlots(day.slots, day.isToday);

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
                        highlightTime={highlightTime}
                        isWeekend={day.isWeekend}
                        isToday={day.isToday}
                    />
                ))}
            </div>
        </section>
    );
}
