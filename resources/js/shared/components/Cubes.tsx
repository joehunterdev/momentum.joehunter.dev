import { useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';
import './Cubes.css';

interface CubesProps {
    gridSize?: number;
    cubeSize?: number;
    maxAngle?: number;
    radius?: number;
    easing?: string;
    duration?: { enter: number; leave: number };
    cellGap?: number | { row?: number; col?: number };
    borderStyle?: string;
    faceColor?: string;
    shadow?: boolean | string;
    autoAnimate?: boolean;
    rippleOnClick?: boolean;
    rippleColor?: string;
    rippleSpeed?: number;
    colorPattern?: 'solid' | 'm-shape';
    primaryColor?: string;
    secondaryColor?: string;
}

const Cubes = ({
    gridSize = 8,
    cubeSize,
    maxAngle = 45,
    radius = 3,
    easing = 'power3.out',
    duration = { enter: 0.3, leave: 0.6 },
    cellGap,
    borderStyle = '1px solid #fff',
    faceColor = '#120F17',
    shadow = false,
    autoAnimate = true,
    rippleOnClick = true,
    rippleColor = '#fff',
    rippleSpeed = 2,
    colorPattern = 'solid',
    primaryColor = '#8B6BAE',
    secondaryColor = '#00E5AA',
}: CubesProps) => {
    const sceneRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
    const userActiveRef = useRef(false);
    const simPosRef = useRef({ x: 0, y: 0 });
    const simTargetRef = useRef({ x: 0, y: 0 });
    const simRAFRef = useRef<number | null>(null);

    const colGap =
        typeof cellGap === 'number'
            ? `${cellGap}px`
            : cellGap?.col !== undefined
                ? `${cellGap.col}px`
                : '5%';
    const rowGap =
        typeof cellGap === 'number'
            ? `${cellGap}px`
            : cellGap?.row !== undefined
                ? `${cellGap.row}px`
                : '5%';

    const enterDur = duration.enter;
    const leaveDur = duration.leave;

    const tiltAt = useCallback(
        (rowCenter: number, colCenter: number) => {
            if (!sceneRef.current) return;
            sceneRef.current.querySelectorAll('.cube').forEach((cube) => {
                const element = cube as HTMLElement;
                const r = +element.dataset.row!;
                const c = +element.dataset.col!;
                const dist = Math.hypot(r - rowCenter, c - colCenter);
                if (dist <= radius) {
                    const pct = 1 - dist / radius;
                    const angle = pct * maxAngle;
                    gsap.to(cube, {
                        duration: enterDur,
                        ease: easing,
                        overwrite: true,
                        rotateX: -angle,
                        rotateY: angle,
                    });
                } else {
                    gsap.to(cube, {
                        duration: leaveDur,
                        ease: 'power3.out',
                        overwrite: true,
                        rotateX: 0,
                        rotateY: 0,
                    });
                }
            });
        },
        [radius, maxAngle, enterDur, leaveDur, easing],
    );

    const onPointerMove = useCallback(
        (e: PointerEvent) => {
            userActiveRef.current = true;
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

            const rect = sceneRef.current!.getBoundingClientRect();
            const cellW = rect.width / gridSize;
            const cellH = rect.height / gridSize;
            const colCenter = (e.clientX - rect.left) / cellW;
            const rowCenter = (e.clientY - rect.top) / cellH;

            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));

            idleTimerRef.current = setTimeout(() => {
                userActiveRef.current = false;
            }, 3000);
        },
        [gridSize, tiltAt],
    );

    const resetAll = useCallback(() => {
        if (!sceneRef.current) return;
        sceneRef.current.querySelectorAll('.cube').forEach((cube) =>
            gsap.to(cube, {
                duration: leaveDur,
                rotateX: 0,
                rotateY: 0,
                ease: 'power3.out',
            }),
        );
    }, [leaveDur]);

    const onTouchMove = useCallback(
        (e: TouchEvent) => {
            e.preventDefault();
            userActiveRef.current = true;
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

            const rect = sceneRef.current!.getBoundingClientRect();
            const cellW = rect.width / gridSize;
            const cellH = rect.height / gridSize;

            const touch = e.touches[0];
            const colCenter = (touch.clientX - rect.left) / cellW;
            const rowCenter = (touch.clientY - rect.top) / cellH;

            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));

            idleTimerRef.current = setTimeout(() => {
                userActiveRef.current = false;
            }, 3000);
        },
        [gridSize, tiltAt],
    );

    const onTouchStart = useCallback(() => {
        userActiveRef.current = true;
    }, []);

    const onTouchEnd = useCallback(() => {
        if (!sceneRef.current) return;
        resetAll();
    }, [resetAll]);

    const onClick = useCallback(
        (e: MouseEvent | TouchEvent) => {
            if (!rippleOnClick || !sceneRef.current) return;
            const rect = sceneRef.current.getBoundingClientRect();
            const cellW = rect.width / gridSize;
            const cellH = rect.height / gridSize;

            const clientX =
                'clientX' in e ? e.clientX : e.touches && e.touches[0].clientX;
            const clientY =
                'clientY' in e ? e.clientY : e.touches && e.touches[0].clientY;

            const colHit = Math.floor((clientX! - rect.left) / cellW);
            const rowHit = Math.floor((clientY! - rect.top) / cellH);

            const baseRingDelay = 0.15;
            const baseAnimDur = 0.3;
            const baseHold = 0.6;

            const spreadDelay = baseRingDelay / rippleSpeed;
            const animDuration = baseAnimDur / rippleSpeed;
            const holdTime = baseHold / rippleSpeed;

            const rings: Record<number, Element[]> = {};
            sceneRef.current.querySelectorAll('.cube').forEach((cube) => {
                const element = cube as HTMLElement;
                const r = +element.dataset.row!;
                const c = +element.dataset.col!;
                const dist = Math.hypot(r - rowHit, c - colHit);
                const ring = Math.round(dist);
                if (!rings[ring]) rings[ring] = [];
                rings[ring].push(cube);
            });

            Object.keys(rings)
                .map(Number)
                .sort((a, b) => a - b)
                .forEach((ring) => {
                    const delay = ring * spreadDelay;
                    const faces = rings[ring].flatMap((cube) =>
                        Array.from(cube.querySelectorAll('.cube-face')),
                    );

                    gsap.to(faces, {
                        backgroundColor: rippleColor,
                        duration: animDuration,
                        delay,
                        ease: 'power3.out',
                    });
                    gsap.to(faces, {
                        backgroundColor: faceColor,
                        duration: animDuration,
                        delay: delay + animDuration + holdTime,
                        ease: 'power3.out',
                    });
                });
        },
        [rippleOnClick, gridSize, faceColor, rippleColor, rippleSpeed],
    );

    useEffect(() => {
        if (!autoAnimate || !sceneRef.current) return;
        simPosRef.current = {
            x: Math.random() * gridSize,
            y: Math.random() * gridSize,
        };
        simTargetRef.current = {
            x: Math.random() * gridSize,
            y: Math.random() * gridSize,
        };
        const speed = 0.02;
        const loop = () => {
            if (!userActiveRef.current) {
                const pos = simPosRef.current;
                const tgt = simTargetRef.current;
                pos.x += (tgt.x - pos.x) * speed;
                pos.y += (tgt.y - pos.y) * speed;
                tiltAt(pos.y, pos.x);
                if (Math.hypot(pos.x - tgt.x, pos.y - tgt.y) < 0.1) {
                    simTargetRef.current = {
                        x: Math.random() * gridSize,
                        y: Math.random() * gridSize,
                    };
                }
            }
            simRAFRef.current = requestAnimationFrame(loop);
        };
        simRAFRef.current = requestAnimationFrame(loop);
        return () => {
            if (simRAFRef.current != null) {
                cancelAnimationFrame(simRAFRef.current);
            }
        };
    }, [autoAnimate, gridSize, tiltAt]);

    useEffect(() => {
        const el = sceneRef.current;
        if (!el) return;

        el.addEventListener('pointermove', onPointerMove as any);
        el.addEventListener('pointerleave', resetAll as any);
        el.addEventListener('click', onClick as any);

        el.addEventListener('touchmove', onTouchMove as any, { passive: false });
        el.addEventListener('touchstart', onTouchStart as any, { passive: true });
        el.addEventListener('touchend', onTouchEnd as any, { passive: true });

        return () => {
            el.removeEventListener('pointermove', onPointerMove as any);
            el.removeEventListener('pointerleave', resetAll as any);
            el.removeEventListener('click', onClick as any);

            el.removeEventListener('touchmove', onTouchMove as any);
            el.removeEventListener('touchstart', onTouchStart as any);
            el.removeEventListener('touchend', onTouchEnd as any);

            rafRef.current != null && cancelAnimationFrame(rafRef.current);
            idleTimerRef.current && clearTimeout(idleTimerRef.current);
        };
    }, [onPointerMove, resetAll, onClick, onTouchMove, onTouchStart, onTouchEnd]);

    // Create interlocking shape pattern for colors (like the logo)
    const getCubeBorderColor = (row: number, col: number): string => {
        if (colorPattern === 'solid') return borderStyle.includes('#') ? borderStyle : primaryColor;

        // Purple outer frame - thick rectangular outline
        const isPurpleTopBar = row >= 0 && row <= 2 && col >= 0 && col <= 11;
        const isPurpleLeftBar = row >= 0 && row <= 11 && col >= 0 && col <= 2;
        const isPurpleBottomBar = row >= 9 && row <= 11 && col >= 0 && col <= 11;
        const isPurpleRightPartial = row >= 0 && row <= 4 && col >= 9 && col <= 11;

        // Teal inner frame - thick rectangular outline, interlocking through purple
        const isTealTopBar = row >= 3 && row <= 5 && col >= 3 && col <= 11;
        const isTealRightBar = row >= 3 && row <= 11 && col >= 9 && col <= 11;
        const isTealBottomBar = row >= 9 && row <= 11 && col >= 0 && col <= 11;
        const isTealLeftPartial = row >= 7 && row <= 11 && col >= 0 && col <= 2;

        if (isPurpleTopBar || isPurpleLeftBar || isPurpleBottomBar || isPurpleRightPartial) {
            return primaryColor; // Purple
        } else if (isTealTopBar || isTealRightBar || isTealBottomBar || isTealLeftPartial) {
            return secondaryColor; // Teal
        }

        // All other cubes get grey outline
        return 'rgba(156, 163, 175, 0.3)';
    }; const cells = Array.from({ length: gridSize });
    const sceneStyle: React.CSSProperties = {
        gridTemplateColumns: cubeSize
            ? `repeat(${gridSize}, ${cubeSize}px)`
            : `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: cubeSize
            ? `repeat(${gridSize}, ${cubeSize}px)`
            : `repeat(${gridSize}, 1fr)`,
        columnGap: colGap,
        rowGap: rowGap,
    };
    const wrapperStyle: React.CSSProperties & Record<string, any> = {
        '--cube-face-border': borderStyle,
        '--cube-face-bg': faceColor,
        '--cube-face-shadow':
            shadow === true ? '0 0 6px rgba(0,0,0,.5)' : shadow || 'none',
        ...(cubeSize
            ? {
                width: `${gridSize * cubeSize}px`,
                height: `${gridSize * cubeSize}px`,
            }
            : {}),
    };

    return (
        <div className="default-animation" style={wrapperStyle}>
            <div ref={sceneRef} className="default-animation--scene" style={sceneStyle}>
                {cells.map((_, r) =>
                    cells.map((__, c) => {
                        const cubeBorderColor = getCubeBorderColor(r, c);
                        const cubeStyle = colorPattern === 'm-shape' ? {
                            '--cube-face-border': `1px solid ${cubeBorderColor}`,
                            '--cube-face-bg': 'transparent',
                        } as React.CSSProperties & Record<string, any> : {};

                        return (
                            <div
                                key={`${r}-${c}`}
                                className="cube"
                                data-row={r}
                                data-col={c}
                                style={cubeStyle}
                            >
                                <div className="cube-face cube-face--top" />
                                <div className="cube-face cube-face--bottom" />
                                <div className="cube-face cube-face--left" />
                                <div className="cube-face cube-face--right" />
                                <div className="cube-face cube-face--front" />
                                <div className="cube-face cube-face--back" />
                            </div>
                        );
                    }),
                )}
            </div>
        </div>
    );
};

export default Cubes;
