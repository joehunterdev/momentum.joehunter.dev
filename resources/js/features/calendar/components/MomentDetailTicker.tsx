import { useEffect, useRef, useState } from 'react';
import type { CalendarMoment } from '../types';

interface Slide {
    label: string;
    text: string;
}

function buildSlides(moment: CalendarMoment): Slide[] {
    const slides: Slide[] = [];
    if (moment.description) slides.push({ label: 'About', text: moment.description });
    if (moment.implementation_intention) slides.push({ label: 'Cue', text: moment.implementation_intention });
    if (moment.habit_stack_after) slides.push({ label: 'Stack', text: moment.habit_stack_after });
    if (moment.environment_prompt) slides.push({ label: 'Env', text: moment.environment_prompt });
    return slides;
}

// Shared timer state keyed by moment id so badge + track stay in sync
type SharedState = { active: number; animating: boolean; slides: Slide[] };
const shared = new Map<number, SharedState>();
const listeners = new Map<number, Set<() => void>>();

function getState(moment: CalendarMoment): SharedState {
    if (!shared.has(moment.id)) {
        shared.set(moment.id, { active: 0, animating: false, slides: buildSlides(moment) });
        listeners.set(moment.id, new Set());
    }
    return shared.get(moment.id)!;
}

function notify(id: number) {
    listeners.get(id)?.forEach((fn) => fn());
}

function useSharedTicker(moment: CalendarMoment) {
    const [, forceRender] = useState(0);

    useEffect(() => {
        getState(moment);
        const fn = () => forceRender((n) => n + 1);
        listeners.get(moment.id)!.add(fn);
        return () => { listeners.get(moment.id)?.delete(fn); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [moment.id]);

    return getState(moment);
}

interface Props {
    moment: CalendarMoment;
    part: 'badge' | 'track';
}

export default function MomentDetailTicker({ moment, part }: Props) {
    const state = useSharedTicker(moment);
    const textRef = useRef<HTMLSpanElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const [shouldScroll, setShouldScroll] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Drive timer only from the track instance to avoid double-advancing
    useEffect(() => {
        if (part !== 'track') return;
        if (state.slides.length <= 1) return;

        timerRef.current = setTimeout(function tick() {
            const s = getState(moment);
            s.animating = true;
            notify(moment.id);
            setTimeout(() => {
                s.active = (s.active + 1) % s.slides.length;
                s.animating = false;
                notify(moment.id);
            }, 300);
            timerRef.current = setTimeout(tick, 5000);
        }, 5000);

        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [moment.id, state.slides.length, part]);

    // Measure overflow after slide change
    useEffect(() => {
        if (part !== 'track') return;
        const el = textRef.current;
        const track = trackRef.current;
        if (el && track) {
            const overflows = el.scrollWidth > track.clientWidth + 4;
            setShouldScroll(overflows);
            if (overflows) track.style.setProperty('--ticker-track-width', `${track.clientWidth}px`);
        }
    }, [state.active, part]);

    if (state.slides.length === 0) return null;
    const slide = state.slides[state.active];

    if (part === 'badge') {
        return <span className="moment-detail-ticker__badge">{slide?.label}</span>;
    }

    return (
        <div
            ref={trackRef}
            className={`moment-detail-ticker__track${state.animating ? ' moment-detail-ticker__track--out' : ''
                }`}
        >
            <span
                ref={textRef}
                className={`moment-detail-ticker__text${shouldScroll ? ' moment-detail-ticker__text--scroll' : ''
                    }`}
            >
                {slide?.text}
            </span>
            <span className="moment-detail-ticker__fade" aria-hidden />
        </div>
    );
}
