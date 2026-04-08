import { router } from '@inertiajs/react';
import { addWeeks, endOfISOWeek, format, parseISO, startOfISOWeek, subWeeks } from 'date-fns';

interface Props {
    weekStart: string; // 'YYYY-MM-DD'
}

function weekLabel(start: Date): string {
    const end = endOfISOWeek(start);
    const startFmt = format(start, 'd MMM');
    const endFmt = format(end, 'd MMM');
    return `${startFmt} – ${endFmt}`;
}

export default function WeekSelectorBar({ weekStart }: Props) {
    const current = startOfISOWeek(parseISO(weekStart));
    const prev = subWeeks(current, 1);
    const next = addWeeks(current, 1);

    function navigate(date: Date) {
        router.get(route('weekly'), { week: format(date, 'yyyy-MM-dd') }, { preserveScroll: false });
    }

    return (
        <div className="week-selector">
            <button
                className="week-selector__btn week-selector__btn--prev"
                onClick={() => navigate(prev)}
                aria-label="Previous week"
            >
                <span className="week-selector__btn-range">{weekLabel(prev)}</span>
            </button>

            <div className="week-selector__current">
                <span className="week-selector__current-range">{weekLabel(current)}</span>
            </div>

            <button
                className="week-selector__btn week-selector__btn--next"
                onClick={() => navigate(next)}
                aria-label="Next week"
            >
                <span className="week-selector__btn-range">{weekLabel(next)}</span>
            </button>
        </div>
    );
}
