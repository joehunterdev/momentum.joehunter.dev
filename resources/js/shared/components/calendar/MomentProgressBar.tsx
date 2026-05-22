interface Props {
    /** 0–100 consistency percentage. null = brand-new moment, no history. */
    consistency: number | null;
    /** When true the bar shows as fully complete. */
    isCompleted?: boolean;
    /** Optional moment colour — overrides the default purple. */
    color?: string | null;
}

/**
 * Slim full-width consistency progress bar for a moment row.
 * Uses moment.color when available, otherwise falls back to brand purple.
 */
export default function MomentProgressBar({ consistency, isCompleted = false, color }: Props) {
    const pct = isCompleted ? 100 : Math.max(0, Math.min(100, consistency ?? 0));
    const fillColor = color
        ? `linear-gradient(to right, ${color}44 0%, ${color} 100%)`
        : 'linear-gradient(to right, rgba(var(--mm-progress-base-rgb), 0.2) 0%, rgba(var(--mm-progress-base-rgb), 0.6) 100%)';

    return (
        <div className="moment-progress">
            <div className="moment-progress__track">
                <div
                    className="moment-progress__fill"
                    style={{ width: `${pct}%`, background: fillColor }}
                />
            </div>
        </div>
    );
}
