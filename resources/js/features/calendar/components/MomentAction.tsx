interface Props {
    moment: App.Data.SlotMomentData;
    /** Override fill (0–100). Defaults to `moment.progress ?? 0`. */
    progress?: number;
}

/**
 * Canonical row component for a moment. Pure presentation: icon, title,
 * description, and a progress fill rendered as the row background. Used by
 * all calendar views (Daily, Weekly, Monthly) and any container that needs
 * to render a moment from a SlotMomentData payload.
 */
export default function MomentAction({ moment, progress }: Props) {
    const pct = Math.max(0, Math.min(100, progress ?? moment.progress ?? 0));

    return (
        <div
            className="moment-action-item"
            style={{ '--moment-progress': `${pct}%` } as React.CSSProperties}
        >
            <span className="moment-action-item__progress-bg" aria-hidden />
            <span className="moment-action-item__icon">{moment.icon ?? '📌'}</span>
            <div className="moment-action-item__body">
                <span className="moment-action-item__title">{moment.name}</span>
                {moment.description && (
                    <span className="moment-action-item__description">
                        {moment.description}
                    </span>
                )}
            </div>
        </div>
    );
}
