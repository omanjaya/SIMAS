<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class EmployeeCodeService
{
    /**
     * Generate next employee code based on role
     *
     * @param  string  $role  admin, teacher, or employee
     * @return string Generated employee code (e.g., TCH0001, STF0001, ADM0001)
     */
    public function generateNextCode(string $role): string
    {
        $rolePrefixes = [
            'admin' => 'ADM',
            'teacher' => 'TCH',
            'employee' => 'STF',
        ];

        if (! isset($rolePrefixes[$role])) {
            throw new \InvalidArgumentException("Invalid role: {$role}");
        }

        // Get current last number for role with row locking to prevent race condition
        $codeTracker = DB::table('last_employee_codes')
            ->where('role', $role)
            ->lockForUpdate()
            ->first();

        if (! $codeTracker) {
            // This should not happen if the seed data is properly inserted, but just in case
            DB::table('last_employee_codes')->insert([
                'role' => $role,
                'last_number' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $nextNumber = 1;
        } else {
            $nextNumber = $codeTracker->last_number + 1;
        }

        // Format number with leading zeros (4 digits)
        $formattedNumber = str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
        $employeeCode = $rolePrefixes[$role].$formattedNumber;

        // Update the last number in database
        DB::table('last_employee_codes')
            ->where('role', $role)
            ->update([
                'last_number' => $nextNumber,
                'updated_at' => now(),
            ]);

        return $employeeCode;
    }

    /**
     * Get role from employee code prefix
     *
     * @return string Role (admin, teacher, employee)
     */
    public function getRoleFromCode(string $employeeCode): string
    {
        $prefix = substr($employeeCode, 0, 3);

        $roleMap = [
            'ADM' => 'admin',
            'TCH' => 'teacher',
            'STF' => 'employee',
        ];

        return $roleMap[$prefix] ?? throw new \InvalidArgumentException("Invalid employee code prefix: {$prefix}");
    }

    /**
     * Get next number without incrementing the counter (for preview purposes)
     */
    public function getNextNumber(string $role): int
    {
        $codeTracker = DB::table('last_employee_codes')
            ->where('role', $role)
            ->first();

        if (! $codeTracker) {
            return 1; // Default start
        }

        return $codeTracker->last_number + 1;
    }
}
