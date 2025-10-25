<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'admin';
    }

    public function rules(): array
    {
        $locationId = $this->route('location');

        return [
            'name' => 'sometimes|required|string|max:255',
            'code' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('locations', 'code')->ignore($locationId),
            ],
            'address' => 'sometimes|required|string|max:500',
            'latitude' => 'sometimes|required|numeric|between:-90,90',
            'longitude' => 'sometimes|required|numeric|between:-180,180',
            'radius_meters' => 'sometimes|required|integer|min:10|max:5000',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'sometimes|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama lokasi wajib diisi',
            'code.required' => 'Kode lokasi wajib diisi',
            'code.unique' => 'Kode lokasi sudah digunakan',
            'latitude.between' => 'Latitude harus antara -90 sampai 90',
            'longitude.between' => 'Longitude harus antara -180 sampai 180',
            'radius_meters.min' => 'Radius minimal 10 meter',
            'radius_meters.max' => 'Radius maksimal 5000 meter (5km)',
        ];
    }
}
