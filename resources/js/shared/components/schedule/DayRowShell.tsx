import React from 'react';

interface Props {
    /** Primary label — "MONDAY", "SUNDAY", etc. */
    label: string;
    /** Secondary label shown dimmer beside the primary — "19 Apr" */
    sublabel?: string;
    /** Badge text shown right-aligned in header — "Today" */
    badge?: string;
    isToday?: boolean;
    isWeekend?: boolean;
    /**
     * 'vertical' — default weekly stack: mobile column, desktop 6-col grid.
     * 'horizontal' — monthly configure: moments flow as a flex-row.
     */
    slotsLayout?: 'vertical' | 'horizontal';
    children: React.ReactNode;
}

/**
 * Shared shell for any day-of-week row.
 * Used by weekly DaySection (time slots as children)
 * and monthly ScheduleRow (moment cards as children).
 */
export default function DayRowShell({
    label,
    sublabel,
    badge,
    isToday = false,
    isWeekend = false,
    slotsLayout = 'vertical',
    children,
}: Props) {
    const sectionCls = [
        'weekly-day-section',
        isToday ? 'weekly-day-section--today' : '',
        isWeekend ? 'weekly-day-section--weekend' : '',
    ]
        .filter(Boolean)
        .join(' ');

    const slotsCls = [
        'weekly-day-slots',
        slotsLayout === 'horizontal' ? 'weekly-day-slots--horizontal' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <section className={sectionCls}>
            <header className="weekly-day-header">
                <span className="weekly-day-header__name">{label}</span>
                {sublabel && <span className="weekly-day-header__date">{sublabel}</span>}
                {badge && <span className="weekly-day-header__badge">{badge}</span>}
            </header>

            <div className={slotsCls}>
                {children}
            </div>
        </section>
    );
}
