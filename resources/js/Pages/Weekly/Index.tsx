import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Icon from '@/shared/components/Icon';
import { WeeklyContainer } from '@/features/calendar';
import type { WeeklyPageProps } from '@/features/calendar';
import { MomentModal, useMomentForm } from '@/features/moments';
import type { MomentFormData } from '@/features/moments';
import { CalendarNav, CalendarProgressBar } from '@/shared/components/calendar';
import type { IsoDayNumber } from '@/features/scheduling';
import { useScheduling } from '@/features/scheduling';
import { SchedulingKind } from '@/shared/types/enums';
import {
    addDays,
    format,
    parseISO,
    subDays,
} from 'date-fns';
import type { PageProps } from '@/types';

interface Props extends PageProps, WeeklyPageProps { }

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
    // Tap → "every {that weekday}" for the month. With a recurring draft already
    // active, a tap on another day instead ADDS that weekday to the pattern
    // (add-up) — so Mon/Wed/Fri is built by tapping each, not pruning from all 7.
    function isoWeekdayOf(date: string): IsoDayNumber {
        const js = parseISO(date).getDay();
        return (js === 0 ? 7 : js) as IsoDayNumber;
    }

    function handleStartScheduling(date: string, time: string) {
        const active = scheduling.state;
        if (active && active.kind === SchedulingKind.Recurring) {
            const weekday = isoWeekdayOf(date);
            if (!active.daysOfWeek.includes(weekday)) {
                scheduling.setDaysOfWeek(
                    [...active.daysOfWeek, weekday].sort((a, b) => a - b),
                );
            }
            return;
        }

        scheduling.start({
            kind: SchedulingKind.Recurring,
            daysOfWeek: [isoWeekdayOf(date)],
            time,
            anchorDate: date,
            endDate: null, // ongoing by default — adjust the horizon in the moment editor
            name: '',
            icon: null,
        });
    }

    const schedulingState = scheduling.state;

    // Rolling 7-day window anchored on weekStart (today by default) — page by a
    // full week each click, not snapped to calendar-week boundaries.
    const currentWeekStart = parseISO(weekStart);
    const prevWeekStart = subDays(currentWeekStart, 7);
    const nextWeekStart = addDays(currentWeekStart, 7);

    function weekLabel(start: Date): string {
        return `${format(start, 'd MMM')} – ${format(addDays(start, 6), 'd MMM')}`;
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
                        {scheduling.mode === 'configure' && (
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
                        onGhostExclude={scheduling.excludeDay}
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
