<?php

namespace Tests\Feature\API;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\EmployeeSchedule;
use App\Models\LeaveRequest;
use App\Models\Location;
use App\Models\Period;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MyScheduleControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_schedules()
    {
        $response = $this->getJson('/api/my/schedules');

        $response->assertStatus(401);
    }

    public function test_user_without_employee_profile_cannot_access_schedules()
    {
        $user = User::factory()->create(['role' => 'employee']);

        $response = $this->actingAs($user)
            ->getJson('/api/my/schedules');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Employee profile not found',
            ]);
    }

    public function test_user_can_view_their_schedules()
    {
        $user = User::factory()->create(['role' => 'employee']);
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        // Create some schedules for the employee
        $location = Location::factory()->create();
        EmployeeSchedule::factory()->create([
            'employee_id' => $employee->id,
            'location_id' => $location->id,
            'day_of_week' => now()->dayOfWeek,
            'is_active' => true
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/my/schedules');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'today',
                    'week',
                    'current_time',
                    'current_day'
                ]
            ])
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_user_can_view_weekly_schedules()
    {
        $user = User::factory()->create(['role' => 'employee']);
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        // Create some schedules for the employee
        $location = Location::factory()->create();
        EmployeeSchedule::factory()->create([
            'employee_id' => $employee->id,
            'location_id' => $location->id,
            'day_of_week' => 2, // Tuesday
            'is_active' => true
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/my/schedules/weekly');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'day_of_week',
                        'day_name',
                        'start_time',
                        'end_time',
                        'location'
                    ]
                ]
            ]);
    }

    public function test_user_can_view_monthly_schedules()
    {
        $user = User::factory()->create(['role' => 'employee']);
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        // Create some schedules for the employee
        $location = Location::factory()->create();
        EmployeeSchedule::factory()->create([
            'employee_id' => $employee->id,
            'location_id' => $location->id,
            'day_of_week' => 1, // Monday
            'is_active' => true
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/my/schedules/monthly');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'month',
                    'year',
                    'calendar'
                ]
            ]);
    }

    public function test_user_can_view_monthly_schedules_with_month_year_parameters()
    {
        $user = User::factory()->create(['role' => 'employee']);
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        // Create some schedules for the employee
        $location = Location::factory()->create();
        EmployeeSchedule::factory()->create([
            'employee_id' => $employee->id,
            'location_id' => $location->id,
            'day_of_week' => 3, // Wednesday
            'is_active' => true
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/my/schedules/monthly?month=10&year=2025');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'month',
                    'year',
                    'calendar'
                ]
            ]);
    }

    public function test_schedules_index_returns_empty_for_employee_without_schedules()
    {
        $user = User::factory()->create(['role' => 'employee']);
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)
            ->getJson('/api/my/schedules');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'today' => null,
                ]
            ]);
    }

    public function test_weekly_schedules_returns_empty_for_employee_without_schedules()
    {
        $user = User::factory()->create(['role' => 'employee']);
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)
            ->getJson('/api/my/schedules/weekly');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => []
            ]);
    }

    public function test_monthly_schedules_returns_empty_for_employee_without_schedules()
    {
        $user = User::factory()->create(['role' => 'employee']);
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)
            ->getJson('/api/my/schedules/monthly');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'month' => now()->month,
                    'year' => now()->year,
                    'calendar' => []
                ]
            ]);
    }
}