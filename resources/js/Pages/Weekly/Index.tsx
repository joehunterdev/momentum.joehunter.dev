import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { WeeklyGrid } from '@/features/weekly';
import type { WeeklyPageProps } from '@/features/weekly';
import type { PageProps } from '@/types';

interface Props extends PageProps, WeeklyPageProps { }

export default function Index({ weekStart, weekEnd, config, days }: Props) {
    const startLabel = format(parseISO(weekStart), 'd MMM');
    const endLabel = format(parseISO(weekEnd), 'd MMM yyyy');

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    {startLabel} – {endLabel}
                </h2>
            }
        >
            <Head title="Weekly" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <WeeklyGrid days={days} config={config} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
