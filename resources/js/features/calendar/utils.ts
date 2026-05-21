/**
 * Calendar business logic — pure functions consumed by view containers and
 * cells. Mirrors the helpers in backend's CalendarService.
 */

import type { CalendarConfig, TimeSlot } from '@/shared/components/calendar/types';

/**
 * Filter time slots to those inside the user's wake→sleep window.
 * When sleep_time <= wake_time the window crosses midnight (e.g. wake 08:15,
 * sleep 00:15) and a slot is inside the window if it's after wake OR before sleep.
 */
export function getVisibleTimeSlots(
    slots: TimeSlot[],
    config: CalendarConfig,
): TimeSlot[] {
    const { wake_time, sleep_time } = config;
    const crossesMidnight = sleep_time <= wake_time;

    return slots.filter((s) =>
        crossesMidnight
            ? s.time >= wake_time || s.time < sleep_time
            : s.time >= wake_time && s.time < sleep_time,
    );
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
