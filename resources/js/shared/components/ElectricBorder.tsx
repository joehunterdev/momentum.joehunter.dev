// CREDIT
// Component inspired by @BalintFerenczy on X
// https://codepen.io/BalintFerenczy/pen/KwdoyEN
// Ported to TypeScript with `active` gating and `thickness` prop.

import { useEffect, useRef, useCallback } from 'react';
import './ElectricBorder.css';

export interface ElectricBorderProps {
    children: React.ReactNode;
    /** Stroke + glow colour — any valid CSS colour string. */
    color?: string;
    /** Animation speed multiplier. */
    speed?: number;
    /** Turbulence intensity (0 = flat, 1 = very chaotic). */
    chaos?: number;
    /** Canvas stroke width in logical pixels. */
    thickness?: number;
    /** Border radius of the animated rect in pixels. */
    borderRadius?: number;
    /** When false the canvas stops drawing (no more rAF). */
    active?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Animated electric border wrapper.
 * Port of the React Bits / @BalintFerenczy electric border.
 * `active` gates the animation — canvas stops drawing when false.
 */
export const ElectricBorder = ({
    children,
    color = '#5227FF',
    speed = 1,
    chaos = 0.15,
    thickness = 1,
    borderRadius = 8,
    active = true,
    className,
    style,
}: ElectricBorderProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const timeRef = useRef(0);
    const lastFrameTimeRef = useRef(0);

    // ── Noise helpers ────────────────────────────────────────────────────────
    const random = useCallback((x: number) => {
        return (Math.sin(x * 12.9898) * 43758.5453) % 1;
    }, []);

    const noise2D = useCallback(
        (x: number, y: number) => {
            const i = Math.floor(x);
            const j = Math.floor(y);
            const fx = x - i;
            const fy = y - j;
            const a = random(i + j * 57);
            const b = random(i + 1 + j * 57);
            const c = random(i + (j + 1) * 57);
            const d = random(i + 1 + (j + 1) * 57);
            const ux = fx * fx * (3.0 - 2.0 * fx);
            const uy = fy * fy * (3.0 - 2.0 * fy);
            return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
        },
        [random]
    );

    const octavedNoise = useCallback(
        (
            x: number,
            octaves: number,
            lacunarity: number,
            gain: number,
            baseAmplitude: number,
            baseFrequency: number,
            time: number,
            seed: number,
            baseFlatness: number,
        ) => {
            let y = 0;
            let amplitude = baseAmplitude;
            let frequency = baseFrequency;
            for (let i = 0; i < octaves; i++) {
                const octaveAmplitude = i === 0 ? amplitude * baseFlatness : amplitude;
                y += octaveAmplitude * noise2D(frequency * x + seed * 100, time * frequency * 0.3);
                frequency *= lacunarity;
                amplitude *= gain;
            }
            return y;
        },
        [noise2D]
    );

    // ── Perimeter helpers ────────────────────────────────────────────────────
    const getCornerPoint = useCallback(
        (centerX: number, centerY: number, radius: number, startAngle: number, arcLength: number, progress: number) => {
            const angle = startAngle + progress * arcLength;
            return { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) };
        },
        []
    );

    const getRoundedRectPoint = useCallback(
        (t: number, left: number, top: number, width: number, height: number, radius: number) => {
            const straightWidth = width - 2 * radius;
            const straightHeight = height - 2 * radius;
            const cornerArc = (Math.PI * radius) / 2;
            const totalPerimeter = 2 * straightWidth + 2 * straightHeight + 4 * cornerArc;
            const distance = t * totalPerimeter;
            let accumulated = 0;

            // Top edge
            if (distance <= accumulated + straightWidth) {
                const p = (distance - accumulated) / straightWidth;
                return { x: left + radius + p * straightWidth, y: top };
            }
            accumulated += straightWidth;

            // Top-right corner
            if (distance <= accumulated + cornerArc) {
                const p = (distance - accumulated) / cornerArc;
                return getCornerPoint(left + width - radius, top + radius, radius, -Math.PI / 2, Math.PI / 2, p);
            }
            accumulated += cornerArc;

            // Right edge
            if (distance <= accumulated + straightHeight) {
                const p = (distance - accumulated) / straightHeight;
                return { x: left + width, y: top + radius + p * straightHeight };
            }
            accumulated += straightHeight;

            // Bottom-right corner
            if (distance <= accumulated + cornerArc) {
                const p = (distance - accumulated) / cornerArc;
                return getCornerPoint(left + width - radius, top + height - radius, radius, 0, Math.PI / 2, p);
            }
            accumulated += cornerArc;

            // Bottom edge
            if (distance <= accumulated + straightWidth) {
                const p = (distance - accumulated) / straightWidth;
                return { x: left + width - radius - p * straightWidth, y: top + height };
            }
            accumulated += straightWidth;

            // Bottom-left corner
            if (distance <= accumulated + cornerArc) {
                const p = (distance - accumulated) / cornerArc;
                return getCornerPoint(left + radius, top + height - radius, radius, Math.PI / 2, Math.PI / 2, p);
            }
            accumulated += cornerArc;

            // Left edge
            if (distance <= accumulated + straightHeight) {
                const p = (distance - accumulated) / straightHeight;
                return { x: left, y: top + height - radius - p * straightHeight };
            }
            accumulated += straightHeight;

            // Top-left corner
            const p = (distance - accumulated) / cornerArc;
            return getCornerPoint(left + radius, top + radius, radius, Math.PI, Math.PI / 2, p);
        },
        [getCornerPoint]
    );

