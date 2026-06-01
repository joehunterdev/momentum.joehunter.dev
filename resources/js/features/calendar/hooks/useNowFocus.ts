import { useCallback, useState } from 'react';

/**
 * Toggle state for the calendar "Now" focus. When `focused` is false the view
 * shows its full time range; when true the container snaps the section to a
 * window centred on the current hour. Shared by the daily and weekly
 * containers and driven by the <CalendarNowToggle> badge.
 */
export function useNowFocus(initialFocused = false) {
    const [focused, setFocused] = useState(initialFocused);
    const toggle = useCallback(() => setFocused((f) => !f), []);
    return { focused, toggle };
}
