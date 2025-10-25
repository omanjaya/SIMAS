<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeRequest extends FormRequest
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
            'user_id' => 'nullable|exists:users,id',
            'employee_code' => 'required|string|max:50|unique:employees,employee_code',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:employees,email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female',
            'position' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'hire_date' => 'required|date',
            'employment_type' => 'required|in:full-time,part-time,contract,intern',
            'salary' => 'nullable|numeric|min:0',
            'salary_type' => 'nullable|in:hourly,monthly',
            'emergency_contact' => 'nullable|json',
            'profile_image' => 'nullable|string',
            'status' => 'nullable|in:active,inactive,terminated',
        ];
    }
}
