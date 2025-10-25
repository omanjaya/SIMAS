<?php

namespace Tests\Feature\API;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Period;
use App\Models\Salary;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CoreAttendanceSchedulingAPITest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_crud_operations(): void
    {
        // Create an admin user for testing
        $admin = User::factory()->admin()->create();
        $token = $admin->createToken('test-token')->plainTextToken;

        $employeeCode = 'EMP_TEST_'.time();
        $email = 'john.doe.'.time().'@example.com';

        // Test creating an employee
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/employees', [
                'employee_code' => $employeeCode,
                'first_name' => 'John',
                'last_name' => 'Doe',
                'email' => $email,
                'phone' => '1234567890',
                'hire_date' => now()->toDateString(),
                'employment_type' => 'full-time',
                'department' => 'IT',
                'position' => 'Developer',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('employees', [
            'employee_code' => $employeeCode,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => $email,
        ]);

        // Get the created employee
        $employeeId = $response->json('employee.id');

        // Test getting the employee
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson("/api/employees/$employeeId");
        $response->assertStatus(200);

        // Test updating the employee
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->putJson("/api/employees/$employeeId", [
                'first_name' => 'Jane',
                'last_name' => 'Smith',
            ]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('employees', [
            'id' => $employeeId,
            'first_name' => 'Jane',
            'last_name' => 'Smith',
        ]);

        // Test listing employees
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/employees');
        $response->assertStatus(200);
    }

    public function test_period_crud_operations(): void
    {
        // Create an admin user for testing
        $admin = User::factory()->admin()->create();
        $token = $admin->createToken('test-token')->plainTextToken;

        // Test creating a period
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/periods', [
                'name' => 'Morning Shift',
                'start_time' => '08:00:00',
                'end_time' => '12:00:00',
                'code' => 'MOR',
                'order' => 1,
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('periods', [
            'name' => 'Morning Shift',
            'code' => 'MOR',
        ]);

        // Get the created period
        $periodId = $response->json('period.id');

        // Test getting the period
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson("/api/periods/$periodId");
        $response->assertStatus(200);

        // Test updating the period
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->putJson("/api/periods/$periodId", [
                'name' => 'Early Morning Shift',
            ]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('periods', [
            'id' => $periodId,
            'name' => 'Early Morning Shift',
        ]);

        // Test listing periods
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/periods');
        $response->assertStatus(200);
    }

    public function test_leave_request_operations(): void
    {
        // Create admin and employee users
        $admin = User::factory()->admin()->create(['password' => Hash::make('password')]);
        $employeeUser = User::factory()->employee()->create(['password' => Hash::make('password')]);

        $employee = Employee::factory()->create([
            'user_id' => $employeeUser->id,
            'first_name' => 'Test',
            'last_name' => 'Employee',
            'email' => 'test.employee.'.time().'@example.com',
            'employee_code' => 'EMP_TEST_'.time().'_2',
            'hire_date' => now()->toDateString(),
            'employment_type' => 'full-time',
            'department' => 'HR',
            'position' => 'Manager',
        ]);

        $adminToken = $admin->createToken('test-token')->plainTextToken;
        $employeeToken = $employeeUser->createToken('test-token')->plainTextToken;

        // Employee creates a leave request
        $response = $this->withHeader('Authorization', "Bearer $employeeToken")
            ->postJson('/api/leave-requests', [
                'leave_type' => 'annual',
                'start_date' => now()->addDays(5)->toDateString(),
                'end_date' => now()->addDays(7)->toDateString(),
                'reason' => 'Vacation',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('leave_requests', [
            'employee_id' => $employee->id,
            'leave_type' => 'annual',
            'reason' => 'Vacation',
            'status' => 'pending',
        ]);

        // Get the created leave request
        $leaveRequestId = $response->json('leave_request.id');

        // Admin approves the leave request
        $response = $this->actingAs($admin)->putJson("/api/leave-requests/$leaveRequestId/approve", [
            'status' => 'approved',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('leave_requests', [
            'id' => $leaveRequestId,
            'status' => 'approved',
        ]);

        // Employee views their own leave request
        $response = $this->withHeader('Authorization', "Bearer $employeeToken")
            ->getJson("/api/leave-requests/$leaveRequestId");
        $response->assertStatus(200);
    }

    public function test_attendance_clock_in_out(): void
    {
        // Create employee user
        $employeeUser = User::factory()->employee()->create(['password' => Hash::make('password')]);

        $employee = Employee::factory()->create([
            'user_id' => $employeeUser->id,
            'first_name' => 'Test',
            'last_name' => 'Clock',
            'email' => 'test.clock.'.time().'@example.com',
            'employee_code' => 'EMP_TEST_'.time().'_3',
            'hire_date' => now()->toDateString(),
            'employment_type' => 'full-time',
            'department' => 'IT',
            'position' => 'Developer',
        ]);

        $token = $employeeUser->createToken('test-token')->plainTextToken;

        // Test clock in with GPS coordinates
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/clock-in', [
                'latitude' => -6.2293867,
                'longitude' => 106.8265753,
            ]);

        $response->assertStatus(200);
        $attendanceId = $response->json('attendance.id');

        // Verify attendance was created
        $this->assertDatabaseHas('attendances', [
            'id' => $attendanceId,
            'employee_id' => $employee->id,
            'check_out_time' => null,
        ]);

        // Test clock out with GPS coordinates
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/clock-out', [
                'latitude' => -6.2293867,
                'longitude' => 106.8265753,
            ]);

        $response->assertStatus(200);

        // Verify attendance was updated with check out time
        $this->assertDatabaseHas('attendances', [
            'id' => $attendanceId,
            'employee_id' => $employee->id,
            'check_out_time' => now()->toDateTimeString(),
        ]);
    }

    public function test_salary_operations(): void
    {
        // Create admin and employee users
        $admin = User::factory()->admin()->create();
        $employeeUser = User::factory()->employee()->create();

        $employee = Employee::factory()->create([
            'user_id' => $employeeUser->id,
            'first_name' => 'Test',
            'last_name' => 'Salary',
            'email' => 'test.salary.'.time().'@example.com',
            'employee_code' => 'EMP_TEST_'.time().'_4',
            'hire_date' => now()->toDateString(),
            'employment_type' => 'full-time',
            'department' => 'Finance',
            'position' => 'Accountant',
        ]);

        $adminToken = $admin->createToken('test-token')->plainTextToken;

        // Test creating a salary
        $response = $this->withHeader('Authorization', "Bearer $adminToken")
            ->postJson('/api/salaries', [
                'employee_id' => $employee->id,
                'base_salary' => 8000000,
                'salary_type' => 'monthly',
                'effective_from' => now()->toDateString(),
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('salaries', [
            'employee_id' => $employee->id,
            'base_salary' => 8000000,
            'salary_type' => 'monthly',
        ]);

        // Get the created salary
        $salaryId = $response->json('salary.id');

        // Test getting the salary
        $response = $this->withHeader('Authorization', "Bearer $adminToken")
            ->getJson("/api/salaries/$salaryId");
        $response->assertStatus(200);

        // Test payroll summary
        $response = $this->withHeader('Authorization', "Bearer $adminToken")
            ->getJson("/api/payroll-summary/{$employee->id}");
        $response->assertStatus(200);
    }

    public function test_school_calendar_operations(): void
    {
        // Create admin user
        $admin = User::factory()->admin()->create();
        $token = $admin->createToken('test-token')->plainTextToken;

        // Test creating a school calendar event
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/school-calendars', [
                'title' => 'National Holiday',
                'start_date' => now()->addDays(10)->toDateString(),
                'end_date' => now()->addDays(10)->toDateString(),
                'event_type' => 'holiday',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('school_calendars', [
            'title' => 'National Holiday',
            'event_type' => 'holiday',
        ]);

        // Get the created calendar event
        $calendarId = $response->json('calendar.id');

        // Test getting the calendar event
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson("/api/school-calendars/$calendarId");
        $response->assertStatus(200);

        // Test listing calendar events
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/school-calendars');
        $response->assertStatus(200);
    }
}
