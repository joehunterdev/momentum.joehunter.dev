import { format, parseISO } from 'date-fns';
import DayRowShell from '@/shared/components/schedule/DayRowShell';
import SlotMomentCard from '@/features/weekly/components/SlotMomentCard';

interface Props {
    days: App.Data.MonthlyDayData[];
    onDayClick: (date: string) => void;
}

/**
 * Mobile-optimized vertical monthly view.
 * Shows each day as a row with its moments, like daily/weekly views.
 */
export default function MonthlyVerticalView({ days, onDayClick }: Props) {
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
                    <DayRowShell
                        key={day.date}
                        label={day.dayName}
                        sublabel={`${dayNumber} ${monthName}`}
                        badge={day.isToday ? 'Today' : undefined}
                        isToday={day.isToday}
                        isWeekend={day.isWeekend}
                        slotsLayout="vertical"
                    >
                        {day.moments.length > 0 ? (
                            <div className="weekly-day-slots">
                                {day.moments.map((moment) => {
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
                                        <div
                                            key={moment.id}
                                            className={`weekly-slot ${moment.status === 'completed' ? 'weekly-slot--completed' : ''}`}
                                        >
                                            <SlotMomentCard moment={slotMoment} variant="overview" />
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="weekly-day-slots">
                                <button
                                    type="button"
                                    className="weekly-slot weekly-slot--empty weekly-slot--overview-empty"
                                    onClick={() => onDayClick(day.date)}
                                >
                                    <span className="weekly-slot__add-btn-text">
                                        + Add moments
                                    </span>
                                </button>
                            </div>
                        )}
                    </DayRowShell>
                );
            })}
        </div>
    );
}
