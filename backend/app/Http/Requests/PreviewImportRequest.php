<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PreviewImportRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only admins can preview imports
        return $this->user()->hasRole('admin');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => 'required|file|mimes:csv,txt|max:10240', // max 10MB
        ];
    }

    /**
     * Get custom messages for validation errors.
     */
    public function messages(): array
    {
        return [
            'file.required' => 'File CSV harus dipilih untuk pratinjau.',
            'file.file' => 'Harus berupa file yang valid.',
            'file.mimes' => 'File harus berupa CSV atau TXT.',
            'file.max' => 'Ukuran file tidak boleh melebihi 10MB.',
        ];
    }
}
