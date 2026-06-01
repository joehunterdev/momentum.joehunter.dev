import { parseISO, startOfDay } from 'date-fns';
import type { WeekDay, WeeklyConfig } from '../types';
import type { IsoDayNumber, SchedulingState } from '@/features/scheduling';
import { computeWindowStart, firstUnactionedSlot } from '../utils';
import { useNowFocus } from '../hooks/useNowFocus';
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
    const { focused, toggle } = useNowFocus(true);

    // Show the whole week — past days included, rendered dimmed (recap), but
    // still actionable so the user can tick off what they did earlier.
    const today = startOfDay(new Date());
    const visibleDays = days;
    const isPastDay = (date: string) => parseISO(date) < today;

    const allTimes = Array.from(
        new Set(visibleDays.flatMap((d) => d.slots.map((s) => s.time)))
    ).sort();
    // Shared window start so every day column stays time-aligned when focused.
    const windowStart = computeWindowStart(allTimes, VISIBLE_SLOTS);
    const sliceForDay = (slots: WeekDay['slots']) =>
        focused ? slots.slice(windowStart, windowStart + VISIBLE_SLOTS) : slots;

    // Single animated "next up" row — forward-looking only, so a past unactioned
    // moment doesn't steal the animation during a recap.
    const nextSlot = firstUnactionedSlot(
        visibleDays
            .filter((d) => !isPastDay(d.date))
            .map((d) => ({ date: d.date, slots: sliceForDay(d.slots) })),
    );

    return (
        <div className="weekly-grid">
            {visibleDays.map((day) => (
                <DaySection
                    key={day.date}
                    day={day}
                    config={config}
                    nextSlot={nextSlot}
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
                    focused={focused}
                    onToggleNow={toggle}
                    isPast={isPastDay(day.date)}
                />
            ))}
        </div>
    );
}
