interface Props {
    label: string;
    sublabel?: string;
    badge?: string;
}

export default function CalendarSectionHeader({ label, sublabel, badge }: Props) {
    return (
        <header className="calendar-section__header">
            <span className="calendar-section__label">{label}</span>
            {sublabel && <span className="calendar-section__sublabel">{sublabel}</span>}
            {badge && <span className="calendar-section__badge">{badge}</span>}
        </header>
    );
}
