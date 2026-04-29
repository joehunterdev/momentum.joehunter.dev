import type { WeekDay, WeeklyConfig } from '../types';
import { computeWindowStart } from '@/shared/components/calendar';
import DaySection from './DaySection';

const VISIBLE_SLOTS = 6;

interface Props {
    days: WeekDay[];
    config: WeeklyConfig;
    onAddMoment: (date: string, time: string) => void;
}

export default function WeeklyGrid({ days, config, onAddMoment }: Props) {
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
                    onAddMoment={onAddMoment}
                    windowStart={windowStart}
                />
            ))}
        </div>
    );
}
