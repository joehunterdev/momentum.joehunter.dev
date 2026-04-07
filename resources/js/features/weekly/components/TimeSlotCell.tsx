import { router } from '@inertiajs/react';
import type { TimeSlot, WeeklyConfig } from '../types';
import SlotMomentIcon from './SlotMomentIcon';

interface Props {
    slot: TimeSlot;
    date: string;
    config: WeeklyConfig;
}

function isOutOfOffice(time: string, config: WeeklyConfig): boolean {
    return time < config.office_start || time >= config.office_end;
}

export default function TimeSlotCell({ slot, date, config }: Props) {
    const ooo = isOutOfOffice(slot.time, config);

    if (slot.moment) {
        return (
            <div className={`weekly-slot${ooo ? ' weekly-slot--ooo' : ''}`}>
                <SlotMomentIcon moment={slot.moment} />
            </div>
        );
    }

    if (ooo) {
        return <div className="weekly-slot weekly-slot--ooo" />;
    }

    return (
        <div className="weekly-slot weekly-slot--empty">
            <button
                type="button"
                className="weekly-slot__add-btn"
                title={`Add moment at ${slot.time}`}
                onClick={() =>
                    router.visit(
                        route('moments.create') + `?day=${date}&time=${slot.time}`,
                    )
                }
            >
                +
            </button>
        </div>
    );
}
