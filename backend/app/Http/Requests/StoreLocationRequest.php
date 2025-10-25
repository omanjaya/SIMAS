<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:locations,code',
            'address' => 'required|string|max:500',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius_meters' => 'required|integer|min:10|max:5000',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama lokasi wajib diisi',
            'code.required' => 'Kode lokasi wajib diisi',
            'code.unique' => 'Kode lokasi sudah digunakan',
            'latitude.required' => 'Latitude wajib diisi',
            'latitude.between' => 'Latitude harus antara -90 sampai 90',
            'longitude.required' => 'Longitude wajib diisi',
            'longitude.between' => 'Longitude harus antara -180 sampai 180',
            'radius_meters.required' => 'Radius wajib diisi',
            'radius_meters.min' => 'Radius minimal 10 meter',
            'radius_meters.max' => 'Radius maksimal 5000 meter (5km)',
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('is_active')) {
            $this->merge(['is_active' => true]);
        }
    }
}
