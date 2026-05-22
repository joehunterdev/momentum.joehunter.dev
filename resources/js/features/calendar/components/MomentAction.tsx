import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { router } from '@inertiajs/react';
import type { CalendarMoment } from '@/shared/components/calendar/types';
import MomentIcon from '@/shared/components/calendar/MomentIcon';
import { MOMENT_ICONS } from '@/shared/constants/icons';
import { MomentStatus } from '@/shared/types/enums';
import {
    consistencyBand,
    useMomentComplete,
    useMomentCompletionFriction,
    useMomentDescriptionMarquee,
} from '@/features/quick-action';

export type MomentActionVariant = 'read' | 'edit' | 'draft';

interface Props {
    moment: CalendarMoment;
    variant?: MomentActionVariant;
    /** Override fill (0–100). Read variant only; defaults to `moment.progress ?? 0`. */
    progress?: number;
    /** Draft variant only. */
    onDraftNameChange?: (name: string) => void;
    onDraftIconChange?: (icon: string | null) => void;
    /** Draft variant: this is the source slot — owns the action buttons. */
    isSource?: boolean;
    /** Draft+source: show ☑ Apply All button (recurring schedules). */
    canApplyAll?: boolean;
    /** Draft+source: ✓ Apply commits source slot as one-off. */
    onDraftApply?: () => void;
    /** Draft+source: ☑ Apply All commits source + all matching ghosts. */
    onDraftApplyAll?: () => void;
    /** Draft+source: ✕ discards the in-progress scheduling. */
    onDraftCancel?: () => void;
    /** Draft+ghost: ✕ excludes this day from the recurrence. */
    onGhostExclude?: () => void;
    /** Draft+source: human-readable summary of what Apply All will commit. */
    recurrenceLabel?: string | null;
    /** Read variant: ISO date the row targets (enables swipe-to-complete). */
    date?: string;
    /** Read variant: time slot (forwarded to the toggle endpoint). */
    time?: string;
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
    isSource = false,
    canApplyAll = false,
    onDraftApply,
    onDraftApplyAll,
    onDraftCancel,
    onGhostExclude,
    recurrenceLabel,
    date,
    time,
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

    // ── Read-variant hooks (must be unconditional — no early returns above) ─
    const rowRef = useRef<HTMLDivElement>(null);
    const descRef = useRef<HTMLSpanElement>(null);
    const descTrackRef = useRef<HTMLSpanElement>(null);

    const isCompleted = moment.status === MomentStatus.Completed;
    const friction = useMomentCompletionFriction(moment.consistency);
    const { dragProgress, holdProgress, isCommitting, onActivate, bindHandlers } = useMomentComplete({
        momentId: moment.id,
        date: date ?? '',
        time,
        isCompleted: isCompleted || !date,
        rowRef,
        requiredHoldMs: friction.requiredHoldMs,
    });

    const { isOverflowing: descOverflowing, overflowPx: descOverflowPx } =
        useMomentDescriptionMarquee(descRef, descTrackRef, !!moment.description, moment.description);

