import type { TimeSlot, WeeklyConfig } from '../types';
import { CalendarMomentCard } from '@/shared/components/calendar';
import { isOutOfOffice } from '../utils';
import MomentAction from './MomentAction';
import { MomentStatus } from '@/shared/types/enums';

interface Props {
    slot: TimeSlot;
    date: string;
    config: WeeklyConfig;
    mode: 'overview' | 'configure';
    isGhost?: boolean;
    isConflict?: boolean;
    ghostName?: string;
    ghostIcon?: string | null;
    onStartScheduling: (date: string, time: string) => void;
    onGhostNameChange?: (name: string) => void;
    onGhostIconChange?: (icon: string | null) => void;
    isToday?: boolean;
    isWeekend?: boolean;
}

/**
 * Single cell wrapper for any calendar view. Renders MomentAction for filled
 * slots, the draft/edit card in configure mode, the OOO dot, or an add button.
 * Used by both DailyContainer and Weekly's DaySection/DayRow.
 */
export default function TimeSlotCell({
    slot,
    date,
    config,
    mode,
    isGhost = false,
    isConflict = false,
    ghostName = '',
    ghostIcon = null,
    onStartScheduling,
    onGhostNameChange,
    onGhostIconChange,
    isToday,
    isWeekend,
}: Props) {
    const ooo = !slot.moment && isOutOfOffice(slot.time, config);

    const cls = [
        'weekly-slot',
        ooo ? 'weekly-slot--ooo' : '',
        isToday ? 'weekly-slot--today' : '',
        isWeekend ? 'weekly-slot--weekend' : '',
        !slot.moment && !ooo && !isGhost ? 'weekly-slot--empty' : '',
        slot.moment?.status === MomentStatus.Completed ? 'weekly-slot--completed' : '',
        isConflict ? 'weekly-slot--conflict' : '',
        mode === 'configure' && !slot.moment && !ooo && !isGhost ? 'weekly-slot--configure-empty' : '',
    ].filter(Boolean).join(' ');

    const timeClickable = mode === 'overview' ? !slot.moment : (!slot.moment && !ooo && !isGhost);

    function handleStartScheduling() {
        onStartScheduling(date, slot.time);
    }

    return (
        <div className={cls}>
            <span
                className={`weekly-slot__time${timeClickable ? ' weekly-slot__time--clickable' : ''}`}
                onClick={timeClickable ? handleStartScheduling : undefined}
                title={timeClickable ? `Add moment at ${slot.time}` : undefined}
            >
                {slot.time}
            </span>
            <div className="weekly-slot__content" style={{ position: 'relative' }}>
                {mode === 'configure' && isGhost ? (
                    <CalendarMomentCard
                        moment={{
                            id: 0,
                            name: ghostName || 'New Moment',
                            description: null,
                            status: null,
                            color: null,
                            icon: ghostIcon,
                            frequency: null,
                            consistency: null,
                            instance_id: null,
                            implementation_intention: null,
                            habit_stack_after: null,
                            environment_prompt: null,
                            progress: null,
                        }}
                        variant="draft"
                        onDraftNameChange={onGhostNameChange}
                        onDraftIconChange={onGhostIconChange}
                    />
                ) : mode === 'configure' && slot.moment ? (
                    <>
                        <CalendarMomentCard moment={slot.moment} variant="edit" />
                        {isConflict && (
                            <span className="weekly-slot__conflict-badge" title="Scheduling conflict">⚠️</span>
                        )}
                    </>
                ) : slot.moment ? (
                    <MomentAction moment={slot.moment} />
                ) : ooo ? (
                    <span className="weekly-slot__ooo-dot" aria-hidden />
                ) : (
                    <button
                        type="button"
                        className={`weekly-slot__add-btn${mode === 'overview' ? ' weekly-slot__add-btn--always-visible' : ''}`}
                        title={`Add moment at ${slot.time}`}
                        onClick={handleStartScheduling}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleStartScheduling(); }}
                    >
                        +
                    </button>
                )}
            </div>
        </div>
    );
}
