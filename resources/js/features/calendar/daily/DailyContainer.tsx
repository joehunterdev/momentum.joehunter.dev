import { format, parseISO } from 'date-fns';
import {
    CalendarSection,
    CalendarSectionHeader,
} from '@/shared/components/calendar';
import type { CalendarConfig } from '@/shared/components/calendar';
import { getVisibleTimeSlots, jsToIsoDay } from '../utils';
import type { IsoDayNumber, SchedulingState } from '@/features/scheduling';
import TimeSlotCell from '../components/TimeSlotCell';

interface Props {
    day: App.Data.WeekDayData;
    config: CalendarConfig;
    mode: 'overview' | 'configure';
    scheduling: SchedulingState | null;
    onStartScheduling: (date: string, time: string) => void;
    onGhostNameChange: (name: string) => void;
    onGhostIconChange: (icon: string | null) => void;
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
}: Props) {
    const currentDate = parseISO(day.date);
    const visibleSlots = getVisibleTimeSlots(day.slots, config);
    const dayIso = jsToIsoDay(currentDate.getDay()) as IsoDayNumber;

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
            {visibleSlots.map((slot) => {
                const schedulingThisSlot =
                    scheduling !== null
                    && slot.time === scheduling.time
                    && (scheduling.kind === 'one-off'
                        ? day.date === scheduling.date
                        : scheduling.daysOfWeek.includes(dayIso));

                const isGhost = schedulingThisSlot && !slot.moment;
                const isConflict = schedulingThisSlot && slot.moment !== null;

                return (
                    <TimeSlotCell
                        key={`${day.date}-${slot.time}`}
                        slot={slot}
                        date={day.date}
                        config={config}
                        mode={mode}
                        isGhost={isGhost}
                        isConflict={isConflict}
                        ghostName={scheduling?.name ?? ''}
                        ghostIcon={scheduling?.icon ?? null}
                        onStartScheduling={onStartScheduling}
                        onGhostNameChange={onGhostNameChange}
                        onGhostIconChange={onGhostIconChange}
                        isToday={day.isToday}
                    />
                );
            })}
        </CalendarSection>
    );
}
