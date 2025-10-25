<?php

namespace Database\Factories;

use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

class AttendanceFactory extends Factory
{
    protected $model = Attendance::class;

    public function definition(): array
    {
        $statuses = ['present', 'late', 'absent', 'half_day'];

        $checkIn = $this->faker->dateTimeBetween('-1 month', 'now');
        $checkOut = (clone $checkIn)->modify('+'.$this->faker->numberBetween(4, 10).' hours');

        return [
            'employee_id' => Employee::factory(),
            'check_in_time' => $checkIn,
            'check_out_time' => $checkOut,
            'status' => $this->faker->randomElement($statuses),
            'check_in_location' => $this->faker->word(),
            'check_out_location' => $this->faker->word(),
            'notes' => $this->faker->sentence(),
        ];
    }
}
