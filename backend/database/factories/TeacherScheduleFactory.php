<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\Period;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TeacherSchedule>
 */
class TeacherScheduleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'employee_id' => Employee::factory(),
            'period_id' => Period::factory(),
            'subject' => fake()->randomElement(['Mathematics', 'Science', 'English', 'Indonesian', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology']),
            'class_name' => fake()->randomElement(['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']),
            'room_number' => fake()->randomElement(['A101', 'A102', 'A103', 'B201', 'B202', 'C301', 'C302', 'D401']),
            'date' => fake()->date(),
            'day_of_week' => fake()->randomElement(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']),
            'is_recurring' => fake()->boolean(30), // 30% chance of being recurring
            'schedule_type' => fake()->randomElement(['class', 'meeting', 'duty', 'exam_supervision']),
            'notes' => fake()->optional()->sentence(),
            'is_active' => fake()->boolean(95), // 95% chance of being active
        ];
    }

    /**
     * Set the schedule as recurring.
     */
    public function recurring(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_recurring' => true,
        ]);
    }

    /**
     * Set the schedule as non-recurring.
     */
    public function nonRecurring(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_recurring' => false,
        ]);
    }

    /**
     * Set the schedule as for a specific day of the week.
     */
    public function onDay(string $day): static
    {
        return $this->state(fn (array $attributes) => [
            'day_of_week' => $day,
        ]);
    }

    /**
     * Set the schedule as a class.
     */
    public function class(): static
    {
        return $this->state(fn (array $attributes) => [
            'schedule_type' => 'class',
        ]);
    }
}
