<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SchoolCalendar>
 */
class SchoolCalendarFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-1 year', '+1 year');
        $endDate = (clone $startDate)->modify('+'.fake()->numberBetween(1, 7).' days');

        return [
            'title' => fake()->randomElement(['National Holiday', 'School Break', 'Exam Period', 'Teacher Meeting', 'Semester Break', 'School Event', 'Parent-Teacher Meeting']),
            'description' => fake()->optional()->sentence(),
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'event_type' => fake()->randomElement(['holiday', 'event', 'exam', 'break', 'other']),
            'color' => fake()->randomElement(['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']),
            'is_recurring' => fake()->boolean(20), // 20% chance of being recurring
            'recurring_pattern' => fake()->optional()->randomElement(['yearly', 'monthly', 'weekly']),
            'recurring_interval' => fake()->optional()->numberBetween(1, 5),
            'metadata' => [
                'organizer' => fake()->name(),
                'location' => fake()->city(),
                'capacity' => fake()->numberBetween(10, 1000),
            ],
            'is_active' => fake()->boolean(95), // 95% chance of being active
        ];
    }

    /**
     * Set the event as a holiday.
     */
    public function holiday(): static
    {
        return $this->state(fn (array $attributes) => [
            'event_type' => 'holiday',
        ]);
    }

    /**
     * Set the event as a school break.
     */
    public function break(): static
    {
        return $this->state(fn (array $attributes) => [
            'event_type' => 'break',
        ]);
    }

    /**
     * Set the event as an exam period.
     */
    public function exam(): static
    {
        return $this->state(fn (array $attributes) => [
            'event_type' => 'exam',
        ]);
    }

    /**
     * Set the event as recurring.
     */
    public function recurring(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_recurring' => true,
        ]);
    }

    /**
     * Set the event as active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }
}
