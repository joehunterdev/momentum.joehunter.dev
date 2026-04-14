import { useState } from 'react';
import Modal from '@/Components/Modal';
import type { Moment, MomentFormData } from '../types';
import { useMomentForm } from '../hooks/useMomentForm';
import MomentForm from './MomentForm';

interface MomentModalProps {
    show: boolean;
    onClose: () => void;
    moment?: Moment;
    defaultValues?: Partial<MomentFormData>;
    onSubmit: (data: MomentFormData, form: ReturnType<typeof useMomentForm>) => void;
    onDelete?: (moment: Moment) => void;
    submitLabel?: string;
}

export default function MomentModal({
    show,
    onClose,
    moment,
    defaultValues,
    onSubmit,
    onDelete,
    submitLabel,
}: MomentModalProps) {
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const title = moment ? 'Edit Moment' : 'New Moment';

    function handleClose() {
        setConfirmingDelete(false);
        onClose();
    }

    return (
        <Modal show={show} onClose={handleClose} maxWidth="2xl">
            <div className="moment-modal">
                <div className="moment-modal__header">
                    <h2 className="moment-modal__title">{title}</h2>
                    <div className="moment-modal__header-actions">
                        {moment && onDelete && !confirmingDelete && (
                            <button
                                type="button"
                                className="moment-modal__delete-link"
                                onClick={() => setConfirmingDelete(true)}
                            >
                                Delete
                            </button>
                        )}
                        <button
                            type="button"
                            className="moment-modal__close"
                            onClick={handleClose}
                            aria-label="Close"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {confirmingDelete ? (
                    <div className="moment-modal__body moment-modal__confirm-delete">
                        <p className="moment-modal__confirm-title">Delete "{moment?.name}"?</p>
                        <p className="moment-modal__confirm-body">
                            Past completions are kept. Future scheduled occurrences will be removed.
                        </p>
                        <div className="moment-modal__confirm-actions">
                            <button
                                type="button"
                                className="moment-modal__confirm-cancel"
                                onClick={() => setConfirmingDelete(false)}
                            >
                                Keep it
                            </button>
                            <button
                                type="button"
                                className="moment-modal__confirm-destroy"
                                onClick={() => { setConfirmingDelete(false); onDelete!(moment!); }}
                            >
                                Yes, delete
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="moment-modal__body">
                        <MomentForm
                            moment={moment}
                            defaultValues={defaultValues}
                            onSubmit={onSubmit}
                            submitLabel={submitLabel ?? (moment ? 'Save Changes' : 'Create Moment')}
                            onCancel={handleClose}
                        />
                    </div>
                )}
            </div>
        </Modal>
    );
}
