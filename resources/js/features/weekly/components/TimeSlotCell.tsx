import { useRef, useState } from 'react';
import type { TimeSlot, WeeklyConfig } from '../types';
import { isOutOfOffice } from '@/shared/components/calendar';
import AddSlotPopover from './AddSlotPopover';
import SlotMomentCard from './SlotMomentCard';

interface Props {
    slot: TimeSlot;
    date: string;
    config: WeeklyConfig;
    mode: 'overview' | 'configure';
    isGhost?: boolean;
    isConflict?: boolean;
    onStartScheduling: (date: string, time: string) => void;
    onGhostNameChange: (name: string) => void;
    onGhostIconChange: (icon: string | null) => void;
    ghostName: string;
    ghostIcon: string | null;
    isWeekend?: boolean;
    isToday?: boolean;
}

export default function TimeSlotCell({
    slot,
    date,
    config,
    mode,
    isGhost,
    isConflict,
    onStartScheduling,
    onGhostNameChange,
    onGhostIconChange,
    ghostName,
    ghostIcon,
    isWeekend,
    isToday,
}: Props) {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const addBtnRef = useRef<HTMLButtonElement>(null);
    const ooo = isOutOfOffice(slot.time, config);

    const cls = [
        'weekly-slot',
        ooo && !slot.moment ? 'weekly-slot--ooo' : '',
        isWeekend ? 'weekly-slot--weekend' : '',
        isToday ? 'weekly-slot--today' : '',
        !slot.moment && !ooo && mode === 'configure' ? 'weekly-slot--empty' : '',
        isConflict ? 'weekly-slot--conflict' : '',
    ]
        .filter(Boolean)
        .join(' ');

    // ── Overview mode ─────────────────────────────────────────────────────────
    if (mode === 'overview') {
        const emptyClickable = !slot.moment;
        return (
            <div
                className={[
                    cls,
                    emptyClickable && !ooo ? 'weekly-slot--overview-empty' : '',
                ].filter(Boolean).join(' ')}
            >
                <span
                    className={`weekly-slot__time${emptyClickable ? ' weekly-slot__time--clickable' : ''}`}
                    onClick={emptyClickable ? () => onStartScheduling(date, slot.time) : undefined}
                    title={emptyClickable ? `Add moment at ${slot.time}` : undefined}
                >
                    {slot.time}
                </span>
                <div className="weekly-slot__content">
                    {slot.moment ? (
                        <SlotMomentCard moment={slot.moment} variant="overview" />
                    ) : ooo ? (
                        <span className="weekly-slot__ooo-dot" aria-hidden />
                    ) : (
                        <button
                            type="button"
                            className="weekly-slot__add-btn weekly-slot__add-btn--always-visible"
                            title={`Add moment at ${slot.time}`}
                            onClick={() => onStartScheduling(date, slot.time)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onStartScheduling(date, slot.time); }}
                        >
                            +
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // ── Configure mode ────────────────────────────────────────────────────────
    const configEmptyClickable = !slot.moment && !isGhost && !ooo;
    return (
        <div className={cls}>
            <span
                className={`weekly-slot__time${configEmptyClickable ? ' weekly-slot__time--clickable' : ''}`}
                onClick={configEmptyClickable ? () => onStartScheduling(date, slot.time) : undefined}
                title={configEmptyClickable ? `Add moment at ${slot.time}` : undefined}
            >
                {slot.time}
            </span>
            <div className="weekly-slot__content" style={{ position: 'relative' }}>
                {isGhost ? (
                    <SlotMomentCard
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
                        }}
                        variant="ghost"
                        onGhostNameChange={onGhostNameChange}
                        onGhostIconChange={onGhostIconChange}
                    />
                ) : slot.moment ? (
                    <>
                        <SlotMomentCard moment={slot.moment} variant="configure" />
                        {isConflict && <span className="weekly-slot__conflict-badge" title="Scheduling conflict">⚠️</span>}
                    </>
                ) : (
                    <>
                        <button
                            ref={addBtnRef}
                            type="button"
                            className="weekly-slot__add-btn"
                            title={`Add moment at ${slot.time}`}
                            onClick={() => onStartScheduling(date, slot.time)}
                        >
                            +
                        </button>
                        <AddSlotPopover
                            isOpen={popoverOpen}
                            anchorRef={addBtnRef}
                            onClose={() => setPopoverOpen(false)}
                            onSelectOnce={() => { setPopoverOpen(false); onStartScheduling(date, slot.time); }}
                            onSelectRecurring={() => { setPopoverOpen(false); onStartScheduling(date, slot.time); }}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
