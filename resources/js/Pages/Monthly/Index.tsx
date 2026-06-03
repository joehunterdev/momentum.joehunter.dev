import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Icon from '@/shared/components/Icon';
import { CalendarNav, CalendarNowToggle, CalendarProgressBar } from '@/shared/components/calendar';
import { MonthlyContainer } from '@/features/calendar';
import type { IsoDayNumber } from '@/features/scheduling';
import { useScheduling } from '@/features/scheduling';
import { addDays, addMonths, format, parseISO, subDays, subMonths } from 'date-fns';
import type { PageProps } from '@/types';
import { SchedulingKind } from '@/shared/types/enums';

interface Props extends PageProps, App.Data.MonthlyPageData { }

const ALL_DAYS: IsoDayNumber[] = [1, 2, 3, 4, 5, 6, 7];

export default function Index({ rangeStart, whole, days, scheduleRows, completedCount, totalCount }: Props) {
    // Two modes: rolling 30 days from now (default) ⇄ whole calendar month.
    // Rolling pages by 30 days; whole pages month-by-month.
    const current = parseISO(rangeStart);
    const prev = whole ? subMonths(current, 1) : subDays(current, 30);
    const next = whole ? addMonths(current, 1) : addDays(current, 30);
    const navLabel = (d: Date) => whole
        ? format(d, 'MMMM yyyy')
        : `${format(d, 'd MMM')} – ${format(addDays(d, 29), 'd MMM')}`;
    const navParam = (d: Date): Record<string, string> =>
        ({ start: format(d, 'yyyy-MM-dd'), ...(whole ? { whole: '1' } : {}) });

    // "Now / Month" toggle: going to "Now" resets to today's rolling window;
    // going to "Month" expands the current anchor's calendar month.
    function toggleWhole() {
        router.get(route('monthly'), whole ? {} : { start: rangeStart, whole: 1 }, { preserveScroll: false });
    }

    const scheduling = useScheduling({
        redirectTo: route('monthly', { start: rangeStart, ...(whole ? { whole: 1 } : {}) }),
    });

    /**
     * For an isoDay click on a configure-mode row, anchor on the first matching
     * date in the range so source/ghost detection picks the right row.
     */
    function firstDateForIsoDay(isoDay: number): string {
        const rangeStartDate = parseISO(rangeStart);
        for (let i = 0; i < 7; i++) {
            const candidate = new Date(rangeStartDate);
            candidate.setDate(rangeStartDate.getDate() + i);
            const candidateIso = ((candidate.getDay() + 6) % 7) + 1; // ISO 1..7
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
            endDate: null, // ongoing by default — adjust the horizon in the moment editor
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
                            routeName="monthly"
                        />
                        <CalendarNowToggle focused={!whole} onToggle={toggleWhole} idleLabel="Month" />
                        {scheduling.mode === 'overview' ? (
                            <button
                                type="button"
                                className="calendar-page-header__mode-btn"
                                title="Configure schedule"
                                onClick={() => scheduling.setMode('configure')}
                            >
                                <Icon name="settings" size={20} aria-hidden />
                            </button>
                        ) : (
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
                                endDate: null, // ongoing by default — adjust the horizon in the moment editor
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
