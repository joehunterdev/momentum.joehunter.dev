export type SlotStatus = 'completed' | 'missed' | 'pending' | null;

export interface SlotMoment {
    id: number;
    name: string;
    icon: string | null;
    color: string | null;
    status: SlotStatus;
    instance_id: number | null;
}

export interface TimeSlot {
    time: string; // 'HH:mm'
    moment: SlotMoment | null;
}

export interface WeekDay {
    date: string; // 'YYYY-MM-DD'
    dayName: string; // 'Monday', 'Tuesday', etc.
    isToday: boolean;
    isWeekend: boolean;
    slots: TimeSlot[];
}

export interface WeeklyConfig {
    wake_time: string;
    sleep_time: string;
    office_start: string;
    office_end: string;
}

export interface WeeklyPageProps {
    weekStart: string;
    weekEnd: string;
    config: WeeklyConfig;
    days: WeekDay[];
}
