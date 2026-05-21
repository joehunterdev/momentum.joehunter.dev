import { format, parseISO, startOfDay, startOfISOWeek } from 'date-fns';
import {
    CalendarSection,
    CalendarSectionHeader,
} from '@/shared/components/calendar';
import type { CalendarMode, SchedulingState } from '@/features/scheduling';
import MomentAction from '../components/MomentAction';
import MonthlyScheduleRow from './MonthlyScheduleRow';

interface Props {
    days: App.Data.MonthlyDayData[];
    scheduleRows: App.Data.MonthlyScheduleRowData[];
    mode: CalendarMode;
    scheduling: SchedulingState | null;
    onStartSchedulingFromDate: (date: string) => void;
    onStartSchedulingFromIsoDay: (isoDay: number) => void;
    onDraftNameChange: (name: string) => void;
    onDraftIconChange: (icon: string | null) => void;
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
 * Orchestrates the monthly view. Overview mode renders the week-grouped day
 * articles; configure mode renders the recurring schedule rows.
 */
export default function MonthlyContainer({
    days,
    scheduleRows,
    mode,
    scheduling,
    onStartSchedulingFromDate,
    onStartSchedulingFromIsoDay,
    onDraftNameChange,
    onDraftIconChange,
}: Props) {
    if (mode === 'configure') {
        return (
            <div className="weekly-grid">
                {scheduleRows.map((row) => (
                    <MonthlyScheduleRow
                        key={row.isoDayNumber}
                        row={row}
                        mode={mode}
                        scheduling={scheduling}
                        onStartScheduling={onStartSchedulingFromIsoDay}
                        onDraftNameChange={onDraftNameChange}
                        onDraftIconChange={onDraftIconChange}
                    />
                ))}
            </div>
        );
    }

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
                                'calendar-article--monthly-day',
                                // day.isToday && 'calendar-article--today',
                                day.isWeekend && 'calendar-article--weekend',
                            ].filter(Boolean).join(' ');

                            return (
                                <div key={day.date} className={rowCls}>
                                    <span className="calendar-article__key">
                                        {dayLabel}
                                    </span>
                                    <div className="calendar-article__content">
                                        {day.moments.length > 0 ? (
                                            day.moments.map((m) => (
                                                <MomentAction
                                                    key={m.id}
                                                    moment={m}
                                                />
                                            ))
                                        ) : (
                                            <button
                                                type="button"
                                                className="calendar-article__add-btn calendar-article__add-btn--always-visible"
                                                title={`Add moment on ${dayLabel}`}
                                                onClick={() => onStartSchedulingFromDate(day.date)}
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
