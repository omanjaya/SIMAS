<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\LeaveRequest;
use Illuminate\Database\Eloquent\Factories\Factory;

class LeaveRequestFactory extends Factory
{
    protected $model = LeaveRequest::class;

    public function definition(): array
    {
        $leaveTypes = ['annual', 'sick', 'emergency', 'personal', 'maternity', 'paternity', 'unpaid'];
        $statuses = ['pending', 'approved', 'rejected', 'cancelled'];

        $startDate = $this->faker->dateTimeBetween('now', '+1 month');
        $endDate = (clone $startDate)->modify('+'.$this->faker->numberBetween(1, 5).' days');
        $totalDays = \Carbon\Carbon::instance($startDate)->diffInDays($endDate) + 1;

        return [
            'employee_id' => Employee::factory(),
            'leave_type' => $this->faker->randomElement($leaveTypes),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'total_days' => $totalDays,
            'reason' => $this->faker->sentence(),
            'status' => $this->faker->randomElement($statuses),
            'approved_by' => null,
            'approved_at' => null,
            'rejection_reason' => null,
            'is_paid' => $this->faker->boolean(80),
        ];
    }
}
