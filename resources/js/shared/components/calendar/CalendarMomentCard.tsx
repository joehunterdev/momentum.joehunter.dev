import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { router } from '@inertiajs/react';
import type { CalendarMoment } from './types';
import MomentIcon from './MomentIcon';
import { MOMENT_ICONS } from '@/shared/constants/icons';

export type CalendarMomentCardVariant = 'read' | 'edit' | 'draft';

interface Props {
    moment: CalendarMoment;
    variant?: CalendarMomentCardVariant;
    onDraftNameChange?: (name: string) => void;
    onDraftIconChange?: (icon: string | null) => void;
}

export default function CalendarMomentCard({
    moment,
    variant = 'edit',
    onDraftNameChange,
    onDraftIconChange,
}: Props) {
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerStyle, setPickerStyle] = useState<React.CSSProperties>({});
    const iconBtnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!pickerOpen || !iconBtnRef.current) { return; }
        const rect = iconBtnRef.current.getBoundingClientRect();
        const pickerWidth = 224; // 14rem at 16px
        const spaceBelow = window.innerHeight - rect.bottom;
        const top = spaceBelow >= 260 ? rect.bottom + 6 : rect.top - 266;
        let left = rect.left;
        if (left + pickerWidth > window.innerWidth - 8) {
            left = window.innerWidth - pickerWidth - 8;
        }
        setPickerStyle({ position: 'fixed', top, left, width: pickerWidth, zIndex: 9999 });
    }, [pickerOpen]);

    useEffect(() => {
        if (!pickerOpen) { return; }
        const close = (e: MouseEvent) => {
            if (iconBtnRef.current && !iconBtnRef.current.contains(e.target as Node)) {
                setPickerOpen(false);
            }
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [pickerOpen]);

    const cardCls = [
        'moment-card',
        variant === 'draft' ? 'moment-card--draft' : '',
    ]
        .filter(Boolean)
        .join(' ');

    // ── Draft variant ────────────────────────────────────────────────────────
    if (variant === 'draft') {
        return (
            <div className="moment-card moment-card--draft-edit">
                <div className="moment-card__row">
                    {/* Icon picker trigger */}
                    <div className="draft-icon-wrap">
                        <button
                            ref={iconBtnRef}
                            type="button"
                            className="slot-icon slot-icon--future slot-icon--draft-placeholder draft-icon-trigger"
                            title="Pick an icon"
                            onClick={(e) => { e.stopPropagation(); setPickerOpen((v) => !v); }}
                        >
                            {moment.icon ?? '📈'}
                        </button>

                        {pickerOpen && createPortal(
                            <div className="draft-icon-picker" style={pickerStyle} role="dialog" aria-label="Pick an icon">
                                <div className="draft-icon-picker__grid">
                                    {MOMENT_ICONS.map((opt) => (
                                        <button
                                            key={opt.name}
                                            type="button"
                                            className={[
                                                'draft-icon-picker__item',
                                                moment.icon === opt.emoji ? 'draft-icon-picker__item--active' : '',
                                            ].filter(Boolean).join(' ')}
                                            title={opt.name}
                                            onClick={() => {
                                                onDraftIconChange?.(opt.emoji);
                                                setPickerOpen(false);
                                            }}
                                        >
                                            {opt.emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>,
                            document.body,
                        )}
                    </div>

                    {/* Inline name input */}
                    <div className="moment-card__body">
                        <input
                            type="text"
                            className="draft-name-input"
                            placeholder="Name this moment…"
                            value={moment.name === 'New Moment' ? '' : (moment.name ?? '')}
                            maxLength={60}
                            onChange={(e) => onDraftNameChange?.(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // ── Read + Edit ───────────────────────────────────────────────────────────
    const name = moment.name ?? 'Untitled Moment';

    return (
        <div className={cardCls}>
            <div className="moment-card__row">
                <MomentIcon
                    moment={moment}
                    date=""
                    onToggle={() => { }}
                    isStatic
                />
                <div className="moment-card__body">
                    <span className="moment-card__name">{name}</span>
                    {moment.description && (
                        <span className="moment-card__desc">
                            {moment.description}
                        </span>
                    )}
                </div>
                <button
                    type="button"
                    className="moment-card__edit-btn"
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
