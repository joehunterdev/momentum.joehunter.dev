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
    // Dev-time overrides via URL search params — allows QA/testing without
    // needing real instance history to drive consistency scores.
    //   ?friction=low|mid|none   forces a friction band
    //   ?holdMs=<number>         overrides the hold duration in ms
    if (import.meta.env.DEV) {
        const params = new URLSearchParams(window.location.search);
        const frictionOverride = params.get('friction');
        const holdMsOverride = parseInt(params.get('holdMs') ?? '', 10);
        const holdMs = Number.isFinite(holdMsOverride) && holdMsOverride >= 0 ? holdMsOverride : undefined;

        if (frictionOverride === 'low') {
            return { requiredHoldMs: holdMs ?? 3000, frictionLevel: 'low', label: 'Press and hold to complete' };
        }
        if (frictionOverride === 'mid') {
            return { requiredHoldMs: holdMs ?? 1500, frictionLevel: 'mid', label: 'Hold to complete' };
        }
        if (frictionOverride === 'none') {
            return NONE;
        }
    }

    const band = consistencyBand(consistency);
    if (band === 'low') {
        return { requiredHoldMs: 3000, frictionLevel: 'low', label: 'Press and hold to complete' };
    }
    if (band === 'mid') {
        return { requiredHoldMs: 1500, frictionLevel: 'mid', label: 'Hold to complete' };
    }
    return NONE;
}
