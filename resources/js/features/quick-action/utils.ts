export type ConsistencyBand = 'low' | 'mid' | 'high' | 'top';

/**
 * Bucket a moment's 28-day consistency (0–100) into a band for visual
 * treatment. Null inputs (brand-new moments with no history) return null so
 * callers can fall back to a neutral state — we don't want to punish a moment
 * that hasn't had time to fail, nor mislabel it as 'top' green.
 *
 *   low  : 0–29   — red
 *   mid  : 30–59  — amber
 *   high : 60–84  — light green
 *   top  : 85–100 — strong green
 */
export function consistencyBand(value: number | null | undefined): ConsistencyBand | null {
    if (value === null || value === undefined) {
        return null;
    }
    if (value < 30) { return 'low'; }
    if (value < 60) { return 'mid'; }
    if (value < 85) { return 'high'; }
    return 'top';
}
