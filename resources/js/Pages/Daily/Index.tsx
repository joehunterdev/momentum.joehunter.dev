import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DailyContainer } from '@/features/calendar';
import { Head } from '@inertiajs/react';
import {
    CalendarNav,
    CalendarProgressBar,
} from '@/shared/components/calendar';
import { addDays, format, parseISO, subDays } from 'date-fns';
import type { PageProps } from '@/types';
import { useScheduling } from '@/features/scheduling';
import { SchedulingKind } from '@/shared/types/enums';

interface Props extends PageProps, App.Data.DailyPageData { }

export default function Index({ date, day, config, completedCount, totalCount }: Props) {
    const scheduling = useScheduling({ redirectTo: route('daily', { date }) });

    function handleStartScheduling(targetDate: string, time: string) {
        const endDate = format(addDays(parseISO(targetDate), 7), 'yyyy-MM-dd');
        scheduling.start({
            kind: SchedulingKind.Recurring,
            daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
            time,
            anchorDate: targetDate,
            endDate,
            name: '',
            icon: null,
        });
    }

    const currentDate = parseISO(date);
    const prevDate = subDays(currentDate, 1);
    const nextDate = addDays(currentDate, 1);

    return (
        <AuthenticatedLayout
            header={
                <div className="calendar-page-header">
                    <div className="calendar-page-header__row">
                        <CalendarNav
                            prevLabel={format(prevDate, 'EEE d MMM')}
                            currentLabel={format(currentDate, 'EEE d MMM')}
                            nextLabel={format(nextDate, 'EEE d MMM')}
                            prevParam={{ date: format(prevDate, 'yyyy-MM-dd') }}
                            nextParam={{ date: format(nextDate, 'yyyy-MM-dd') }}
                            routeName="daily"
                        />
                        {scheduling.mode === 'overview' ? (
                            <button
                                type="button"
                                className="calendar-page-header__mode-btn"
                                title="Configure schedule"
                                onClick={() => scheduling.setMode('configure')}
                            >
                                ⚙️
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="calendar-page-header__mode-btn calendar-page-header__mode-btn--done"
                                onClick={scheduling.exit}
                            >
                                ✕ Done
                            </button>
                        )}
                    </div>
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

            <div className="py-0 sm:py-6">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <DailyContainer
                        day={day}
                        config={config}
                        mode={scheduling.mode}
                        scheduling={scheduling.state}
                        onStartScheduling={handleStartScheduling}
                        onGhostNameChange={scheduling.setName}
                        onGhostIconChange={scheduling.setIcon}
                        onDraftApply={scheduling.applySourceOnly}
                        onDraftApplyAll={scheduling.confirm}
                        onDraftCancel={scheduling.cancel}
                        onGhostExclude={scheduling.excludeDay}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
