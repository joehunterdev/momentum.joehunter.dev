import { format, parseISO } from 'date-fns';
import {
    CalendarSection,
    CalendarSectionHeader,
    CalendarSectionArticle,
} from '@/shared/components/calendar';
import type { CalendarConfig } from '@/shared/components/calendar';
import { getVisibleTimeSlots, firstUnactionedSlot } from '../utils';
import type { IsoDayNumber, SchedulingState } from '@/features/scheduling';

interface Props {
    day: App.Data.WeekDayData;
    config: CalendarConfig;
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

/**
 * Orchestrates the daily view: computes visible slots and renders the day's
 * slot list inside a CalendarSection.
 */
export default function DailyContainer({
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
}: Props) {
    const currentDate = parseISO(day.date);
    const visibleSlots = getVisibleTimeSlots(day.slots, config);
    const nextTime = firstUnactionedSlot([{ date: day.date, slots: visibleSlots }])?.time ?? null;

    return (
        <CalendarSection
            isToday={day.isToday}
            layout="vertical"
            header={
                <CalendarSectionHeader
                    label={day.dayName}
                    sublabel={format(currentDate, 'd MMMM yyyy')}
                    badge={day.isToday ? 'Today' : undefined}
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
                    isToday={day.isToday}
                    isNext={!!nextTime && slot.time === nextTime}
                />
            ))}
        </CalendarSection>
    );
}
