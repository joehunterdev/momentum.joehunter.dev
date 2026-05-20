<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserConfigRequest extends FormRequest
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
            'wake_time' => ['required', 'date_format:H:i'],
            'sleep_time' => ['required', 'date_format:H:i'],
            'week_starts_on' => ['required', 'integer', 'between:1,7'],
            'office_start' => ['required', 'date_format:H:i'],
            'office_end' => ['required', 'date_format:H:i', 'after:office_start'],
            'identity_statement' => ['nullable', 'string', 'max:500'],
        ];
    }
}
