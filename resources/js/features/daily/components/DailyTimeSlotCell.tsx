import { useState } from 'react';
import type { CalendarConfig, TimeSlot } from '@/shared/components/calendar';
import type { SchedulingState } from '@/features/scheduling';
import { isOutOfOffice } from '@/shared/components/calendar';
import DailySlotCard from './DailySlotCard';
import { CalendarMomentCard } from '@/shared/components/calendar';

type DailyMode = 'overview' | 'configure';

interface Props {
    slot: TimeSlot;
    date: string;
    config: CalendarConfig;
    onToggleMoment: (momentId: number, instanceId: number | null, date: string) => void;
    isToday?: boolean;
    isNext?: boolean;
    mode: DailyMode;
    scheduling: SchedulingState | null;
    onStartScheduling: (time: string) => void;
    onGhostNameChange: (name: string) => void;
    onGhostIconChange: (icon: string | null) => void;
}

export default function DailyTimeSlotCell({
    slot,
    date,
    config,
    onToggleMoment,
    isToday,
    isNext,
    mode,
    scheduling,
    onStartScheduling,
    onGhostNameChange,
    onGhostIconChange,
}: Props) {
    const [swipeProgress, setSwipeProgress] = useState(0);
    const [swipeDone, setSwipeDone] = useState(false);

    const ooo = !slot.moment && isOutOfOffice(slot.time, config);

    // Check if this slot is being scheduled (ghost card)
    const isSchedulingThisSlot =
        scheduling !== null &&
        slot.time === scheduling.time &&
        (scheduling.kind === 'one-off'
            ? date === scheduling.date
            : true); // For recurring, always show on the target day

    const isGhost = isSchedulingThisSlot && !slot.moment;
    const isConflict = isSchedulingThisSlot && slot.moment !== null;

    const cls = [
        'weekly-slot',
        ooo ? 'weekly-slot--ooo' : '',
        isToday ? 'weekly-slot--today' : '',
        !slot.moment && !ooo && !isGhost ? 'weekly-slot--empty' : '',
        slot.moment?.status === 'completed' ? 'weekly-slot--completed' : '',
        swipeProgress > 0 ? 'weekly-slot--swiping' : '',
        swipeDone ? 'weekly-slot--swipe-done' : '',
        mode === 'configure' && !slot.moment && !ooo && !isGhost ? 'weekly-slot--configure-empty' : '',
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

    // In overview mode, allow clicking empty slots to start scheduling (even if out-of-office)
    const emptyClickable = !slot.moment;
    const timeClickable = ooo && emptyClickable; // Make time clickable for out-of-office slots

    return (
        <div
            className={cls}
            style={
                swipeProgress > 0
                    ? ({ '--swipe-progress': swipeProgress } as React.CSSProperties)
                    : undefined
            }
        >
            <span
                className={`weekly-slot__time${timeClickable ? ' weekly-slot__time--clickable' : ''}`}
                onClick={timeClickable ? () => onStartScheduling(slot.time) : undefined}
                title={timeClickable ? `Add moment at ${slot.time}` : undefined}
            >
                {slot.time}
            </span>
            <div className="weekly-slot__content" style={{ position: 'relative' }}>
                {mode === 'configure' && isGhost ? (
                    <CalendarMomentCard
                        moment={{
                            id: 0,
                            name: scheduling?.name || 'New Moment',
                            description: null,
                            status: null,
                            color: null,
                            icon: scheduling?.icon ?? null,
                            frequency: null,
                            consistency: null,
                            instance_id: null,
                            implementation_intention: null,
                            habit_stack_after: null,
                            environment_prompt: null,
                        }}
                        variant="draft"
                        onDraftNameChange={onGhostNameChange}
                        onDraftIconChange={onGhostIconChange}
                    />
                ) : mode === 'configure' && slot.moment && isConflict ? (
                    <>
                        <DailySlotCard
                            moment={slot.moment}
                            date={date}
                            isNext={false}
                            onToggle={handleToggle}
                            onSwipeProgress={handleSwipeProgress}
                            swipeProgress={swipeProgress}
                        />
                        <span className="weekly-slot__conflict-badge" title="Scheduling conflict">⚠️</span>
                    </>
                ) : slot.moment ? (
                    <DailySlotCard
                        moment={slot.moment}
                        date={date}
                        isNext={isNext}
                        onToggle={handleToggle}
                        onSwipeProgress={handleSwipeProgress}
                        swipeProgress={swipeProgress}
                    />
                ) : ooo ? (
                    <span className="weekly-slot__ooo-dot" aria-hidden />
                ) : mode === 'configure' && !isGhost ? (
                    <button
                        type="button"
                        className="weekly-slot__add-btn"
                        title={`Add moment at ${slot.time}`}
                        onClick={() => onStartScheduling(slot.time)}
                    >
                        +
                    </button>
                ) : emptyClickable ? (
                    <button
                        type="button"
                        className="weekly-slot__add-btn weekly-slot__add-btn--always-visible"
                        title={`Add moment at ${slot.time}`}
                        onClick={() => onStartScheduling(slot.time)}
                    >
                        +
                    </button>
                ) : (
                    <span className="weekly-slot__empty-label" />
                )}
            </div>
        </div>
    );
}
