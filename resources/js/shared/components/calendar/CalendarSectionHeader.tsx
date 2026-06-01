import type { ReactNode } from 'react';

interface Props {
    label: string;
    sublabel?: string;
    /** A plain string renders the static badge chip; a node (e.g. the
     *  CalendarNowToggle button) is rendered as-is with its own styling. */
    badge?: ReactNode;
}

export default function CalendarSectionHeader({ label, sublabel, badge }: Props) {
    return (
        <header className="calendar-section__header">
            <span className="calendar-section__label">{label}</span>
            {sublabel && <span className="calendar-section__sublabel">{sublabel}</span>}
            {typeof badge === 'string'
                ? <span className="calendar-section__badge">{badge}</span>
                : badge}
        </header>
    );
}
