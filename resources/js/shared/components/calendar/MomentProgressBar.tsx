interface Props {
    /** 0–100 consistency percentage. null = brand-new moment, no history. */
    consistency: number | null;
    /** When true the bar shows as fully complete. */
    isCompleted?: boolean;
}

/**
 * Slim full-width consistency progress bar for a moment row.
 * Purple (0%) → teal (100%) linear gradient via CSS; width conveys progress.
 */
export default function MomentProgressBar({ consistency, isCompleted = false }: Props) {
    const pct = isCompleted ? 100 : Math.max(0, Math.min(100, consistency ?? 0));

    return (
        <div className="moment-progress">
            <div className="moment-progress__track">
                <div
                    className="moment-progress__fill"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}
