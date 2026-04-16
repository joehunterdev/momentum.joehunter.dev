import { router } from '@inertiajs/react';

interface Props {
    prevLabel: string;
    currentLabel: string;
    nextLabel: string;
    prevParam: Record<string, string>;
    nextParam: Record<string, string>;
    routeName: string;
}

/**
 * Generic prev/current/next navigation bar for daily, weekly, and monthly views.
 * Pages compute labels and params — this component is intentionally dumb.
 */
export default function CalendarNav({
    prevLabel,
    currentLabel,
    nextLabel,
    prevParam,
    nextParam,
    routeName,
}: Props) {
    function navigate(params: Record<string, string>) {
        router.get(route(routeName), params, { preserveScroll: false });
    }

    return (
        <div className="calendar-nav">
            <button
                className="calendar-nav__btn calendar-nav__btn--prev"
                onClick={() => navigate(prevParam)}
                aria-label={`Go to ${prevLabel}`}
            >
                <span className="calendar-nav__label">{prevLabel}</span>
            </button>

            <div className="calendar-nav__current">
                <span className="calendar-nav__current-label">{currentLabel}</span>
            </div>

            <button
                className="calendar-nav__btn calendar-nav__btn--next"
                onClick={() => navigate(nextParam)}
                aria-label={`Go to ${nextLabel}`}
            >
                <span className="calendar-nav__label">{nextLabel}</span>
            </button>
        </div>
    );
}
