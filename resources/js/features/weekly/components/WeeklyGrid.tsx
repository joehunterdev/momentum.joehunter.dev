import type { WeekDay, WeeklyConfig } from '../types';
import DaySection from './DaySection';

interface Props {
    days: WeekDay[];
    config: WeeklyConfig;
    onAddMoment: (date: string, time: string, mode: 'once' | 'recurring') => void;
}

export default function WeeklyGrid({ days, config, onAddMoment }: Props) {
    return (
        <div className="weekly-grid">
            {days.map((day) => (
                <DaySection
                    key={day.date}
                    day={day}
                    config={config}
                    onAddMoment={onAddMoment}
                />
            ))}
        </div>
    );
}
