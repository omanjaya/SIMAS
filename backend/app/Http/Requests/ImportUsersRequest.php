<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ImportUsersRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only admins can import users
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
            'csv_file' => 'required|file|mimes:csv,txt|max:10240', // max 10MB
        ];
    }

    /**
     * Get custom messages for validation errors.
     */
    public function messages(): array
    {
        return [
            'csv_file.required' => 'File CSV harus dipilih untuk impor.',
            'csv_file.file' => 'Harus berupa file yang valid.',
            'csv_file.mimes' => 'File harus berupa CSV atau TXT.',
            'csv_file.max' => 'Ukuran file tidak boleh melebihi 10MB.',
        ];
    }
}
