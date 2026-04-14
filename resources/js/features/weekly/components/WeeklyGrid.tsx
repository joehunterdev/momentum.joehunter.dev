import type { WeekDay, WeeklyConfig } from '../types';
import DaySection from './DaySection';

interface Props {
    days: WeekDay[];
    config: WeeklyConfig;
    onAddMoment: (date: string, time: string, mode: 'once' | 'recurring') => void;
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

export default function WeeklyGrid({ days, config, onAddMoment }: Props) {
    const windowStart = computeWindowStart(days);

    return (
        <div className="weekly-grid">
            {days.map((day) => (
                <DaySection
                    key={day.date}
                    day={day}
                    config={config}
                    onAddMoment={onAddMoment}
                    windowStart={windowStart}
                />
            ))}
        </div>
    );
}
