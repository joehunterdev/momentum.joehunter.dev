import type { WeekDay, WeeklyConfig } from '../types';
import type { SchedulingState } from '@/features/scheduling';
import { computeWindowStart } from '@/shared/components/calendar';
import DaySection from './DaySection';

const VISIBLE_SLOTS = 6;

interface Props {
    days: WeekDay[];
    config: WeeklyConfig;
    mode: 'overview' | 'configure';
    scheduling: SchedulingState | null;
    onStartScheduling: (date: string, time: string) => void;
    onGhostNameChange: (name: string) => void;
    onGhostIconChange: (icon: string | null) => void;
}

export default function WeeklyGrid({ days, config, mode, scheduling, onStartScheduling, onGhostNameChange, onGhostIconChange }: Props) {
    const allTimes = Array.from(
        new Set(days.flatMap((d) => d.slots.map((s) => s.time).filter((t) => t.endsWith(':00'))))
    ).sort();
    const windowStart = computeWindowStart(allTimes, VISIBLE_SLOTS);

    return (
        <div className="weekly-grid">
            {days.map((day) => (
                <DaySection
                    key={day.date}
                    day={day}
                    config={config}
                    mode={mode}
                    scheduling={scheduling}
                    onStartScheduling={onStartScheduling}
                    onGhostNameChange={onGhostNameChange}
                    onGhostIconChange={onGhostIconChange}
                    windowStart={windowStart}
                />
            ))}
        </div>
    );
}
