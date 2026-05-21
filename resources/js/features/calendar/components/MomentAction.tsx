import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { router } from '@inertiajs/react';
import type { CalendarMoment } from '@/shared/components/calendar/types';
import MomentIcon from '@/shared/components/calendar/MomentIcon';
import { MOMENT_ICONS } from '@/shared/constants/icons';

export type MomentActionVariant = 'read' | 'edit' | 'draft';

interface Props {
    moment: CalendarMoment;
    variant?: MomentActionVariant;
    /** Override fill (0–100). Read variant only; defaults to `moment.progress ?? 0`. */
    progress?: number;
    /** Draft variant only. */
    onDraftNameChange?: (name: string) => void;
    onDraftIconChange?: (icon: string | null) => void;
}

/**
 * Canonical row for a moment inside a `.calendar-article`. One BEM block
 * (.moment-action) with three variants:
 *
 *   - read   overview mode: progress wash background, swipe target.
 *   - edit   configure mode: edit pencil, taps through to MomentEdit page.
 *   - draft  configure mode while scheduling a new moment: icon picker
 *            trigger + name input, dashed primary border.
 */
export default function MomentAction({
    moment,
    variant = 'read',
    progress,
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

    const cls = `moment-action moment-action--${variant}`;
    const name = moment.name ?? 'Untitled Moment';

    // ── Draft variant ───────────────────────────────────────────────────────
    if (variant === 'draft') {
        return (
            <div className={cls}>
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

                <div className="moment-action__body">
                    <input
                        type="text"
                        className="draft-name-input"
                        placeholder="Name this moment…"
                        value={name === 'New Moment' ? '' : (moment.name ?? '')}
                        maxLength={60}
                        onChange={(e) => onDraftNameChange?.(e.target.value)}
                    />
                </div>
            </div>
        );
    }

    // ── Edit variant ────────────────────────────────────────────────────────
    if (variant === 'edit') {
        return (
            <div className={cls}>
                <MomentIcon
                    moment={moment}
                    date=""
                    onToggle={() => { }}
                    isStatic
                />
                <div className="moment-action__body">
                    <span className="moment-action__name">{name}</span>
                    {moment.description && (
                        <span className="moment-action__desc">{moment.description}</span>
                    )}
                </div>
                <button
                    type="button"
                    className="moment-action__edit-btn"
                    title={`Edit ${name}`}
                    onClick={() => router.get(route('moments.edit', { moment: moment.id }))}
                    aria-label={`Edit ${name}`}
                >
                    ✏️
                </button>
            </div>
        );
    }

    // ── Read variant (default) ──────────────────────────────────────────────
    // const pct = Math.max(0, Math.min(100, progress ?? moment.progress ?? 0));

    return (
        <div
            className={cls}
        // style={{ '--moment-progress': `${pct}%` } as React.CSSProperties}
        >
            {/* <span className="moment-action__progress-bg" aria-hidden /> */}
            <span className="moment-action__icon">{moment.icon ?? '📌'}</span>
            <div className="moment-action__body">
                <span className="moment-action__name">{name}</span>
                {moment.description && (
                    <span className="moment-action__desc">{moment.description}</span>
                )}
            </div>
        </div>
    );
}
