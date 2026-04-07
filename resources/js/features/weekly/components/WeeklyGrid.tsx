import type { WeekDay, WeeklyConfig } from '../types';
import DaySection from './DaySection';

interface Props {
    days: WeekDay[];
    config: WeeklyConfig;
    onAddMoment: (date: string, time: string, mode: 'once' | 'recurring') => void;
    onToggleMoment: (momentId: number, instanceId: number | null, date: string) => void;
    highlightTime?: string;
}

export default function WeeklyGrid({ days, config, onAddMoment, onToggleMoment, highlightTime }: Props) {
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
                />
            ))}
        </div>
    );
}
