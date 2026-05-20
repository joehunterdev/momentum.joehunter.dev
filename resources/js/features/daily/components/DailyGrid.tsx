import { format, parseISO } from 'date-fns';
import type { CalendarConfig, TimeSlot, WeekDay } from '@/shared/components/calendar';
import type { SchedulingState } from '@/features/scheduling';
import { CalendarSection, CalendarSectionHeader } from '@/shared/components/calendar';
import DailyTimeSlotCell from './DailyTimeSlotCell';

type DailyMode = 'overview' | 'configure';

const INTERVAL_MINUTES = 30;

interface Props {
    day: WeekDay;
    config: CalendarConfig;
    onToggleMoment: (momentId: number, instanceId: number | null, date: string) => void;
    nextMomentKey?: string | null;
    mode: DailyMode;
    scheduling: SchedulingState | null;
    onStartScheduling: (time: string) => void;
    onGhostNameChange: (name: string) => void;
    onGhostIconChange: (icon: string | null) => void;
}

/** Slots from wake → sleep. For today, anchor to (now - 2h) snapped to interval. */
function getVisibleSlots(slots: TimeSlot[], config: CalendarConfig, isToday: boolean): TimeSlot[] {
    const inWindow = slots.filter(
        (s) => s.time >= config.wake_time && s.time < config.sleep_time,
    );

    if (!isToday) {
        return inWindow;
    }

    const now = new Date();
    const cutoffMinutes = Math.max(0, now.getHours() * 60 + now.getMinutes() - 2 * 60);
    const snappedCutoff = cutoffMinutes - (cutoffMinutes % INTERVAL_MINUTES);
    const cutoffHH = String(Math.floor(snappedCutoff / 60)).padStart(2, '0');
    const cutoffMM = String(snappedCutoff % 60).padStart(2, '0');
    const cutoffTime = `${cutoffHH}:${cutoffMM}`;

    return inWindow.filter((s) => s.time >= cutoffTime || s.moment !== null);
}

export default function DailyGrid({
    day,
    config,
    onToggleMoment,
    nextMomentKey,
    mode,
    scheduling,
    onStartScheduling,
    onGhostNameChange,
    onGhostIconChange
}: Props) {
    const dateObj = parseISO(day.date);
    const visibleSlots = getVisibleSlots(day.slots, config, day.isToday);

    return (
        <CalendarSection
            isToday={day.isToday}
            layout="vertical"
            header={
                <CalendarSectionHeader
                    label={day.dayName}
                    sublabel={format(dateObj, 'd MMMM yyyy')}
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
