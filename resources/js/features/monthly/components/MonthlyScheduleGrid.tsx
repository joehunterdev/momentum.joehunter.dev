import type { CalendarMode, SchedulingState } from '@/features/scheduling';
import MonthlyScheduleRow from './MonthlyScheduleRow';

interface Props {
    rows: App.Data.MonthlyScheduleRowData[];
    mode: CalendarMode;
    scheduling: SchedulingState | null;
    onStartScheduling: (isoDay: number) => void;
    onDraftNameChange: (name: string) => void;
    onDraftIconChange: (icon: string | null) => void;
}

/**
 * Monthly configure grid — 7 day-of-week rows (Mon–Sun).
 * Each row uses the same CalendarSection as the weekly view,
 * with CalendarSectionArticle for the per-moment cells.
 */
export default function MonthlyScheduleGrid({
    rows,
    mode,
    scheduling,
    onStartScheduling,
    onDraftNameChange,
    onDraftIconChange,
}: Props) {
    return (
        <div className="weekly-grid">
            {rows.map((row) => (
                <MonthlyScheduleRow
                    key={row.isoDayNumber}
                    row={row}
                    mode={mode}
                    scheduling={scheduling}
                    onStartScheduling={onStartScheduling}
                    onDraftNameChange={onDraftNameChange}
                    onDraftIconChange={onDraftIconChange}
                />
            ))}
        </div>
    );
}
