import { format, parseISO } from 'date-fns';
import type { SchedulingState, TimeSlot, WeekDay, WeeklyConfig } from '../types';
import { jsToIsoDay } from '@/shared/components/calendar';
import TimeSlotCell from './TimeSlotCell';

interface Props {
    day: WeekDay;
    config: WeeklyConfig;
    mode: 'overview' | 'configure';
    scheduling: SchedulingState | null;
    onStartScheduling: (date: string, time: string) => void;
    onGhostNameChange: (name: string) => void;
    onGhostIconChange: (icon: string | null) => void;
    windowStart: number;
}

const VISIBLE_SLOTS = 6;

function getWindowedSlots(slots: TimeSlot[], windowStart: number): TimeSlot[] {
    const hourly = slots.filter((s) => s.time.endsWith(':00'));
    return hourly.slice(windowStart, windowStart + VISIBLE_SLOTS);
}

export default function DaySection({ day, config, mode, scheduling, onStartScheduling, onGhostNameChange, onGhostIconChange, windowStart }: Props) {
    const dateObj = parseISO(day.date);
    const visibleSlots = getWindowedSlots(day.slots, windowStart);
    const dayIso = jsToIsoDay(dateObj.getDay());

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
                {visibleSlots.map((slot) => {
                    const schedulingThisDay =
                        scheduling !== null &&
                        slot.time === scheduling.time &&
                        (scheduling.frequency === 'once'
                            ? day.date === scheduling.date
                            : scheduling.daysOfWeek.includes(dayIso));

                    const isGhost = schedulingThisDay && !slot.moment;
                    const isConflict = schedulingThisDay && slot.moment !== null;

                    return (
                        <TimeSlotCell
                            key={`${day.date}-${slot.time}`}
                            slot={slot}
                            date={day.date}
                            config={config}
                            mode={mode}
                            isGhost={isGhost}
                            isConflict={isConflict}
                            onStartScheduling={onStartScheduling}
                            onGhostNameChange={onGhostNameChange}
                            onGhostIconChange={onGhostIconChange}
                            ghostName={scheduling?.name ?? ''}
                            ghostIcon={scheduling?.icon ?? null}
                            isWeekend={day.isWeekend}
                            isToday={day.isToday}
                        />
                    );
                })}
            </div>
        </section>
    );
}
