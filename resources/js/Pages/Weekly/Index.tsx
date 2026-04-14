import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { WeeklyGrid } from '@/features/weekly';
import type { WeeklyPageProps } from '@/features/weekly';
import { MomentModal, useMomentForm } from '@/features/moments';
import type { MomentFormData } from '@/features/moments';
import { DateSelectorBar } from '@/shared/components/calendar';
import type { PageProps } from '@/types';

interface Props extends PageProps, WeeklyPageProps { }

export default function Index({ weekStart, config, days }: Props) {

    const [showingModal, setShowingModal] = useState(false);
    const [modalDefaults, setModalDefaults] = useState<Partial<MomentFormData> | undefined>();

    function handleAddMoment(date: string, time: string, mode: 'once' | 'recurring') {
        if (mode === 'recurring') {
            setModalDefaults({ frequency: 'weekly', days_of_week: [1, 2, 3, 4, 5], preferred_time: time });
        } else {
            const isoDay = new Date(date).getDay() || 7;
            setModalDefaults({ frequency: 'custom', days_of_week: [isoDay], preferred_time: time });
        }
        setShowingModal(true);
    }

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

    return (
        <AuthenticatedLayout
            header={<DateSelectorBar mode="week" weekStart={weekStart} />}
        >
            <Head title="Weekly" />

            <div className="py-0 sm:py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <WeeklyGrid days={days} config={config} onAddMoment={handleAddMoment} />
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
