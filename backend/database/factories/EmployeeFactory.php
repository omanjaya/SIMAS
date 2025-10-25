<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Employee>
 */
class EmployeeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'employee_code' => 'EMP'.str_pad(fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'address' => fake()->address(),
            'address_ktp' => fake()->address(),
            'address_domisili' => fake()->optional(0.7)->address(), // 70% same as KTP (null)
            'date_of_birth' => fake()->date(),
            'gender' => fake()->randomElement(['male', 'female']),
            'position' => fake()->jobTitle(),
            'secondary_position' => fake()->optional(0.3)->jobTitle(), // 30% have secondary position
            'department' => fake()->randomElement(['IT', 'HR', 'Finance', 'Academics', 'Administration', 'Maintenance']),
            'rank' => 'Golongan ' . fake()->randomElement(['III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX']),
            'job_class' => 'Kelas Jabatan ' . fake()->numberBetween(1, 12),
            'tpp_amount' => fake()->randomFloat(2, 3000000, 10000000), // 3-10 juta
            'hire_date' => fake()->date(),
            'employment_type' => fake()->randomElement(['full-time', 'part-time', 'contract', 'intern']),
            'salary' => fake()->randomElement([5000000, 6000000, 7000000, 8000000, 10000000]),
            'salary_type' => fake()->randomElement(['hourly', 'monthly']),
            'emergency_contact' => [
                'name' => fake()->name(),
                'phone' => fake()->phoneNumber(),
                'relationship' => fake()->randomElement(['spouse', 'parent', 'sibling', 'friend']),
            ],
            'profile_image' => null,
            'status' => fake()->randomElement(['active', 'inactive', 'terminated']),
            'user_id' => User::factory(),
        ];
    }

    /**
     * Set the employee as an admin.
     */
    public function admin(): static
    {
        return $this->afterCreating(function ($employee) {
            $employee->user->update(['role' => 'admin']);
        });
    }

    /**
     * Set the employee as a teacher.
     */
    public function teacher(): static
    {
        return $this->afterCreating(function ($employee) {
            $employee->user->update(['role' => 'teacher']);
        });
    }

    /**
     * Set the employee as an employee.
     */
    public function staff(): static
    {
        return $this->afterCreating(function ($employee) {
            $employee->user->update(['role' => 'employee']);
        });
    }
}
