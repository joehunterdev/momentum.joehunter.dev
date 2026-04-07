export interface MomentSchedule {
    id: number;
    moment_id: number;
    frequency: 'daily' | 'weekly' | 'custom';
    days_of_week: number[] | null; // 1=Mon … 7=Sun
    preferred_time: string | null; // "HH:mm"
}
export interface Cue {
    id: number;
    moment_id: number;
    implementation_intention: string | null;
    habit_stack_after: string | null;
    environment_prompt: string | null;
}

export interface Reward {
    id: number;
    moment_id: number;
    description: string | null;
    temptation_bundle: string | null;
}

export interface Moment {
    id: number;
    name: string;
    description: string | null;
    color: string | null;
    icon: string | null;
    is_active: boolean;
    sort_order: number;
    schedule: MomentSchedule | null;
    cue: Cue | null;
    reward: Reward | null;
}

/** Flat form shape submitted to MomentController@store/update */
export interface MomentFormData {
    name: string;
    description: string;
    color: string;
    icon: string;
    sort_order: number;
    is_active: boolean;
    // Schedule
    frequency: 'daily' | 'weekly' | 'custom';
    days_of_week: number[];
    preferred_time: string;
    // Cue
    implementation_intention: string;
    habit_stack_after: string;
    environment_prompt: string;
    // Reward
    reward_description: string;
    temptation_bundle: string;
}
