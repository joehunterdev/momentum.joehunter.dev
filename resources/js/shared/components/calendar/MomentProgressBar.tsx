interface Props {
    /** 'ongoing' | 'fixed' | 'once' — determines bar rendering. */
    barKind: string;
    /** 0–100 fill % for ongoing/fixed bars; null = neutral/empty. */
    barValue: number | null;
    /** For fixed: completed reps. */
    barCompleted?: number | null;
    /** For fixed: scheduled reps in the commitment. */
    barScheduledTotal?: number | null;
    /** For fixed: days remaining. */
    barDaysRemaining?: number | null;
    /** Optional moment colour — overrides the default purple. */
    color?: string | null;
    /**
     * 0–1 swipe progress. When > 0, renders a lighter preview segment
     * showing the projected gain from completing today (Ongoing only).
     */
    previewProgress?: number;
}

/**
 * Progress bar for a moment row. Adapts based on habit type:
 * - Ongoing: rate-so-far (0–100), neutral when no due-days resolved.
 * - Fixed: tally of commitment (0–100 → completed), visually distinct.
 * - Once: no bar rendered.
 */
export default function MomentProgressBar({
    barKind,
    barValue,
    barCompleted,
    barScheduledTotal,
    color,
    previewProgress = 0,
}: Props) {
    if (barKind === 'once') {
        return null; // No bar for one-time items
    }

    const pct = barValue ?? 0;
    const fillColor = color
        ? `linear-gradient(to right, ${color}44 0%, ${color} 100%)`
        : 'linear-gradient(to right, rgba(var(--mm-progress-base-rgb), 0.2) 0%, rgba(var(--mm-progress-base-rgb), 0.6) 100%)';

    // Ongoing: preview gain effect
    let gainPct = 0;
    if (barKind === 'ongoing' && barValue !== null) {
        gainPct = Math.min(8, (100 - pct) / 20) * previewProgress;
    }

    const previewColor = color ? `${color}55` : 'rgba(var(--mm-progress-base-rgb), 0.25)';

    // Neutral track appearance when barValue is null (no due-days resolved)
    const isNeutral = barValue === null;
    const trackClass = `moment-progress__track ${isNeutral ? 'moment-progress__track--neutral' : ''} ${
        barKind === 'fixed' ? 'moment-progress__track--fixed' : ''
    }`;

    return (
        <div className="moment-progress">
            <div className={trackClass}>
                <div
                    className="moment-progress__fill"
                    style={{
                        width: `${isNeutral ? 0 : pct}%`,
                        background: fillColor,
                    }}
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
            {barKind === 'fixed' && barCompleted !== undefined && barScheduledTotal !== undefined && (
                <div className="moment-progress__label">
                    {barCompleted}/{barScheduledTotal}
                </div>
            )}
        </div>
    );
}
