<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSalaryRequest extends FormRequest
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
            'base_salary' => 'sometimes|numeric|min:0',
            'salary_type' => 'sometimes|in:hourly,monthly',
            'hourly_rate' => 'nullable|numeric|min:0',
            'monthly_hours' => 'nullable|integer|min:0',
            'overtime_rate' => 'nullable|numeric|min:0',
            'bonuses' => 'nullable|numeric|min:0',
            'deductions' => 'nullable|numeric|min:0',
            'allowances' => 'nullable|json',
            'tax_components' => 'nullable|json',
            'is_active' => 'boolean',
            'effective_from' => 'sometimes|date',
            'effective_to' => 'nullable|date|after_or_equal:effective_from',
            'pay_grade' => 'nullable|string|max:10',
            'notes' => 'nullable|string',
            'updated_by' => 'nullable|exists:users,id',
        ];
    }
}
