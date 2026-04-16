import { useState } from 'react';
import type { CalendarConfig, TimeSlot } from '@/shared/components/calendar';
import { isOutOfOffice } from '@/shared/components/calendar';
import DailySlotCard from './DailySlotCard';

interface Props {
    slot: TimeSlot;
    date: string;
    config: CalendarConfig;
    onToggleMoment: (momentId: number, instanceId: number | null, date: string) => void;
    isToday?: boolean;
    isNext?: boolean;
}

export default function DailyTimeSlotCell({
    slot,
    date,
    config,
    onToggleMoment,
    isToday,
    isNext,
}: Props) {
    const [swipeProgress, setSwipeProgress] = useState(0);
    const [swipeDone, setSwipeDone] = useState(false);

    const ooo = !slot.moment && isOutOfOffice(slot.time, config);

    const cls = [
        'weekly-slot',
        ooo ? 'weekly-slot--ooo' : '',
        isToday ? 'weekly-slot--today' : '',
        !slot.moment && !ooo ? 'weekly-slot--empty' : '',
        slot.moment?.status === 'completed' ? 'weekly-slot--completed' : '',
        swipeProgress > 0 ? 'weekly-slot--swiping' : '',
        swipeDone ? 'weekly-slot--swipe-done' : '',
    ]
        .filter(Boolean)
        .join(' ');

    function handleSwipeProgress(progress: number) {
        setSwipeProgress(progress);
    }

    function handleToggle(momentId: number, instanceId: number | null, date: string) {
        setSwipeDone(true);
        setSwipeProgress(0);
        setTimeout(() => setSwipeDone(false), 700);
        onToggleMoment(momentId, instanceId, date);
    }

    return (
        <div
            className={cls}
            style={
                swipeProgress > 0
                    ? ({ '--swipe-progress': swipeProgress } as React.CSSProperties)
                    : undefined
            }
        >
            <span className="weekly-slot__time">{slot.time}</span>
            <div className="weekly-slot__content">
                {slot.moment ? (
                    <DailySlotCard
                        moment={slot.moment}
                        date={date}
                        isNext={isNext}
                        onToggle={handleToggle}
                        onSwipeProgress={handleSwipeProgress}
                    />
                ) : ooo ? (
                    <span className="weekly-slot__ooo-dot" aria-hidden />
                ) : (
                    <span className="weekly-slot__empty-label" />
                )}
            </div>
        </div>
    );
}
