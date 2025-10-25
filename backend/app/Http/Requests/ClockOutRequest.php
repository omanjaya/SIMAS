<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ClockOutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'attendance_id' => 'required|exists:attendances,id',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'timestamp' => 'nullable|date_format:Y-m-d H:i:s',
            'device_info' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'attendance_id.required' => 'ID attendance wajib diisi',
            'attendance_id.exists' => 'Attendance tidak ditemukan',
            'latitude.required' => 'Latitude wajib diisi',
            'latitude.between' => 'Latitude tidak valid',
            'longitude.required' => 'Longitude wajib diisi',
            'longitude.between' => 'Longitude tidak valid',
        ];
    }

    protected function prepareForValidation(): void
    {
        if (!$this->has('timestamp')) {
            $this->merge(['timestamp' => now()->format('Y-m-d H:i:s')]);
        }
    }
}
