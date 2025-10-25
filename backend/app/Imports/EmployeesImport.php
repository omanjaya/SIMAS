<?php

namespace App\Imports;

use App\Models\Employee;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class EmployeesImport implements ToModel, WithHeadingRow, WithValidation
{
    private $successCount = 0;

    private $failedCount = 0;

    private $errors = [];

    public function model(array $row)
    {
        try {
            $employee = Employee::create([
                'employee_code' => $row['employee_code'] ?? null,
                'first_name' => $row['first_name'] ?? null,
                'last_name' => $row['last_name'] ?? null,
                'email' => $row['email'] ?? null,
                'phone' => $row['phone'] ?? null,
                'address' => $row['address'] ?? null,
                'date_of_birth' => $row['date_of_birth'] ?? null,
                'gender' => $row['gender'] ?? null,
                'position' => $row['position'] ?? null,
                'department' => $row['department'] ?? null,
                'hire_date' => $row['hire_date'] ?? now(), // Use current date if not provided
                'employment_type' => $row['employment_type'] ?? 'full-time',
                'salary' => $row['salary'] ?? null,
                'salary_type' => $row['salary_type'] ?? 'monthly',
                'emergency_contact' => $row['emergency_contact'] ?? null,
                'profile_image' => $row['profile_image'] ?? null,
                'status' => $row['status'] ?? 'active',
            ]);

            $this->successCount++;

            return $employee;
        } catch (\Exception $e) {
            $this->failedCount++;
            $this->errors[] = [
                'row' => $this->successCount + $this->failedCount + 1,
                'email' => $row['email'] ?? 'N/A',
                'message' => $e->getMessage(),
            ];

            return null;
        }
    }

    public function rules(): array
    {
        return [
            'employee_code' => 'required|string|max:50|unique:employees,employee_code',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|unique:employees,email|max:255',
            'hire_date' => 'required|date',
            'phone' => 'nullable|string|max:20',
            'status' => 'nullable|in:active,inactive,terminated',
            'employment_type' => 'nullable|in:full-time,part-time,contract,intern',
            'salary_type' => 'nullable|in:hourly,monthly',
            'gender' => 'nullable|in:male,female',
        ];
    }

    public function getResult()
    {
        return [
            'total' => $this->successCount + $this->failedCount,
            'success' => $this->successCount,
            'failed' => $this->failedCount,
            'errors' => $this->errors,
        ];
    }
}
