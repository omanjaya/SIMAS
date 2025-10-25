<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeacherScheduleRequest extends FormRequest
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
            'employee_id' => 'required|exists:employees,id',
            'period_id' => 'required|exists:periods,id',
            'subject' => 'required|string|max:255',
            'class_name' => 'required|string|max:255',
            'room_number' => 'nullable|string|max:50',
            'date' => 'required|date',
            'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'is_recurring' => 'boolean',
            'schedule_type' => 'required|in:class,meeting,duty,exam_supervision',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ];
    }
}
