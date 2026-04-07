import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import { WeeklyGrid } from '@/features/weekly';
import type { WeeklyPageProps } from '@/features/weekly';
import { MomentModal, useMomentForm } from '@/features/moments';
import type { MomentFormData } from '@/features/moments';
import type { PageProps } from '@/types';

interface Props extends PageProps, WeeklyPageProps { }

export default function Index({ weekStart, weekEnd, config, days }: Props) {
    const startLabel = format(parseISO(weekStart), 'd MMM');
    const endLabel = format(parseISO(weekEnd), 'd MMM yyyy');

    const [showingModal, setShowingModal] = useState(false);

    function handleAddMoment(_date: string, _time: string) {
        setShowingModal(true);
    }

    function handleModalSubmit(_data: MomentFormData, form: ReturnType<typeof useMomentForm>) {
        form.post(route('moments.store'), {
            onSuccess: () => setShowingModal(false),
            onError: () => { },
        });
    }

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
                    <WeeklyGrid days={days} config={config} onAddMoment={handleAddMoment} />
                </div>
            </div>

            <MomentModal
                show={showingModal}
                onClose={() => setShowingModal(false)}
                onSubmit={handleModalSubmit}
            />
        </AuthenticatedLayout>
    );
}
