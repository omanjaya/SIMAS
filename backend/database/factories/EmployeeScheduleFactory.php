<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\EmployeeSchedule;
use App\Models\Location;
use Illuminate\Database\Eloquent\Factories\Factory;

class EmployeeScheduleFactory extends Factory
{
    protected $model = EmployeeSchedule::class;

    public function definition(): array
    {
        return [
            'employee_id' => Employee::factory(),
            'location_id' => Location::factory(),
            'day_of_week' => $this->faker->numberBetween(1, 7), // 1=Monday, 7=Sunday
            'start_time' => $this->faker->time('H:i'),
            'end_time' => $this->faker->time('H:i'),
            'late_tolerance_minutes' => $this->faker->numberBetween(5, 30),
            'early_checkout_tolerance_minutes' => $this->faker->numberBetween(5, 30),
            'is_active' => $this->faker->boolean(90), // 90% probability of being active
            'notes' => $this->faker->optional()->sentence(),
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function monday(): static
    {
        return $this->state(fn (array $attributes) => [
            'day_of_week' => 1,
        ]);
    }

    public function tuesday(): static
    {
        return $this->state(fn (array $attributes) => [
            'day_of_week' => 2,
        ]);
    }

    public function wednesday(): static
    {
        return $this->state(fn (array $attributes) => [
            'day_of_week' => 3,
        ]);
    }

    public function thursday(): static
    {
        return $this->state(fn (array $attributes) => [
            'day_of_week' => 4,
        ]);
    }

    public function friday(): static
    {
        return $this->state(fn (array $attributes) => [
            'day_of_week' => 5,
        ]);
    }

    public function saturday(): static
    {
        return $this->state(fn (array $attributes) => [
            'day_of_week' => 6,
        ]);
    }

    public function sunday(): static
    {
        return $this->state(fn (array $attributes) => [
            'day_of_week' => 7,
        ]);
    }
}
