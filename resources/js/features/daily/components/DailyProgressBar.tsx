interface Props {
    completedCount: number;
    totalCount: number;
}

/**
 * A simple fill bar showing X of Y moments done for the day.
 */
export default function DailyProgressBar({ completedCount, totalCount }: Props) {
    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <div className="daily-progress" title={`${completedCount} of ${totalCount} done`}>
            <div className="daily-progress__bar">
                <div className="daily-progress__fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="daily-progress__label">
                {completedCount} / {totalCount}
            </span>
        </div>
    );
}
