<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SimplifiedImportService
{
    protected EmployeeCodeService $codeService;

    protected EmployeePasswordService $passwordService;

    public function __construct(EmployeeCodeService $codeService, EmployeePasswordService $passwordService)
    {
        $this->codeService = $codeService;
        $this->passwordService = $passwordService;
    }

    /**
     * Process simplified import with 4 columns: full_name, email, hire_date, role
     *
     * @param  array  $data  Array of employee data
     * @return array Result with success/failure counts and errors
     */
    public function processSimplifiedImport(array $data): array
    {
        $successCount = 0;
        $failedCount = 0;
        $errors = [];
        $results = [];

        \Log::info('SimplifiedImportService: Processing import', [
            'total_rows' => count($data),
            'first_row_keys' => ! empty($data) ? array_keys($data[0]) : [],
            'first_row_sample' => ! empty($data) ? $data[0] : null,
        ]);

        // First, validate all entries before processing
        $validationResults = $this->validateSimplifiedData($data);

        if (! $validationResults['valid']) {
            return [
                'success' => false,
                'message' => 'Validation failed',
                'data' => [
                    'total' => count($data),
                    'success' => 0,
                    'failed' => count($data),
                    'errors' => $validationResults['errors'],
                ],
            ];
        }

        // Process each entry
        foreach ($data as $index => $row) {
            try {
                $result = $this->processSingleEntry($row, $index + 2); // +2 because row 1 is header

                if ($result['success']) {
                    $successCount++;
                    $results[] = $result['data'];
                } else {
                    $failedCount++;
                    $errors[] = [
                        'row' => $index + 2,
                        'email' => $row['email'] ?? 'N/A',
                        'message' => $result['message'],
                    ];
                }
            } catch (\Exception $e) {
                $failedCount++;
                $errors[] = [
                    'row' => $index + 2,
                    'email' => $row['email'] ?? 'N/A',
                    'message' => $e->getMessage(),
                ];
            }
        }

        return [
            'success' => true,
            'message' => 'Import completed',
            'data' => [
                'total' => count($data),
                'success' => $successCount,
                'failed' => $failedCount,
                'errors' => $errors,
                'results' => $results,
            ],
        ];
    }

    /**
     * Process a single simplified entry
     */
    protected function processSingleEntry(array $row, int $rowNumber): array
    {
        DB::beginTransaction();

        try {
            // Extract simplified data and normalize
            $fullName = trim($row['full_name'] ?? '');
            $email = trim($row['email'] ?? '');
            $hireDate = trim($row['hire_date'] ?? '');
            $role = strtolower(trim($row['role'] ?? ''));

            // Generate employee code
            $employeeCode = $this->codeService->generateNextCode($role);

            // Generate password
            $password = $this->passwordService->generatePassword($employeeCode);

            // Create user first
            $user = User::create([
                'name' => $fullName,
                'email' => $email,
                'password' => Hash::make($password),
                'role' => $role,
            ]);

            // Create employee with auto-generated and simplified data
            $employee = Employee::create([
                'employee_code' => $employeeCode,
                'first_name' => $fullName,  // Store full name in first name field
                'last_name' => '',          // Empty since we're using full name
                'email' => $email,
                'hire_date' => $hireDate,
                'role' => $role,
                'profile_completed' => false,  // User will complete profile later
                'user_id' => $user->id,
            ]);

            DB::commit();

            return [
                'success' => true,
                'data' => [
                    'row' => $rowNumber,
                    'employee_code' => $employeeCode,
                    'email' => $email,
                    'full_name' => $fullName,
                ],
            ];
        } catch (\Exception $e) {
            DB::rollBack();

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Validate simplified data before import
     */
    protected function validateSimplifiedData(array $data): array
    {
        $errors = [];
        $valid = true;

        foreach ($data as $index => $row) {
            $rowNumber = $index + 2; // +2 because row 1 is header

            // Validate required fields
            if (empty(trim($row['full_name'] ?? ''))) {
                $errors[] = [
                    'row' => $rowNumber,
                    'field' => 'full_name',
                    'message' => 'Full name is required',
                ];
                $valid = false;
            }

            if (empty(trim($row['email'] ?? ''))) {
                $errors[] = [
                    'row' => $rowNumber,
                    'field' => 'email',
                    'message' => 'Email is required',
                ];
                $valid = false;
            } elseif (! filter_var($row['email'], FILTER_VALIDATE_EMAIL)) {
                $errors[] = [
                    'row' => $rowNumber,
                    'field' => 'email',
                    'message' => 'Invalid email format',
                ];
                $valid = false;
            }

            if (empty(trim($row['hire_date'] ?? ''))) {
                $errors[] = [
                    'row' => $rowNumber,
                    'field' => 'hire_date',
                    'message' => 'Hire date is required',
                ];
                $valid = false;
            } elseif (! $this->validateDateFormat($row['hire_date'])) {
                $errors[] = [
                    'row' => $rowNumber,
                    'field' => 'hire_date',
                    'message' => 'Hire date must be in YYYY-MM-DD format',
                ];
                $valid = false;
            }

            $allowedRoles = ['admin', 'teacher', 'employee'];
            if (empty(trim($row['role'] ?? ''))) {
                $errors[] = [
                    'row' => $rowNumber,
                    'field' => 'role',
                    'message' => 'Role is required',
                ];
                $valid = false;
            } elseif (! in_array(strtolower($row['role']), $allowedRoles)) {
                $errors[] = [
                    'row' => $rowNumber,
                    'field' => 'role',
                    'message' => 'Role must be one of: '.implode(', ', $allowedRoles),
                ];
                $valid = false;
            }

            // Check for email duplicates within the file
            $emailCount = 0;
            foreach ($data as $checkRow) {
                if (strtolower($checkRow['email'] ?? '') === strtolower($row['email'] ?? '')) {
                    $emailCount++;
                }
            }
            if ($emailCount > 1) {
                $errors[] = [
                    'row' => $rowNumber,
                    'field' => 'email',
                    'message' => 'Duplicate email found in file',
                ];
                $valid = false;
            }
        }

        return [
            'valid' => $valid,
            'errors' => $errors,
        ];
    }

    /**
     * Validate date format (YYYY-MM-DD)
     */
    protected function validateDateFormat(string $date): bool
    {
        $dateArray = explode('-', $date);
        if (count($dateArray) !== 3) {
            return false;
        }

        [$year, $month, $day] = $dateArray;

        return checkdate((int) $month, (int) $day, (int) $year);
    }
}
