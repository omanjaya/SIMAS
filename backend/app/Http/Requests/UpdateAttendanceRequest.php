<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAttendanceRequest extends FormRequest
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
            'check_out_time' => 'required|date_format:Y-m-d H:i:s|after:check_in_time',
            'check_out_location' => 'nullable|string',
            'check_out_image_path' => 'nullable|string',
            'status' => 'nullable|in:present,late,half_day',
            'verified_by' => 'nullable|exists:users,id',
        ];
    }
}
