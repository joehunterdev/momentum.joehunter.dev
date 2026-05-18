import { format, parseISO } from 'date-fns';
import { CalendarSection, CalendarSectionHeader, CalendarSectionArticle } from '@/shared/components/calendar';
import type { CalendarMode, SchedulingState } from '@/features/scheduling';

interface Props {
    days: App.Data.MonthlyDayData[];
    mode: CalendarMode;
    scheduling: SchedulingState | null;
    onDayClick: (date: string) => void;
    onStartScheduling: (date: string) => void;
    onDraftNameChange?: (name: string) => void;
    onDraftIconChange?: (icon: string | null) => void;
}

/**
 * Mobile-optimized vertical monthly view.
 * Shows each day as a row with its moments, using CalendarSectionArticle
 * for consistency with daily/weekly views (per calendar-components-refactor-plan.md §4.6).
 */
export default function MonthlyVerticalView({
    days,
    mode,
    scheduling,
    onDayClick,
    onStartScheduling,
    onDraftNameChange,
    onDraftIconChange,
}: Props) {
    // Filter to only days with moments or today onwards
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const relevantDays = days.filter(day => {
        const dayDate = parseISO(day.date);
        dayDate.setHours(0, 0, 0, 0);
        return day.moments.length > 0 || day.isToday || dayDate >= today;
    });

    return (
        <div className="monthly-vertical-view">
            {relevantDays.map((day) => {
                const dateObj = parseISO(day.date);
                const dayNumber = format(dateObj, 'd');
                const monthName = format(dateObj, 'MMM');

                return (
                    <CalendarSection
                        key={day.date}
                        isToday={day.isToday}
                        isWeekend={day.isWeekend}
                        layout="vertical"
                        header={
                            <CalendarSectionHeader
                                label={day.dayName}
                                sublabel={`${dayNumber} ${monthName}`}
                                badge={day.isToday ? 'Today' : undefined}
                            />
                        }
                    >
                        {day.moments.length > 0 ? (
                            day.moments.map((moment) => {
                                // Convert MonthlyMomentData to SlotMoment format
                                const slotMoment: App.Data.SlotMomentData = {
                                    id: moment.id,
                                    name: moment.name,
                                    icon: moment.icon,
                                    color: moment.color,
                                    status: moment.status,
                                    description: null,
                                    frequency: null,
                                    consistency: null,
                                    instance_id: null,
                                    implementation_intention: null,
                                    habit_stack_after: null,
                                    environment_prompt: null,
                                };

                                return (
                                    <CalendarSectionArticle
                                        key={moment.id}
                                        slotKey={`${day.date}:${moment.id}`}
                                        date={day.date}
                                        moment={slotMoment}
                                        mode={mode}
                                        scheduling={scheduling}
                                        capabilities={{
                                            addOnEmpty: false,
                                            draftEdit: false,
                                            conflictBadge: false,
                                            editButton: true,
                                            outOfOffice: false,
                                        }}
                                    />
                                );
                            })
                        ) : (
                            <CalendarSectionArticle
                                slotKey={`${day.date}:empty`}
                                date={day.date}
                                moment={null}
                                mode={mode}
                                scheduling={scheduling}
                                capabilities={{
                                    addOnEmpty: true,
                                    draftEdit: false,
                                    conflictBadge: false,
                                    editButton: false,
                                    outOfOffice: false,
                                }}
                                onStartScheduling={() => onStartScheduling(day.date)}
                            />
                        )}
                    </CalendarSection>
                );
            })}
        </div>
    );
}
