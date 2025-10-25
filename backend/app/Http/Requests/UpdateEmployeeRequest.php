<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEmployeeRequest extends FormRequest
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
        $employeeId = $this->route('employee');

        return [
            'user_id' => 'nullable|exists:users,id',
            'employee_code' => 'sometimes|string|max:50|unique:employees,employee_code,'.$employeeId,
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:employees,email,'.$employeeId,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female',
            'position' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'hire_date' => 'sometimes|date',
            'employment_type' => 'sometimes|in:full-time,part-time,contract,intern',
            'salary' => 'nullable|numeric|min:0',
            'salary_type' => 'nullable|in:hourly,monthly',
            'emergency_contact' => 'nullable|json',
            'profile_image' => 'nullable|string',
            'status' => 'nullable|in:active,inactive,terminated',
        ];
    }
}
