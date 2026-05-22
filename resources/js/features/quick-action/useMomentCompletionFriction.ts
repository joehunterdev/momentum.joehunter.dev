import { consistencyBand } from './utils';

export type FrictionLevel = 'none' | 'mid' | 'low';

export interface FrictionConfig {
    /** Milliseconds the user must keep the pointer down before commit unlocks. */
    requiredHoldMs: number;
    /** Friction band — drives ring colour and aria-label. */
    frictionLevel: FrictionLevel;
    /** Hover/aria hint describing the friction. Empty when there is none. */
    label: string;
}

const NONE: FrictionConfig = { requiredHoldMs: 0, frictionLevel: 'none', label: '' };

/**
 * Map a moment's consistency to a friction config. The intent is psychological:
 * if your record is poor, completing the moment should require *more deliberate
 * effort* — hold longer, feel the gesture. Strong-track-record moments commit
 * instantly on a normal swipe so we don't slow down the user when they're
 * doing well.
 *
 * Bands (from consistencyBand):
 *   top  / high  → no friction
 *   mid          → 1.5s hold
 *   low          → 3.0s hold
 *   null (new)   → no friction (don't punish a moment with no history)
 */
export function useMomentCompletionFriction(
    consistency: number | null | undefined,
): FrictionConfig {
    const band = consistencyBand(consistency);
    if (band === 'low') {
        return { requiredHoldMs: 3000, frictionLevel: 'low', label: 'Press and hold to complete' };
    }
    if (band === 'mid') {
        return { requiredHoldMs: 1500, frictionLevel: 'mid', label: 'Hold to complete' };
    }
    return NONE;
}
