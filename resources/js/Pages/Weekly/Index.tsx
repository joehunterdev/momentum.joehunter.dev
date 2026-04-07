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
    const [highlightTime, setHighlightTime] = useState<string | null>(null);
    const [modalDefaults, setModalDefaults] = useState<Partial<MomentFormData> | undefined>();

    function handleAddMoment(_date: string, time: string, mode: 'once' | 'recurring') {
        if (mode === 'recurring') {
            setHighlightTime(time);
            setModalDefaults({ frequency: 'weekly', days_of_week: [1, 2, 3, 4, 5], preferred_time: time });
        } else {
            setModalDefaults({ preferred_time: time });
        }
        setShowingModal(true);
    }

    function handleModalClose() {
        setShowingModal(false);
        setHighlightTime(null);
        setModalDefaults(undefined);
    }

    function handleModalSubmit(_data: MomentFormData, form: ReturnType<typeof useMomentForm>) {
        form.post(route('moments.store'), {
            onSuccess: () => handleModalClose(),
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
                    <WeeklyGrid days={days} config={config} onAddMoment={handleAddMoment} highlightTime={highlightTime ?? undefined} />
                </div>
            </div>

            <MomentModal
                show={showingModal}
                onClose={handleModalClose}
                defaultValues={modalDefaults}
                onSubmit={handleModalSubmit}
            />
        </AuthenticatedLayout>
    );
}
