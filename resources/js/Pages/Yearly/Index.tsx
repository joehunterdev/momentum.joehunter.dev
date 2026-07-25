import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Icon from '@/shared/components/Icon';
import { CalendarNav, CalendarProgressBar } from '@/shared/components/calendar';
import { MonthlyContainer } from '@/features/calendar';
import type { IsoDayNumber } from '@/features/scheduling';
import { useScheduling } from '@/features/scheduling';
import { addDays, format, parseISO, subDays } from 'date-fns';
import type { PageProps } from '@/types';
import { SchedulingKind } from '@/shared/types/enums';

interface Props extends PageProps, App.Data.MonthlyPageData { }

const ALL_DAYS: IsoDayNumber[] = [1, 2, 3, 4, 5, 6, 7];

export default function Index({ rangeStart, days, completedCount, totalCount }: Props) {
    // 365-day rolling window anchored on the displayed start date.
    const current = parseISO(rangeStart);
    const prev = subDays(current, 365);
    const next = addDays(current, 365);
    const navLabel = (d: Date) => `${format(d, 'd MMM yyyy')} – ${format(addDays(d, 364), 'd MMM yyyy')}`;
    const navParam = (d: Date): Record<string, string> =>
        ({ start: format(d, 'yyyy-MM-dd') });

    const scheduling = useScheduling({
        redirectTo: route('yearly', { start: rangeStart }),
    });

    function firstDateForIsoDay(isoDay: number): string {
        const rangeStartDate = parseISO(rangeStart);
        for (let i = 0; i < 7; i++) {
            const candidate = new Date(rangeStartDate);
            candidate.setDate(rangeStartDate.getDate() + i);
            const candidateIso = ((candidate.getDay() + 6) % 7) + 1;
            if (candidateIso === isoDay) {
                return format(candidate, 'yyyy-MM-dd');
            }
        }
        return rangeStart;
    }

    function handleStartScheduling(isoDay: number) {
        const anchor = firstDateForIsoDay(isoDay);
        scheduling.start({
            kind: SchedulingKind.Recurring,
            daysOfWeek: [...ALL_DAYS],
            time: null,
            anchorDate: anchor,
            endDate: null,
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
                            prevLabel={navLabel(prev)}
                            currentLabel={navLabel(current)}
                            nextLabel={navLabel(next)}
                            prevParam={navParam(prev)}
                            nextParam={navParam(next)}
                            routeName="yearly"
                        />
                        {scheduling.mode === 'configure' && (
                            <button
                                type="button"
                                className="calendar-page-header__mode-btn calendar-page-header__mode-btn--done"
                                onClick={scheduling.exit}
                            >
                                <Icon name="close" size={18} aria-hidden /> Done
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
            <Head title="Yearly" />

            <div className="py-0 sm:py-6">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <MonthlyContainer
                        days={days}
                        scheduleRows={[]}
                        mode={scheduling.mode}
                        scheduling={scheduling.state}
                        whole={false}
                        onToggleWhole={() => {}}
                        onStartSchedulingFromDate={(date: string) => {
                            scheduling.start({
                                kind: SchedulingKind.Recurring,
                                daysOfWeek: [...ALL_DAYS],
                                time: null,
                                anchorDate: date,
                                endDate: null,
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
