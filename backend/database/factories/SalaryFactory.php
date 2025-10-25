<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\Salary;
use Illuminate\Database\Eloquent\Factories\Factory;

class SalaryFactory extends Factory
{
    protected $model = Salary::class;

    public function definition(): array
    {
        $payGrades = ['A', 'B', 'C', 'D', 'E'];

        $salaryType = $this->faker->randomElement(['monthly', 'hourly']);
        $baseSalary = $this->faker->randomElement([5000000, 7500000, 10000000, 12500000, 15000000]);
        $allowances = $this->faker->randomElement([0, 500000, 1000000, 1500000, 2000000]);
        $deductions = $this->faker->randomElement([0, 250000, 500000, 750000]);

        return [
            'employee_id' => Employee::factory(),
            'base_salary' => $baseSalary,
            'salary_type' => $salaryType,
            'hourly_rate' => $salaryType === 'hourly' ? $this->faker->randomFloat(2, 50000, 150000) : null,
            'monthly_hours' => $salaryType === 'hourly' ? $this->faker->numberBetween(120, 200) : 0,
            'pay_grade' => $this->faker->randomElement($payGrades),
            'allowances' => $allowances,
            'deductions' => $deductions,
            'effective_from' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'effective_to' => null,
            'is_active' => true,
            'notes' => $this->faker->sentence(),
        ];
    }
}
