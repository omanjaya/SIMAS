<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Period>
 */
class PeriodFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startHour = fake()->numberBetween(6, 10);
        $endHour = $startHour + fake()->numberBetween(1, 4);

        return [
            'name' => fake()->randomElement(['Morning Shift', 'Afternoon Shift', 'Evening Shift', 'Period 1', 'Period 2', 'Period 3', 'Period 4']).' ('.$startHour.':00-'.$endHour.':00)',
            'start_time' => sprintf('%02d:00:00', $startHour),
            'end_time' => sprintf('%02d:00:00', $endHour),
            'code' => fake()->randomElement(['MOR', 'AFT', 'EVE', 'P1', 'P2', 'P3', 'P4']),
            'is_active' => fake()->boolean(90), // 90% chance of being active
            'description' => fake()->sentence(),
            'order' => fake()->numberBetween(1, 10),
        ];
    }

    /**
     * Set the period as active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Set the period as inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
