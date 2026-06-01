interface Props {
    /** True when the section is snapped to the current hour. */
    focused: boolean;
    /** Flip between full-range and now-focused. */
    onToggle: () => void;
    /** Label shown in the idle (full-range) state. */
    idleLabel?: string;
}

/**
 * The "Today / Now" badge in a calendar section header. Acts as a toggle:
 * idle it reads "Today" and the section shows its full range; pressed it reads
 * "Now" and the container snaps the section to the current hour. Presentational
 * only — the toggle state lives in the container via `useNowFocus`.
 */
export default function CalendarNowToggle({ focused, onToggle, idleLabel = 'Today' }: Props) {
    return (
        <button
            type="button"
            className={`calendar-now-toggle${focused ? ' calendar-now-toggle--active' : ''}`}
            onClick={onToggle}
            aria-pressed={focused}
            title={focused ? 'Show the full range' : 'Jump to now'}
        >
            {focused ? 'Now' : idleLabel}
        </button>
    );
}
