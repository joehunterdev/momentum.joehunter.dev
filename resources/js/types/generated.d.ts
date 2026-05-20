declare namespace App {
    namespace Data {
        export type CueData = {
            implementation_intention: string | null;
            habit_stack_after: string | null;
            environment_prompt: string | null;
        };
        export type DailyPageData = {
            date: string;
            day: App.Data.WeekDayData;
            config: App.Data.UserConfigData;
            completedCount: number;
            totalCount: number;
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
        };
        export type MonthlyDayData = {
            date: string;
            dayName: string;
            isToday: boolean;
            isWeekend: boolean;
            isCurrentMonth: boolean;
            moments: App.Data.MonthlyMomentData[];
            completedCount: number;
            totalCount: number;
        };
        export type MonthlyMomentData = {
            id: number;
            name: string;
            icon: string | null;
            color: string | null;
            status: string | null;
            progress: number | null;
        };
        export type MonthlyPageData = {
            month: string;
            monthStart: string;
            monthEnd: string;
            config: App.Data.UserConfigData;
            days: App.Data.MonthlyDayData[];
            scheduleRows: App.Data.MonthlyScheduleRowData[];
            completedCount: number;
            totalCount: number;
        };
        export type MonthlyScheduleRowData = {
            isoDayNumber: number;
            dayLabel: string;
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
            consistency: number | null;
            status: string | null;
            instance_id: number | null;
            implementation_intention: string | null;
            habit_stack_after: string | null;
            environment_prompt: string | null;
            progress: number | null;
        };
        export type TimeSlotData = {
            time: string;
            moment: App.Data.SlotMomentData | null;
        };
        export type UserConfigData = {
            wake_time: string;
            sleep_time: string;
            office_start: string;
            office_end: string;
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
        export type Frequency = "daily" | "weekly" | "custom" | "once";
    }
}
