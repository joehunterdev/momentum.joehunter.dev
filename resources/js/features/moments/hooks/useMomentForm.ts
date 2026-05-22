import { useForm } from '@inertiajs/react';
import type { Moment, MomentFormData } from '../types';
// Inertia's useForm handles form state, errors, and submission — no Zod needed here.
// Validation lives in the Laravel FormRequest; errors are returned via Inertia's error bag.
const defaults: MomentFormData = {
    name: '',
    description: '',
    color: '#8B5CF6',
    icon: '',
    sort_order: 0,
    is_active: true,
    frequency: 'daily',
    days_of_week: [],
    preferred_time: '',
    implementation_intention: '',
    habit_stack_after: '',
    environment_prompt: '',
    reward_description: '',
    temptation_bundle: '',
};

export function useMomentForm(moment?: Moment, overrides?: Partial<MomentFormData>) {
    return useForm<MomentFormData>({
        ...defaults,
        ...(moment
            ? {
                name: moment.name,
                description: moment.description ?? '',
                color: moment.color ?? '#3B82F6',
                icon: moment.icon ?? '',

                sort_order: moment.sort_order,
                is_active: moment.is_active,
                frequency: moment.schedule?.frequency ?? 'daily',
                days_of_week: moment.schedule?.days_of_week ?? [],
                preferred_time: moment.schedule?.preferred_time ?? '',
                implementation_intention: moment.cue?.implementation_intention ?? '',
                habit_stack_after: moment.cue?.habit_stack_after ?? '',
                environment_prompt: moment.cue?.environment_prompt ?? '',
                reward_description: moment.reward?.description ?? '',
                temptation_bundle: moment.reward?.temptation_bundle ?? '',
            }
            : {}),
        ...(!moment && overrides ? overrides : {}),
    });
}
