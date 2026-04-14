import { format, parseISO } from 'date-fns';
import type { CalendarConfig, WeekDay } from '@/shared/components/calendar';
import DailyTimeSlotCell from './DailyTimeSlotCell';

interface Props {
    day: WeekDay;
    config: CalendarConfig;
    onToggleMoment: (momentId: number, instanceId: number | null, date: string) => void;
    nextMomentKey?: string | null;
}

/**
 * Renders the full slot list for a single day.
 * On-the-hour slots that have a moment are always shown.
 * All 30-min slots are included (not windowed — daily view shows everything).
 */
export default function DailyGrid({ day, config, onToggleMoment, nextMomentKey }: Props) {
    const dateObj = parseISO(day.date);

    return (
        <section className="daily-grid">
            <header className="daily-grid__header">
                <span className="daily-grid__day-name">{day.dayName}</span>
                <span className="daily-grid__date">{format(dateObj, 'd MMMM yyyy')}</span>
                {day.isToday && <span className="daily-grid__today-badge">Today</span>}
            </header>

            <div className="daily-grid__slots">
                {day.slots.map((slot) => (
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
