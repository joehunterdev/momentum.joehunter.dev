import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FlashMessage from '@/shared/components/FlashMessage';
import { MomentModal } from '@/features/moments';
import type { MomentFormData } from '@/features/moments';
import { useMomentForm } from '@/features/moments';
import { Head, router } from '@inertiajs/react';
import type { PageProps } from '@/types';

export default function Create(_props: PageProps) {
    function handleSubmit(_data: MomentFormData, form: ReturnType<typeof useMomentForm>) {
        form.post(route('moments.store'), {
            onError: () => { },
        });
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">New Moment</h2>
            }
        >
            <Head title="New Moment" />
            <FlashMessage />

            <MomentModal
                show={true}
                onClose={() => router.visit(route('daily'))}
                onSubmit={handleSubmit}
                submitLabel="Create Moment"
            />
        </AuthenticatedLayout>
    );
}
