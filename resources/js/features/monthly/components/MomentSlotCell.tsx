import { CalendarMomentCard } from '@/shared/components/calendar';
import type { SchedulingState } from '@/features/weekly/types';

interface Props {
    /** Existing moment, or null for an empty/add slot */
    moment: App.Data.MomentData | null;
    isGhost?: boolean;
    scheduling: SchedulingState | null;
    onStartScheduling: () => void;
    onGhostNameChange: (name: string) => void;
    onGhostIconChange: (icon: string | null) => void;
}

/**
 * Single slot cell for the monthly configure grid.
 * Mirrors TimeSlotCell but holds a moment (no time label, no OOO).
 */
export default function MomentSlotCell({
    moment,
    isGhost,
    scheduling,
    onStartScheduling,
    onGhostNameChange,
    onGhostIconChange,
}: Props) {
    const cls = [
        'weekly-slot',
        'weekly-slot--no-time',
        isGhost ? 'weekly-slot--ghost' : '',
        !moment && !isGhost ? 'weekly-slot--overview-empty' : '',
    ]
        .filter(Boolean)
        .join(' ');

    const ghostMoment: App.Data.SlotMomentData = {
        id: 0,
        name: scheduling?.name || 'New Moment',
        description: null,
        icon: scheduling?.icon ?? null,
        color: null,
        frequency: scheduling?.frequency ?? 'weekly',
        consistency: null,
        status: null,
        instance_id: null,
        implementation_intention: null,
        habit_stack_after: null,
        environment_prompt: null,
    };

    const existingMoment: App.Data.SlotMomentData | null = moment
        ? {
            id: moment.id,
            name: moment.name,
            description: moment.description ?? null,
            icon: moment.icon ?? null,
            color: moment.color ?? null,
            frequency: moment.schedule?.frequency ?? null,
            consistency: null,
            status: null,
            instance_id: null,
            implementation_intention: null,
            habit_stack_after: null,
            environment_prompt: null,
        }
        : null;

    return (
        <div className={cls}>
            <div className="weekly-slot__content">
                {isGhost ? (
                    <CalendarMomentCard
                        moment={ghostMoment}
                        variant="draft"
                        onDraftNameChange={onGhostNameChange}
                        onDraftIconChange={onGhostIconChange}
                    />
                ) : existingMoment ? (
                    <CalendarMomentCard moment={existingMoment} variant="edit" />
                ) : (
                    <button
                        type="button"
                        className="weekly-slot__add-btn weekly-slot__add-btn--always-visible"
                        title="Schedule a moment on this day"
                        onClick={onStartScheduling}
                    >
                        +
                    </button>
                )}
            </div>
        </div>
    );
}
