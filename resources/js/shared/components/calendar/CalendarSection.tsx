import React from 'react';

interface Props {
    isToday?: boolean;
    isWeekend?: boolean;
    /**
     * 'vertical' — stack of articles (daily, weekly, monthly-vertical).
     * 'horizontal' — flex row of articles (monthly schedule rows).
     */
    layout?: 'vertical' | 'horizontal';
    /** JSX header slot — typically <CalendarSectionHeader>, but any element. */
    header?: React.ReactNode;
    children: React.ReactNode;
}

export default function CalendarSection({
    isToday = false,
    isWeekend = false,
    layout = 'vertical',
    header,
    children,
}: Props) {
    const sectionCls = [
        'calendar-section',
        // isToday ? 'calendar-section--today' : '',
        isWeekend ? 'calendar-section--weekend' : '',
    ].filter(Boolean).join(' ');

    const articlesCls = [
        'calendar-section__articles',
        layout === 'horizontal' ? 'calendar-section__articles--horizontal' : '',
    ].filter(Boolean).join(' ');

    return (
        <section className={sectionCls}>
            {header}
            <div className={articlesCls}>
                {children}
            </div>
        </section>
    );
}
