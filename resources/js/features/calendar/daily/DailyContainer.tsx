import { format, parseISO } from 'date-fns';
import {
    CalendarSection,
    CalendarSectionHeader,
    CalendarSectionArticle,
    CalendarNowToggle,
} from '@/shared/components/calendar';
import type { CalendarConfig } from '@/shared/components/calendar';
import { getVisibleTimeSlots, firstUnactionedSlot, currentSlotTime } from '../utils';
import type { IsoDayNumber, SchedulingState } from '@/features/scheduling';

interface Props {
    days: App.Data.WeekDayData[];
    config: CalendarConfig;
    mode: 'overview' | 'configure';
    scheduling: SchedulingState | null;
    /** Horizon mode: false = rolling 24h from now ("Now"), true = whole day ("Today"). */
    whole?: boolean;
    onToggleWhole?: () => void;
    onStartScheduling: (date: string, time: string) => void;
    onGhostNameChange: (name: string) => void;
    onGhostIconChange: (icon: string | null) => void;
    onDraftApply: () => void;
    onDraftApplyAll: () => void;
    onDraftCancel: () => void;
    onGhostExclude: (isoDay: IsoDayNumber) => void;
}

/**
 * Orchestrates the daily view: a rolling 24h window anchored on "now" that may
 * span two calendar dates (today's remaining wake→sleep slots, then tomorrow's
 * up to the same time). Each date is rendered as its own day section. The
 * "Now / Today" toggle lives in the first section's header badge — same slot
 * the weekly view uses — keeping the control consistent across views.
 */
export default function DailyContainer({
    days,
    config,
    mode,
    scheduling,
    whole,
    onToggleWhole,
    onStartScheduling,
    onGhostNameChange,
    onGhostIconChange,
    onDraftApply,
    onDraftApplyAll,
    onDraftCancel,
    onGhostExclude,
}: Props) {
    const nowSlot = currentSlotTime();
    // Single animated "next up" row across the whole window, in chronological order.
    const nextSlot = firstUnactionedSlot(
        days.map((d) => ({ date: d.date, slots: getVisibleTimeSlots(d.slots, config) })),
    );

    return (
        <>
            {days.map((day, i) => {
                const slots = getVisibleTimeSlots(day.slots, config);

                return (
                    <CalendarSection
                        key={day.date}
                        isToday={day.isToday}
                        layout="vertical"
                        header={
                            <CalendarSectionHeader
                                label={day.dayName}
                                sublabel={format(parseISO(day.date), 'd MMMM yyyy')}
                                badge={i === 0 && onToggleWhole
                                    ? <CalendarNowToggle focused={!whole} onToggle={onToggleWhole} idleLabel="Today" />
                                    : undefined}
                            />
                        }
                    >
                        {slots.map((slot) => (
                            <CalendarSectionArticle
                                key={`${day.date}-${slot.time}`}
                                slotKey={`${day.date}-${slot.time}`}
                                date={day.date}
                                time={slot.time}
                                moment={slot.moment}
                                config={config}
                                capabilities={{
                                    addOnEmpty: true,
                                    draftEdit: true,
                                    conflictBadge: true,
                                    outOfOffice: true,
                                }}
                                mode={mode}
                                scheduling={scheduling}
                                onStartScheduling={() => onStartScheduling(day.date, slot.time)}
                                onDraftNameChange={onGhostNameChange}
                                onDraftIconChange={onGhostIconChange}
                                onDraftApply={onDraftApply}
                                onDraftApplyAll={onDraftApplyAll}
                                onDraftCancel={onDraftCancel}
                                onGhostExclude={onGhostExclude}
                                isToday={day.isToday}
                                isNext={nextSlot?.date === day.date && slot.time === nextSlot?.time}
                                isNow={day.isToday && slot.time === nowSlot}
                            />
                        ))}
                    </CalendarSection>
                );
            })}
        </>
    );
}
