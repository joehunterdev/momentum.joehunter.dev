import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { WeeklyGrid, RecurrenceBar } from '@/features/weekly';
import type { WeeklyPageProps } from '@/features/weekly';
import { MomentModal, useMomentForm } from '@/features/moments';
import type { MomentFormData } from '@/features/moments';
import { DateSelectorBar } from '@/shared/components/calendar';
import { WEEK_DAYS } from '@/shared/constants/moments';
import type { PageProps } from '@/types';

interface Props extends PageProps, WeeklyPageProps { }

type WeekMode = 'overview' | 'configure';

interface SchedulingState {
    date: string;
    time: string;
    frequency: 'daily' | 'weekly' | 'custom' | 'once';
    daysOfWeek: number[];
    name: string;
    icon: string | null;
}

/** Convert JS getDay() (0=Sun) to ISO day (1=Mon … 7=Sun) */
function jsToIsoDay(d: number): number {
    return d === 0 ? 7 : d;
}

export default function Index({ weekStart, config, days }: Props) {

    const [mode, setMode] = useState<WeekMode>('overview');
    const [scheduling, setScheduling] = useState<SchedulingState | null>(null);

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
        setMode('configure');
        setScheduling({
            date,
            time,
            frequency: 'weekly',
            daysOfWeek: [1, 2, 3, 4, 5], // default: weekdays
            name: '',
            icon: null,
        });
    }

    function handleSchedulingChange(frequency: 'daily' | 'weekly' | 'custom' | 'once', daysOfWeek: number[]) {
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
                _redirect: route('weekly'),
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

    // ── Conflict count ────────────────────────────────────────────────────────
    const conflictCount = scheduling
        ? days.reduce((count, day) => {
            if (scheduling.frequency === 'once') {
                if (day.date !== scheduling.date) { return count; }
            } else {
                const iso = jsToIsoDay(new Date(day.date).getDay());
                if (!scheduling.daysOfWeek.includes(iso)) { return count; }
            }
            const hasConflict = day.slots.some(
                (s) => s.time === scheduling.time && s.moment !== null,
            );
            return count + (hasConflict ? 1 : 0);
        }, 0)
        : 0;

    // ── Consistent day-pill labels for RecurrenceBar ──────────────────────────
    const dayLabels = WEEK_DAYS.map((d) => d.label);

    return (
        <AuthenticatedLayout
            header={
                <div className="weekly-header">
                    <DateSelectorBar mode="week" weekStart={weekStart} />
                    {mode === 'overview' ? (
                        <button
                            type="button"
                            className="weekly-header__mode-btn"
                            title="Configure schedule"
                            onClick={() => setMode('configure')}
                        >
                            ⚙️
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="weekly-header__mode-btn weekly-header__mode-btn--done"
                            onClick={handleExitConfigure}
                        >
                            ✕ Done
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Weekly" />

            {mode === 'configure' && scheduling && (
                <RecurrenceBar
                    time={scheduling.time}
                    frequency={scheduling.frequency}
                    daysOfWeek={scheduling.daysOfWeek}
                    dayLabels={dayLabels}
                    conflictCount={conflictCount}
                    onChange={handleSchedulingChange}
                    onConfirm={handleConfirmSchedule}
                    onCancel={() => setScheduling(null)}
                />
            )}

            <div className="py-0 sm:py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <WeeklyGrid
                        days={days}
                        config={config}
                        mode={mode}
                        scheduling={scheduling}
                        onStartScheduling={handleStartScheduling}
                        onGhostNameChange={handleSchedulingNameChange}
                        onGhostIconChange={handleSchedulingIconChange}
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