    // ── Draft variant ───────────────────────────────────────────────────────
    if (variant === 'draft') {
        const draftValue = name === 'New Moment' ? '' : (moment.name ?? '');
        const canCommit = draftValue.trim().length > 0;

        // Non-source matching slot — read-only mirror of the source row,
        // with an X button to drop this day from the recurrence.
        if (!isSource) {
            return (
                <div className={`${cls} moment-action--draft-ghost`}>
                    <span className="moment-action__icon">{moment.icon ?? '📈'}</span>
                    <div className="moment-action__body">
                        <span className="moment-action__name">{draftValue || 'New moment'}</span>
                    </div>
                    {onGhostExclude && (
                        <button
                            type="button"
                            className="moment-action__draft-btn moment-action__draft-btn--exclude"
                            title="Don't recur on this day"
                            aria-label="Exclude this day"
                            onClick={onGhostExclude}
                        >
                            ✕
                        </button>
                    )}
                </div>
            );
        }

        return (
            <div className={`${cls} moment-action--draft-source`}>
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
                        value={draftValue}
                        maxLength={60}
                        autoFocus
                        onChange={(e) => onDraftNameChange?.(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && canCommit) {
                                e.preventDefault();
                                (canApplyAll ? onDraftApplyAll : onDraftApply)?.();
                            } else if (e.key === 'Escape') {
                                e.preventDefault();
                                onDraftCancel?.();
                            }
                        }}
                    />
                    {recurrenceLabel && (
                        <span className="moment-action__recurrence-pill" title="What Apply All will commit">
                            {recurrenceLabel}
                        </span>
                    )}
                </div>

                <div className="moment-action__draft-actions">
                    <button
                        type="button"
                        className="moment-action__draft-btn moment-action__draft-btn--cancel"
                        title="Cancel"
                        aria-label="Cancel"
                        onClick={onDraftCancel}
                    >
                        ✕
                    </button>
                    <button
                        type="button"
                        className="moment-action__draft-btn moment-action__draft-btn--apply"
                        title={canApplyAll ? 'Apply to this slot only' : 'Apply'}
                        aria-label="Apply"
                        disabled={!canCommit}
                        onClick={onDraftApply}
                    >
                        ✓
                    </button>
                    {canApplyAll && (
                        <button
                            type="button"
                            className="moment-action__draft-btn moment-action__draft-btn--apply-all"
                            title="Apply to all matching days"
                            aria-label="Apply to all"
                            disabled={!canCommit}
                            onClick={onDraftApplyAll}
                        >
                            ☑
                        </button>
                    )}
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
    const band = consistencyBand(moment.consistency);
    const readCls = [
        cls,
        band && `moment-action--consistency-${band}`,
        friction.frictionLevel !== 'none' && `moment-action--friction-${friction.frictionLevel}`,
        isCompleted && 'moment-action--completed',
        isCompleted && 'moment-action--swipe-left',
        !isCompleted && 'moment-action--swipe-right',
        isCommitting && 'moment-action--committing',
    ].filter(Boolean).join(' ');

    const descClassName = `moment-action__desc${descOverflowing ? ' moment-action__desc--marquee' : ''}`;
    // Effective travel speed ~40 px/s with a small pause baked in at each end.
    const marqueeDurationSec = descOverflowPx > 0 ? (descOverflowPx / 40) + 2 : 0;
    const descStyle: React.CSSProperties | undefined = descOverflowing
        ? ({
            '--marquee-distance': `${descOverflowPx}px`,
            '--marquee-duration': `${marqueeDurationSec}s`,
        } as React.CSSProperties)
        : undefined;

    // Icon travels the full row width minus its own size (~2rem = 32px) + gap.
    // rowRef.current is valid by the time dragProgress > 0 (component is mounted).
    const maxTravel = Math.max(0, (rowRef.current?.clientWidth ?? 320) - 40);
    const iconTranslateX = isCompleted
        ? `translateX(${dragProgress * -maxTravel}px)`
        : `translateX(${dragProgress * maxTravel}px)`;
    const iconTransition = dragProgress === 0 ? 'transform 0.3s ease' : 'none';

    // Body fades out as the icon starts sliding, giving it clear runway.
    const bodyOpacity = Math.max(0, 1 - dragProgress * 3);

    // Consistency donut — SVG arc around the icon.
    // Completed moments show a full teal ring; others show consistency %.
    const donutR = 18;  // radius — icon is 32px so donut sits just outside
    const donutCirc = 2 * Math.PI * donutR;
    const donutPct = isCompleted ? 1 : Math.max(0, Math.min(1, (moment.consistency ?? 0) / 100));
    const donutDash = donutPct * donutCirc;
    const donutColor = isCompleted
        ? 'rgba(0,200,150,0.85)'
        : donutPct >= 0.85 ? 'rgba(0,200,150,0.7)'
            : donutPct >= 0.60 ? 'rgba(132,204,22,0.65)'
                : donutPct >= 0.30 ? 'rgba(245,158,11,0.65)'
                    : 'rgba(239,68,68,0.55)';

    return (
        <div
            ref={rowRef}
            className={readCls}
            style={{ '--hold-progress': holdProgress } as React.CSSProperties}
        >
            <span
                className="moment-action__icon"
                style={{
                    touchAction: 'pan-y',
                    cursor: isCommitting ? 'wait' : 'pointer',
                    transform: iconTranslateX,
                    transition: iconTransition,
                    willChange: dragProgress > 0 ? 'transform' : 'auto',
                    zIndex: dragProgress > 0 ? 10 : undefined,
                    overflow: 'visible',
                }}
                role="button"
                tabIndex={0}
                aria-label={friction.label || (isCompleted ? 'Mark as incomplete' : 'Mark as complete')}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onActivate();
                    }
                }}
                {...bindHandlers}
            >
                {moment.icon ?? '📌'}
                {/* Consistency donut — always visible, full ring on completion */}
                <svg
                    className="moment-action__donut"
                    viewBox="0 0 44 44"
                    aria-hidden
                >
                    {/* Track */}
                    <circle
                        cx="22" cy="22" r={donutR}
                        fill="none"
                        stroke="rgba(0,0,0,0.08)"
                        strokeWidth="2.5"
                    />
                    {/* Fill */}
                    {donutPct > 0 && (
                        <circle
                            cx="22" cy="22" r={donutR}
                            fill="none"
                            stroke={donutColor}
                            strokeWidth="2.5"
                            strokeDasharray={`${donutDash} ${donutCirc}`}
                            strokeLinecap="round"
                            transform="rotate(-90 22 22)"
                            style={{ transition: 'stroke-dasharray 0.4s ease, stroke 0.3s ease' }}
                        />
                    )}
                </svg>
            </span>
            <div
                className="moment-action__body"
                style={{ opacity: bodyOpacity, transition: bodyOpacity === 1 ? 'opacity 0.2s ease' : 'none' }}
            >
                <span className="moment-action__name">{name}</span>
                {moment.description && (
                    <span ref={descRef} className={descClassName} style={descStyle}>
                        <span ref={descTrackRef} className="moment-action__desc-track">
                            {moment.description}
                        </span>
                    </span>
                )}
            </div>
        </div>
    );
}
