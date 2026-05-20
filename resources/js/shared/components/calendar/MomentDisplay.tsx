import type { CalendarMoment } from '@/features/calendar/types';

interface Props {
    moment: CalendarMoment;
    /** Override fill (0–100). Defaults to `moment.progress ?? 0`. */
    progress?: number;
}

export default function MomentDisplay({ moment, progress }: Props) {
    const pct = Math.max(0, Math.min(100, progress ?? moment.progress ?? 0));
    const name = moment.name ?? 'Untitled Moment';

    return (
        <div
            className="moment-action-item"
            style={{ '--moment-progress': `${pct}%` } as React.CSSProperties}
        >
            <span className="moment-action-item__progress-bg" aria-hidden />
            <span className="moment-action-item__icon">{moment.icon ?? '📌'}</span>
            <div className="moment-action-item__body">
                <span className="moment-action-item__title">{name}</span>
                {moment.description && (
                    <span className="moment-action-item__description">
                        {moment.description}
                    </span>
                )}
            </div>
        </div>
    );
}
