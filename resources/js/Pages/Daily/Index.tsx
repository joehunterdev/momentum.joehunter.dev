import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DailyContainer, useCalendarActions } from '@/features/calendar';
import { Head } from '@inertiajs/react';
import {
    CalendarNav,
    CalendarProgressBar,
    MomentFrequencyConfig,
} from '@/shared/components/calendar';
import { addDays, format, parseISO, subDays } from 'date-fns';
import type { PageProps } from '@/types';
import { useScheduling } from '@/features/scheduling';
import { SchedulingKind } from '@/shared/types/enums';

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

    const currentDate = parseISO(date);
    const prevDate = subDays(currentDate, 1);
    const nextDate = addDays(currentDate, 1);

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
                    <DailyContainer
                        day={day}
                        config={config}
                        mode={scheduling.mode}
                        scheduling={scheduling.state}
                        onToggleMoment={handleToggleMoment}
                        onStartScheduling={handleStartScheduling}
                        onGhostNameChange={scheduling.setName}
                        onGhostIconChange={scheduling.setIcon}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
