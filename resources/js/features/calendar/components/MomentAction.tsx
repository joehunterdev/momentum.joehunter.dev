import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { router } from '@inertiajs/react';
import Icon from '@/shared/components/Icon';
import MomentIconPicker from '@/features/moments/components/MomentIconPicker';
import type { CalendarMoment } from '@/shared/components/calendar/types';
import MomentIcon from '@/shared/components/calendar/MomentIcon';
import MomentProgressBar from '@/shared/components/calendar/MomentProgressBar';
import Ticker from '@/shared/components/Ticker';
import MomentActionIcon from './MomentActionIcon';
import { MomentStatus } from '@/shared/types/enums';
import {
    consistencyBand,
    useMomentComplete,
    useMomentCompletionFriction,
    useMomentDescriptionMarquee,
    useMomentDetailCycle,
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
    /** Read variant: this is the single "next up" action — auto-cycle its detail line. */
    isNext?: boolean;
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
    isNext = false,
}: Props) {
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerStyle, setPickerStyle] = useState<React.CSSProperties>({});
    const iconBtnRef = useRef<HTMLButtonElement>(null);
    const pickerPanelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!pickerOpen || !iconBtnRef.current) { return; }
        const rect = iconBtnRef.current.getBoundingClientRect();
        // Span the full slot row so the picker reads as belonging to this row
        // rather than a narrow popover hanging off the icon.
        const row = iconBtnRef.current.closest('.calendar-article');
        const rowRect = (row ?? iconBtnRef.current).getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const top = spaceBelow >= 260 ? rect.bottom + 6 : rect.top - 266;
        setPickerStyle({
            position: 'fixed',
            top,
            left: rowRect.left,
            width: rowRect.width,
            zIndex: 9999,
        });
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

    // Rotating detail line: description (home) then each populated behavioural
    // field. Only the single "next up" row auto-cycles; any row can be tapped.
    const detailItems = [
        moment.description,
        moment.implementation_intention,
        moment.habit_stack_after,
        moment.environment_prompt,
    ].filter((v): v is string => !!v && v.trim().length > 0);
    const { text: detailText, visible: detailVisible, advance: advanceDetail, canCycle } =
        useMomentDetailCycle({ items: detailItems, auto: variant === 'read' && isNext });

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
                        {moment.icon ? <Icon name={moment.icon} /> : <img src="/logo.png" alt="" className="moment-action__icon-img" />}
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
                            <Icon name="close" size={16} aria-hidden />
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
                        {moment.icon
                            ? <Icon name={moment.icon} />
                            : <Icon name="add_reaction" size={20} aria-hidden />}
                    </button>

                    {pickerOpen && createPortal(
                        <div ref={pickerPanelRef} className="draft-icon-picker" style={pickerStyle} role="dialog" aria-label="Pick an icon">
                            <MomentIconPicker
                                embedded
                                value={moment.icon ?? ''}
                                onChange={(emoji) => {
                                    onDraftIconChange?.(emoji);
                                    setPickerOpen(false);
                                }}
                            />
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
                        <Icon name="close" size={18} aria-hidden />
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
                        <Icon name="check" size={18} aria-hidden />
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
                    <Icon name="edit" size={18} aria-hidden />
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
    // Cap travel so the icon stops ~48px from the right edge (thumb room).
    const RIGHT_MARGIN = 48;
    const maxTravel = Math.max(0, (rowRef.current?.clientWidth ?? 320) - 40 - RIGHT_MARGIN);
    const iconTranslateX = isCompleted
        ? `translateX(${dragProgress * -maxTravel}px)`
        : `translateX(${dragProgress * maxTravel}px)`;
    const iconTransition = dragProgress === 0 ? 'transform 0.3s ease' : 'none';

    // Body fades out as the icon starts sliding, giving it clear runway.
    const bodyOpacity = Math.max(0, 1 - dragProgress * 3);

    const hasFriction = friction.requiredHoldMs > 0;
    const arcPerimeter = 4 * 38;
    // No friction → fill tracks drag position directly.
    // Friction     → empty during drag; the moment the wall is hit, target jumps to 1
    //                and the CSS transition runs uninterrupted for exactly requiredHoldMs.
    //                Using holdProgress here would reset the transition every rAF tick.
    const normDrag = Math.min(1, dragProgress / 0.85);
    const atWall = dragProgress >= 0.85;
    const arcProgress = hasFriction ? (atWall ? 1 : 0) : normDrag;
    const arcOffset = arcPerimeter * (1 - arcProgress);
    // Colour by friction level so the border signals urgency.
    const arcColor = friction.frictionLevel === 'low'
        ? '#ef4444'
        : friction.frictionLevel === 'mid'
            ? '#f59e0b'
            : (moment.color ?? 'var(--mm-progress-complete, #00E5AA)');

    return (
        <div
            ref={rowRef}
            className={readCls}
            style={{ '--hold-progress': holdProgress } as React.CSSProperties}
        >
            <div className="moment-action__row">
                <MomentActionIcon
                    moment={moment}
                    dragProgress={dragProgress}
                    isCommitting={isCommitting}
                    isCompleted={isCompleted}
                    arcColor={arcColor}
                    arcOffset={arcOffset}
                    arcPerimeter={arcPerimeter}
                    hasFriction={hasFriction}
                    requiredHoldMs={friction.requiredHoldMs}
                    frictionLabel={friction.label}
                    bindHandlers={bindHandlers}
                    onActivate={onActivate}
                    translateX={iconTranslateX}
                    transition={iconTransition}
                />
                <div
                    className="moment-action__body"
                    data-cycle={canCycle || undefined}
                    style={{ opacity: bodyOpacity, transition: bodyOpacity === 1 ? 'opacity 0.2s ease' : 'none' }}
                    onClick={canCycle ? advanceDetail : undefined}
                    onKeyDown={canCycle ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advanceDetail(); }
                    } : undefined}
                    role={canCycle ? 'button' : undefined}
                    tabIndex={canCycle ? 0 : undefined}
                    aria-label={canCycle ? 'Show next habit detail' : undefined}
                >
                    <span className="moment-action__name">{name}</span>
                    {canCycle ? (
                        <span className="moment-action__detail" data-visible={detailVisible}>
                            <Ticker text={detailText} />
                        </span>
                    ) : moment.description && (
                        <span ref={descRef} className={descClassName} style={descStyle}>
                            <span ref={descTrackRef} className="moment-action__desc-track">
                                {moment.description}
                            </span>
                        </span>
                    )}
                </div>
                {isCompleted && (
                    <span className="moment-action__tick" aria-hidden>
                        <Icon name="check" size={16} />
                    </span>
                )}
            </div>
            <div className="moment-action__progress">
                <MomentProgressBar consistency={moment.consistency} isCompleted={isCompleted} color={moment.color} previewProgress={Math.max(dragProgress, siblingDragPreview)} />
            </div>
        </div>
    );
}
