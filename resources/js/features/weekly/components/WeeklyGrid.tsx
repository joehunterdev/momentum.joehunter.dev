import { format, parseISO } from 'date-fns';
import type { WeekDay, WeeklyConfig } from '../types';
import TimeSlotCell from './TimeSlotCell';

interface Props {
    days: WeekDay[];
    config: WeeklyConfig;
    onAddMoment: (date: string, time: string) => void;
}

export default function WeeklyGrid({ days, config, onAddMoment }: Props) {
    const timeLabels = days[0]?.slots.map((s) => s.time) ?? [];
    const numDays = days.length; // 7
    const numTimes = timeLabels.length;

    return (
        <div
            className="weekly-grid"
            style={{
                // CSS custom properties drive the grid template in SCSS
                ['--wg-days' as string]: numDays,
                ['--wg-times' as string]: numTimes,
            }}
        >
            {/* Corner spacer — top-left cell */}
            <div className="weekly-grid__corner" aria-hidden />

            {/* Day headers — one per day (col on desktop, row-header on mobile) */}
            {days.map((day, di) => {
                const dateObj = parseISO(day.date);
                const cls = [
                    'weekly-grid__day-header',
                    day.isToday ? 'weekly-grid__day-header--today' : '',
                    day.isWeekend ? 'weekly-grid__day-header--weekend' : '',
                ]
                    .filter(Boolean)
                    .join(' ');
                return (
                    <div
                        key={day.date}
                        className={cls}
                        // desktop: col di+2, row 1 | mobile: row di+2, col 1  (via CSS)
                        style={{ ['--di' as string]: di + 2 }}
                    >
                        <span className="weekly-grid__day-name">{day.dayName.slice(0, 3)}</span>
                        <span className="weekly-grid__day-date">{format(dateObj, 'd MMM')}</span>
                    </div>
                );
            })}

            {/* Time labels — one per slot */}
            {timeLabels.map((time, ti) => (
                <div
                    key={time}
                    className="weekly-grid__time-label"
                    // desktop: col 1, row ti+2 | mobile: col ti+2, row 1  (via CSS)
                    style={{ ['--ti' as string]: ti + 2 }}
                >
                    {time}
                </div>
            ))}

            {/* Slot cells — placed at (day, time) intersection */}
            {days.map((day, di) =>
                day.slots.map((slot, ti) => (
                    <TimeSlotCell
                        key={`${day.date}-${slot.time}`}
                        slot={slot}
                        date={day.date}
                        config={config}
                        onAddMoment={onAddMoment}
                        // desktop: col di+2, row ti+2 | mobile: col ti+2, row di+2  (via CSS)
                        style={{ ['--di' as string]: di + 2, ['--ti' as string]: ti + 2 }}
                        isWeekend={day.isWeekend}
                        isToday={day.isToday}
                    />
                )),
            )}
        </div>
    );
}
