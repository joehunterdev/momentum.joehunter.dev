import { ReactNode } from 'react';
import ElectricBorder from '@/shared/components/ElectricBorder';

export interface MomentActionBorderProps {
    children: ReactNode;
    color?: string | null;
    consistency: number | null;
    dragProgress: number;
    holdProgress: number;
    /** True when this moment requires a hold timer to commit (low consistency). */
    hasFriction: boolean;
    isCompleted: boolean;
}

/**
 * MomentActionBorder — Binding layer between moment state and ElectricBorder animation.
 *
 * Mirrors the same two-mode logic as the arc indicator:
 *
 *   No friction  → border intensity driven by normalised drag (full at 0.85 threshold)
 *   Friction     → drag just enables the border; intensity driven by hold timer progress
 *                  (border only reaches full brightness once the hold is complete)
 *
 * Other params (speed, chaos) scale with consistency so habitual moments feel
 * calmer and more confident than struggling ones.
 */
export default function MomentActionBorder({
    children,
    color = 'var(--mm-primary)',
    consistency,
    dragProgress,
    holdProgress,
    hasFriction,
    isCompleted,
}: MomentActionBorderProps) {
    const normalizedConsistency = consistency !== null && consistency !== undefined ? consistency / 100 : 0.5;

    // Mirror arc logic exactly:
    //   No friction → normalise drag so border is full at the commit threshold (0.85)
    //   Friction    → drag just starts the animation; hold fills intensity
    const normalisedDrag = Math.min(1, dragProgress / 0.85);
    const interaction = hasFriction ? holdProgress : normalisedDrag;

    // Border is active as soon as the user starts dragging (even for friction items,
    // so there's immediate feedback), but intensity builds via `interaction` above.
    const active = dragProgress > 0 && !isCompleted;

    // Speed: calmer for high-consistency habits (they feel automatic)
    const speed = 0.4 + normalizedConsistency * 0.8;   // 0.4 → 1.2

    // Chaos: more turbulent for low-consistency (struggling) moments
    const baseChaos = 0.20 - normalizedConsistency * 0.10;
    const chaos = Math.max(0.08, baseChaos + interaction * 0.04);  // rises during hold

    // Thickness: grows with interaction so the border "fills" visually
    const thickness = 0.8 + interaction * 1.4;   // 0.8 → 2.2 px

    // Fallback color for null value
    const borderColor = color || 'var(--mm-primary)';

    return (
        <ElectricBorder
            color={borderColor}
            speed={speed}
            chaos={chaos}
            thickness={thickness}
            borderRadius={8}
            active={active}
        >
            {children}
        </ElectricBorder>
    );
}
