import type { WeekDay, WeeklyConfig } from '../types';
import DaySection from './DaySection';

interface SchedulingState {
    time: string;
    frequency: 'daily' | 'weekly' | 'custom';
    daysOfWeek: number[];
    name: string;
    icon: string | null;
}

interface Props {
    days: WeekDay[];
    config: WeeklyConfig;
    mode: 'overview' | 'configure';
    scheduling: SchedulingState | null;
    onStartScheduling: (date: string, time: string) => void;
    onGhostNameChange: (name: string) => void;
    onGhostIconChange: (icon: string | null) => void;
}

const VISIBLE_SLOTS = 6;

/** Returns the start index into the hourly slot array so all days show the same time window. */
function computeWindowStart(days: WeekDay[]): number {
    // Gather all unique hourly times across the week
    const allTimes = Array.from(
        new Set(days.flatMap((d) => d.slots.map((s) => s.time).filter((t) => t.endsWith(':00'))))
    ).sort();

    if (allTimes.length <= VISIBLE_SLOTS) return 0;

    const nowHour = new Date().getHours();
    const nowTime = `${String(nowHour).padStart(2, '0')}:00`;

    let anchorIdx = allTimes.findIndex((t) => t >= nowTime);
    if (anchorIdx < 0) anchorIdx = allTimes.length - 1;

    const half = Math.floor(VISIBLE_SLOTS / 2);
    return Math.max(0, Math.min(anchorIdx - half, allTimes.length - VISIBLE_SLOTS));
}

export default function WeeklyGrid({ days, config, mode, scheduling, onStartScheduling, onGhostNameChange, onGhostIconChange }: Props) {
    const windowStart = computeWindowStart(days);

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
