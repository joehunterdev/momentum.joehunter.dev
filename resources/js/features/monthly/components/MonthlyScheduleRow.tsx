import type { SchedulingState } from '@/features/weekly/types';
import DayRowShell from '@/shared/components/schedule/DayRowShell';
import MomentSlotCell from './MomentSlotCell';

interface Props {
    row: App.Data.MonthlyScheduleRowData;
    scheduling: SchedulingState | null;
    onStartScheduling: (isoDay: number) => void;
    onGhostNameChange: (name: string) => void;
    onGhostIconChange: (icon: string | null) => void;
}

const WEEKEND_DAYS = [6, 7];

export default function MonthlyScheduleRow({
    row,
    scheduling,
    onStartScheduling,
    onGhostNameChange,
    onGhostIconChange,
}: Props) {
    const isWeekend = WEEKEND_DAYS.includes(row.isoDayNumber);

    const schedulingThisDay =
        scheduling !== null &&
        scheduling.frequency !== 'once' &&
        scheduling.daysOfWeek.includes(row.isoDayNumber);

    return (
        <DayRowShell
            label={row.dayLabel}
            isWeekend={isWeekend}
            slotsLayout="horizontal"
        >
            {/* One cell per existing moment */}
            {row.moments.map((m) => (
                <MomentSlotCell
                    key={m.id}
                    moment={m}
                    isGhost={false}
                    scheduling={scheduling}
                    onStartScheduling={() => onStartScheduling(row.isoDayNumber)}
                    onGhostNameChange={onGhostNameChange}
                    onGhostIconChange={onGhostIconChange}
                />
            ))}

            {/* Ghost card when scheduling targets this day */}
            {schedulingThisDay && (
                <MomentSlotCell
                    key="ghost"
                    moment={null}
                    isGhost
                    scheduling={scheduling}
                    onStartScheduling={() => onStartScheduling(row.isoDayNumber)}
                    onGhostNameChange={onGhostNameChange}
                    onGhostIconChange={onGhostIconChange}
                />
            )}

            {/* Add button — always one empty slot at the end */}
            <MomentSlotCell
                key="add"
                moment={null}
                isGhost={false}
                scheduling={null}
                onStartScheduling={() => onStartScheduling(row.isoDayNumber)}
                onGhostNameChange={onGhostNameChange}
                onGhostIconChange={onGhostIconChange}
            />
        </DayRowShell>
    );
}
