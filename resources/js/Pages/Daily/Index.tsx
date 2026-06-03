import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DailyContainer } from '@/features/calendar';
import { Head, router } from '@inertiajs/react';
import Icon from '@/shared/components/Icon';
import {
    CalendarNav,
    CalendarProgressBar,
} from '@/shared/components/calendar';
import { addDays, format, parseISO, subDays } from 'date-fns';
import type { PageProps } from '@/types';
import { useScheduling } from '@/features/scheduling';
import { SchedulingKind } from '@/shared/types/enums';

interface Props extends PageProps, App.Data.DailyPageData { }

export default function Index({ from, whole, days, config, completedCount, totalCount }: Props) {
    const scheduling = useScheduling({ redirectTo: route('daily', { from, ...(whole ? { whole: 1 } : {}) }) });

    // Daily shows a rolling 24h window — no surface to preview a repeat — so a
    // tap creates a one-off for the tapped slot's day. (Recurring habits are
    // built in the weekly/monthly views where the ghosts can show the pattern.)
    function handleStartScheduling(targetDate: string, time: string) {
        scheduling.start({
            kind: SchedulingKind.OneOff,
            date: targetDate,
            time,
            name: '',
            icon: null,
        });
    }

    // Page by a full day each click (both modes shift the anchor ±1 day).
    const windowStart = parseISO(from);
    const prevStart = subDays(windowStart, 1);
    const nextStart = addDays(windowStart, 1);
    const fromParam = (d: Date) => format(d, "yyyy-MM-dd'T'HH:mm");
    const dayParam = (d: Date): Record<string, string> =>
        ({ from: fromParam(d), ...(whole ? { whole: '1' } : {}) });

    // "Now / Today" toggle: rolling 24h-from-now ⇄ whole anchored day. Going to
    // "Now" resets to today; going to "Today" expands the current anchor's day.
    function toggleWhole() {
        router.get(route('daily'), whole ? {} : { from, whole: 1 }, { preserveScroll: false });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="calendar-page-header">
                    <div className="calendar-page-header__row">
                        <CalendarNav
                            prevLabel={format(prevStart, 'EEE d MMM')}
                            currentLabel={whole
                                ? format(windowStart, 'EEE d MMM')
                                : format(windowStart, 'EEE d MMM, HH:mm')}
                            nextLabel={format(nextStart, 'EEE d MMM')}
                            prevParam={dayParam(prevStart)}
                            nextParam={dayParam(nextStart)}
                            routeName="daily"
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
            <Head title="Daily" />

            <div className="py-0 sm:py-6">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <DailyContainer
                        days={days}
                        config={config}
                        mode={scheduling.mode}
                        scheduling={scheduling.state}
                        whole={whole}
                        onToggleWhole={toggleWhole}
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
        </AuthenticatedLayout>
    );
}
