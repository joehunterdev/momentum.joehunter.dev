import Modal from '@/Components/Modal';
import type { Moment, MomentFormData } from '../types';
import { useMomentForm } from '../hooks/useMomentForm';
import MomentForm from './MomentForm';

interface MomentModalProps {
    show: boolean;
    onClose: () => void;
    moment?: Moment;
    onSubmit: (data: MomentFormData, form: ReturnType<typeof useMomentForm>) => void;
    submitLabel?: string;
}

export default function MomentModal({
    show,
    onClose,
    moment,
    onSubmit,
    submitLabel,
}: MomentModalProps) {
    const title = moment ? 'Edit Moment' : 'New Moment';

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="moment-modal">
                <div className="moment-modal__header">
                    <h2 className="moment-modal__title">{title}</h2>
                    <button
                        type="button"
                        className="moment-modal__close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <div className="moment-modal__body">
                    <MomentForm
                        moment={moment}
                        onSubmit={onSubmit}
                        submitLabel={submitLabel ?? (moment ? 'Save Changes' : 'Create Moment')}
                        onCancel={onClose}
                    />
                </div>
            </div>
        </Modal>
    );
}
