import { format, parseISO } from 'date-fns';
import type { CalendarConfig, TimeSlot, WeekDay } from '@/shared/components/calendar';
import type { SchedulingState } from '@/features/weekly/types';
import { CalendarSection, CalendarSectionHeader } from '@/shared/components/calendar';
import DailyTimeSlotCell from './DailyTimeSlotCell';

type DailyMode = 'overview' | 'configure';

interface Props {
    day: WeekDay;
    nextDay?: WeekDay | null;
    config: CalendarConfig;
    onToggleMoment: (momentId: number, instanceId: number | null, date: string) => void;
    nextMomentKey?: string | null;
    mode: DailyMode;
    scheduling: SchedulingState | null;
    onStartScheduling: (time: string) => void;
    onGhostNameChange: (name: string) => void;
    onGhostIconChange: (icon: string | null) => void;
}

/** Returns true if this slot time falls on an interval boundary (every N minutes). */
function isIntervalBoundary(time: string, intervalMinutes: number): boolean {
    const [, mm] = time.split(':').map(Number);
    return mm % intervalMinutes === 0;
}

/** All slots from wake through sleep at the configured interval. For today, anchors to current time. */
function getTodaySlots(slots: TimeSlot[], config: CalendarConfig, isToday: boolean, intervalMinutes: number): TimeSlot[] {
    const filtered = slots.filter(
        (s) => isIntervalBoundary(s.time, intervalMinutes) && s.time >= config.wake_time && s.time < config.sleep_time,
    );

    if (!isToday) {
        return filtered;
    }

    const now = new Date();
    const cutoffMinutes = Math.max(0, now.getHours() * 60 + now.getMinutes() - 2 * 60);
    const cutoffRemainder = cutoffMinutes % intervalMinutes;
    const snappedCutoff = cutoffMinutes - cutoffRemainder;
    const cutoffHH = String(Math.floor(snappedCutoff / 60)).padStart(2, '0');
    const cutoffMM = String(snappedCutoff % 60).padStart(2, '0');
    const cutoffTime = `${cutoffHH}:${cutoffMM}`;

    return filtered.filter((s) => s.time >= cutoffTime || s.moment !== null);
}

/**
 * Next-day slots: all hourly slots from wake through sleep.
 * Empty slots beyond the first few are trimmed — we show up to NEXT_DAY_MAX
 * contiguous slots from wake, always including slots that have a moment.
 */
const NEXT_DAY_MAX = 6;

function getNextDaySlots(slots: TimeSlot[], config: CalendarConfig, intervalMinutes: number): TimeSlot[] {
    const filtered = slots.filter(
        (s) => isIntervalBoundary(s.time, intervalMinutes) && s.time >= config.wake_time && s.time < config.sleep_time,
    );

    // Find last slot index that has a moment
    let lastMomentIdx = -1;
    filtered.forEach((s, i) => { if (s.moment) lastMomentIdx = i; });

    // Show up to NEXT_DAY_MAX slots, but always enough to include the last moment
    const showUpTo = Math.max(NEXT_DAY_MAX, lastMomentIdx + 1);
    return filtered.slice(0, showUpTo);
}

export default function DailyGrid({
    day,
    nextDay,
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
    const intervalMinutes = 20;
    const visibleSlots = getTodaySlots(day.slots, config, day.isToday, intervalMinutes);
    const nextDaySlots = nextDay ? getNextDaySlots(nextDay.slots, config, intervalMinutes) : [];
    const showNextDay = nextDay && nextDaySlots.length > 0;

    return (
        <>
            {/* ── Today ─────────────────────────────────────────────────────── */}
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

            {/* ── Next day ──────────────────────────────────────────────────── */}
            {showNextDay && nextDay && (
                <CalendarSection
                    isToday={false}
                    isWeekend={nextDay.isWeekend}
                    layout="vertical"
                    header={
                        <CalendarSectionHeader
                            label={nextDay.dayName}
                            sublabel={format(parseISO(nextDay.date), 'd MMMM yyyy')}
                        />
                    }
                >
                    {nextDaySlots.map((slot) => (
                        <DailyTimeSlotCell
                            key={`${nextDay.date}-${slot.time}`}
                            slot={slot}
                            date={nextDay.date}
                            config={config}
                            onToggleMoment={() => { }}
                            isToday={false}
                            isNext={false}
                            mode={mode}
                            scheduling={scheduling}
                            onStartScheduling={onStartScheduling}
                            onGhostNameChange={onGhostNameChange}
                            onGhostIconChange={onGhostIconChange}
                        />
                    ))}
                </CalendarSection>
            )}
        </>
    );
}
