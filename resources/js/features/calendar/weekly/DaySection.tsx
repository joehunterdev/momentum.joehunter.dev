import { format, parseISO } from 'date-fns';
import type { TimeSlot, WeekDay, WeeklyConfig } from '../types';
import type { IsoDayNumber, SchedulingState } from '@/features/scheduling';
import { jsToIsoDay, currentSlotTime } from '../utils';
import { CalendarSection, CalendarSectionHeader, CalendarSectionArticle, CalendarNowToggle } from '@/shared/components/calendar';

interface Props {
    day: WeekDay;
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
    windowStart: number;
    /** The single row to auto-animate across the week (date + slot time), or null. */
    nextSlot: { date: string; time: string } | null;
    /** True when the week is snapped to the current hour (windowed); false = full range. */
    focused: boolean;
    /** Toggle the week's "Now" focus — wired to the badge on today's column only. */
    onToggleNow: () => void;
    /** Past day — rendered dimmed (recap) but still actionable. */
    isPast: boolean;
}

const VISIBLE_SLOTS = 6;

function getWindowedSlots(slots: TimeSlot[], windowStart: number): TimeSlot[] {
    return slots.slice(windowStart, windowStart + VISIBLE_SLOTS);
}

export default function DaySection({
    day,
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
    windowStart,
    nextSlot,
    focused,
    onToggleNow,
    isPast,
}: Props) {
    const dateObj = parseISO(day.date);
    const visibleSlots = focused ? getWindowedSlots(day.slots, windowStart) : day.slots;
    const dayIso = jsToIsoDay(dateObj.getDay()) as IsoDayNumber;
    const nowSlot = day.isToday ? currentSlotTime() : null;

    return (
        <CalendarSection
            isToday={day.isToday}
            isWeekend={day.isWeekend}
            isPast={isPast}
            layout="vertical"
            header={
                <CalendarSectionHeader
                    label={day.dayName}
                    sublabel={format(dateObj, 'd MMM')}
                    badge={day.isToday ? <CalendarNowToggle focused={focused} onToggle={onToggleNow} /> : undefined}
                />
            }
        >
            {visibleSlots.map((slot) => (
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
                    isWeekend={day.isWeekend}
                    isToday={day.isToday}
                    isNext={nextSlot?.date === day.date && nextSlot?.time === slot.time}
                    isNow={slot.time === nowSlot}
                />
            ))}
        </CalendarSection>
    );
}
