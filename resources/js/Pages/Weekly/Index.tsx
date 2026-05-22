import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { WeeklyContainer } from '@/features/calendar';
import type { WeeklyPageProps } from '@/features/calendar';
import { MomentModal, useMomentForm } from '@/features/moments';
import type { MomentFormData } from '@/features/moments';
import { CalendarNav, CalendarProgressBar } from '@/shared/components/calendar';
import { jsToIsoDay } from '@/features/calendar/utils';
import type { IsoDayNumber } from '@/features/scheduling';
import { useScheduling } from '@/features/scheduling';
import { SchedulingKind } from '@/shared/types/enums';
import {
    addWeeks,
    endOfISOWeek,
    format,
    parseISO,
    startOfISOWeek,
    subWeeks,
} from 'date-fns';
import type { PageProps } from '@/types';

interface Props extends PageProps, WeeklyPageProps { }

const WEEKDAYS: IsoDayNumber[] = [1, 2, 3, 4, 5];

export default function Index({ weekStart, config, days, completedCount, totalCount }: Props) {
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
            kind: SchedulingKind.Recurring,
            daysOfWeek: isWeekday ? [...WEEKDAYS] : [clickedIso],
            time,
            anchorDate: date,
            name: '',
            icon: null,
        });
    }

    const schedulingState = scheduling.state;

    const currentWeekStart = startOfISOWeek(parseISO(weekStart));
    const prevWeekStart = subWeeks(currentWeekStart, 1);
    const nextWeekStart = addWeeks(currentWeekStart, 1);

    function weekLabel(start: Date): string {
        return `${format(start, 'd MMM')} – ${format(endOfISOWeek(start), 'd MMM')}`;
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="calendar-page-header">
                    <div className="calendar-page-header__row">
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
                                className="calendar-page-header__mode-btn"
                                title="Configure schedule"
                                onClick={() => scheduling.setMode('configure')}
                            >
                                ⚙️
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="calendar-page-header__mode-btn calendar-page-header__mode-btn--done"
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
            <Head title="Weekly" />

            <div className="py-0 sm:py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <WeeklyContainer
                        days={days}
                        config={config}
                        mode={scheduling.mode}
                        scheduling={schedulingState}
                        onStartScheduling={handleStartScheduling}
                        onGhostNameChange={scheduling.setName}
                        onGhostIconChange={scheduling.setIcon}
                        onDraftApply={scheduling.applySourceOnly}
                        onDraftApplyAll={scheduling.confirm}
                        onDraftCancel={scheduling.cancel}
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
