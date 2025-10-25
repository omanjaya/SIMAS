<?php

namespace Tests\Unit\Services;

use App\Models\Employee;
use App\Models\EmployeeSchedule;
use App\Models\Location;
use App\Services\ScheduleValidationService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScheduleValidationServiceTest extends TestCase
{
    use RefreshDatabase;

    protected ScheduleValidationService $scheduleValidationService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->scheduleValidationService = new ScheduleValidationService;
    }

    public function test_get_active_schedule_for_today(): void
    {
        $employee = Employee::factory()->create();
        $location = Location::factory()->create();

        $schedule = EmployeeSchedule::factory()->create([
            'employee_id' => $employee->id,
            'location_id' => $location->id,
            'day_of_week' => 1, // Monday
            'start_time' => '08:00:00',
            'end_time' => '17:00:00',
            'is_active' => true,
        ]);

        $result = $this->scheduleValidationService->getActiveScheduleForToday($employee->id, 1);
        $this->assertNotNull($result);
        $this->assertEquals($schedule->id, $result->id);
    }

    public function test_is_within_schedule_time(): void
    {
        $employee = Employee::factory()->create();
        $location = Location::factory()->create();

        $schedule = EmployeeSchedule::factory()->create([
            'employee_id' => $employee->id,
            'location_id' => $location->id,
            'day_of_week' => 1,
            'start_time' => '08:00:00',
            'end_time' => '17:00:00',
            'late_tolerance_minutes' => 15,
            'early_checkout_tolerance_minutes' => 15,
            'is_active' => true,
        ]);

        // Within check-in time tolerance
        $checkInTime = Carbon::parse('08:10:00'); // 10 mins after start, within 15 min tolerance
        $result = $this->scheduleValidationService->isWithinScheduleTime($schedule, $checkInTime);
        $this->assertTrue($result['valid']);
        $this->assertTrue($result['is_within_in_time']);

        // Outside check-in time tolerance
        $checkInTime = Carbon::parse('08:20:00'); // 20 mins after start, outside 15 min tolerance
        $result = $this->scheduleValidationService->isWithinScheduleTime($schedule, $checkInTime);
        $this->assertFalse($result['is_within_in_time']);
    }

    public function test_calculate_late_minutes(): void
    {
        $employee = Employee::factory()->create();
        $location = Location::factory()->create();

        $schedule = EmployeeSchedule::factory()->create([
            'employee_id' => $employee->id,
            'location_id' => $location->id,
            'day_of_week' => 1,
            'start_time' => '08:00:00',
            'end_time' => '17:00:00',
            'is_active' => true,
        ]);

        // On time
        $checkInTime = Carbon::parse('08:00:00');
        $lateMinutes = $this->scheduleValidationService->calculateLateMinutes($schedule, $checkInTime);
        $this->assertEquals(0, $lateMinutes);

        // Late by 30 minutes
        $checkInTime = Carbon::parse('08:30:00');
        $lateMinutes = $this->scheduleValidationService->calculateLateMinutes($schedule, $checkInTime);
        $this->assertEquals(30, $lateMinutes);

        // Early (not late)
        $checkInTime = Carbon::parse('07:30:00');
        $lateMinutes = $this->scheduleValidationService->calculateLateMinutes($schedule, $checkInTime);
        $this->assertEquals(0, $lateMinutes);
    }

    public function test_validate_check_in_on_time(): void
    {
        // Set test date to Monday
        Carbon::setTestNow(Carbon::parse('2025-10-27 08:10:00')); // Monday

        $employee = Employee::factory()->create();
        $location = Location::factory()->create();

        $schedule = EmployeeSchedule::factory()->create([
            'employee_id' => $employee->id,
            'location_id' => $location->id,
            'day_of_week' => 1, // Monday
            'start_time' => '08:00:00',
            'end_time' => '17:00:00',
            'late_tolerance_minutes' => 15,
            'is_active' => true,
        ]);

        // Check-in within tolerance (10 minutes late)
        $checkInTime = Carbon::parse('08:10:00');
        $result = $this->scheduleValidationService->validateCheckIn($employee, $checkInTime);
        $this->assertTrue($result['valid']);
        $this->assertTrue($result['is_within_tolerance']);
        $this->assertEquals(10, $result['late_minutes']);
        $this->assertEquals($schedule->id, $result['schedule']->id);
    }

    public function test_validate_check_in_late(): void
    {
        // Set test date to Monday
        Carbon::setTestNow(Carbon::parse('2025-10-27 08:20:00')); // Monday

        $employee = Employee::factory()->create();
        $location = Location::factory()->create();

        $schedule = EmployeeSchedule::factory()->create([
            'employee_id' => $employee->id,
            'location_id' => $location->id,
            'day_of_week' => 1, // Monday
            'start_time' => '08:00:00',
            'end_time' => '17:00:00',
            'late_tolerance_minutes' => 15,
            'is_active' => true,
        ]);

        // Check-in outside tolerance (20 minutes late)
        $checkInTime = Carbon::parse('08:20:00');
        $result = $this->scheduleValidationService->validateCheckIn($employee, $checkInTime);
        $this->assertFalse($result['valid']);
        $this->assertFalse($result['is_within_tolerance']);
        $this->assertEquals(20, $result['late_minutes']);
    }

    public function test_validate_check_in_no_schedule(): void
    {
        // Set test date to Tuesday (no schedule)
        Carbon::setTestNow(Carbon::parse('2025-10-28 08:00:00')); // Tuesday

        $employee = Employee::factory()->create();

        // Create a schedule for Monday only
        $location = Location::factory()->create();
        EmployeeSchedule::factory()->create([
            'employee_id' => $employee->id,
            'location_id' => $location->id,
            'day_of_week' => 1, // Monday only
            'start_time' => '08:00:00',
            'end_time' => '17:00:00',
            'late_tolerance_minutes' => 15,
            'is_active' => true,
        ]);

        // Check-in on Tuesday (no schedule)
        $checkInTime = Carbon::parse('08:00:00');
        $result = $this->scheduleValidationService->validateCheckIn($employee, $checkInTime);
        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('Tidak ada jadwal', $result['reason']);
    }

    public function test_validate_check_out_within_tolerance(): void
    {
        // Set test date to Monday
        Carbon::setTestNow(Carbon::parse('2025-10-27 17:10:00')); // Monday

        $employee = Employee::factory()->create();
        $location = Location::factory()->create();

        $schedule = EmployeeSchedule::factory()->create([
            'employee_id' => $employee->id,
            'location_id' => $location->id,
            'day_of_week' => 1, // Monday
            'start_time' => '08:00:00',
            'end_time' => '17:00:00',
            'early_checkout_tolerance_minutes' => 15,
            'is_active' => true,
        ]);

        // Check-out within tolerance (10 minutes after end)
        $checkOutTime = Carbon::parse('17:10:00');
        $result = $this->scheduleValidationService->validateCheckOut($employee, $checkOutTime);
        $this->assertTrue($result['valid']);
        $this->assertTrue($result['is_within_tolerance']);
        $this->assertEquals(0, $result['early_minutes']);
    }

    public function test_validate_check_out_early(): void
    {
        // Set test date to Monday
        Carbon::setTestNow(Carbon::parse('2025-10-27 16:30:00')); // Monday

        $employee = Employee::factory()->create();
        $location = Location::factory()->create();

        $schedule = EmployeeSchedule::factory()->create([
            'employee_id' => $employee->id,
            'location_id' => $location->id,
            'day_of_week' => 1, // Monday
            'start_time' => '08:00:00',
            'end_time' => '17:00:00',
            'early_checkout_tolerance_minutes' => 15,
            'is_active' => true,
        ]);

        // Check-out too early (30 minutes before end)
        $checkOutTime = Carbon::parse('16:30:00');
        $result = $this->scheduleValidationService->validateCheckOut($employee, $checkOutTime);
        $this->assertFalse($result['valid']);
        $this->assertFalse($result['is_within_tolerance']);
        $this->assertGreaterThan(0, $result['early_minutes']);
    }
}
