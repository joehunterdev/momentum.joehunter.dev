import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { CalendarNav } from '@/shared/components/calendar';
import {
    MonthlyGrid,
    MonthlyScheduleGrid,
    MonthlyVerticalView,
} from '@/features/monthly';
import { FrequencyBar } from '@/features/weekly';
import type { SchedulingState } from '@/features/weekly/types';
import { addMonths, format, parseISO, subMonths } from 'date-fns';
import { WEEK_DAYS } from '@/shared/constants/moments';
import type { PageProps } from '@/types';

interface Props extends PageProps, App.Data.MonthlyPageData { }

type MonthlyMode = 'overview' | 'configure';

export default function Index({ month, monthStart, days, scheduleRows }: Props) {
    const current = parseISO(monthStart);
    const prev = subMonths(current, 1);
    const next = addMonths(current, 1);

    const [mode, setMode] = useState<MonthlyMode>('overview');
    const [scheduling, setScheduling] = useState<SchedulingState | null>(null);

    function handleDayClick(date: string) {
        router.visit(route('daily', { date }));
    }

    // ── Schedule creation ─────────────────────────────────────────────────────
    function handleStartScheduling(isoDay: number) {
        setScheduling({
            date: monthStart,
            time: null,
            frequency: 'daily',
            daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // All days of the week
            name: '',
            icon: null,
        });
    }

    function handleSchedulingChange(frequency: App.Enums.Frequency, daysOfWeek: number[]) {
        setScheduling((prev) => prev ? { ...prev, frequency, daysOfWeek } : null);
    }

    function handleSchedulingNameChange(name: string) {
        setScheduling((prev) => prev ? { ...prev, name } : null);
    }

    function handleSchedulingIconChange(icon: string | null) {
        setScheduling((prev) => prev ? { ...prev, icon } : null);
    }

    function handleConfirmSchedule() {
        if (!scheduling) { return; }

        router.post(
            route('moments.store'),
            {
                name: scheduling.name.trim() || null,
                frequency: scheduling.frequency,
                days_of_week: scheduling.frequency !== 'once' ? scheduling.daysOfWeek : null,
                preferred_time: null,
                icon: scheduling.icon,
                scheduled_date: null,
                _redirect: route('monthly', { month }),
            },
            {
                preserveScroll: true,
                onSuccess: () => setScheduling(null),
            },
        );
    }

    function handleExitConfigure() {
        setMode('overview');
        setScheduling(null);
    }

    const dayLabels = WEEK_DAYS.map((d) => d.label);

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
                    {mode === 'overview' ? (
                        <button
                            type="button"
                            className="monthly-header__mode-btn"
                            title="Configure schedule"
                            onClick={() => setMode('configure')}
                        >
                            ⚙️
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="monthly-header__mode-btn monthly-header__mode-btn--done"
                            onClick={handleExitConfigure}
                        >
                            ✕ Done
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Monthly" />

            {mode === 'configure' && scheduling && (
                <FrequencyBar
                    frequency={scheduling.frequency}
                    daysOfWeek={scheduling.daysOfWeek}
                    dayLabels={dayLabels}
                    onChange={handleSchedulingChange}
                    onConfirm={handleConfirmSchedule}
                    onCancel={() => setScheduling(null)}
                />
            )}

            <div className="py-0 sm:py-6">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    {mode === 'overview' ? (
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
                            scheduling={scheduling}
                            onStartScheduling={handleStartScheduling}
                            onGhostNameChange={handleSchedulingNameChange}
                            onGhostIconChange={handleSchedulingIconChange}
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
