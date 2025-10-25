<?php

namespace Tests\Feature\API;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\EmployeeSchedule;
use App\Models\LeaveRequest;
use App\Models\Location;
use App\Models\Period;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MyDashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_dashboard()
    {
        $response = $this->getJson('/api/my/dashboard');

        $response->assertStatus(401);
    }

    public function test_user_without_employee_profile_cannot_access_dashboard()
    {
        $user = User::factory()->create(['role' => 'employee']);

        $response = $this->actingAs($user)
            ->getJson('/api/my/dashboard');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Employee profile not found',
            ]);
    }

    public function test_user_can_view_their_dashboard()
    {
        $user = User::factory()->create([
            'role' => 'employee',
            'name' => 'Test User'
        ]);
        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'employee_code' => 'EMP001',
            'position' => 'Staff',
            'department' => 'IT'
        ]);

        // Create a location for schedules
        $location = Location::factory()->create([
            'name' => 'Main Office',
            'address' => '123 Main St'
        ]);

        // Create today's schedule
        EmployeeSchedule::factory()->create([
            'employee_id' => $employee->id,
            'location_id' => $location->id,
            'day_of_week' => now()->dayOfWeek,
            'start_time' => '08:00:00',
            'end_time' => '16:00:00',
            'is_active' => true
        ]);

        // The dashboard controller looks for attendance for TODAY
        // If today is a weekend, it won't have any
        if (!now()->isWeekday()) {
            // Create attendance for a weekday instead
            Attendance::factory()->create([
                'employee_id' => $employee->id,
                'check_in_time' => now()->previous(Carbon::MONDAY)->setTime(8, 15, 0),
                'status' => 'present'
            ]);
        } else {
            // Create today's attendance
            $period = Period::factory()->create();
            Attendance::factory()->create([
                'employee_id' => $employee->id,
                'period_id' => $period->id,
                'location_id' => $location->id,
                'check_in_time' => now()->setTime(8, 15, 0),
                'check_out_time' => null, // Not checked out yet
                'status' => 'present'
            ]);
        }

        // Create some pending leave requests
        LeaveRequest::factory()->create([
            'employee_id' => $employee->id,
            'status' => 'pending'
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/my/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'user',
                    'today',
                    'monthly_summary',
                    'leave_requests',
                    'recent_attendance'
                ]
            ])
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_dashboard_returns_correct_data_for_user_with_no_attendance_today()
    {
        $user = User::factory()->create(['role' => 'employee']);
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        // Create today's schedule but no attendance
        $location = Location::factory()->create();
        EmployeeSchedule::factory()->create([
            'employee_id' => $employee->id,
            'location_id' => $location->id,
            'day_of_week' => now()->dayOfWeek,
            'start_time' => '08:00:00',
            'end_time' => '16:00:00',
            'is_active' => true
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/my/dashboard');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'today' => [
                        'attendance' => null,
                        'can_clock_in' => true,
                        'can_clock_out' => false
                    ]
                ]
            ]);
    }

    public function test_dashboard_returns_correct_data_for_user_with_no_schedule_today()
    {
        $user = User::factory()->create(['role' => 'employee']);
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        // Create attendance but no schedule for today
        $period = Period::factory()->create();
        $location = Location::factory()->create();
        Attendance::factory()->create([
            'employee_id' => $employee->id,
            'period_id' => $period->id,
            'location_id' => $location->id,
            'check_in_time' => now()->setTime(8, 0, 0),
            'status' => 'present'
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/my/dashboard');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'today' => [
                        'schedule' => null
                    ]
                ]
            ]);
    }

    public function test_dashboard_with_multiple_attendances()
    {
        $user = User::factory()->create(['role' => 'employee']);
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        $period = Period::factory()->create();
        $location = Location::factory()->create();

        // Create multiple attendances in the past week
        Attendance::factory(5)->create([
            'employee_id' => $employee->id,
            'period_id' => $period->id,
            'location_id' => $location->id,
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/my/dashboard');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_dashboard_with_upcoming_approved_leaves()
    {
        $user = User::factory()->create(['role' => 'employee']);
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        // Create an approved leave request that starts in the future
        LeaveRequest::factory()->create([
            'employee_id' => $employee->id,
            'status' => 'approved',
            'start_date' => now()->addDays(2),
            'end_date' => now()->addDays(3)
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/my/dashboard');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'leave_requests' => [
                        'pending' => 0,
                        'approved_upcoming' => 1
                    ]
                ]
            ]);
    }
}