import { format, parseISO } from 'date-fns';
import type { CalendarConfig, TimeSlot, WeekDay } from '@/shared/components/calendar';
import DailyTimeSlotCell from './DailyTimeSlotCell';

interface Props {
    day: WeekDay;
    config: CalendarConfig;
    onToggleMoment: (momentId: number, instanceId: number | null, date: string) => void;
    nextMomentKey?: string | null;
}

const VISIBLE_SLOTS = 8;

/**
 * Keep only on-the-hour slots, then window to VISIBLE_SLOTS centred near
 * the current time (today) or from wake time (past/future days).
 * Slots with a moment are always included regardless of the window.
 */
function getVisibleSlots(slots: TimeSlot[], isToday: boolean): TimeSlot[] {
    const hourly = slots.filter((s) => s.time.endsWith(':00'));

    if (!isToday || hourly.length <= VISIBLE_SLOTS) {
        return hourly.slice(0, VISIBLE_SLOTS);
    }

    const nowMins = new Date().getHours() * 60 + new Date().getMinutes();

    // Find the slot closest to now
    let anchorIdx = 0;
    let anchorDiff = Infinity;
    hourly.forEach((s, i) => {
        const [h] = s.time.split(':').map(Number);
        const diff = Math.abs(h * 60 - nowMins);
        if (diff < anchorDiff) {
            anchorDiff = diff;
            anchorIdx = i;
        }
    });

    // Bias the window so current time is roughly 2 slots from the top
    const LOOK_AHEAD = 2;
    const start = Math.max(0, Math.min(anchorIdx - LOOK_AHEAD, hourly.length - VISIBLE_SLOTS));
    const windowed = new Set(hourly.slice(start, start + VISIBLE_SLOTS).map((s) => s.time));

    // Always include slots that have a moment scheduled
    hourly.forEach((s) => {
        if (s.moment) windowed.add(s.time);
    });

    return hourly.filter((s) => windowed.has(s.time));
}

export default function DailyGrid({ day, config, onToggleMoment, nextMomentKey }: Props) {
    const dateObj = parseISO(day.date);
    const visibleSlots = getVisibleSlots(day.slots, day.isToday);

    return (
        <section className="daily-grid">
            <header className="daily-grid__header">
                <span className="daily-grid__day-name">{day.dayName}</span>
                <span className="daily-grid__date">{format(dateObj, 'd MMMM yyyy')}</span>
                {day.isToday && <span className="daily-grid__today-badge">Today</span>}
            </header>

            <div className="daily-grid__slots">
                {visibleSlots.map((slot) => (
                    <DailyTimeSlotCell
                        key={`${day.date}-${slot.time}`}
                        slot={slot}
                        date={day.date}
                        config={config}
                        onToggleMoment={onToggleMoment}
                        isToday={day.isToday}
                        isNext={
                            !!slot.moment &&
                            nextMomentKey ===
                            `${day.date}:${slot.time}:${slot.moment.id}`
                        }
                    />
                ))}
            </div>
        </section>
    );
}
