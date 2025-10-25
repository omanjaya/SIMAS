<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviewAttendanceCorrectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Only admin can review
        return $this->user() && $this->user()->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'status' => 'required|in:approved,rejected',
            'admin_notes' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Review status is required',
            'status.in' => 'Status must be: approved or rejected',
            'admin_notes.max' => 'Admin notes cannot exceed 500 characters',
        ];
    }
}