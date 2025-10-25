<?php

namespace App\Jobs;

use App\Models\Employee;
use App\Models\User;
use App\Models\UserImport;
use Illuminate\Bus\Batchable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use League\Csv\Reader;

class ProcessUserBulkImport implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        protected int $userImportId,
        protected string $filePath,
        protected int $userId
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $userImport = UserImport::findOrFail($this->userImportId);

        // Update status to processing
        $userImport->update(['status' => 'processing']);

        $totalRecords = 0;
        $successfulRecords = 0;
        $failedRecords = 0;
        $errors = [];

        try {
            // Read the CSV file
            $csv = Reader::createFromPath(storage_path('app/'.$this->filePath), 'r');
            $csv->setHeaderOffset(0); // Set the first row as header

            foreach ($csv as $index => $row) {
                $totalRecords++;

                // Validate required fields
                if (empty($row['employee_code']) || empty($row['first_name']) || empty($row['email'])) {
                    $errors[] = [
                        'line' => $index + 2, // +2 because header is offset 0, and we want actual line number
                        'error' => 'Missing required fields: employee_code, first_name, or email',
                        'data' => $row,
                    ];
                    $failedRecords++;

                    continue;
                }

                // Check if employee code already exists
                $existingEmployee = Employee::where('employee_code', $row['employee_code'])->first();
                if ($existingEmployee) {
                    $errors[] = [
                        'line' => $index + 2,
                        'error' => 'Employee with code '.$row['employee_code'].' already exists',
                        'data' => $row,
                    ];
                    $failedRecords++;

                    continue;
                }

                // Check if email already exists
                $existingUser = User::where('email', $row['email'])->first();
                if ($existingUser) {
                    $errors[] = [
                        'line' => $index + 2,
                        'error' => 'User with email '.$row['email'].' already exists',
                        'data' => $row,
                    ];
                    $failedRecords++;

                    continue;
                }

                try {
                    // Create the user account first
                    $user = User::create([
                        'name' => trim(($row['first_name'] ?? '').' '.($row['last_name'] ?? '')),
                        'email' => $row['email'],
                        'password' => bcrypt($row['password'] ?? 'password'), // Use provided password or default
                        'role' => $row['role'] ?? 'employee', // Use provided role or default to employee
                    ]);

                    // Create the employee record
                    $employee = new Employee;
                    $employee->user_id = $user->id;
                    $employee->employee_code = $row['employee_code'];
                    $employee->first_name = $row['first_name'];
                    $employee->last_name = $row['last_name'] ?? '';
                    $employee->phone = $row['phone'] ?? '';
                    $employee->address = $row['address'] ?? '';
                    $employee->date_of_birth = $row['date_of_birth'] ?? null;
                    $employee->gender = $row['gender'] ?? '';
                    $employee->position = $row['position'] ?? '';
                    $employee->department = $row['department'] ?? '';
                    $employee->hire_date = $row['hire_date'] ?? null;
                    $employee->employment_type = $row['employment_type'] ?? 'full-time';
                    $employee->salary = $row['salary'] ?? 0;
                    $employee->salary_type = $row['salary_type'] ?? 'monthly';
                    $employee->status = $row['status'] ?? 'active';

                    $employee->save();

                    $successfulRecords++;
                } catch (\Exception $e) {
                    $errors[] = [
                        'line' => $index + 2,
                        'error' => 'Failed to create user/employee: '.$e->getMessage(),
                        'data' => $row,
                    ];
                    $failedRecords++;
                }
            }

            // Update the user import record with results
            $userImport->update([
                'total_records' => $totalRecords,
                'successful_records' => $successfulRecords,
                'failed_records' => $failedRecords,
                'summary' => [
                    'total' => $totalRecords,
                    'successful' => $successfulRecords,
                    'failed' => $failedRecords,
                    'success_rate' => $totalRecords > 0 ? round(($successfulRecords / $totalRecords) * 100, 2) : 0,
                ],
                'errors' => $errors,
                'status' => $failedRecords > 0 ? ($successfulRecords > 0 ? 'completed' : 'failed') : 'completed',
                'completed_at' => now(),
            ]);

        } catch (\Exception $e) {
            // Update the import record as failed
            $userImport->update([
                'status' => 'failed',
                'errors' => [
                    ['error' => 'Failed to read CSV file: '.$e->getMessage()],
                ],
                'completed_at' => now(),
            ]);
            throw $e;
        }
    }
}
