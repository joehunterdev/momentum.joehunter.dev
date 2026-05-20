import type { CalendarMode, IsoDayNumber, SchedulingState } from '@/features/scheduling';
import {
    CalendarSection,
    CalendarSectionArticle,
    CalendarSectionHeader,
} from '@/shared/components/calendar';

interface Props {
    row: App.Data.MonthlyScheduleRowData;
    mode: CalendarMode;
    scheduling: SchedulingState | null;
    onStartScheduling: (isoDay: number) => void;
    onDraftNameChange: (name: string) => void;
    onDraftIconChange: (icon: string | null) => void;
}

const WEEKEND_ISO_DAYS = [6, 7];

function toSlotMoment(m: App.Data.MomentData): App.Data.SlotMomentData {
    return {
        id: m.id,
        name: m.name,
        description: m.description ?? null,
        icon: m.icon ?? null,
        color: m.color ?? null,
        frequency: m.schedule?.frequency ?? null,
        consistency: null,
        status: null,
        instance_id: null,
        implementation_intention: m.cue?.implementation_intention ?? null,
        habit_stack_after: m.cue?.habit_stack_after ?? null,
        environment_prompt: m.cue?.environment_prompt ?? null,
        progress: null,
    };
}

export default function MonthlyScheduleRow({
    row,
    mode,
    scheduling,
    onStartScheduling,
    onDraftNameChange,
    onDraftIconChange,
}: Props) {
    const isWeekend = WEEKEND_ISO_DAYS.includes(row.isoDayNumber);
    const isoDayNumber = row.isoDayNumber as IsoDayNumber;

    const targetsThisDay =
        scheduling !== null
        && scheduling.kind === 'recurring'
        && scheduling.daysOfWeek.includes(isoDayNumber);

    return (
        <CalendarSection
            isWeekend={isWeekend}
            layout="horizontal"
            header={<CalendarSectionHeader label={row.dayLabel} />}
        >
            {/* One article per existing moment */}
            {row.moments.map((m) => (
                <CalendarSectionArticle
                    key={m.id}
                    slotKey={`${row.isoDayNumber}:moment-${m.id}`}
                    isoDayNumber={row.isoDayNumber}
                    moment={toSlotMoment(m)}
                    mode={mode}
                    scheduling={scheduling}
                    capabilities={{ editButton: true }}
                />
            ))}

            {/* Draft article when scheduling targets this day */}
            {targetsThisDay && (
                <CalendarSectionArticle
                    key="draft"
                    slotKey={`${row.isoDayNumber}:draft`}
                    isoDayNumber={row.isoDayNumber}
                    moment={null}
                    mode={mode}
                    scheduling={scheduling}
                    capabilities={{ draftEdit: true }}
                    onDraftNameChange={onDraftNameChange}
                    onDraftIconChange={onDraftIconChange}
                />
            )}

            {/* Always-present add article at the end of the row */}
            <CalendarSectionArticle
                key="add"
                slotKey={`${row.isoDayNumber}:add`}
                isoDayNumber={row.isoDayNumber}
                moment={null}
                mode={mode}
                scheduling={null}
                capabilities={{ addOnEmpty: true }}
                onStartScheduling={() => onStartScheduling(row.isoDayNumber)}
            />
        </CalendarSection>
    );
}
