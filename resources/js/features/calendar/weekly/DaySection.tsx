import { format, parseISO } from 'date-fns';
import type { TimeSlot, WeekDay, WeeklyConfig } from '../types';
import type { IsoDayNumber, SchedulingState } from '@/features/scheduling';
import { jsToIsoDay } from '../utils';
import { CalendarSection, CalendarSectionHeader, CalendarSectionArticle } from '@/shared/components/calendar';

interface Props {
    day: WeekDay;
    config: WeeklyConfig;
    mode: 'overview' | 'configure';
    scheduling: SchedulingState | null;
    onStartScheduling: (date: string, time: string) => void;
    onGhostNameChange: (name: string) => void;
    onGhostIconChange: (icon: string | null) => void;
    windowStart: number;
}

const VISIBLE_SLOTS = 6;

function getWindowedSlots(slots: TimeSlot[], windowStart: number): TimeSlot[] {
    return slots.slice(windowStart, windowStart + VISIBLE_SLOTS);
}

export default function DaySection({ day, config, mode, scheduling, onStartScheduling, onGhostNameChange, onGhostIconChange, windowStart }: Props) {
    const dateObj = parseISO(day.date);
    const visibleSlots = getWindowedSlots(day.slots, windowStart);
    const dayIso = jsToIsoDay(dateObj.getDay()) as IsoDayNumber;

    return (
        <CalendarSection
            isToday={day.isToday}
            isWeekend={day.isWeekend}
            layout="vertical"
            header={
                <CalendarSectionHeader
                    label={day.dayName}
                    sublabel={format(dateObj, 'd MMM')}
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
                    isWeekend={day.isWeekend}
                    isToday={day.isToday}
                />
            ))}
        </CalendarSection>
    );
}
