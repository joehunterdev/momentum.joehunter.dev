import { useState } from 'react';
import type { TimeSlot, WeeklyConfig } from '../types';
import AddSlotPopover from './AddSlotPopover';
import SlotMomentCard from './SlotMomentCard';

interface Props {
    slot: TimeSlot;
    date: string;
    config: WeeklyConfig;
    onAddMoment: (date: string, time: string, mode: 'once' | 'recurring') => void;
    onToggleMoment: (momentId: number, instanceId: number | null, date: string) => void;
    highlightTime?: string;
    isWeekend?: boolean;
    isToday?: boolean;
    isNext?: boolean;
}

function isOutOfOffice(time: string, config: WeeklyConfig): boolean {
    return time < config.office_start || time >= config.office_end;
}

export default function TimeSlotCell({ slot, date, config, onAddMoment, onToggleMoment, highlightTime, isWeekend, isToday, isNext }: Props) {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [swipeProgress, setSwipeProgress] = useState(0);
    const [swipeDone, setSwipeDone] = useState(false);
    const ooo = !slot.moment && isOutOfOffice(slot.time, config);
    const isHighlighted = slot.time === highlightTime && !slot.moment && !isWeekend;

    const cls = [
        'weekly-slot',
        ooo ? 'weekly-slot--ooo' : '',
        isWeekend ? 'weekly-slot--weekend' : '',
        isToday ? 'weekly-slot--today' : '',
        !slot.moment && !ooo ? 'weekly-slot--empty' : '',
        slot.moment?.status === 'completed' ? 'weekly-slot--completed' : '',
        isHighlighted ? 'weekly-slot--highlight' : '',
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
            style={swipeProgress > 0 ? { '--swipe-progress': swipeProgress } as React.CSSProperties : undefined}
        >
            <span className="weekly-slot__time">{slot.time}</span>
            <div className="weekly-slot__content" style={{ position: 'relative' }}>
                {slot.moment ? (
                    <SlotMomentCard
                        moment={slot.moment}
                        date={date}
                        isNext={isNext}
                        onToggle={handleToggle}
                        onSwipeProgress={handleSwipeProgress}
                    />
                ) : ooo ? (
                    <span className="weekly-slot__ooo-dot" aria-hidden />
                ) : (
                    <>
                        <button
                            type="button"
                            className="weekly-slot__add-btn"
                            title={`Add moment at ${slot.time}`}
                            onClick={() => setPopoverOpen(true)}
                        >
                            +
                        </button>
                        <AddSlotPopover
                            isOpen={popoverOpen}
                            onClose={() => setPopoverOpen(false)}
                            onSelectOnce={() => onAddMoment(date, slot.time, 'once')}
                            onSelectRecurring={() => onAddMoment(date, slot.time, 'recurring')}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
