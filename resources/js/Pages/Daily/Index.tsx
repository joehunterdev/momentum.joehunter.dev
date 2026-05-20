import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DailyTimeSlotCell } from '@/features/daily';
import { Head, router } from '@inertiajs/react';
import {
    CalendarNav,
    CalendarProgressBar,
    CalendarSection,
    CalendarSectionHeader,
    MomentFrequencyConfig,
} from '@/shared/components/calendar';
import type { CalendarConfig, TimeSlot } from '@/shared/components/calendar';
import { addDays, format, parseISO, subDays } from 'date-fns';
import type { PageProps } from '@/types';
import { useScheduling } from '@/features/scheduling';

interface Props extends PageProps, App.Data.DailyPageData { }

const INTERVAL_MINUTES = 30;

/** Slots from wake → sleep. For today, anchor to (now - 2h) snapped to interval. */
function getVisibleSlots(slots: TimeSlot[], config: CalendarConfig, isToday: boolean): TimeSlot[] {
    const inWindow = slots.filter(
        (s) => s.time >= config.wake_time && s.time < config.sleep_time,
    );

    if (!isToday) {
        return inWindow;
    }

    const now = new Date();
    const cutoffMinutes = Math.max(0, now.getHours() * 60 + now.getMinutes() - 2 * 60);
    const snappedCutoff = cutoffMinutes - (cutoffMinutes % INTERVAL_MINUTES);
    const cutoffHH = String(Math.floor(snappedCutoff / 60)).padStart(2, '0');
    const cutoffMM = String(snappedCutoff % 60).padStart(2, '0');
    const cutoffTime = `${cutoffHH}:${cutoffMM}`;

    return inWindow.filter((s) => s.time >= cutoffTime || s.moment !== null);
}

export default function Index({ date, day, config, completedCount, totalCount }: Props) {
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
    const visibleSlots = getVisibleSlots(day.slots, config, day.isToday);

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
                    <CalendarSection
                        isToday={day.isToday}
                        layout="vertical"
                        header={
                            <CalendarSectionHeader
                                label={day.dayName}
                                sublabel={format(currentDate, 'd MMMM yyyy')}
                                badge={day.isToday ? 'Today' : undefined}
                            />
                        }
                    >
                        {visibleSlots.map((slot) => (
                            <DailyTimeSlotCell
                                key={`${day.date}-${slot.time}`}
                                slot={slot}
                                date={day.date}
                                config={config}
                                onToggleMoment={handleToggleMoment}
                                isToday={day.isToday}
                                isNext={
                                    !!slot.moment &&
                                    nextMomentKey === `${day.date}:${slot.time}:${slot.moment.id}`
                                }
                                mode={scheduling.mode}
                                scheduling={scheduling.state}
                                onStartScheduling={handleStartScheduling}
                                onGhostNameChange={scheduling.setName}
                                onGhostIconChange={scheduling.setIcon}
                            />
                        ))}
                    </CalendarSection>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
