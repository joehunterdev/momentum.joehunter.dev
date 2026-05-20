interface Props {
    score: number; // 0–100
}

/**
 * Thin horizontal progress pill.
 * Colour gradient: red (0) → orange → yellow → green (100).
 */
export default function ConsistencyBar({ score }: Props) {
    const clamped = Math.min(100, Math.max(0, score));

    return (
        <div className="consistency-bar" title={`${clamped}% consistency`}>
            <div
                className="consistency-bar__fill"
                style={{ width: `${clamped}%` }}
            />
        </div>
    );
}
