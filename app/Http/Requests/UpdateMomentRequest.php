<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class UpdateMomentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $moment = $this->route('moment');

        return $moment && $moment->user_id === $this->user()->id;
    }

    /**
     * Log validation failures before the 422 is thrown, so a rejected save is
     * visible in storage/logs/laravel.log instead of failing silently in the UI.
     */
    protected function failedValidation(Validator $validator): void
    {
        Log::warning('[MomentController@update] validation failed', [
            'user_id' => $this->user()?->id,
            'moment_id' => $this->route('moment')?->id,
            'errors' => $validator->errors()->toArray(),
            'input' => $this->all(),
        ]);

        parent::failedValidation($validator);
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
            'icon' => ['nullable', 'string', 'max:64'],
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
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],

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
