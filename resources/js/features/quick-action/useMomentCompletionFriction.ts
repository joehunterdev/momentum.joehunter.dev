import { usePage } from '@inertiajs/react';
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

const NONE: FrictionConfig = { requiredHoldMs: 1000, frictionLevel: 'none', label: '' };
const MID: FrictionConfig = { requiredHoldMs: 2200, frictionLevel: 'mid', label: 'Hold to complete' };
const LOW: FrictionConfig = { requiredHoldMs: 4000, frictionLevel: 'low', label: 'Press and hold to complete' };

/**
 * Map a moment's consistency to a friction config, respecting the user's
 * global friction_level setting from their config.
 *
 *   auto         → derived from consistency band (default behaviour)
 *   none         → always instant, regardless of consistency
 *   mid          → always 1.5s hold, regardless of consistency
 *   low          → always 3.0s hold, regardless of consistency
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

    // Read the user's global friction level preference from Inertia shared props.
    const page = usePage();
    const configLevel = (page.props as Record<string, unknown>).friction_level as string ?? 'auto';

    if (configLevel === 'none') return NONE;
    if (configLevel === 'mid') return MID;
    if (configLevel === 'low') return LOW;

    // auto: derive from consistency band
    const band = consistencyBand(consistency);
    if (band === 'low') return LOW;
    if (band === 'mid') return MID;
    return NONE;
}
