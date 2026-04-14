import { format, parseISO } from 'date-fns';
import type { CalendarConfig, TimeSlot, WeekDay } from '@/shared/components/calendar';
import DailyTimeSlotCell from './DailyTimeSlotCell';

interface Props {
    day: WeekDay;
    nextDay?: WeekDay | null;
    config: CalendarConfig;
    onToggleMoment: (momentId: number, instanceId: number | null, date: string) => void;
    nextMomentKey?: string | null;
}

/** All hourly slots from wake through sleep. For today, anchors to current hour. */
function getTodaySlots(slots: TimeSlot[], config: CalendarConfig, isToday: boolean): TimeSlot[] {
    const hourly = slots.filter(
        (s) => s.time.endsWith(':00') && s.time >= config.wake_time && s.time < config.sleep_time,
    );

    if (!isToday) {
        return hourly;
    }

    // For today: show from 2 hours before current time, but always include
    // any past slots that have a moment scheduled (so nothing is hidden).
    const nowHour = new Date().getHours();
    const cutoffHour = Math.max(0, nowHour - 2);
    const cutoffTime = `${String(cutoffHour).padStart(2, '0')}:00`;

    return hourly.filter((s) => s.time >= cutoffTime || s.moment !== null);
}

/**
 * Next-day slots: all hourly slots from wake through sleep.
 * Empty slots beyond the first few are trimmed — we show up to NEXT_DAY_MAX
 * contiguous slots from wake, always including slots that have a moment.
 */
const NEXT_DAY_MAX = 6;

function getNextDaySlots(slots: TimeSlot[], config: CalendarConfig): TimeSlot[] {
    const hourly = slots.filter(
        (s) => s.time.endsWith(':00') && s.time >= config.wake_time && s.time < config.sleep_time,
    );

    // Find last slot index that has a moment
    let lastMomentIdx = -1;
    hourly.forEach((s, i) => { if (s.moment) lastMomentIdx = i; });

    // Show up to NEXT_DAY_MAX slots, but always enough to include the last moment
    const showUpTo = Math.max(NEXT_DAY_MAX, lastMomentIdx + 1);
    return hourly.slice(0, showUpTo);
}

export default function DailyGrid({ day, nextDay, config, onToggleMoment, nextMomentKey }: Props) {
    const dateObj = parseISO(day.date);
    const visibleSlots = getTodaySlots(day.slots, config, day.isToday);
    const nextDaySlots = nextDay ? getNextDaySlots(nextDay.slots, config) : [];
    const showNextDay = nextDay && nextDaySlots.length > 0;

    return (
        <>
            {/* ── Today ─────────────────────────────────────────────────────── */}
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
                                nextMomentKey === `${day.date}:${slot.time}:${slot.moment.id}`
                            }
                        />
                    ))}
                </div>
            </section>

            {/* ── Next day ──────────────────────────────────────────────────── */}
            {showNextDay && nextDay && (
                <section className="daily-grid daily-grid--next-day">
                    <header className="daily-grid__header">
                        <span className="daily-grid__day-name">{nextDay.dayName}</span>
                        <span className="daily-grid__date">
                            {format(parseISO(nextDay.date), 'd MMMM yyyy')}
                        </span>
                    </header>

                    <div className="daily-grid__slots daily-grid__slots--next-day">
                        {nextDaySlots.map((slot) => (
                            <DailyTimeSlotCell
                                key={`${nextDay.date}-${slot.time}`}
                                slot={slot}
                                date={nextDay.date}
                                config={config}
                                onToggleMoment={() => { }}
                                isToday={false}
                                isNext={false}
                            />
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}
