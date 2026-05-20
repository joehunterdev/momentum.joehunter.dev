import { format, parseISO } from 'date-fns';
import type { WeekDay, WeeklyConfig } from '../types';
import TimeSlotCell from './TimeSlotCell';

interface Props {
    day: WeekDay;
    config: WeeklyConfig;
    mode: 'overview' | 'configure';
    onStartScheduling: (date: string, time: string) => void;
}

export default function DayRow({ day, config, mode, onStartScheduling }: Props) {
    const rowClass = [
        'weekly-day-row',
        day.isToday ? 'weekly-day-row--today' : '',
        day.isWeekend ? 'weekly-day-row--weekend' : '',
    ]
        .filter(Boolean)
        .join(' ');

    const dateObj = parseISO(day.date);

    return (
        <div className={rowClass}>
            {/* Sticky day label */}
            <div className="weekly-day-row__label">
                <span className="weekly-day-row__day-name">
                    {day.dayName.slice(0, 3)}
                </span>
                <span className="weekly-day-row__date">
                    {format(dateObj, 'd MMM')}
                </span>
            </div>

            {/* Time slot cells */}
            <div className="weekly-day-row__slots">
                {day.slots.map((slot) => (
                    <TimeSlotCell
                        key={slot.time}
                        slot={slot}
                        date={day.date}
                        config={config}
                        mode={mode}
                        onStartScheduling={onStartScheduling}
                        onGhostNameChange={() => { }}
                        onGhostIconChange={() => { }}
                        ghostName=""
                        ghostIcon={null}
                    />
                ))}
            </div>
        </div>
    );
}
