interface Props {
    /** 0–100 consistency percentage. null = brand-new moment, no history. */
    consistency: number | null;
    /** When true the bar shows as fully complete. */
    isCompleted?: boolean;
    /** Optional moment colour — overrides the default purple. */
    color?: string | null;
    /**
     * 0–1 swipe progress. When > 0, renders a lighter preview segment
     * showing the projected consistency gain from completing today.
     */
    previewProgress?: number;
}

/**
 * Slim full-width consistency progress bar for a moment row.
 * Uses moment.color when available, otherwise falls back to brand purple.
 */
export default function MomentProgressBar({ consistency, isCompleted = false, color, previewProgress = 0 }: Props) {
    const pct = isCompleted ? 100 : Math.max(0, Math.min(100, consistency ?? 0));

    // Projected gain: one completion ≈ moves needle by ~(100-pct)/20 capped at 8%.
    // Scales with swipe progress so it grows as you drag.
    const gainPct = isCompleted ? 0 : Math.min(8, (100 - pct) / 20) * previewProgress;

    const fillColor = color
        ? `linear-gradient(to right, ${color}44 0%, ${color} 100%)`
        : 'linear-gradient(to right, rgba(var(--mm-progress-base-rgb), 0.2) 0%, rgba(var(--mm-progress-base-rgb), 0.6) 100%)';

    const previewColor = color ? `${color}55` : 'rgba(var(--mm-progress-base-rgb), 0.25)';

    return (
        <div className="moment-progress">
            <div className="moment-progress__track">
                <div
                    className="moment-progress__fill"
                    style={{ width: `${pct}%`, background: fillColor }}
                />
                {gainPct > 0 && (
                    <div
                        className="moment-progress__preview"
                        style={{
                            left: `${pct}%`,
                            width: `${gainPct}%`,
                            background: previewColor,
                        }}
                    />
                )}
            </div>
        </div>
    );
}
