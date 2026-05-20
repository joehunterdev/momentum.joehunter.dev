import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { CalendarNav, CalendarProgressBar, MomentFrequencyConfig } from '@/shared/components/calendar';
import {
    MonthlyGrid,
    MonthlyScheduleGrid,
    MonthlyVerticalView,
} from '@/features/monthly';
import type { IsoDayNumber } from '@/features/scheduling';
import { useScheduling } from '@/features/scheduling';
import { addMonths, format, parseISO, subMonths } from 'date-fns';
import { WEEK_DAYS } from '@/shared/constants/moments';
import type { PageProps } from '@/types';

interface Props extends PageProps, App.Data.MonthlyPageData { }

const ALL_DAYS: IsoDayNumber[] = [1, 2, 3, 4, 5, 6, 7];

export default function Index({ month, monthStart, days, scheduleRows, completedCount, totalCount }: Props) {
    const current = parseISO(monthStart);
    const prev = subMonths(current, 1);
    const next = addMonths(current, 1);

    const scheduling = useScheduling({ redirectTo: route('monthly', { month }) });

    function handleDayClick(date: string) {
        router.visit(route('daily', { date }));
    }

    // ── Schedule creation ─────────────────────────────────────────────────────
    function handleStartScheduling(_isoDay: number) {
        scheduling.start({
            kind: 'recurring',
            daysOfWeek: [...ALL_DAYS],
            time: null,
            anchorDate: monthStart,
            name: '',
            icon: null,
        });
    }

    const dayLabels = WEEK_DAYS.map((d) => d.label);

    return (
        <AuthenticatedLayout
            header={
                <div className="monthly-header">
                    <div className="monthly-header__row">
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
                                className="monthly-header__mode-btn"
                                title="Configure schedule"
                                onClick={() => scheduling.setMode('configure')}
                            >
                                ⚙️
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="monthly-header__mode-btn monthly-header__mode-btn--done"
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

            {scheduling.mode === 'configure' && scheduling.state && (
                <MomentFrequencyConfig
                    state={scheduling.state}
                    dayLabels={dayLabels}
                    onKindChange={(next) => scheduling.setKind(next, monthStart)}
                    onDaysChange={scheduling.setDaysOfWeek}
                    onConfirm={scheduling.confirm}
                    onCancel={scheduling.cancel}
                />
            )}

            <div className="py-0 sm:py-6">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    {scheduling.mode === 'overview' ? (
                        <>
                            {/* Desktop/Tablet Grid View */}
                            <div className="hidden md:block">
                                <MonthlyGrid
                                    days={days}
                                    onDayClick={handleDayClick}
                                />
                            </div>

                            {/* Mobile Vertical View */}
                            <div className="block md:hidden">
                                <MonthlyVerticalView
                                    days={days}
                                    mode={scheduling.mode}
                                    scheduling={scheduling.state}
                                    onDayClick={handleDayClick}
                                    onStartScheduling={(date) => {
                                        scheduling.start({
                                            kind: 'recurring',
                                            daysOfWeek: [...ALL_DAYS],
                                            time: null,
                                            anchorDate: date,
                                            name: '',
                                            icon: null,
                                        });
                                    }}
                                    onDraftNameChange={scheduling.setName}
                                    onDraftIconChange={scheduling.setIcon}
                                />
                            </div>
                        </>
                    ) : (
                        <MonthlyScheduleGrid
                            rows={scheduleRows}
                            mode={scheduling.mode}
                            scheduling={scheduling.state}
                            onStartScheduling={handleStartScheduling}
                            onDraftNameChange={scheduling.setName}
                            onDraftIconChange={scheduling.setIcon}
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
