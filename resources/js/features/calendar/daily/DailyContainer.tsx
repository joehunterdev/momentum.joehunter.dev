import { format, parseISO } from 'date-fns';
import {
    CalendarSection,
    CalendarSectionHeader,
} from '@/shared/components/calendar';
import type { CalendarConfig } from '@/shared/components/calendar';
import { getVisibleTimeSlots } from '@/shared/components/calendar/utils';
import type { SchedulingState } from '@/features/scheduling';
import { MomentStatus } from '@/shared/types/enums';
import DailyTimeSlotCell from '../components/DailyTimeSlotCell';

interface Props {
    day: App.Data.WeekDayData;
    config: CalendarConfig;
    mode: 'overview' | 'configure';
    scheduling: SchedulingState | null;
    onToggleMoment: (momentId: number, instanceId: number | null, date: string) => void;
    onStartScheduling: (time: string) => void;
    onGhostNameChange: (name: string) => void;
    onGhostIconChange: (icon: string | null) => void;
}

/**
 * Orchestrates the daily view: computes visible slots, identifies the next
 * pending moment, and renders the day's slot list inside a CalendarSection.
 */
export default function DailyContainer({
    day,
    config,
    mode,
    scheduling,
    onToggleMoment,
    onStartScheduling,
    onGhostNameChange,
    onGhostIconChange,
}: Props) {
    const currentDate = parseISO(day.date);
    const visibleSlots = getVisibleTimeSlots(day.slots, config, day.isToday);

    const nextMomentKey = (() => {
        for (const slot of day.slots) {
            if (slot.moment && slot.moment.status !== MomentStatus.Completed) {
                return `${day.date}:${slot.time}:${slot.moment.id}`;
            }
        }
        return null;
    })();

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
                <DailyTimeSlotCell
                    key={`${day.date}-${slot.time}`}
                    slot={slot}
                    date={day.date}
                    config={config}
                    onToggleMoment={onToggleMoment}
                    isToday={day.isToday}
                    isNext={
                        !!slot.moment &&
                        nextMomentKey === `${day.date}:${slot.time}:${slot.moment.id}`
                    }
                    mode={mode}
                    scheduling={scheduling}
                    onStartScheduling={onStartScheduling}
                    onGhostNameChange={onGhostNameChange}
                    onGhostIconChange={onGhostIconChange}
                />
            ))}
        </CalendarSection>
    );
}
