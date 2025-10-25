<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Period;
use App\Models\SchoolCalendar;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create default admin user
        $adminUser = User::factory()->admin()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
        ]);

        // Create admin employee
        $adminEmployee = Employee::factory()->admin()->create([
            'user_id' => $adminUser->id,
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@example.com',
            'employee_code' => 'ADM001',
        ]);

        // Create teacher user
        $teacherUser = User::factory()->teacher()->create([
            'name' => 'Teacher User',
            'email' => 'teacher@example.com',
            'password' => bcrypt('password'),
        ]);

        // Create teacher employee
        $teacherEmployee = Employee::factory()->teacher()->create([
            'user_id' => $teacherUser->id,
            'first_name' => 'Teacher',
            'last_name' => 'User',
            'email' => 'teacher@example.com',
            'employee_code' => 'TCH001',
        ]);

        // Create staff user
        $staffUser = User::factory()->employee()->create([
            'name' => 'Staff User',
            'email' => 'staff@example.com',
            'password' => bcrypt('password'),
        ]);

        // Create staff employee
        $staffEmployee = Employee::factory()->staff()->create([
            'user_id' => $staffUser->id,
            'first_name' => 'Staff',
            'last_name' => 'User',
            'email' => 'staff@example.com',
            'employee_code' => 'STF001',
        ]);

        // Create sample periods
        $periods = [
            ['name' => 'Morning Shift', 'start_time' => '07:00:00', 'end_time' => '11:00:00', 'code' => 'MOR', 'order' => 1],
            ['name' => 'Afternoon Shift', 'start_time' => '13:00:00', 'end_time' => '17:00:00', 'code' => 'AFT', 'order' => 2],
            ['name' => 'Evening Shift', 'start_time' => '16:00:00', 'end_time' => '20:00:00', 'code' => 'EVE', 'order' => 3],
        ];

        foreach ($periods as $periodData) {
            Period::create($periodData);
        }

        // Create sample school calendar events
        $events = [
            ['title' => 'New Year Holiday', 'start_date' => '2025-01-01', 'end_date' => '2025-01-01', 'event_type' => 'holiday'],
            ['title' => 'School Break', 'start_date' => '2025-06-01', 'end_date' => '2025-06-15', 'event_type' => 'break'],
            ['title' => 'Semester Break', 'start_date' => '2025-12-20', 'end_date' => '2025-01-05', 'event_type' => 'break'],
            ['title' => 'National Education Day', 'start_date' => '2025-05-02', 'end_date' => '2025-05-02', 'event_type' => 'holiday'],
            ['title' => 'Exam Period', 'start_date' => '2025-05-15', 'end_date' => '2025-05-30', 'event_type' => 'exam'],
        ];

        foreach ($events as $eventData) {
            SchoolCalendar::create($eventData);
        }

        // Create sample employees (additional to the ones created above)
        $employees = Employee::factory(20)->create();

        // Get the IDs of all periods to use for related records
        $periodIds = Period::pluck('id')->toArray();

        // Create sample teacher schedules using existing periods
        \App\Models\TeacherSchedule::factory(30)->create([
            'period_id' => function () use ($periodIds) {
                return $periodIds[array_rand($periodIds)];
            },
        ]);

        // Create sample leave requests
        \App\Models\LeaveRequest::factory(15)->create();

        // Create sample salaries
        \App\Models\Salary::factory(25)->create();

        // Create sample face templates
        \App\Models\FaceTemplate::factory(25)->create();

        // Create sample attendances using existing periods
        \App\Models\Attendance::factory(100)->create([
            'period_id' => function () use ($periodIds) {
                return $periodIds[array_rand($periodIds)];
            },
        ]);

        // Run LocationSeeder and EmployeeScheduleSeeder
        $this->call(LocationSeeder::class);
        $this->call(EmployeeScheduleSeeder::class);
    }
}
