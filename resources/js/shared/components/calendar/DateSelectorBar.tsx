import { router } from '@inertiajs/react';
import {
    addDays,
    addWeeks,
    endOfISOWeek,
    format,
    parseISO,
    startOfISOWeek,
    subDays,
    subWeeks,
} from 'date-fns';

interface WeekProps {
    mode: 'week';
    weekStart: string; // 'YYYY-MM-DD' — ISO week start
}

interface DayProps {
    mode: 'day';
    date: string; // 'YYYY-MM-DD'
}

type Props = WeekProps | DayProps;

function weekLabel(start: Date): string {
    const end = endOfISOWeek(start);
    return `${format(start, 'd MMM')} – ${format(end, 'd MMM')}`;
}

function dayLabel(date: Date): string {
    return format(date, 'EEE d MMM');
}

export default function DateSelectorBar(props: Props) {
    if (props.mode === 'week') {
        const current = startOfISOWeek(parseISO(props.weekStart));
        const prev = subWeeks(current, 1);
        const next = addWeeks(current, 1);

        function navigate(date: Date) {
            router.get(
                route('weekly'),
                { week: format(date, 'yyyy-MM-dd') },
                { preserveScroll: false },
            );
        }

        return (
            <div className="week-selector">
                <button
                    className="week-selector__btn week-selector__btn--prev"
                    onClick={() => navigate(prev)}
                    aria-label="Previous week"
                >
                    <span className="week-selector__btn-range">
                        {weekLabel(prev)}
                    </span>
                </button>

                <div className="week-selector__current">
                    <span className="week-selector__current-range">
                        {weekLabel(current)}
                    </span>
                </div>

                <button
                    className="week-selector__btn week-selector__btn--next"
                    onClick={() => navigate(next)}
                    aria-label="Next week"
                >
                    <span className="week-selector__btn-range">
                        {weekLabel(next)}
                    </span>
                </button>
            </div>
        );
    }

    // Day mode
    const current = parseISO(props.date);
    const prev = subDays(current, 1);
    const next = addDays(current, 1);

    function navigate(date: Date) {
        router.get(
            route('daily'),
            { date: format(date, 'yyyy-MM-dd') },
            { preserveScroll: false },
        );
    }

    return (
        <div className="week-selector">
            <button
                className="week-selector__btn week-selector__btn--prev"
                onClick={() => navigate(prev)}
                aria-label="Previous day"
            >
                <span className="week-selector__btn-range">
                    {dayLabel(prev)}
                </span>
            </button>

            <div className="week-selector__current">
                <span className="week-selector__current-range">
                    {dayLabel(current)}
                </span>
            </div>

            <button
                className="week-selector__btn week-selector__btn--next"
                onClick={() => navigate(next)}
                aria-label="Next day"
            >
                <span className="week-selector__btn-range">
                    {dayLabel(next)}
                </span>
            </button>
        </div>
    );
}
