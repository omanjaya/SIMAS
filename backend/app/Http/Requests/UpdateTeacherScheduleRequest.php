<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTeacherScheduleRequest extends FormRequest
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
        $scheduleId = $this->route('teacherSchedule');

        return [
            'employee_id' => 'sometimes|exists:employees,id',
            'period_id' => 'sometimes|exists:periods,id',
            'subject' => 'sometimes|string|max:255',
            'class_name' => 'sometimes|string|max:255',
            'room_number' => 'nullable|string|max:50',
            'date' => 'sometimes|date',
            'day_of_week' => 'sometimes|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'is_recurring' => 'boolean',
            'schedule_type' => 'sometimes|in:class,meeting,duty,exam_supervision',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ];
    }
}
