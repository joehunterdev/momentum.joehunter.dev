import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { WeeklyGrid } from '@/features/weekly';
import type { SchedulingState as LegacySchedulingState, WeeklyPageProps } from '@/features/weekly';
import { MomentModal, useMomentForm } from '@/features/moments';
import type { MomentFormData } from '@/features/moments';
import { CalendarNav, MomentFrequencyConfig, jsToIsoDay } from '@/shared/components/calendar';
import type { IsoDayNumber, SchedulingState as NewSchedulingState } from '@/features/scheduling';
import { useScheduling } from '@/features/scheduling';
import {
    addWeeks,
    endOfISOWeek,
    format,
    parseISO,
    startOfISOWeek,
    subWeeks,
} from 'date-fns';
import { WEEK_DAYS } from '@/shared/constants/moments';
import type { PageProps } from '@/types';

interface Props extends PageProps, WeeklyPageProps { }

const WEEKDAYS: IsoDayNumber[] = [1, 2, 3, 4, 5];

/**
 * Adapter: new discriminated-union scheduling state → legacy flat shape
 * expected by <WeeklyGrid>. Removed when that migrates.
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

export default function Index({ weekStart, config, days }: Props) {
    const scheduling = useScheduling({ redirectTo: route('weekly') });

    // ── Edit-via-modal flow (kept for editing existing moments) ───────────────
    const [showingModal, setShowingModal] = useState(false);
    const [modalDefaults, setModalDefaults] = useState<Partial<MomentFormData> | undefined>();

    function handleModalClose() {
        setShowingModal(false);
        setModalDefaults(undefined);
    }

    function handleModalSubmit(_data: MomentFormData, form: ReturnType<typeof useMomentForm>) {
        form.transform((d) => ({ ...d, _redirect: route('weekly') }));
        form.post(route('moments.store'), {
            onSuccess: () => handleModalClose(),
            onError: () => { },
        });
    }

    function handleModalDelete(moment: import('@/features/moments').Moment) {
        router.delete(route('moments.destroy', moment.id), {
            onSuccess: () => handleModalClose(),
        });
    }

    // ── Schedule-first creation flow ──────────────────────────────────────────
    function handleStartScheduling(date: string, time: string) {
        const clickedIso = jsToIsoDay(new Date(date).getDay()) as IsoDayNumber;
        const isWeekday = clickedIso >= 1 && clickedIso <= 5;

        scheduling.start({
            kind: 'recurring',
            daysOfWeek: isWeekday ? [...WEEKDAYS] : [clickedIso],
            time,
            anchorDate: date,
            name: '',
            icon: null,
        });
    }

    const legacyScheduling = toLegacy(scheduling.state, weekStart);

    // ── Conflict count ────────────────────────────────────────────────────────
    const conflictCount = legacyScheduling
        ? days.reduce((count, day) => {
            if (legacyScheduling.frequency === 'once') {
                if (day.date !== legacyScheduling.date) { return count; }
            } else {
                const iso = jsToIsoDay(new Date(day.date).getDay());
                if (!legacyScheduling.daysOfWeek.includes(iso)) { return count; }
            }
            const hasConflict = day.slots.some(
                (s) => s.time === legacyScheduling.time && s.moment !== null,
            );
            return count + (hasConflict ? 1 : 0);
        }, 0)
        : 0;

    // ── Consistent day-pill labels for FrequencyBar ──────────────────────────
    const dayLabels = WEEK_DAYS.map((d) => d.label);

    const currentWeekStart = startOfISOWeek(parseISO(weekStart));
    const prevWeekStart = subWeeks(currentWeekStart, 1);
    const nextWeekStart = addWeeks(currentWeekStart, 1);

    function weekLabel(start: Date): string {
        return `${format(start, 'd MMM')} – ${format(endOfISOWeek(start), 'd MMM')}`;
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="weekly-header">
                    <CalendarNav
                        prevLabel={weekLabel(prevWeekStart)}
                        currentLabel={weekLabel(currentWeekStart)}
                        nextLabel={weekLabel(nextWeekStart)}
                        prevParam={{ week: format(prevWeekStart, 'yyyy-MM-dd') }}
                        nextParam={{ week: format(nextWeekStart, 'yyyy-MM-dd') }}
                        routeName="weekly"
                    />
                    {scheduling.mode === 'overview' ? (
                        <button
                            type="button"
                            className="weekly-header__mode-btn"
                            title="Configure schedule"
                            onClick={() => scheduling.setMode('configure')}
                        >
                            ⚙️
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="weekly-header__mode-btn weekly-header__mode-btn--done"
                            onClick={scheduling.exit}
                        >
                            ✕ Done
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Weekly" />

            {scheduling.mode === 'configure' && scheduling.state && (
                <MomentFrequencyConfig
                    state={scheduling.state}
                    time={scheduling.state.time}
                    dayLabels={dayLabels}
                    conflictCount={conflictCount}
                    onKindChange={(next) => scheduling.setKind(next, weekStart)}
                    onDaysChange={scheduling.setDaysOfWeek}
                    onConfirm={scheduling.confirm}
                    onCancel={scheduling.cancel}
                />
            )}

            <div className="py-0 sm:py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <WeeklyGrid
                        days={days}
                        config={config}
                        mode={scheduling.mode}
                        scheduling={legacyScheduling}
                        onStartScheduling={handleStartScheduling}
                        onGhostNameChange={scheduling.setName}
                        onGhostIconChange={scheduling.setIcon}
                    />
                </div>
            </div>

            {/* Modal kept for editing existing moments only */}
            <MomentModal
                show={showingModal}
                onClose={handleModalClose}
                defaultValues={modalDefaults}
                onSubmit={handleModalSubmit}
            />
        </AuthenticatedLayout>
    );
}
