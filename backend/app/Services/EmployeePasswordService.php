<?php

namespace App\Services;

class EmployeePasswordService
{
    /**
     * Generate password based on employee code pattern
     *
     * @return string Generated password
     */
    public function generatePassword(string $employeeCode): string
    {
        return $employeeCode.'@Saraswati';
    }

    /**
     * Check if a password matches the expected pattern for an employee code
     */
    public function matchesPattern(string $employeeCode, string $password): bool
    {
        $expectedPassword = $this->generatePassword($employeeCode);

        return hash_equals($expectedPassword, $password);
    }

    /**
     * Get password pattern explanation for documentation
     */
    public function getPatternDescription(): string
    {
        return '{employee_code}@Saraswati';
    }

    /**
     * Validate if a password follows the expected pattern
     */
    public function followsPattern(string $password): bool
    {
        // Pattern: ends with @Saraswati
        return str_ends_with($password, '@Saraswati');
    }
}
