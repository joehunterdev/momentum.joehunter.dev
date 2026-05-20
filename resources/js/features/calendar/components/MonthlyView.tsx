import { format, parseISO, startOfDay, startOfISOWeek } from 'date-fns';
import {
    CalendarMomentCard,
    CalendarSection,
    CalendarSectionHeader,
    MomentDisplay,
} from '@/shared/components/calendar';

interface Props {
    days: App.Data.MonthlyDayData[];
    onStartScheduling: (date: string) => void;
}

interface WeekGroup {
    weekStartIso: string;
    days: App.Data.MonthlyDayData[];
}

function groupByIsoWeek(days: App.Data.MonthlyDayData[]): WeekGroup[] {
    const buckets = new Map<string, App.Data.MonthlyDayData[]>();
    for (const day of days) {
        const weekStart = format(startOfISOWeek(parseISO(day.date)), 'yyyy-MM-dd');
        const bucket = buckets.get(weekStart) ?? [];
        bucket.push(day);
        buckets.set(weekStart, bucket);
    }
    return [...buckets.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([weekStartIso, days]) => ({ weekStartIso, days }));
}

/**
 * Mobile monthly view. Section = ISO week, article = one day (24h "slot").
 * Each day-article carries the day label in its leading column and stacks any
 * scheduled moments inside, or shows a `+` add button when empty.
 */
export default function MonthlyView({ days, onStartScheduling }: Props) {
    const today = startOfDay(new Date());
    const isCurrentMonthView = days.some((d) => d.isToday);
    const visibleDays = isCurrentMonthView
        ? days.filter((d) => parseISO(d.date) >= today)
        : days;

    const weeks = groupByIsoWeek(visibleDays);

    return (
        <div className="monthly-vertical-view">
            {weeks.map(({ weekStartIso, days: weekDays }) => {
                const weekLabel = `Week of ${format(parseISO(weekStartIso), 'd MMM')}`;

                return (
                    <CalendarSection
                        key={weekStartIso}
                        layout="vertical"
                        header={<CalendarSectionHeader label={weekLabel} />}
                    >
                        {weekDays.map((day) => {
                            const dayLabel = format(parseISO(day.date), 'EEE d').toUpperCase();
                            const rowCls = [
                                'calendar-article',
                                'weekly-slot',
                                'weekly-slot--monthly-day',
                                day.isToday && 'calendar-article--today weekly-slot--today',
                                day.isWeekend && 'calendar-article--weekend weekly-slot--weekend',
                            ].filter(Boolean).join(' ');

                            return (
                                <div key={day.date} className={rowCls}>
                                    <span className="calendar-article__time weekly-slot__time">
                                        {dayLabel}
                                    </span>
                                    <div className="calendar-article__content weekly-slot__content">
                                        {day.moments.length > 0 ? (
                                            day.moments.map((m) => (
                                                <MomentDisplay
                                                    key={m.id}
                                                    moment={m}
                                                />
                                            ))
                                        ) : (
                                            <button
                                                type="button"
                                                className="calendar-article__add-btn weekly-slot__add-btn weekly-slot__add-btn--always-visible"
                                                title={`Add moment on ${dayLabel}`}
                                                onClick={() => onStartScheduling(day.date)}
                                            >
                                                +
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </CalendarSection>
                );
            })}
        </div>
    );
}
