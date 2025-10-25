<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\EmployeeSchedule;
use App\Models\Location;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmployeeScheduleTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_schedule_can_be_created(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $employee = Employee::factory()->create();
        $location = Location::factory()->create();

        $response = $this->actingAs($admin)->postJson('/api/employee-schedules', [
            'employee_id' => $employee->id,
            'location_id' => $location->id,
            'day_of_week' => 1,
            'start_time' => '08:00',
            'end_time' => '17:00',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('employee_schedules', [
            'employee_id' => $employee->id,
            'day_of_week' => 1,
        ]);
    }

    public function test_employee_schedules_can_be_listed(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        EmployeeSchedule::factory(3)->create();

        $response = $this->actingAs($admin)->getJson('/api/employee-schedules');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data',
            'total',
            'current_page',
            'last_page',
            'per_page',
        ]);
    }

    public function test_employee_schedule_can_be_retrieved(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $schedule = EmployeeSchedule::factory()->create();

        $response = $this->actingAs($admin)->getJson("/api/employee-schedules/{$schedule->id}");

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => $schedule->toArray(),
        ]);
    }

    public function test_employee_schedule_can_be_updated(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $schedule = EmployeeSchedule::factory()->create();

        $response = $this->actingAs($admin)->putJson("/api/employee-schedules/{$schedule->id}", [
            'day_of_week' => 2,
            'start_time' => '09:00',
            'end_time' => '18:00',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('employee_schedules', [
            'id' => $schedule->id,
            'day_of_week' => 2,
        ]);
    }

    public function test_employee_schedule_can_be_deleted(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $schedule = EmployeeSchedule::factory()->create();

        $response = $this->actingAs($admin)->deleteJson("/api/employee-schedules/{$schedule->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('employee_schedules', [
            'id' => $schedule->id,
        ]);
    }

    public function test_employee_schedules_can_be_fetched_by_employee(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $employee = Employee::factory()->create();
        EmployeeSchedule::factory(3)->create(['employee_id' => $employee->id]);

        $response = $this->actingAs($admin)->getJson("/api/employees/{$employee->id}/schedules");

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
    }

    public function test_employee_schedules_can_be_bulk_assigned(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $employee = Employee::factory()->create();
        $location = Location::factory()->create();

        $response = $this->actingAs($admin)->postJson("/api/employees/{$employee->id}/schedules/bulk-assign", [
            'schedules' => [
                [
                    'day_of_week' => 1,
                    'location_id' => $location->id,
                    'start_time' => '08:00',
                    'end_time' => '17:00',
                ],
                [
                    'day_of_week' => 2,
                    'location_id' => $location->id,
                    'start_time' => '08:00',
                    'end_time' => '17:00',
                ],
            ],
        ]);

        $response->assertStatus(200);
        $this->assertEquals(2, $employee->schedules()->count());
    }

    public function test_employee_schedule_day_name_attribute(): void
    {
        $schedule = EmployeeSchedule::factory()->create(['day_of_week' => 1]); // Monday

        $this->assertEquals('Senin', $schedule->day_name);
    }
}
