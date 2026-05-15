import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DailyGrid, DailyProgressBar } from '@/features/daily';
import { Head, router } from '@inertiajs/react';
import { CalendarNav, jsToIsoDay } from '@/shared/components/calendar';
import { addDays, format, parseISO, subDays } from 'date-fns';
import type { PageProps } from '@/types';
import { useState } from 'react';
import type { SchedulingState } from '@/features/weekly/types';
import { FrequencyBar } from '@/features/weekly';

interface Props extends PageProps, App.Data.DailyPageData { }

type DailyMode = 'overview' | 'configure';

export default function Index({ date, day, nextDay, config, completedCount, totalCount }: Props) {
    const [mode, setMode] = useState<DailyMode>('overview');
    const [scheduling, setScheduling] = useState<SchedulingState | null>(null);

    // ── Schedule-first creation flow ──────────────────────────────────────────
    function handleStartScheduling(time: string) {
        setMode('configure');
        setScheduling({
            date,
            time,
            frequency: 'once',
            daysOfWeek: [],
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
                preferred_time: scheduling.time,
                icon: scheduling.icon,
                scheduled_date: scheduling.frequency === 'once' ? scheduling.date : null,
                _redirect: route('daily', { date }),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setScheduling(null);
                    setMode('overview');
                },
            },
        );
    }

    function handleCancelSchedule() {
        setScheduling(null);
        setMode('overview');
    }

    async function handleToggleMoment(
        momentId: number,
        _instanceId: number | null,
        date: string,
    ) {
        const token =
            (
                document.querySelector(
                    'meta[name="csrf-token"]',
                ) as HTMLMetaElement | null
            )?.content ?? '';

        await fetch(route('moments.toggle', { moment: momentId }), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token,
                Accept: 'application/json',
            },
            body: JSON.stringify({ date }),
        });

        router.reload({ only: ['day', 'completedCount', 'totalCount'] });
    }

    // Key = "date:time:momentId" — first pending moment of the day
    const nextMomentKey = (() => {
        for (const slot of day.slots) {
            if (slot.moment && slot.moment.status !== 'completed') {
                return `${day.date}:${slot.time}:${slot.moment.id}`;
            }
        }
        return null;
    })();

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
                    {mode === 'overview' && totalCount > 0 && (
                        <DailyProgressBar
                            completedCount={completedCount}
                            totalCount={totalCount}
                        />
                    )}
                </div>
            }
        >
            <Head title="Daily" />
            {/* Scheduling UI */}
            {mode === 'configure' && scheduling && (
                <FrequencyBar
                    time={scheduling.time}
                    frequency={scheduling.frequency}
                    daysOfWeek={scheduling.daysOfWeek}
                    onChange={handleSchedulingChange}
                    onCancel={handleCancelSchedule}
                    onConfirm={handleConfirmSchedule}
                />
            )}

            <div className="py-0 sm:py-6">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <DailyGrid
                        day={day}
                        nextDay={nextDay}
                        config={config}
                        onToggleMoment={handleToggleMoment}
                        nextMomentKey={nextMomentKey}
                        mode={mode}
                        scheduling={scheduling}
                        onStartScheduling={handleStartScheduling}
                        onGhostNameChange={handleSchedulingNameChange}
                        onGhostIconChange={handleSchedulingIconChange}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
