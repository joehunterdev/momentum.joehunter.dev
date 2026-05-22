import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { CalendarNav, CalendarProgressBar } from '@/shared/components/calendar';
import { MonthlyContainer } from '@/features/calendar';
import type { IsoDayNumber } from '@/features/scheduling';
import { useScheduling } from '@/features/scheduling';
import { addMonths, format, parseISO, subMonths } from 'date-fns';
import type { PageProps } from '@/types';
import { SchedulingKind } from '@/shared/types/enums';

interface Props extends PageProps, App.Data.MonthlyPageData { }

const ALL_DAYS: IsoDayNumber[] = [1, 2, 3, 4, 5, 6, 7];

export default function Index({ month, monthStart, days, scheduleRows, completedCount, totalCount }: Props) {
    const current = parseISO(monthStart);
    const prev = subMonths(current, 1);
    const next = addMonths(current, 1);

    const scheduling = useScheduling({ redirectTo: route('monthly', { month }) });

    /**
     * For an isoDay click on a configure-mode row, anchor on the first matching
     * date in the month so source/ghost detection picks the right row.
     */
    function firstDateForIsoDay(isoDay: number): string {
        const monthStartDate = parseISO(monthStart);
        for (let i = 0; i < 7; i++) {
            const candidate = new Date(monthStartDate);
            candidate.setDate(monthStartDate.getDate() + i);
            const candidateIso = ((candidate.getDay() + 6) % 7) + 1; // ISO 1..7
            if (candidateIso === isoDay) {
                return format(candidate, 'yyyy-MM-dd');
            }
        }
        return monthStart;
    }

    function handleStartScheduling(isoDay: number) {
        scheduling.start({
            kind: SchedulingKind.Recurring,
            daysOfWeek: [...ALL_DAYS],
            time: null,
            anchorDate: firstDateForIsoDay(isoDay),
            name: '',
            icon: null,
        });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="calendar-page-header">
                    <div className="calendar-page-header__row">
                        <CalendarNav
                            prevLabel={format(prev, 'MMMM yyyy')}
                            currentLabel={format(current, 'MMMM yyyy')}
                            nextLabel={format(next, 'MMMM yyyy')}
                            prevParam={{ month: format(prev, 'yyyy-MM') }}
                            nextParam={{ month: format(next, 'yyyy-MM') }}
                            routeName="monthly"
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
            <Head title="Monthly" />

            <div className="py-0 sm:py-6">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <MonthlyContainer
                        days={days}
                        scheduleRows={scheduleRows}
                        mode={scheduling.mode}
                        scheduling={scheduling.state}
                        onStartSchedulingFromDate={(date) => {
                            scheduling.start({
                                kind: SchedulingKind.Recurring,
                                daysOfWeek: [...ALL_DAYS],
                                time: null,
                                anchorDate: date,
                                name: '',
                                icon: null,
                            });
                        }}
                        onStartSchedulingFromIsoDay={handleStartScheduling}
                        onDraftNameChange={scheduling.setName}
                        onDraftIconChange={scheduling.setIcon}
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
