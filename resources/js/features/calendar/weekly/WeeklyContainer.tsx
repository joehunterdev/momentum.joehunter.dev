import { parseISO, startOfDay } from 'date-fns';
import type { WeekDay, WeeklyConfig } from '../types';
import type { IsoDayNumber, SchedulingState } from '@/features/scheduling';
import { computeWindowStart } from '../utils';
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
    onDraftApply: () => void;
    onDraftApplyAll: () => void;
    onDraftCancel: () => void;
    onGhostExclude: (isoDay: IsoDayNumber) => void;
}

export default function WeeklyContainer({
    days,
    config,
    mode,
    scheduling,
    onStartScheduling,
    onGhostNameChange,
    onGhostIconChange,
    onDraftApply,
    onDraftApplyAll,
    onDraftCancel,
    onGhostExclude,
}: Props) {
    // On the current week, hide days before today — habits start from now.
    // Past weeks and future weeks render in full.
    const today = startOfDay(new Date());
    const isCurrentWeek = days.some((d) => d.isToday);
    const visibleDays = isCurrentWeek
        ? days.filter((d) => parseISO(d.date) >= today)
        : days;

    const allTimes = Array.from(
        new Set(visibleDays.flatMap((d) => d.slots.map((s) => s.time)))
    ).sort();
    const windowStart = computeWindowStart(allTimes, VISIBLE_SLOTS);

    return (
        <div className="weekly-grid">
            {visibleDays.map((day) => (
                <DaySection
                    key={day.date}
                    day={day}
                    config={config}
                    mode={mode}
                    scheduling={scheduling}
                    onStartScheduling={onStartScheduling}
                    onGhostNameChange={onGhostNameChange}
                    onGhostIconChange={onGhostIconChange}
                    onDraftApply={onDraftApply}
                    onDraftApplyAll={onDraftApplyAll}
                    onDraftCancel={onDraftCancel}
                    onGhostExclude={onGhostExclude}
                    windowStart={windowStart}
                />
            ))}
        </div>
    );
}
