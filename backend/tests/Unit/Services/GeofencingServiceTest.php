<?php

namespace Tests\Unit\Services;

use App\Models\Employee;
use App\Models\EmployeeSchedule;
use App\Models\Location;
use App\Services\GeofencingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GeofencingServiceTest extends TestCase
{
    use RefreshDatabase;

    protected GeofencingService $geofencingService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->geofencingService = new GeofencingService;
    }

    public function test_calculate_distance_accuracy(): void
    {
        // Test distance calculation between two known points
        // Distance between (0,0) and (0,0) should be 0
        $distance = $this->geofencingService->calculateDistance(0, 0, 0, 0);
        $this->assertEquals(0, $distance);

        // Test distance between two different points
        // Expected distance between (0,0) and (1,1) should be approximately 157425 meters
        $distance = $this->geofencingService->calculateDistance(0, 0, 1, 1);
        $this->assertGreaterThan(157000, $distance);
        $this->assertLessThan(158000, $distance);
    }

    public function test_is_within_radius_returns_correctly(): void
    {
        $location = Location::factory()->create([
            'latitude' => -6.2293867,
            'longitude' => 106.8265753,
            'radius_meters' => 100,
        ]);

        // Inside radius
        $result = $this->geofencingService->isWithinRadius($location, -6.2293867, 106.8265753);
        $this->assertTrue($result['is_within_radius']);
        $this->assertLessThan(100, $result['distance']);

        // Outside radius
        $result = $this->geofencingService->isWithinRadius($location, -6.2280000, 106.8260000);
        $this->assertFalse($result['is_within_radius']);
        $this->assertGreaterThan(100, $result['distance']);
    }

    public function test_validate_employee_location_with_schedule(): void
    {
        $location = Location::factory()->create([
            'latitude' => -6.2293867,
            'longitude' => 106.8265753,
            'radius_meters' => 100,
        ]);

        $employee = Employee::factory()->create();
        $schedule = EmployeeSchedule::factory()->create([
            'employee_id' => $employee->id,
            'location_id' => $location->id,
            'day_of_week' => 1, // Monday
            'start_time' => '08:00:00',
            'end_time' => '17:00:00',
            'is_active' => true,
        ]);

        // Inside location radius on correct day
        $result = $this->geofencingService->validateEmployeeLocation($employee, -6.2293867, 106.8265753, 1);
        $this->assertTrue($result['valid']);
        $this->assertNotNull($result['location']);
        $this->assertNotNull($result['schedule']);

        // Outside location radius
        $result = $this->geofencingService->validateEmployeeLocation($employee, -6.2280000, 106.8260000, 1);
        $this->assertFalse($result['valid']);
    }

    public function test_validate_employee_location_without_schedule(): void
    {
        $employee = Employee::factory()->create();

        $result = $this->geofencingService->validateEmployeeLocation($employee, -6.2293867, 106.8265753, 1);
        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('No schedule', $result['reason']);
    }

    public function test_find_nearest_locations(): void
    {
        $location1 = Location::factory()->active()->create([
            'latitude' => -6.2293867,
            'longitude' => 106.8265753,
        ]);

        $location2 = Location::factory()->active()->create([
            'latitude' => -6.2300000,
            'longitude' => 106.8300000,
        ]);

        $nearest = $this->geofencingService->findNearestLocations(
            -6.2293867,
            106.8265753
        );

        $this->assertGreaterThanOrEqual(1, count($nearest));
        
        // Find location1 in the results
        $foundLocation1 = false;
        foreach ($nearest as $result) {
            if ($result['location']->id === $location1->id) {
                $foundLocation1 = true;
                break;
            }
        }
        $this->assertTrue($foundLocation1);
    }

    public function test_validate_gps_coordinates(): void
    {
        // Valid coordinates
        $result = $this->geofencingService->validateGpsCoordinates(-6.2293867, 106.8265753);
        $this->assertTrue($result['valid']);
        $this->assertEmpty($result['errors']);

        // Invalid latitude
        $result = $this->geofencingService->validateGpsCoordinates(100, 106.8265753);
        $this->assertFalse($result['valid']);
        $this->assertContains('Latitude must be between -90 and 90', $result['errors']);

        // Invalid longitude
        $result = $this->geofencingService->validateGpsCoordinates(-6.2293867, 200);
        $this->assertFalse($result['valid']);
        $this->assertContains('Longitude must be between -180 and 180', $result['errors']);

        // Both invalid
        $result = $this->geofencingService->validateGpsCoordinates(100, 200);
        $this->assertFalse($result['valid']);
        $this->assertCount(2, $result['errors']);
    }
}
