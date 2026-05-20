<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMomentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'color' => ['nullable', 'string', 'max:7'],
            'icon' => ['nullable', 'string', 'max:10'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            // Schedule
            'frequency' => ['nullable', 'in:daily,weekly,custom,once'],
            'days_of_week' => ['nullable', 'array'],
            'days_of_week.*' => ['integer', 'between:1,7'],
            'preferred_time' => ['nullable', 'date_format:H:i'],
            'scheduled_date' => ['nullable', 'date'],
            // Cue
            'implementation_intention' => ['nullable', 'string', 'max:255'],
            'habit_stack_after' => ['nullable', 'string', 'max:255'],
            'environment_prompt' => ['nullable', 'string', 'max:255'],
            // Reward
            'reward_description' => ['nullable', 'string', 'max:255'],
            'temptation_bundle' => ['nullable', 'string', 'max:255'],
        ];
    }
}
