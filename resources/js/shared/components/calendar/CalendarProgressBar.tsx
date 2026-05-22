interface Props {
    completedCount: number;
    totalCount: number;
}

/**
 * Horizontal fill bar showing X / Y moments done.
 * Used in the calendar header for daily, weekly, and monthly views.
 */
export default function CalendarProgressBar({ completedCount, totalCount }: Props) {
    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <div className="calendar-progress" title={`${completedCount} of ${totalCount} done`}>
            <div className="calendar-progress__bar">
                <div className="calendar-progress__fill" style={{ width: `${pct}%`, '--pct': pct } as React.CSSProperties} />
            </div>
            <span className="calendar-progress__label">
                {completedCount} / {totalCount}
            </span>
        </div>
    );
}
