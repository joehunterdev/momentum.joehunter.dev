import { useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import type { SlotMoment } from '../types';
import SlotMomentIcon from './SlotMomentIcon';
import { MOMENT_ICONS } from '@/shared/constants/icons';

type Variant = 'overview' | 'configure' | 'ghost';

interface Props {
    moment: SlotMoment;
    variant?: Variant;
    onGhostNameChange?: (name: string) => void;
    onGhostIconChange?: (icon: string | null) => void;
}

export default function SlotMomentCard({
    moment,
    variant = 'configure',
    onGhostNameChange,
    onGhostIconChange,
}: Props) {
    const [pickerOpen, setPickerOpen] = useState(false);
    const iconBtnRef = useRef<HTMLButtonElement>(null);

    const cardCls = [
        'slot-moment-card',
        variant === 'ghost' ? 'slot-moment-card--ghost' : '',
    ]
        .filter(Boolean)
        .join(' ');

    // ── Ghost variant ─────────────────────────────────────────────────────────
    if (variant === 'ghost') {
        return (
            <div className="slot-moment-card slot-moment-card--ghost-edit">
                <div className="slot-moment-card__row">
                    {/* Icon picker trigger */}
                    <div className="ghost-icon-wrap">
                        <button
                            ref={iconBtnRef}
                            type="button"
                            className="slot-icon slot-icon--future slot-icon--ghost-placeholder ghost-icon-trigger"
                            title="Pick an icon"
                            onClick={(e) => { e.stopPropagation(); setPickerOpen((v) => !v); }}
                        >
                            {moment.icon ?? '+'}
                        </button>

                        {pickerOpen && (
                            <div className="ghost-icon-picker" role="dialog" aria-label="Pick an icon">
                                <div className="ghost-icon-picker__grid">
                                    {MOMENT_ICONS.map((opt) => (
                                        <button
                                            key={opt.name}
                                            type="button"
                                            className={[
                                                'ghost-icon-picker__item',
                                                moment.icon === opt.emoji ? 'ghost-icon-picker__item--active' : '',
                                            ].filter(Boolean).join(' ')}
                                            title={opt.name}
                                            onClick={() => {
                                                onGhostIconChange?.(opt.emoji);
                                                setPickerOpen(false);
                                            }}
                                        >
                                            {opt.emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Inline name input */}
                    <div className="slot-moment-card__body">
                        <input
                            type="text"
                            className="ghost-name-input"
                            placeholder="Name this moment…"
                            value={moment.name === 'New Moment' ? '' : (moment.name ?? '')}
                            maxLength={60}
                            onChange={(e) => onGhostNameChange?.(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // ── Overview + Configure ──────────────────────────────────────────────────
    const name = moment.name ?? 'Untitled Moment';

    return (
        <div className={cardCls}>
            <div className="slot-moment-card__row">
                <SlotMomentIcon
                    moment={moment}
                    date=""
                    onToggle={() => { }}
                    isStatic
                />
                <div className="slot-moment-card__body">
                    <span className="slot-moment-card__name">{name}</span>
                    {moment.description && (
                        <span className="slot-moment-card__desc">
                            {moment.description}
                        </span>
                    )}
                </div>
                <button
                    type="button"
                    className="slot-moment-card__edit-btn"
                    title={`Edit ${name}`}
                    onClick={() => router.get(route('moments.edit', { moment: moment.id }))}
                    aria-label={`Edit ${name}`}
                >
                    ✏️
                </button>
            </div>
        </div>
    );
}
