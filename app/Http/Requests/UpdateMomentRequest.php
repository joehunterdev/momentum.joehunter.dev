<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMomentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $moment = $this->route('moment');

        return $moment && $moment->user_id === $this->user()->id;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'color' => ['nullable', 'string', 'max:7'],
            'icon' => ['nullable', 'string', 'max:10'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],

            // Schedule — field-frequency contract:
            //   daily     → no days, no scheduled_date
            //   recurring → days_of_week required (non-empty)
            //   once      → scheduled_date required
            'frequency' => ['nullable', 'in:daily,recurring,once'],
            'days_of_week' => [
                'nullable',
                'array',
                // min:1 only when frequency is recurring; daily/once may send [].
                Rule::when(
                    $this->input('frequency') === 'recurring',
                    ['required', 'min:1'],
                ),
            ],
            'days_of_week.*' => ['integer', 'between:1,7'],
            'scheduled_date' => ['required_if:frequency,once', 'nullable', 'date'],
            'preferred_time' => ['nullable', 'date_format:H:i'],

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
