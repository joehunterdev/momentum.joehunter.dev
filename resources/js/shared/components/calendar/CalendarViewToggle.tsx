import { Link } from '@inertiajs/react';

/**
 * 3-way view toggle: Daily | Weekly | Monthly.
 * Replaces the 2-way ViewToggle in AuthenticatedLayout.
 */
export default function CalendarViewToggle() {
    const isDaily = route().current('daily');
    const isWeekly = route().current('weekly');
    const isMonthly = route().current('monthly');

    const btnCls = (active: boolean) =>
        ['calendar-view-toggle__btn', active ? 'calendar-view-toggle__btn--active' : '']
            .filter(Boolean)
            .join(' ');

    return (
        <div className="calendar-view-toggle">
            {/* Daily — single-day calendar icon */}
            <Link
                href={route('daily')}
                className={btnCls(!!isDaily)}
                aria-label="Daily view"
                title="Daily"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
            </Link>

            {/* Weekly — 2×2 grid icon */}
            <Link
                href={route('weekly')}
                className={btnCls(!!isWeekly)}
                aria-label="Weekly view"
                title="Weekly"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                </svg>
            </Link>

            {/* Monthly — calendar grid icon */}
            <Link
                href={route('monthly')}
                className={btnCls(!!isMonthly)}
                aria-label="Monthly view"
                title="Monthly"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    <line x1="8" y1="10" x2="8" y2="22" />
                    <line x1="16" y1="10" x2="16" y2="22" />
                    <line x1="3" y1="16" x2="21" y2="16" />
                </svg>
            </Link>
        </div>
    );
}
