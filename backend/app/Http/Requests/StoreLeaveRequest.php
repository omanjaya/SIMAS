<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeaveRequest extends FormRequest
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
        $user = $this->user();

        // For non-admin users, employee_id will be set automatically, so not required in request
        // For admin users, employee_id is required to specify which employee the leave is for
        $employeeIdRule = $user && ! $user->isAdmin() ? 'exists:employees,id' : 'required|exists:employees,id';

        return [
            'employee_id' => $employeeIdRule,
            'leave_type' => 'required|in:sick,annual,emergency,personal,maternity,paternity,unpaid',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string',
            'is_paid' => 'boolean',
            'attachments' => 'nullable|json',
        ];
    }
}
