/**
 * Shared calendar utilities used across daily, weekly, and monthly views.
 * Extracted from duplicated logic in DailyGrid, DaySection, TimeSlotCell.
 */

import type { CalendarConfig, TimeSlot } from './types';

/**
 * Filter time slots to those visible in the wake→sleep window.
 * For today, anchors to (now - 2h) snapped to interval to keep current time in view.
 *
 * @param slots - all time slots for the day
 * @param config - calendar configuration with wake/sleep times
 * @param isToday - whether this is today's view
 * @param intervalMinutes - slot interval for snapping (default: 30)
 * @returns filtered array of visible time slots
 */
export function getVisibleTimeSlots(
    slots: TimeSlot[],
    config: CalendarConfig,
    isToday: boolean,
    intervalMinutes: number = 30,
): TimeSlot[] {
    const inWindow = slots.filter(
        (s) => s.time >= config.wake_time && s.time < config.sleep_time,
    );

    if (!isToday) {
        return inWindow;
    }

    const now = new Date();
    const cutoffMinutes = Math.max(0, now.getHours() * 60 + now.getMinutes() - 2 * 60);
    const snappedCutoff = cutoffMinutes - (cutoffMinutes % intervalMinutes);
    const cutoffHH = String(Math.floor(snappedCutoff / 60)).padStart(2, '0');
    const cutoffMM = String(snappedCutoff % 60).padStart(2, '0');
    const cutoffTime = `${cutoffHH}:${cutoffMM}`;

    return inWindow.filter((s) => s.time >= cutoffTime || s.moment !== null);
}

/**
 * Snap a time string (HH:mm or HH:mm:ss) to the nearest 30-min slot boundary.
 */
export function snapToSlot(time: string, intervalMinutes: number = 30): string {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const snappedMinutes = Math.round(totalMinutes / intervalMinutes) * intervalMinutes;
    const snappedHours = Math.floor(snappedMinutes / 60);
    const snappedMins = snappedMinutes % 60;

    return `${String(snappedHours).padStart(2, '0')}:${String(snappedMins).padStart(2, '0')}`;
}

/**
 * Check if a time falls outside office hours.
 */
export function isOutOfOffice(time: string, config: CalendarConfig): boolean {
    return time < config.office_start || time >= config.office_end;
}

/**
 * JS getDay() (0=Sun) to ISO weekday (1=Mon, 7=Sun).
 */
export function jsToIsoDay(d: number): number {
    return d === 0 ? 7 : d;
}

/**
 * ISO weekday (1=Mon, 7=Sun) to JS getDay() (0=Sun, 6=Sat).
 */
export function isoToDayOfWeek(iso: number): number {
    return iso === 7 ? 0 : iso;
}

/**
 * Compute the start index into a sorted hourly time array to center on current time.
 * Used by weekly view to show the current hour in the middle of the visible window.
 *
 * @param allTimes - sorted array of unique times (e.g., ["07:00", "08:00", ...])
 * @param visibleCount - number of slots to show (e.g., 6)
 * @returns start index to slice into allTimes
 */
export function computeWindowStart(allTimes: string[], visibleCount: number): number {
    if (allTimes.length <= visibleCount) return 0;

    const nowHour = new Date().getHours();
    const nowTime = `${String(nowHour).padStart(2, '0')}:00`;

    let anchorIdx = allTimes.findIndex((t) => t >= nowTime);
    if (anchorIdx < 0) anchorIdx = allTimes.length - 1;

    const half = Math.floor(visibleCount / 2);
    return Math.max(0, Math.min(anchorIdx - half, allTimes.length - visibleCount));
}

/**
 * Check if a date falls on a scheduled occurrence for a given frequency.
 *
 * @param date - ISO date string (YYYY-MM-DD)
 * @param frequency - frequency type ('daily', 'weekly', 'custom', 'once')
 * @param daysOfWeek - array of ISO weekday numbers [1=Mon, ..., 7=Sun]
 * @returns true if the date matches the frequency schedule
 */
export function isScheduledOn(
    date: string,
    frequency: string,
    daysOfWeek: number[] | null,
): boolean {
    const dateObj = new Date(date);
    const jsDay = dateObj.getDay();
    const isoDay = jsToIsoDay(jsDay);

    return (
        frequency === 'daily' ||
        (frequency === 'weekly' && daysOfWeek !== null && daysOfWeek.includes(isoDay)) ||
        (frequency === 'custom' && daysOfWeek !== null && daysOfWeek.includes(isoDay)) ||
        frequency === 'once'
    );
}
