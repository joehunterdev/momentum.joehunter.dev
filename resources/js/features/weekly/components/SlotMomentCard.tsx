import { router } from '@inertiajs/react';
import type { SlotMoment } from '../types';

interface Props {
    moment: SlotMoment;
}

const STATUS_DOT: Record<string, string> = {
    completed: 'slot-moment-card__status--completed',
    missed: 'slot-moment-card__status--missed',
    pending: 'slot-moment-card__status--pending',
};

export default function SlotMomentCard({ moment }: Props) {
    return (
        <div className="slot-moment-card">
            <div className="slot-moment-card__row">
                <span
                    className={[
                        'slot-moment-card__status',
                        moment.status ? (STATUS_DOT[moment.status] ?? '') : 'slot-moment-card__status--future',
                    ].join(' ')}
                    aria-hidden
                />
                <div className="slot-moment-card__body">
                    <span className="slot-moment-card__name">{moment.name}</span>
                    {moment.description && (
                        <span className="slot-moment-card__desc">
                            {moment.description}
                        </span>
                    )}
                </div>
                <button
                    type="button"
                    className="slot-moment-card__edit-btn"
                    title={`Edit ${moment.name}`}
                    onClick={() =>
                        router.get(route('moments.edit', { moment: moment.id }))
                    }
                    aria-label={`Edit ${moment.name}`}
                >
                    ✏️
                </button>
            </div>
        </div>
    );
}