    // ── Main animation effect ────────────────────────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        // Stop immediately when inactive — still mount the canvas so it
        // can resume without a full remount when `active` flips back.
        if (!active) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        // Check prefers-reduced-motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // ── Constants ──────────────────────────────────────────────────────────
        const octaves = 10;
        const lacunarity = 1.6;
        const gain = 0.7;
        const amplitude = chaos;
        const frequency = 10;
        const baseFlatness = 0;
        const displacement = 18;   // how far points deviate from the border (px)
        const borderOffset = 32;   // canvas overhang on each side to contain displacement

        const updateSize = () => {
            const rect = container.getBoundingClientRect();
            const w = rect.width + borderOffset * 2;
            const h = rect.height + borderOffset * 2;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.scale(dpr, dpr);
            return { width: w, height: h };
        };

        let { width, height } = updateSize();
        let lastDpr = Math.min(window.devicePixelRatio || 1, 2);

        const drawFrame = (currentTime: number) => {
            if (!canvas || !ctx) return;

            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            if (dpr !== lastDpr) {
                lastDpr = dpr;
                ({ width, height } = updateSize());
            }

            const deltaTime = (currentTime - lastFrameTimeRef.current) / 1000;
            timeRef.current += deltaTime * speed;
            lastFrameTimeRef.current = currentTime;

            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.scale(dpr, dpr);

            ctx.strokeStyle = color;
            ctx.lineWidth = thickness;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            const left = borderOffset;
            const top = borderOffset;
            const borderWidth = width - 2 * borderOffset;
            const borderHeight = height - 2 * borderOffset;
            const maxRadius = Math.min(borderWidth, borderHeight) / 2;
            const radius = Math.min(borderRadius, maxRadius);

            const approxPerimeter = 2 * (borderWidth + borderHeight) + 2 * Math.PI * radius;
            const sampleCount = Math.floor(approxPerimeter / 2);

            ctx.beginPath();

            for (let i = 0; i <= sampleCount; i++) {
                const progress = i / sampleCount;
                const point = getRoundedRectPoint(progress, left, top, borderWidth, borderHeight, radius);

                const xNoise = octavedNoise(progress * 8, octaves, lacunarity, gain, amplitude, frequency, timeRef.current, 0, baseFlatness);
                const yNoise = octavedNoise(progress * 8, octaves, lacunarity, gain, amplitude, frequency, timeRef.current, 1, baseFlatness);

                const dx = point.x + xNoise * displacement;
                const dy = point.y + yNoise * displacement;

                if (i === 0) ctx.moveTo(dx, dy);
                else ctx.lineTo(dx, dy);
            }

            ctx.closePath();
            ctx.stroke();

            animationRef.current = requestAnimationFrame(drawFrame);
        };

        const resizeObserver = new ResizeObserver(() => {
            ({ width, height } = updateSize());
        });
        resizeObserver.observe(container);

        animationRef.current = requestAnimationFrame(drawFrame);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            resizeObserver.disconnect();
        };
    }, [active, color, speed, chaos, thickness, borderRadius, octavedNoise, getRoundedRectPoint]);

    const cssVars = {
        '--electric-border-color': color,
        '--electric-border-radius': `${borderRadius}px`,
    } as React.CSSProperties;

    return (
        <div
            ref={containerRef}
            className={`electric-border${className ? ` ${className}` : ''}`}
            style={{ ...cssVars, borderRadius, ...style }}
        >
            {/* Canvas — centred over container via CSS transform */}
            <div className="eb-canvas-container">
                <canvas ref={canvasRef} className="eb-canvas" aria-hidden="true" />
            </div>

            {/* Static glow layers (always visible when active) */}
            {active && (
                <div className="eb-layers" aria-hidden="true">
                    <div className="eb-glow-1" />
                    <div className="eb-glow-2" />
                    <div className="eb-background-glow" />
                </div>
            )}

            {/* Content sits on top */}
            <div className="eb-content">{children}</div>
        </div>
    );
};

export default ElectricBorder;
