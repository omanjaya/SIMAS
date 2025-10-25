<?php

namespace Tests\Feature\API;

use App\Models\Employee;
use App\Models\EmployeeSchedule;
use App\Models\Location;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceValidationTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Employee $employee;
    protected Location $location;
    protected EmployeeSchedule $schedule;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create(['role' => 'employee']);
        $this->employee = Employee::factory()->create(['user_id' => $this->user->id]);
        $this->location = Location::factory()->active()->create([
            'latitude' => -6.2293867,
            'longitude' => 106.8265753,
            'radius_meters' => 100,
        ]);

        // Create Monday schedule: 08:00 - 17:00
        $this->schedule = EmployeeSchedule::factory()->active()->create([
            'employee_id' => $this->employee->id,
            'location_id' => $this->location->id,
            'day_of_week' => 1, // Monday
            'start_time' => '08:00:00',
            'end_time' => '17:00:00',
            'late_tolerance_minutes' => 15,
            'early_checkout_tolerance_minutes' => 15,
        ]);
    }

    /** @test */
    public function employee_can_clock_in_successfully_with_valid_location_and_schedule()
    {
        Carbon::setTestNow(Carbon::parse('2025-10-27 08:05:00')); // Monday, on-time

        $response = $this->actingAs($this->user)
            ->postJson('/api/clock-in', [
                'latitude' => -6.2293867, // Exact location
                'longitude' => 106.8265753,
            ]);

        $response->assertCreated()
            ->assertJson([
                'success' => true,
                'message' => 'Check-in berhasil',
            ]);

        $this->assertDatabaseHas('attendances', [
            'employee_id' => $this->employee->id,
            'check_in_validation_passed' => true,
        ]);

        $this->assertDatabaseHas('attendance_validations', [
            'employee_id' => $this->employee->id,
            'validation_type' => 'check_in',
            'overall_validation_passed' => true,
        ]);
    }

    /** @test */
    public function clock_in_fails_when_outside_location_radius()
    {
        Carbon::setTestNow(Carbon::parse('2025-10-27 08:05:00'));

        $response = $this->actingAs($this->user)
            ->postJson('/api/clock-in', [
                'latitude' => -6.2393867, // ~1km away
                'longitude' => 106.8365753,
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);

        $this->assertDatabaseHas('attendance_validations', [
            'employee_id' => $this->employee->id,
            'overall_validation_passed' => false,
            'location_validation_passed' => false,
        ]);

        $this->assertDatabaseMissing('attendances', [
            'employee_id' => $this->employee->id,
        ]);
    }

    /** @test */
    public function clock_in_fails_when_outside_schedule_time()
    {
        Carbon::setTestNow(Carbon::parse('2025-10-27 08:20:00')); // 20 min late

        $response = $this->actingAs($this->user)
            ->postJson('/api/clock-in', [
                'latitude' => -6.2293867,
                'longitude' => 106.8265753,
            ]);

        $response->assertStatus(422);

        $this->assertDatabaseHas('attendance_validations', [
            'employee_id' => $this->employee->id,
            'overall_validation_passed' => false,
            'schedule_validation_passed' => false,
        ]);
    }

    /** @test */
    public function clock_in_fails_when_no_schedule_for_day()
    {
        Carbon::setTestNow(Carbon::parse('2025-10-28 08:05:00')); // Tuesday, no schedule

        $response = $this->actingAs($this->user)
            ->postJson('/api/clock-in', [
                'latitude' => -6.2293867,
                'longitude' => 106.8265753,
            ]);

        $response->assertStatus(422)
            ->assertJsonFragment(['message' => 'Check-in gagal: Tidak ada jadwal untuk hari ini']);
    }

    /** @test */
    public function prevents_duplicate_check_in_on_same_day()
    {
        Carbon::setTestNow(Carbon::parse('2025-10-27 08:05:00'));

        // First check-in
        $this->actingAs($this->user)
            ->postJson('/api/clock-in', [
                'latitude' => -6.2293867,
                'longitude' => 106.8265753,
            ])
            ->assertCreated();

        // Second check-in attempt
        $response = $this->actingAs($this->user)
            ->postJson('/api/clock-in', [
                'latitude' => -6.2293867,
                'longitude' => 106.8265753,
            ]);

        $response->assertStatus(422)
            ->assertJsonFragment(['message' => 'Anda sudah melakukan check-in hari ini']);
    }

    /** @test */
    public function validates_gps_coordinates_format()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/clock-in', [
                'latitude' => 100, // Invalid
                'longitude' => 200, // Invalid
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['latitude', 'longitude']);
    }

    /** @test */
    public function admin_can_view_failed_validation_attempts()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // Create some failed attempts
        Carbon::setTestNow(Carbon::parse('2025-10-27 08:05:00'));

        $this->actingAs($this->user)
            ->postJson('/api/clock-in', [
                'latitude' => -6.2393867, // Outside radius
                'longitude' => 106.8365753,
            ]);

        $response = $this->actingAs($admin)
            ->getJson('/api/attendance-validations/failed');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['id', 'employee_id', 'validation_type', 'overall_validation_passed']
                ]
            ]);
    }

    /** @test */
    public function employee_can_clock_out_successfully_with_valid_location(): void
    {
        Carbon::setTestNow(Carbon::parse('2025-10-27 08:05:00')); // Monday, on-time

        $clockInResponse = $this->actingAs($this->user)
            ->postJson('/api/clock-in', [
                'latitude' => -6.2293867,
                'longitude' => 106.8265753,
            ]);

        $clockInResponse->assertCreated();
        $attendanceId = $clockInResponse->json('attendance.id');
        $this->assertNotNull($attendanceId);

        Carbon::setTestNow(Carbon::parse('2025-10-27 17:05:00')); // Within checkout tolerance

        $clockOutResponse = $this->actingAs($this->user)
            ->postJson('/api/clock-out', [
                'attendance_id' => $attendanceId,
                'latitude' => -6.2293867,
                'longitude' => 106.8265753,
            ]);

        $clockOutResponse->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Check-out berhasil',
            ]);

        $this->assertDatabaseHas('attendances', [
            'id' => $attendanceId,
            'employee_id' => $this->employee->id,
            'check_out_validation_passed' => true,
        ]);

        $this->assertDatabaseHas('attendance_validations', [
            'attendance_id' => $attendanceId,
            'validation_type' => 'check_out',
            'overall_validation_passed' => true,
        ]);
    }

    /** @test */
    public function clock_out_fails_when_outside_location_radius(): void
    {
        Carbon::setTestNow(Carbon::parse('2025-10-27 08:05:00'));

        $clockInResponse = $this->actingAs($this->user)
            ->postJson('/api/clock-in', [
                'latitude' => -6.2293867,
                'longitude' => 106.8265753,
            ]);

        $clockInResponse->assertCreated();
        $attendanceId = $clockInResponse->json('attendance.id');
        $this->assertNotNull($attendanceId);

        Carbon::setTestNow(Carbon::parse('2025-10-27 16:55:00'));

        $clockOutResponse = $this->actingAs($this->user)
            ->postJson('/api/clock-out', [
                'attendance_id' => $attendanceId,
                'latitude' => -6.2393867,
                'longitude' => 106.8365753,
            ]);

        $clockOutResponse->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Check-out gagal: Lokasi tidak valid',
            ]);

        $this->assertDatabaseHas('attendance_validations', [
            'attendance_id' => $attendanceId,
            'validation_type' => 'check_out',
            'overall_validation_passed' => false,
            'location_validation_passed' => false,
        ]);

        $this->assertDatabaseMissing('attendances', [
            'id' => $attendanceId,
            'check_out_time' => '2025-10-27 16:55:00',
        ]);
    }
}
