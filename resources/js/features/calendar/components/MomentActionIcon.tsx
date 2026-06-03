import Icon from '@/shared/components/Icon';
import type { CalendarMoment } from '@/shared/components/calendar/types';

interface Props {
    moment: CalendarMoment;
    /** True while a drag/hold gesture is in progress — gates the arc. */
    isActioning: boolean;
    isCommitting: boolean;
    isCompleted: boolean;
    arcColor: string;
    arcOffset: number;
    arcPerimeter: number;
    frictionLabel: string;
    /** Keyboard activation (Enter/Space) — commits immediately, skipping friction. */
    onActivate: () => void;
}

/**
 * The draggable icon + friction arc for a read-variant moment row.
 *
 * NOTE: horizontal travel + lean rotation are now owned by the parent
 * `<DragToComplete>` (Motion). This component only renders the icon and the
 * SVG friction arc; it no longer applies its own transform or pointer handlers.
 */
export default function MomentActionIcon({
    moment,
    isActioning,
    isCommitting,
    isCompleted,
    arcColor,
    arcOffset,
    arcPerimeter,
    frictionLabel,
    onActivate,
}: Props) {
    return (
        <span
            style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
            }}
        >
            <span
                className="moment-action__icon"
                style={{
                    cursor: isCommitting ? 'wait' : 'grab',
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
            >
                {moment.icon
                    ? <Icon name={moment.icon} />
                    : <img src="/logo.png" alt="" className="moment-action__icon-img" />
                }
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
                            transition: 'stroke-dashoffset 0.08s linear',
                        }}
                    />
                </svg>
            )}
        </span>
    );
}
