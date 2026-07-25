declare namespace App {
    namespace Data {
        export type CueData = {
            implementation_intention: string | null;
            habit_stack_after: string | null;
            environment_prompt: string | null;
        };
        export type DailyPageData = {
            from: string;
            whole: boolean;
            days: App.Data.WeekDayData[];
            config: App.Data.UserConfigData;
            completedCount: number;
            totalCount: number;
        };
        export type HabitStatData = {
            id: number;
            name: string;
            icon: string | null;
            color: string | null;
            completionRate: number | null;
            currentStreak: number;
            longestStreak: number;
            cells: string[];
        };
        export type MomentData = {
            id: number;
            name: string;
            description: string | null;
            color: string | null;
            icon: string | null;
            is_active: boolean;
            sort_order: number;
            schedule: App.Data.MomentScheduleData | null;
            cue: App.Data.CueData | null;
            reward: App.Data.RewardData | null;
        };
        export type MomentScheduleData = {
            frequency: App.Enums.Frequency;
            days_of_week: number[] | null;
            preferred_time: string | null;
            start_date: string | null;
            end_date: string | null;
        };
        export type MonthlyDayData = {
            date: string;
            dayName: string;
            isToday: boolean;
            isWeekend: boolean;
            isCurrentMonth: boolean;
            moments: App.Data.SlotMomentData[];
            completedCount: number;
            totalCount: number;
        };
        export type MonthlyPageData = {
            rangeStart: string;
            rangeEnd: string;
            whole: boolean;
            config: App.Data.UserConfigData;
            days: App.Data.MonthlyDayData[];
            scheduleRows: App.Data.MonthlyScheduleRowData[];
            completedCount: number;
            totalCount: number;
        };
        export type MonthlyScheduleRowData = {
            isoDayNumber: number;
            moments: App.Data.MomentData[];
        };
        export type RewardData = {
            description: string | null;
            temptation_bundle: string | null;
        };
        export type SlotMomentData = {
            id: number;
            name: string;
            description: string | null;
            icon: string | null;
            color: string | null;
            frequency: App.Enums.Frequency | null;
            status: App.Enums.MomentStatus | null;
            instance_id: number | null;
            implementation_intention: string | null;
            habit_stack_after: string | null;
            environment_prompt: string | null;
            bar_kind: string;
            bar_value: number | null;
            bar_completed: number | null;
            bar_scheduled_total: number | null;
            bar_days_remaining: number | null;
            bar_end_date: string | null;
        };
        export type StatsPageData = {
            rangeDays: number;
            days: string[];
            summary: App.Data.StatsSummaryData;
            habits: App.Data.HabitStatData[];
            trend: App.Data.TrendPointData[];
        };
        export type StatsSummaryData = {
            completionRate: number;
            totalCompleted: number;
            longestStreak: number;
            missedDays: number;
        };
        export type TimeSlotData = {
            time: string;
            moment: App.Data.SlotMomentData | null;
        };
        export type TrendPointData = {
            date: string;
            rate: number;
        };
        export type UserConfigData = {
            wake_time: string;
            sleep_time: string;
            office_start: string;
            office_end: string;
            friction_level: string;
        };
        export type WeekDayData = {
            date: string;
            dayName: string;
            isToday: boolean;
            isWeekend: boolean;
            slots: App.Data.TimeSlotData[];
        };
        export type WeeklyPageData = {
            weekStart: string;
            weekEnd: string;
            config: App.Data.UserConfigData;
            days: App.Data.WeekDayData[];
            completedCount: number;
            totalCount: number;
        };
    }
    namespace Enums {
        export type Frequency = "daily" | "recurring" | "once";
        export type MomentStatus =
            "pending" | "completed" | "missed" | "skipped";
        export type UserRole = "super_admin" | "admin" | "basic" | "demo";
    }
}
