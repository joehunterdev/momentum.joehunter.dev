import { useState } from 'react';
import type { IsoDayNumber, SchedulingState } from '@/features/scheduling';
import { SchedulingKind } from '@/shared/types/enums';
import { WEEK_DAYS } from '@/shared/constants/moments';
import Icon from '@/shared/components/Icon';

const ALL_DAYS: IsoDayNumber[] = [1, 2, 3, 4, 5, 6, 7];
const WEEKDAYS: IsoDayNumber[] = [1, 2, 3, 4, 5];

interface Props {
    state: SchedulingState;
    onKindChange: (next: SchedulingKind) => void;
    onDaysChange: (days: IsoDayNumber[]) => void;
    time?: string | null;
    conflictCount?: number;
    /** Optional override for the M/T/W… pill labels. Defaults to WEEK_DAYS. */
    dayLabels?: string[];
    onConfirm: () => void;
    onCancel: () => void;
}

function sameSet(a: IsoDayNumber[], b: IsoDayNumber[]): boolean {
    if (a.length !== b.length) { return false; }
    return b.every((d) => a.includes(d));
}

export default function MomentFrequencyConfig({
    state,
    onKindChange,
    onDaysChange,
    time,
    conflictCount = 0,
    dayLabels,
    onConfirm,
    onCancel,
}: Props) {
    const kind = state.kind;
    const daysOfWeek: IsoDayNumber[] = state.kind === SchedulingKind.Recurring ? state.daysOfWeek : [];

    const isAllDays = sameSet(daysOfWeek, ALL_DAYS);
    const isWeekdays = sameSet(daysOfWeek, WEEKDAYS);

    function toggleDay(day: IsoDayNumber) {
        if (kind !== SchedulingKind.Recurring) { return; }
        const next = daysOfWeek.includes(day)
            ? daysOfWeek.filter((d) => d !== day)
            : [...daysOfWeek, day].sort((a, b) => a - b);
        onDaysChange(next);
    }

    function kindBtnCls(active: boolean) {
        return [
            'calendar-frequency-config__kind-btn',
            active ? 'calendar-frequency-config__kind-btn--active' : '',
        ].filter(Boolean).join(' ');
    }

    function presetBtnCls(active: boolean) {
        return [
            'calendar-frequency-config__preset',
            active ? 'calendar-frequency-config__preset--active' : '',
        ].filter(Boolean).join(' ');
    }

    function dayPillCls(active: boolean) {
        return [
            'calendar-frequency-config__day-pill',
            active ? 'calendar-frequency-config__day-pill--active' : '',
        ].filter(Boolean).join(' ');
    }

    return (
        <div className="calendar-frequency-config">
            {time && <span className="calendar-frequency-config__time">{time}</span>}

            <div className="calendar-frequency-config__kind-group" role="group" aria-label="Schedule kind">
                <button
                    type="button"
                    className={kindBtnCls(kind === SchedulingKind.OneOff)}
                    onClick={() => onKindChange(SchedulingKind.OneOff)}
                >
                    One-off
                </button>
                <button
                    type="button"
                    className={kindBtnCls(kind === SchedulingKind.Recurring)}
                    onClick={() => onKindChange(SchedulingKind.Recurring)}
                >
                    Recurring
                </button>
            </div>

            {kind === 'recurring' && (
                <>
                    <div className="calendar-frequency-config__presets" role="group" aria-label="Preset day patterns">
                        <button
                            type="button"
                            className={presetBtnCls(isAllDays)}
                            onClick={() => onDaysChange([...ALL_DAYS])}
                        >
                            All days
                        </button>
                        <button
                            type="button"
                            className={presetBtnCls(isWeekdays)}
                            onClick={() => onDaysChange([...WEEKDAYS])}
                        >
                            Weekdays
                        </button>
                    </div>

                    <div className="calendar-frequency-config__days" role="group" aria-label="Days of week">
                        {WEEK_DAYS.map((day, i) => (
                            <button
                                key={day.value}
                                type="button"
                                className={dayPillCls(daysOfWeek.includes(day.value))}
                                aria-label={day.full}
                                aria-pressed={daysOfWeek.includes(day.value)}
                                onClick={() => toggleDay(day.value)}
                            >
                                {dayLabels?.[i] ?? day.label}
                            </button>
                        ))}
                    </div>
                </>
            )}

            {conflictCount > 0 && (
                <span
                    className="calendar-frequency-config__conflicts"
                    title={`${conflictCount} time slot(s) already have a moment`}
                >
                    <Icon name="warning" size={16} aria-hidden /> {conflictCount} conflict{conflictCount > 1 ? 's' : ''}
                </span>
            )}

            <div className="calendar-frequency-config__actions">
                <button
                    type="button"
                    className="calendar-frequency-config__cancel"
                    onClick={onCancel}
                >
                    <Icon name="close" size={18} aria-hidden />
                </button>
                <button
                    type="button"
                    className="calendar-frequency-config__confirm"
                    onClick={onConfirm}
                >
                    <Icon name="check" size={18} aria-hidden /> Confirm
                </button>
            </div>
        </div>
    );
}
