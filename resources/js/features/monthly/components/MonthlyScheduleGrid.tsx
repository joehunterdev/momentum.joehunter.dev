import type { SchedulingState } from '@/features/weekly/types';
import MonthlyScheduleRow from './MonthlyScheduleRow';

interface Props {
    rows: App.Data.MonthlyScheduleRowData[];
    scheduling: SchedulingState | null;
    onStartScheduling: (isoDay: number) => void;
    onGhostNameChange: (name: string) => void;
    onGhostIconChange: (icon: string | null) => void;
}

/**
 * Monthly configure grid — 7 day-of-week rows (Mon–Sun).
 * Each row uses the same DayRowShell as the weekly view,
 * with MomentSlotCells instead of TimeSlotCells.
 */
export default function MonthlyScheduleGrid({
    rows,
    scheduling,
    onStartScheduling,
    onGhostNameChange,
    onGhostIconChange,
}: Props) {
    return (
        <div className="weekly-grid">
            {rows.map((row) => (
                <MonthlyScheduleRow
                    key={row.isoDayNumber}
                    row={row}
                    scheduling={scheduling}
                    onStartScheduling={onStartScheduling}
                    onGhostNameChange={onGhostNameChange}
                    onGhostIconChange={onGhostIconChange}
                />
            ))}
        </div>
    );
}

