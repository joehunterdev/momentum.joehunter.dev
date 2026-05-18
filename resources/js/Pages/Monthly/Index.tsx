import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { CalendarNav, MomentFrequencyConfig } from '@/shared/components/calendar';
import {
    MonthlyGrid,
    MonthlyScheduleGrid,
    MonthlyVerticalView,
} from '@/features/monthly';
import type { SchedulingState as LegacySchedulingState } from '@/features/weekly/types';
import type { IsoDayNumber, SchedulingState as NewSchedulingState } from '@/features/scheduling';
import { useScheduling } from '@/features/scheduling';
import { addMonths, format, parseISO, subMonths } from 'date-fns';
import { WEEK_DAYS } from '@/shared/constants/moments';
import type { PageProps } from '@/types';

interface Props extends PageProps, App.Data.MonthlyPageData { }

const ALL_DAYS: IsoDayNumber[] = [1, 2, 3, 4, 5, 6, 7];
const WEEKDAYS: IsoDayNumber[] = [1, 2, 3, 4, 5];

/**
 * Adapter: new discriminated-union state → legacy flat shape for
 * <MonthlyScheduleGrid>. Removed when that migrates.
 */
function toLegacy(state: NewSchedulingState | null, fallbackDate: string): LegacySchedulingState | null {
    if (!state) { return null; }

    if (state.kind === 'one-off') {
        return {
            date: state.date,
            time: state.time,
            frequency: 'once',
            daysOfWeek: [],
            name: state.name,
            icon: state.icon,
        };
    }

    const isAllDays = state.daysOfWeek.length === 7;
    const isWeekdays =
        state.daysOfWeek.length === WEEKDAYS.length
        && WEEKDAYS.every((d) => state.daysOfWeek.includes(d));
    const frequency: App.Enums.Frequency = isAllDays ? 'daily' : isWeekdays ? 'weekly' : 'custom';

    return {
        date: state.anchorDate || fallbackDate,
        time: state.time,
        frequency,
        daysOfWeek: state.daysOfWeek,
        name: state.name,
        icon: state.icon,
    };
}

export default function Index({ month, monthStart, days, scheduleRows }: Props) {
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
    const legacyScheduling = toLegacy(scheduling.state, monthStart);

    return (
        <AuthenticatedLayout
            header={
                <div className="monthly-header">
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
                                    onDayClick={handleDayClick}
                                />
                            </div>
                        </>
                    ) : (
                        <MonthlyScheduleGrid
                            rows={scheduleRows}
                            scheduling={legacyScheduling}
                            onStartScheduling={handleStartScheduling}
                            onGhostNameChange={scheduling.setName}
                            onGhostIconChange={scheduling.setIcon}
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
