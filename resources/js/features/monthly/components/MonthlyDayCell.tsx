import { format, parseISO } from 'date-fns';

interface Props {
    day: App.Data.MonthlyDayData;
    onDayClick?: (date: string) => void;
}

export default function MonthlyDayCell({ day, onDayClick }: Props) {
    const dateObj = parseISO(day.date);

    const cellCls = [
        'monthly-day-cell',
        day.isToday ? 'monthly-day-cell--today' : '',
        day.isWeekend ? 'monthly-day-cell--weekend' : '',
        !day.isCurrentMonth ? 'monthly-day-cell--faded' : '',
    ]
        .filter(Boolean)
        .join(' ');

    const completionRatio = day.totalCount > 0 ? day.completedCount / day.totalCount : null;

    const ringCls = completionRatio === null
        ? ''
        : completionRatio === 1
            ? 'monthly-day-cell__date-num--complete'
            : completionRatio > 0
                ? 'monthly-day-cell__date-num--partial'
                : 'monthly-day-cell__date-num--none';

    return (
        <div
            className={cellCls}
            role={onDayClick ? 'button' : undefined}
            tabIndex={onDayClick ? 0 : undefined}
            onClick={() => onDayClick?.(day.date)}
            onKeyDown={(e) => e.key === 'Enter' && onDayClick?.(day.date)}
        >
            <span className={`monthly-day-cell__date-num ${ringCls}`}>
                {format(dateObj, 'd')}
            </span>

            {day.moments.length > 0 && (
                <ul className="monthly-day-cell__moments">
                    {day.moments.slice(0, 3).map((m) => (
                        <li
                            key={m.id}
                            className={`monthly-day-cell__pip monthly-day-cell__pip--${m.status ?? 'future'}`}
                            title={m.name}
                        >
                            {m.icon ? (
                                <span className="monthly-day-cell__pip-icon">{m.icon}</span>
                            ) : (
                                <span
                                    className="monthly-day-cell__pip-dot"
                                    style={m.color ? { background: m.color } : undefined}
                                />
                            )}
                        </li>
                    ))}
                    {day.moments.length > 3 && (
                        <li className="monthly-day-cell__overflow">+{day.moments.length - 3}</li>
                    )}
                </ul>
            )}
        </div>
    );
}
