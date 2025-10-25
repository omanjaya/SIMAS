<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UserImportService
{
    protected $errors = [];

    protected $successCount = 0;

    protected $errorCount = 0;

    /**
     * Import users from CSV data
     */
    public function importFromCsvData(array $csvData, array $options = []): array
    {
        $this->errors = [];
        $this->successCount = 0;
        $this->errorCount = 0;

        // Skip header row
        array_shift($csvData);

        foreach ($csvData as $rowNumber => $data) {
            // Adjust row number to account for header row
            $actualRowNumber = $rowNumber + 2;
            $this->processRow($data, $actualRowNumber, $options);
        }

        return [
            'success_count' => $this->successCount,
            'error_count' => $this->errorCount,
            'errors' => $this->errors,
        ];
    }

    /**
     * Process a single row of CSV data
     */
    protected function processRow(array $data, int $rowNumber, array $options): void
    {
        try {
            // Ensure we have enough data
            if (count($data) < 3) {
                $this->addError($rowNumber, 'Insufficient data in row');

                return;
            }

            // Map CSV columns to user attributes
            $userData = [
                'name' => $data[0] ?? null,
                'email' => $data[1] ?? null,
                'role' => $data[2] ?? 'employee',
                'password' => isset($data[3]) ? Hash::make($data[3]) : Hash::make('password123'),
                'status' => 'active',
            ];

            // Validate user data
            $validator = Validator::make($userData, [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'role' => ['required', Rule::in(['admin', 'teacher', 'employee'])],
                'password' => 'required|string|min:8',
            ]);

            if ($validator->fails()) {
                $this->addError($rowNumber, $validator->errors()->first());

                return;
            }

            // Check for duplicates
            if (User::where('email', $userData['email'])->exists()) {
                $this->addError($rowNumber, "Email already exists: {$userData['email']}");

                return;
            }

            // Create user
            $user = User::create($userData);

            // If role is teacher or employee, create employee record
            if (in_array($user->role, ['teacher', 'employee'])) {
                $firstName = $this->extractFirstName($userData['name']);
                $lastName = $this->extractLastName($userData['name']);

                Employee::create([
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'email' => $userData['email'],
                    'employee_code' => $this->generateEmployeeCode(),
                    'hire_date' => now(),
                    'employment_type' => $options['default_employment_type'] ?? 'full-time',
                    'department' => $options['default_department'] ?? 'General',
                    'position' => $options['default_position'] ?? ucfirst($user->role),
                    'user_id' => $user->id,
                    'status' => 'active',
                ]);
            }

            $this->successCount++;
        } catch (\Exception $e) {
            $this->addError($rowNumber, $e->getMessage());
        }
    }

    /**
     * Add an error to the error list
     */
    protected function addError(int $rowNumber, string $message): void
    {
        $this->errors[] = "Row {$rowNumber}: {$message}";
        $this->errorCount++;
    }

    /**
     * Extract first name from full name
     */
    protected function extractFirstName(string $fullName): string
    {
        $parts = explode(' ', $fullName);

        return $parts[0];
    }

    /**
     * Extract last name from full name
     */
    protected function extractLastName(string $fullName): string
    {
        $parts = explode(' ', $fullName);

        return count($parts) > 1 ? implode(' ', array_slice($parts, 1)) : '';
    }

    /**
     * Generate unique employee code
     */
    protected function generateEmployeeCode(): string
    {
        do {
            $code = 'EMP'.strtoupper(Str::random(5));
        } while (Employee::where('employee_code', $code)->exists());

        return $code;
    }
}
