<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAttendanceRequest extends FormRequest
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
            'period_id' => 'nullable|exists:periods,id',
            'check_in_time' => 'required|date_format:Y-m-d H:i:s',
            'check_out_time' => 'nullable|date_format:Y-m-d H:i:s|after_or_equal:check_in_time',
            'attendance_type' => 'required|in:manual,face_recognition,rfid',
            'check_in_location' => 'nullable|string',
            'check_out_location' => 'nullable|string',
            'check_in_image_path' => 'nullable|string',
            'check_out_image_path' => 'nullable|string',
            'confidence_score' => 'nullable|numeric|min:0|max:100',
            'biometric_data' => 'nullable|json',
            'status' => 'nullable|in:present,late,half_day',
            'verified_by' => 'nullable|exists:users,id',
        ];
    }
}
