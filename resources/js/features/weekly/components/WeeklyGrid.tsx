import type { WeekDay, WeeklyConfig } from '../types';
import DaySection from './DaySection';

interface Props {
    days: WeekDay[];
    config: WeeklyConfig;
    onAddMoment: (date: string, time: string, mode: 'once' | 'recurring') => void;
    onToggleMoment: (momentId: number, instanceId: number | null, date: string) => void;
    highlightTime?: string;
}

/** Returns a stable key for the first pending/future moment across all days. */
function findNextMomentKey(days: WeekDay[]): string | null {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const nowMins = now.getHours() * 60 + now.getMinutes();

    for (const day of days) {
        if (day.date < todayStr) continue;
        for (const slot of day.slots) {
            if (!slot.moment) continue;
            if (slot.moment.status === 'completed' || slot.moment.status === 'missed') continue;
            // On today, skip slots that have already passed
            if (day.date === todayStr) {
                const [h, m] = slot.time.split(':').map(Number);
                if (h * 60 + m < nowMins) continue;
            }
            return `${day.date}:${slot.time}:${slot.moment.id}`;
        }
    }
    return null;
}

export default function WeeklyGrid({ days, config, onAddMoment, onToggleMoment, highlightTime }: Props) {
    const nextMomentKey = findNextMomentKey(days);

    return (
        <div className="weekly-grid">
            {days.map((day) => (
                <DaySection
                    key={day.date}
                    day={day}
                    config={config}
                    onAddMoment={onAddMoment}
                    onToggleMoment={onToggleMoment}
                    highlightTime={highlightTime}
                    nextMomentKey={nextMomentKey}
                />
            ))}
        </div>
    );
}
