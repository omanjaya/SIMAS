<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSchoolCalendarRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization will be handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'event_type' => 'required|in:holiday,event,exam,break,other',
            'color' => 'nullable|string|max:20',
            'is_recurring' => 'boolean',
            'recurring_pattern' => 'nullable|in:yearly,monthly,weekly',
            'recurring_interval' => 'nullable|integer|min:1',
            'metadata' => 'nullable|json',
            'is_active' => 'boolean',
        ];
    }
}
