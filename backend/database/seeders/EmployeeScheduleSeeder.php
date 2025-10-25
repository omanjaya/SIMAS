<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\EmployeeSchedule;
use App\Models\Location;
use App\Models\User;
use Illuminate\Database\Seeder;

class EmployeeScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();
        $employees = Employee::all();
        $locations = Location::all();

        foreach ($employees as $employee) {
            $schedules = [
                [
                    'employee_id' => $employee->id,
                    'location_id' => $locations->random()->id,
                    'day_of_week' => 1, // Monday
                    'start_time' => '08:00:00',
                    'end_time' => '17:00:00',
                    'late_tolerance_minutes' => 15,
                    'early_checkout_tolerance_minutes' => 15,
                    'is_active' => true,
                    'notes' => 'Senin - Jadwal reguler',
                    'created_by' => $admin?->id,
                ],
                [
                    'employee_id' => $employee->id,
                    'location_id' => $locations->random()->id,
                    'day_of_week' => 2, // Tuesday
                    'start_time' => '08:00:00',
                    'end_time' => '17:00:00',
                    'late_tolerance_minutes' => 15,
                    'early_checkout_tolerance_minutes' => 15,
                    'is_active' => true,
                    'notes' => 'Selasa - Jadwal reguler',
                    'created_by' => $admin?->id,
                ],
                [
                    'employee_id' => $employee->id,
                    'location_id' => $locations->random()->id,
                    'day_of_week' => 3, // Wednesday
                    'start_time' => '08:00:00',
                    'end_time' => '17:00:00',
                    'late_tolerance_minutes' => 15,
                    'early_checkout_tolerance_minutes' => 15,
                    'is_active' => true,
                    'notes' => 'Rabu - Jadwal reguler',
                    'created_by' => $admin?->id,
                ],
                [
                    'employee_id' => $employee->id,
                    'location_id' => $locations->random()->id,
                    'day_of_week' => 4, // Thursday
                    'start_time' => '08:00:00',
                    'end_time' => '17:00:00',
                    'late_tolerance_minutes' => 15,
                    'early_checkout_tolerance_minutes' => 15,
                    'is_active' => true,
                    'notes' => 'Kamis - Jadwal reguler',
                    'created_by' => $admin?->id,
                ],
                [
                    'employee_id' => $employee->id,
                    'location_id' => $locations->random()->id,
                    'day_of_week' => 5, // Friday
                    'start_time' => '08:00:00',
                    'end_time' => '16:00:00', // Earlier on Friday
                    'late_tolerance_minutes' => 15,
                    'early_checkout_tolerance_minutes' => 15,
                    'is_active' => true,
                    'notes' => 'Jumat - Jadwal lebih awal',
                    'created_by' => $admin?->id,
                ],
            ];

            foreach ($schedules as $schedule) {
                EmployeeSchedule::create($schedule);
            }

            // Create some additional random schedules for variety
            EmployeeSchedule::factory(2)->create([
                'employee_id' => $employee->id,
                'created_by' => $admin?->id,
            ]);
        }
    }
}
