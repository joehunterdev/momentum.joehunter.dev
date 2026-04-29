import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { CalendarNav } from '@/shared/components/calendar';
import { MonthlyGrid } from '@/features/monthly';
import { addMonths, format, parseISO, subMonths } from 'date-fns';
import type { PageProps } from '@/types';

interface Props extends PageProps, App.Data.MonthlyPageData { }

export default function Index({ monthStart, days }: Props) {
    const current = parseISO(monthStart);
    const prev = subMonths(current, 1);
    const next = addMonths(current, 1);

    function handleDayClick(date: string) {
        router.visit(route('daily', { date }));
    }

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
                </div>
            }
        >
            <Head title="Monthly" />

            <div className="py-0 sm:py-6">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <MonthlyGrid days={days} onDayClick={handleDayClick} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
