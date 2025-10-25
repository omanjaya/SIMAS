<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAttendanceCorrectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Already authenticated
    }

    public function rules(): array
    {
        return [
            'attendance_id' => 'required|exists:attendances,id',
            'correction_type' => 'required|in:clock_in,clock_out,both',
            'new_clock_in_time' => 'nullable|date|required_if:correction_type,clock_in,both',
            'new_clock_out_time' => 'nullable|date|required_if:correction_type,clock_out,both|after:new_clock_in_time',
            'reason' => 'required|string|min:10|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'attendance_id.required' => 'Attendance ID is required',
            'attendance_id.exists' => 'Attendance record not found',
            'correction_type.required' => 'Correction type is required',
            'correction_type.in' => 'Correction type must be: clock_in, clock_out, or both',
            'new_clock_in_time.required_if' => 'New clock-in time is required',
            'new_clock_out_time.required_if' => 'New clock-out time is required',
            'new_clock_out_time.after' => 'Clock-out time must be after clock-in time',
            'reason.required' => 'Reason for correction is required',
            'reason.min' => 'Reason must be at least 10 characters',
            'reason.max' => 'Reason cannot exceed 500 characters',
        ];
    }
}