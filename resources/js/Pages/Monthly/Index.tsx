import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import type { PageProps } from '@/types';

interface Props extends PageProps, App.Data.MonthlyPageData {}

export default function Index({ month, monthStart, monthEnd, days, config }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="Monthly" />

            <div className="py-0 sm:py-6">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <p className="text-center text-gray-400 py-12">
                        Monthly view coming soon — {month}
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
