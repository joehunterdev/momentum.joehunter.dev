import Icon from '@/shared/components/Icon';
import type { CalendarMoment } from '@/shared/components/calendar/types';

interface Props {
    moment: CalendarMoment;
    /** 0–1 drag/hold progress; arc only renders when > 0. */
    dragProgress: number;
    /** 0–1 border-fill progress — also drives the icon spin. */
    arcProgress: number;
    isCommitting: boolean;
    isCompleted: boolean;
    arcColor: string;
    arcOffset: number;
    arcPerimeter: number;
    hasFriction: boolean;
    requiredHoldMs: number;
    frictionLabel: string;
    bindHandlers: Record<string, unknown>;
    onActivate: () => void;
    translateX: string;
    transition: string;
}

export default function MomentActionIcon({
    moment,
    dragProgress,
    arcProgress,
    isCommitting,
    isCompleted,
    arcColor,
    arcOffset,
    arcPerimeter,
    hasFriction,
    requiredHoldMs,
    frictionLabel,
    bindHandlers,
    onActivate,
    translateX,
    transition,
}: Props) {
    const isActioning = dragProgress > 0;

    return (
        <span
            style={{
                transform: translateX,
                transition,
                willChange: isActioning ? 'transform' : 'auto',
                zIndex: isActioning ? 10 : undefined,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
            }}
        >
            <span
                className="moment-action__icon"
                style={{
                    touchAction: 'pan-y',
                    cursor: isCommitting ? 'wait' : 'pointer',
                    overflow: 'visible',
                }}
                role="button"
                tabIndex={0}
                aria-label={frictionLabel || (isCompleted ? 'Mark as incomplete' : 'Mark as complete')}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onActivate();
                    }
                }}
                {...bindHandlers}
            >
                {/* Inner glyph spins in lockstep with the border fill (arcProgress),
                    eased in-out: it accelerates from rest, whips through the
                    middle, then decelerates as the ring closes. Three full turns
                    (1080°). The border/arc stay put — only the icon rotates. */}
                <span
                    className="moment-action__icon-spin"
                    style={{
                        display: 'inline-flex',
                        transformOrigin: '50% 50%',
                        transform: `rotate(${arcProgress * 1080}deg)`,
                        transition: hasFriction
                            ? `transform ${requiredHoldMs}ms cubic-bezier(0.85, 0, 0.15, 1)`
                            : 'transform 0.25s cubic-bezier(0.85, 0, 0.15, 1)',
                        willChange: isActioning ? 'transform' : 'auto',
                    }}
                >
                    {moment.icon
                        ? <Icon name={moment.icon} />
                        : <img src="/logo.png" alt="" className="moment-action__icon-img" />
                    }
                </span>
            </span>

            {isActioning && (
                <svg
                    className="moment-action__arc"
                    viewBox="0 0 44 44"
                    aria-hidden
                >
                    <rect x="3" y="3" width="38" height="38"
                        fill="none"
                        stroke="rgba(0,0,0,0.08)"
                        strokeWidth="3"
                    />
                    <rect x="3" y="3" width="38" height="38"
                        fill="none"
                        stroke={arcColor}
                        strokeWidth="3"
                        strokeDasharray={arcPerimeter}
                        strokeLinecap="butt"
                        style={{
                            strokeDashoffset: arcOffset,
                            transition: hasFriction ? `stroke-dashoffset ${requiredHoldMs}ms cubic-bezier(0.45, 0, 0.55, 1)` : 'none',
                        }}
                    />
                </svg>
            )}
        </span>
    );
}
