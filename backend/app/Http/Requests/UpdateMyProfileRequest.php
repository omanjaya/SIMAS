<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMyProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Already authenticated via middleware
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|string|max:500',  // Keep for backward compatibility
            'address_ktp' => 'sometimes|string|max:500',  // NEW
            'address_domisili' => 'sometimes|string|max:500',  // NEW
            // Note: rank, job_class, tpp_amount, secondary_position should be admin-only
            // Not editable by regular users
        ];
    }

    public function messages(): array
    {
        return [
            'name.string' => 'Name must be a string',
            'name.max' => 'Name cannot exceed 255 characters',
            'phone.string' => 'Phone must be a string',
            'phone.max' => 'Phone cannot exceed 20 characters',
            'address.string' => 'Address must be a string',
            'address.max' => 'Address cannot exceed 500 characters',
        ];
    }
}