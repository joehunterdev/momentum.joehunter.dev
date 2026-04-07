import type { WeekDay, WeeklyConfig } from '../types';
import DayRow from './DayRow';

interface Props {
    days: WeekDay[];
    config: WeeklyConfig;
}

export default function WeeklyGrid({ days, config }: Props) {
    // Derive time labels from the first day's slots (all days share the same slot times)
    const timeLabels = days[0]?.slots.map((s) => s.time) ?? [];

    return (
        <div className="weekly-grid">
            {/* Header row — time labels */}
            <div className="weekly-grid__header-row">
                <div className="weekly-grid__day-label-spacer" />
                {timeLabels.map((time) => (
                    <div key={time} className="weekly-grid__time-label">
                        {time}
                    </div>
                ))}
            </div>

            {/* Day rows */}
            {days.map((day) => (
                <DayRow key={day.date} day={day} config={config} />
            ))}
        </div>
    );
}
