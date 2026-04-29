import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { WeeklyGrid } from '@/features/weekly';
import type { WeeklyPageProps } from '@/features/weekly';
import { CalendarNav } from '@/shared/components/calendar';
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

export default function Index({ weekStart, config, days }: Props) {
    const currentWeekStart = startOfISOWeek(parseISO(weekStart));
    const prevWeekStart = subWeeks(currentWeekStart, 1);
    const nextWeekStart = addWeeks(currentWeekStart, 1);

    function weekLabel(start: Date): string {
        return `${format(start, 'd MMM')} \u2013 ${format(endOfISOWeek(start), 'd MMM')}`;
    }

    function handleAddMoment(date: string, time: string) {
        router.visit(route('moments.create', { preferred_time: time, date }));
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
                </div>
            }
        >
            <Head title="Weekly" />

            <div className="py-0 sm:py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <WeeklyGrid
                        days={days}
                        config={config}
                        onAddMoment={handleAddMoment}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
