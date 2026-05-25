import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { router } from '@inertiajs/react';
import type { CalendarMoment } from '@/shared/components/calendar/types';
import MomentIcon from '@/shared/components/calendar/MomentIcon';
import MomentProgressBar from '@/shared/components/calendar/MomentProgressBar';
import MomentActionBorder from './MomentActionBorder';
import { MOMENT_ICONS } from '@/shared/constants/icons';
import { MomentStatus } from '@/shared/types/enums';
import {
    consistencyBand,
    useMomentComplete,
    useMomentCompletionFriction,
    useMomentDescriptionMarquee,
    useMomentDragPreview,
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
    const pickerPanelRef = useRef<HTMLDivElement>(null);

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
            const target = e.target as Node;
            const insideBtn = iconBtnRef.current?.contains(target);
            const insidePanel = pickerPanelRef.current?.contains(target);
            if (!insideBtn && !insidePanel) {
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
    const siblingDragPreview = useMomentDragPreview(moment.id);
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
                    <span className="moment-action__icon">
                        {moment.icon ?? <img src="/logo.png" alt="" className="moment-action__icon-img" />}
                    </span>
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
                        {moment.icon ?? <img src="/logo.png" alt="" className="moment-action__icon-img" />}
                    </button>

                    {pickerOpen && createPortal(
                        <div ref={pickerPanelRef} className="draft-icon-picker" style={pickerStyle} role="dialog" aria-label="Pick an icon">
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

                <div className="moment-action__body moment-action__body--draft">
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
                    {/* recurrenceLabel — hidden for now
                    {recurrenceLabel && (
                        <span className="moment-action__recurrence-pill" title="What Apply All will commit">
                            {recurrenceLabel}
                        </span>
                    )} */}
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
                        title={canApplyAll ? 'Tap to apply once · Hold to apply to all matching days' : 'Apply'}
                        aria-label={canApplyAll ? 'Apply (hold for all)' : 'Apply'}
                        disabled={!canCommit}
                        onPointerDown={(e) => {
                            if (!canCommit) return;
                            const target = e.currentTarget as HTMLButtonElement;
                            const timer = window.setTimeout(() => {
                                onDraftApplyAll?.();
                            }, 600);
                            const up = () => {
                                clearTimeout(timer);
                                target.removeEventListener('pointerup', up);
                                target.removeEventListener('pointerleave', up);
                            };
                            target.addEventListener('pointerup', up);
                            target.addEventListener('pointerleave', up);
                        }}
                        onClick={() => { if (canCommit) onDraftApply?.(); }}
                    >
                        ✓
                    </button>
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
        isCompleted && 'moment-action--completed',
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

    // Arc animates around the icon ONLY while dragging.
    // Square border fills clockwise via strokeDashoffset on a rect path.
    // Two colours: teal = swiping to complete, gray = swiping to undo.
    //
    // Two modes depending on friction:
    //   No friction  → arc fills as you drag (visual = how far you've pulled)
    //   Friction     → drag gets you to the wall; arc fills over the hold timer
    //                  (hold is the gate, not distance)
    const arcPerimeter = 4 * 38; // rect is 38×38 inside the 44×44 viewBox (3px inset each side)
    const hasFriction = friction.requiredHoldMs > 0;
    const arcProgress = hasFriction
        ? holdProgress                                          // hold timer fills the arc
        : Math.min(1, dragProgress / 0.85);                    // drag fills the arc, full at threshold
    const arcOffset = arcPerimeter * (1 - arcProgress);
    const arcColor = isCompleted ? 'rgba(160,160,160,0.8)' : 'var(--mm-progress-complete, #00E5AA)';

    return (
        <MomentActionBorder
            color={moment.color}
            consistency={moment.consistency}
            dragProgress={dragProgress}
            holdProgress={holdProgress}
            hasFriction={hasFriction}
            isCompleted={isCompleted}
        >
            <div
                ref={rowRef}
                className={readCls}
                style={{ '--hold-progress': holdProgress } as React.CSSProperties}
            >
                <div className="moment-action__row">
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
                        {moment.icon
                            ? moment.icon
                            : <img src="/logo.png" alt="" className="moment-action__icon-img" />
                        }
                        {dragProgress > 0 && (
                            <svg
                                className="moment-action__arc"
                                viewBox="0 0 44 44"
                                aria-hidden
                                style={hasFriction && holdProgress > 0 && holdProgress < 1 ? {
                                    animation: 'moment-arc-spin 0.9s linear infinite',
                                    transformOrigin: '22px 22px',
                                } : undefined}
                            >
                                {/* Track — faint square outline */}
                                <rect x="3" y="3" width="38" height="38"
                                    fill="none"
                                    stroke="rgba(0,0,0,0.08)"
                                    strokeWidth="3"
                                />
                                {/* Fill — clockwise from top-left */}
                                <rect x="3" y="3" width="38" height="38"
                                    fill="none"
                                    stroke={arcColor}
                                    strokeWidth="3"
                                    strokeDasharray={arcPerimeter}
                                    strokeDashoffset={arcOffset}
                                    strokeLinecap="butt"
                                />
                            </svg>
                        )}
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
                    {isCompleted && (
                        <span className="moment-action__tick" aria-hidden>
                            ✓
                        </span>
                    )}
                </div>
                <div className="moment-action__progress">
                    <MomentProgressBar consistency={moment.consistency} isCompleted={isCompleted} color={moment.color} previewProgress={Math.max(dragProgress, siblingDragPreview)} />
                </div>
            </div>
        </MomentActionBorder>
    );
}
