<?php

namespace Tests\Feature\API;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\EmployeeSchedule;
use App\Models\Location;
use App\Models\Period;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MyAttendanceControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_attendance()
    {
        $response = $this->getJson('/api/my/attendance');

        $response->assertStatus(401);
    }

    public function test_user_without_employee_profile_cannot_access_attendance()
    {
        $user = User::factory()->create(['role' => 'employee']);

        $response = $this->actingAs($user)
            ->getJson('/api/my/attendance');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Employee profile not found',
            ]);
    }

    public function test_user_can_view_their_attendance_history()
    {
        $user = User::factory()->create(['role' => 'employee']);
        $employee = Employee::factory()->create(['user_id' => $user->id]);
        $period = Period::factory()->create();
        $location = Location::factory()->create();

        Attendance::factory()->create([
            'employee_id' => $employee->id,
            'period_id' => $period->id,
            'location_id' => $location->id,
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/my/attendance');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'per_page',
                    'current_page',
                    'last_page',
                    'data' => [
                        '*' => [
                            'id',
                            'employee_id',
                            'period_id',
                            'location_id',
                            'check_in_time',
                            'check_out_time',
                            'status',
                            'period',
                            'location',
                            'employee'
                        ]
                    ]
                ]
            ]);
    }

    public function test_user_can_view_today_attendance_status()
    {
        $user = User::factory()->create(['role' => 'employee']);
        $employee = Employee::factory()->create(['user_id' => $user->id]);
        $period = Period::factory()->create();
        $location = Location::factory()->create();

        // Create today's attendance
        Attendance::factory()->create([
            'employee_id' => $employee->id,
            'period_id' => $period->id,
            'location_id' => $location->id,
            'check_in_time' => now()->setTime(8, 0, 0),
        ]);

        // Create employee schedule for today
        EmployeeSchedule::factory()->create([
            'employee_id' => $employee->id,
            'location_id' => $location->id,
            'day_of_week' => now()->dayOfWeek,
            'start_time' => '08:00:00',
            'end_time' => '16:00:00',
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/my/attendance/today');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'attendance',
                    'schedule',
                    'current_time',
                    'can_clock_in',
                    'can_clock_out',
                    'status'
                ]
            ]);
    }

    public function test_user_can_view_attendance_statistics()
    {
        $user = User::factory()->create(['role' => 'employee']);
        $employee = Employee::factory()->create(['user_id' => $user->id]);
        $period = Period::factory()->create();
        $location = Location::factory()->create();

        Attendance::factory()->create([
            'employee_id' => $employee->id,
            'period_id' => $period->id,
            'location_id' => $location->id,
            'status' => 'present',
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/my/attendance/statistics');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'period',
                    'summary',
                    'working_hours'
                ]
            ]);
    }

    public function test_user_can_view_monthly_attendance_summary()
    {
        $user = User::factory()->create(['role' => 'employee']);
        $employee = Employee::factory()->create(['user_id' => $user->id]);
        $period = Period::factory()->create();
        $location = Location::factory()->create();

        Attendance::factory()->create([
            'employee_id' => $employee->id,
            'period_id' => $period->id,
            'location_id' => $location->id,
            'status' => 'late',
            'check_in_time' => now()->startOfMonth()->addDays(5)->setTime(9, 0, 0),
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/my/attendance/summary/10');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'month',
                    'year',
                    'summary',
                    'daily'
                ]
            ]);
    }

    public function test_attendance_summary_returns_422_for_invalid_month()
    {
        $user = User::factory()->create(['role' => 'employee']);
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)
            ->getJson('/api/my/attendance/summary/13');

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid month. Must be between 1 and 12',
            ]);
    }

    public function test_attendance_summary_with_year_parameter()
    {
        $user = User::factory()->create(['role' => 'employee']);
        $employee = Employee::factory()->create(['user_id' => $user->id]);
        $period = Period::factory()->create();
        $location = Location::factory()->create();

        Attendance::factory()->create([
            'employee_id' => $employee->id,
            'period_id' => $period->id,
            'location_id' => $location->id,
            'status' => 'present',
            'check_in_time' => Carbon::create(2025, 10, 15, 8, 0, 0),
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/my/attendance/summary/10?year=2025');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'month' => 10,
                    'year' => 2025,
                ]
            ]);
    }

    public function test_attendance_index_with_date_filters()
    {
        $user = User::factory()->create(['role' => 'employee']);
        $employee = Employee::factory()->create(['user_id' => $user->id]);
        $period = Period::factory()->create();
        $location = Location::factory()->create();

        Attendance::factory()->create([
            'employee_id' => $employee->id,
            'period_id' => $period->id,
            'location_id' => $location->id,
            'check_in_time' => now()->subDays(5),
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/my/attendance?start_date=' . now()->subWeek()->toDateString() . '&end_date=' . now()->toDateString());

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_attendance_index_with_per_page_parameter()
    {
        $user = User::factory()->create(['role' => 'employee']);
        $employee = Employee::factory()->create(['user_id' => $user->id]);
        $period = Period::factory()->create();
        $location = Location::factory()->create();

        Attendance::factory()->count(5)->create([
            'employee_id' => $employee->id,
            'period_id' => $period->id,
            'location_id' => $location->id,
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/my/attendance?per_page=3');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'per_page' => 3,
                ]
            ]);
    }

    public function test_today_attendance_returns_correct_status_when_no_schedule()
    {
        $user = User::factory()->create(['role' => 'employee']);
        $employee = Employee::factory()->create(['user_id' => $user->id]);
        $period = Period::factory()->create();
        $location = Location::factory()->create();

        // Create today's attendance but no schedule
        Attendance::factory()->create([
            'employee_id' => $employee->id,
            'period_id' => $period->id,
            'location_id' => $location->id,
            'check_in_time' => now()->setTime(8, 0, 0),
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/my/attendance/today');

        $response->assertStatus(200);
    }

    public function test_attendance_statistics_with_date_range()
    {
        $user = User::factory()->create(['role' => 'employee']);
        $employee = Employee::factory()->create(['user_id' => $user->id]);
        $period = Period::factory()->create();
        $location = Location::factory()->create();

        Attendance::factory()->create([
            'employee_id' => $employee->id,
            'period_id' => $period->id,
            'location_id' => $location->id,
            'status' => 'present',
            'check_in_time' => now()->subDays(3),
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/my/attendance/statistics?start_date=' . now()->subWeek()->toDateString() . '&end_date=' . now()->toDateString());

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }
}