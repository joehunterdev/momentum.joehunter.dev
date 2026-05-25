export interface UserConfig {
    id: number;
    wake_time: string;           // "HH:mm"
    sleep_time: string;          // "HH:mm"
    week_starts_on: number;      // 1–7
    office_start: string;        // "HH:mm"
    office_end: string;          // "HH:mm"
    identity_statement: string | null;
    friction_level: 'auto' | 'none' | 'mid' | 'low';
}
