<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'employee_id' => 'required|exists:employees,id',
            'location_id' => 'required|exists:locations,id',
            'day_of_week' => 'required|integer|min:1|max:7',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'late_tolerance_minutes' => 'nullable|integer|min:0|max:120',
            'early_checkout_tolerance_minutes' => 'nullable|integer|min:0|max:120',
            'is_active' => 'boolean',
            'notes' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'employee_id.required' => 'Pegawai wajib dipilih',
            'location_id.required' => 'Lokasi wajib dipilih',
            'day_of_week.min' => 'Hari harus antara 1 (Senin) sampai 7 (Minggu)',
            'end_time.after' => 'Jam selesai harus lebih besar dari jam mulai',
        ];
    }

    protected function prepareForValidation(): void
    {
        $defaults = [
            'is_active' => true,
            'late_tolerance_minutes' => 15,
            'early_checkout_tolerance_minutes' => 15,
        ];

        foreach ($defaults as $key => $value) {
            if (! $this->has($key)) {
                $this->merge([$key => $value]);
            }
        }
    }
}
