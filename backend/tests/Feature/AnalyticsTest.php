<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\Salary;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
        $this->actingAs($this->admin);
    }

    public function test_attendance_trends_endpoint_returns_data(): void
    {
        // Arrange: Create test data
        $employee = Employee::factory()->create([
            'department' => 'IT',
        ]);

        $checkIn = now()->subDays(2)->setTime(8, 0);

        Attendance::factory()->count(5)->create([
            'employee_id' => $employee->id,
            'status' => 'present',
            'check_in_time' => $checkIn,
            'check_out_time' => (clone $checkIn)->addHours(9),
        ]);

        // Act: Call endpoint
        $response = $this->getJson('/api/analytics/attendance-trends?'.http_build_query([
            'start_date' => now()->subDays(7)->format('Y-m-d'),
            'end_date' => now()->format('Y-m-d'),
            'group_by' => 'day',
        ]));

        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'period',
                    'trends' => [
                        '*' => ['date', 'total_employees', 'present', 'late', 'absent', 'attendance_rate'],
                    ],
                    'summary',
                ],
            ]);
    }

    public function test_overtime_analysis_endpoint_returns_data(): void
    {
        // Create test data
        $employee = Employee::factory()->create();
        $checkIn = now()->subDays(2)->setTime(8, 0);

        Attendance::factory()->count(3)->create([
            'employee_id' => $employee->id,
            'check_in_time' => $checkIn,
            'check_out_time' => (clone $checkIn)->addHours(10), // 2 hours overtime
        ]);

        $response = $this->getJson('/api/analytics/overtime?'.http_build_query([
            'start_date' => now()->subDays(7)->format('Y-m-d'),
            'end_date' => now()->format('Y-m-d'),
            'threshold_hours' => 8,
        ]));

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'overtime_summary',
                    'by_employee',
                    'by_department',
                ],
            ]);
    }

    public function test_leave_forecast_endpoint_returns_data(): void
    {
        // Create test data
        $employee = Employee::factory()->create();
        LeaveRequest::factory()->count(2)->create([
            'employee_id' => $employee->id,
            'status' => 'approved',
            'total_days' => 3,
            'start_date' => now()->addDays(5),
        ]);

        $response = $this->getJson('/api/analytics/leave-forecast?'.http_build_query([
            'year' => now()->year,
        ]));

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'forecast_year',
                    'employees' => [
                        '*' => [
                            'employee_id',
                            'employee_name',
                            'department',
                            'leave_entitlement',
                            'leave_taken',
                            'leave_pending',
                            'leave_remaining',
                            'forecast_exhausted_date',
                            'risk_level',
                        ],
                    ],
                    'summary',
                ],
            ]);
    }

    public function test_payroll_cost_analysis_endpoint_returns_data(): void
    {
        // Create test data
        $employee = Employee::factory()->create();
        Salary::factory()->create([
            'employee_id' => $employee->id,
            'base_salary' => 8000000,
            'allowances' => 1000000,
            'deductions' => 500000,
        ]);

        $response = $this->getJson('/api/analytics/payroll-cost?'.http_build_query([
            'start_date' => now()->startOfMonth()->format('Y-m-d'),
            'end_date' => now()->endOfMonth()->format('Y-m-d'),
        ]));

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'period' => ['start', 'end'],
                    'totals' => ['gross', 'allowances', 'deductions', 'net', 'employee_count'],
                    'by_month',
                    'by_department',
                    'by_position',
                ],
            ]);
    }

    public function test_analytics_endpoints_require_authentication(): void
    {
        $this->app['auth']->forgetGuards();

        $response = $this->getJson('/api/analytics/attendance-trends?start_date=2025-01-01&end_date=2025-01-31');

        $response->assertStatus(401);
    }

    public function test_attendance_trends_requires_parameters(): void
    {
        $response = $this->getJson('/api/analytics/attendance-trends');

        $response->assertStatus(422);
    }
}
