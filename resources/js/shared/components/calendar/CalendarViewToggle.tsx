import { Link } from '@inertiajs/react';
import Icon from '@/shared/components/Icon';

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
                <Icon name="today" size={20} aria-hidden />
            </Link>

            {/* Weekly — 2×2 grid icon */}
            <Link
                href={route('weekly')}
                className={btnCls(!!isWeekly)}
                aria-label="Weekly view"
                title="Weekly"
            >
                <Icon name="view_week" size={20} aria-hidden />
            </Link>

            {/* Monthly — calendar grid icon */}
            <Link
                href={route('monthly')}
                className={btnCls(!!isMonthly)}
                aria-label="Monthly view"
                title="Monthly"
            >
                <Icon name="calendar_view_month" size={20} aria-hidden />
            </Link>
        </div>
    );
}
