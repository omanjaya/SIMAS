<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ClockInRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'face_image' => 'nullable|string', // Base64 encoded image
            'timestamp' => 'nullable|date_format:Y-m-d H:i:s',
            'device_info' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'latitude.required' => 'Latitude wajib diisi',
            'latitude.between' => 'Latitude tidak valid',
            'longitude.required' => 'Longitude wajib diisi',
            'longitude.between' => 'Longitude tidak valid',
            'timestamp.date_format' => 'Format timestamp harus Y-m-d H:i:s',
        ];
    }

    protected function prepareForValidation(): void
    {
        if (!$this->has('timestamp')) {
            $this->merge(['timestamp' => now()->format('Y-m-d H:i:s')]);
        }
    }
}
