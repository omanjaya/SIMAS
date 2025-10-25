<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFaceTemplateRequest extends FormRequest
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
            'face_data' => 'required|string', // This could be base64 encoded image or processed face data
            'face_encoding_method' => 'required|string|max:100',
            'face_features' => 'nullable|json',
            'image_path' => 'nullable|string',
            'confidence_threshold' => 'nullable|integer|min:1|max:100',
        ];
    }
}
