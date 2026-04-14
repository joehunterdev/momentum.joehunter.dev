import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FlashMessage from '@/shared/components/FlashMessage';
import { MomentModal } from '@/features/moments';
import type { Moment, MomentFormData } from '@/features/moments';
import { useMomentForm } from '@/features/moments';
import { Head, router } from '@inertiajs/react';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    moment: Moment;
}

export default function Edit({ moment }: Props) {
    function handleSubmit(_data: MomentFormData, form: ReturnType<typeof useMomentForm>) {
        form.put(route('moments.update', moment.id), {
            onError: () => { },
        });
    }

    function handleDelete(m: Moment) {
        router.delete(route('moments.destroy', m.id));
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">Edit Moment</h2>
            }
        >
            <Head title={`Edit: ${moment.name}`} />
            <FlashMessage />

            <MomentModal
                show={true}
                onClose={() => router.visit(route('weekly'))}
                moment={moment}
                onSubmit={handleSubmit}
                onDelete={handleDelete}
            />
        </AuthenticatedLayout>
    );
}
