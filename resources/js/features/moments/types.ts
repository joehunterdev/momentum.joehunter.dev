// Types are generated from PHP DTOs — do not edit manually.
// Run `php artisan typescript:transform` to regenerate.

// Re-export generated types under the names the feature uses
export type MomentSchedule = App.Data.MomentScheduleData;
export type Cue = App.Data.CueData;
export type Reward = App.Data.RewardData;
export type Moment = App.Data.MomentData;

/** Flat form shape submitted to MomentController@store/update — not a DTO */
export interface MomentFormData {
    name: string;
    description: string;
    color: string;
    icon: string;
    sort_order: number;
    is_active: boolean;
    // Schedule
    frequency: App.Enums.Frequency;
    days_of_week: number[];
    preferred_time: string;
    /** ISO date (yyyy-MM-dd); null defaults to moment's created_at. */
    start_date: string | null;
    /** Horizon — ISO date (yyyy-MM-dd) the habit stops after; null = ongoing. */
    end_date: string | null;
    // Cue
    implementation_intention: string;
    habit_stack_after: string;
    environment_prompt: string;
    // Reward
    reward_description: string;
    temptation_bundle: string;
}
