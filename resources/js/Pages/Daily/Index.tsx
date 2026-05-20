import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DailyTimeSlotCell } from '@/features/calendar';
import { Head, router } from '@inertiajs/react';
import {
    CalendarNav,
    CalendarProgressBar,
    CalendarSection,
    CalendarSectionHeader,
    MomentFrequencyConfig,
} from '@/shared/components/calendar';
import type { CalendarConfig, TimeSlot } from '@/shared/components/calendar';
import { getVisibleTimeSlots } from '@/shared/components/calendar/utils';
import { addDays, format, parseISO, subDays } from 'date-fns';
import type { PageProps } from '@/types';
import { useScheduling } from '@/features/scheduling';
import { useCalendarActions } from '@/features/calendar/hooks/useCalendarActions';
import { MomentStatus, SchedulingKind } from '@/shared/types/enums';

interface Props extends PageProps, App.Data.DailyPageData { }

export default function Index({ date, day, config, completedCount, totalCount }: Props) {
    const scheduling = useScheduling({ redirectTo: route('daily', { date }) });
    const { toggleMoment } = useCalendarActions();

    function handleStartScheduling(time: string) {
        scheduling.start({
            kind: SchedulingKind.OneOff,
            date,
            time,
            name: '',
            icon: null,
        });
    }

    async function handleToggleMoment(
        momentId: number,
        _instanceId: number | null,
        date: string,
    ) {
        await toggleMoment({
            momentId,
            date,
            reloadOnly: ['day', 'completedCount', 'totalCount'],
        });
    }

    // Key = "date:time:momentId" — first pending moment of the day
    const nextMomentKey = (() => {
        for (const slot of day.slots) {
            if (slot.moment && slot.moment.status !== MomentStatus.Completed) {
                return `${day.date}:${slot.time}:${slot.moment.id}`;
            }
        }
        return null;
    })();

    const currentDate = parseISO(date);
    const prevDate = subDays(currentDate, 1);
    const nextDate = addDays(currentDate, 1);
    const visibleSlots = getVisibleTimeSlots(day.slots, config, day.isToday);

    return (
        <AuthenticatedLayout
            header={
                <div className="daily-header">
                    <CalendarNav
                        prevLabel={format(prevDate, 'EEE d MMM')}
                        currentLabel={format(currentDate, 'EEE d MMM')}
                        nextLabel={format(nextDate, 'EEE d MMM')}
                        prevParam={{ date: format(prevDate, 'yyyy-MM-dd') }}
                        nextParam={{ date: format(nextDate, 'yyyy-MM-dd') }}
                        routeName="daily"
                    />
                    {scheduling.mode === 'overview' && totalCount > 0 && (
                        <CalendarProgressBar
                            completedCount={completedCount}
                            totalCount={totalCount}
                        />
                    )}
                </div>
            }
        >
            <Head title="Daily" />
            {scheduling.mode === 'configure' && scheduling.state && (
                <MomentFrequencyConfig
                    state={scheduling.state}
                    time={scheduling.state.time}
                    onKindChange={(next) => scheduling.setKind(next, date)}
                    onDaysChange={scheduling.setDaysOfWeek}
                    onCancel={scheduling.exit}
                    onConfirm={scheduling.confirm}
                />
            )}

            <div className="py-0 sm:py-6">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <CalendarSection
                        isToday={day.isToday}
                        layout="vertical"
                        header={
                            <CalendarSectionHeader
                                label={day.dayName}
                                sublabel={format(currentDate, 'd MMMM yyyy')}
                                badge={day.isToday ? 'Today' : undefined}
                            />
                        }
                    >
                        {visibleSlots.map((slot) => (
                            <DailyTimeSlotCell
                                key={`${day.date}-${slot.time}`}
                                slot={slot}
                                date={day.date}
                                config={config}
                                onToggleMoment={handleToggleMoment}
                                isToday={day.isToday}
                                isNext={
                                    !!slot.moment &&
                                    nextMomentKey === `${day.date}:${slot.time}:${slot.moment.id}`
                                }
                                mode={scheduling.mode}
                                scheduling={scheduling.state}
                                onStartScheduling={handleStartScheduling}
                                onGhostNameChange={scheduling.setName}
                                onGhostIconChange={scheduling.setIcon}
                            />
                        ))}
                    </CalendarSection>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
