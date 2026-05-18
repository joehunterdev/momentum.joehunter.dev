import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DailyGrid, DailyProgressBar } from '@/features/daily';
import { Head, router } from '@inertiajs/react';
import { CalendarNav, MomentFrequencyConfig } from '@/shared/components/calendar';
import { addDays, format, parseISO, subDays } from 'date-fns';
import type { PageProps } from '@/types';
import type { IsoDayNumber, SchedulingState as NewSchedulingState } from '@/features/scheduling';
import { useScheduling } from '@/features/scheduling';
import type { SchedulingState as LegacySchedulingState } from '@/features/weekly/types';

interface Props extends PageProps, App.Data.DailyPageData { }

const WEEKDAYS: IsoDayNumber[] = [1, 2, 3, 4, 5];

/**
 * Adapter: convert the new discriminated-union scheduling state into the
 * legacy flat shape that <DailyGrid> still consumes.
 * Removed once those components migrate in later PRs.
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

export default function Index({ date, day, nextDay, config, completedCount, totalCount }: Props) {
    const scheduling = useScheduling({ redirectTo: route('daily', { date }) });

    function handleStartScheduling(time: string) {
        scheduling.start({
            kind: 'one-off',
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

    const legacyScheduling = toLegacy(scheduling.state, date);

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
                    <DailyGrid
                        day={day}
                        nextDay={nextDay}
                        config={config}
                        onToggleMoment={handleToggleMoment}
                        nextMomentKey={nextMomentKey}
                        mode={scheduling.mode}
                        scheduling={legacyScheduling}
                        onStartScheduling={handleStartScheduling}
                        onGhostNameChange={scheduling.setName}
                        onGhostIconChange={scheduling.setIcon}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
