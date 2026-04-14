import { router } from '@inertiajs/react';
import type { SlotMoment } from '../types';

type Variant = 'overview' | 'configure' | 'ghost';

interface Props {
    moment: SlotMoment;
    variant?: Variant;
}

const STATUS_DOT: Record<string, string> = {
    completed: 'slot-moment-card__status--completed',
    missed: 'slot-moment-card__status--missed',
    pending: 'slot-moment-card__status--pending',
};

export default function SlotMomentCard({ moment, variant = 'configure' }: Props) {
    const cardCls = [
        'slot-moment-card',
        variant === 'ghost' ? 'slot-moment-card--ghost' : '',
        variant === 'overview' ? 'slot-moment-card--overview' : '',
    ]
        .filter(Boolean)
        .join(' ');

    if (variant === 'ghost') {
        return (
            <div className={cardCls}>
                <div className="slot-moment-card__row">
                    <span className="slot-moment-card__status" aria-hidden />
                    <div className="slot-moment-card__body">
                        <span className="slot-moment-card__name slot-moment-card__name--ghost">New Moment</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cardCls}>
            <div className="slot-moment-card__row">
                <span
                    className={[
                        'slot-moment-card__status',
                        moment.status ? (STATUS_DOT[moment.status] ?? '') : 'slot-moment-card__status--future',
                    ].join(' ')}
                    aria-hidden
                />
                <div className="slot-moment-card__body">
                    <span className="slot-moment-card__name">{moment.name ?? 'Untitled Moment'}</span>
                    {moment.description && (
                        <span className="slot-moment-card__desc">
                            {moment.description}
                        </span>
                    )}
                </div>
                {variant === 'configure' && (
                    <button
                        type="button"
                        className="slot-moment-card__edit-btn"
                        title={`Edit ${moment.name ?? 'Untitled Moment'}`}
                        onClick={() =>
                            router.get(route('moments.edit', { moment: moment.id }))
                        }
                        aria-label={`Edit ${moment.name ?? 'Untitled Moment'}`}
                    >
                        ✏️
                    </button>
                )}
            </div>
        </div>
    );
}
