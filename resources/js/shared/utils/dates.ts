/**
 * Format a YYYY-MM-DD string as a human-readable date.
 * e.g. "2026-04-05" → "Saturday, 5 April 2026"
 */
export function formatDate(dateString: string): string {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

/**
 * Returns today's date as YYYY-MM-DD in local time.
 */
export function todayString(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Format a "HH:mm:ss" time string to "HH:mm".
 */
export function formatTime(time: string): string {
    return time.slice(0, 5);
}
