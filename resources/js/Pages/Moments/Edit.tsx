import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import FlashMessage from '@/shared/components/FlashMessage';
import { MomentModal } from '@/features/moments';
import type { Moment, MomentFormData } from '@/features/moments';
import { useMomentForm } from '@/features/moments';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    moment: Moment;
}

export default function Edit({ moment }: Props) {
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    function handleSubmit(_data: MomentFormData, form: ReturnType<typeof useMomentForm>) {
        form.put(route('moments.update', moment.id), {
            onError: () => { },
        });
    }

    function handleDelete() {
        router.delete(route('moments.destroy', moment.id), {
            onFinish: () => setConfirmingDelete(false),
        });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">Edit Moment</h2>
                    <DangerButton
                        type="button"
                        onClick={() => setConfirmingDelete(true)}
                        className="text-sm"
                    >
                        Delete
                    </DangerButton>
                </div>
            }
        >
            <Head title={`Edit: ${moment.name}`} />
            <FlashMessage />

            <MomentModal
                show={true}
                onClose={() => router.visit(route('daily'))}
                moment={moment}
                onSubmit={handleSubmit}
            />

            <Modal show={confirmingDelete} onClose={() => setConfirmingDelete(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900">Delete "{moment.name}"?</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        This will archive the moment and all its history. This action cannot be undone.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setConfirmingDelete(false)}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={handleDelete}>Delete Moment</DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
