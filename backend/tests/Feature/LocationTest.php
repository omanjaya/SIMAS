<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\EmployeeSchedule;
use App\Models\Location;
use App\Models\LocationAuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LocationTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $regularUser;
    protected Location $location;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminUser = User::factory()->create(['role' => 'admin']);
        $this->regularUser = User::factory()->create(['role' => 'employee']);
        $this->location = Location::factory()->create();
    }

    /** @test */
    public function admin_can_create_location(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/locations', [
                'name' => 'Test Office',
                'code' => 'TEST-OFFICE',
                'address' => '123 Test Street',
                'latitude' => -6.2293867,
                'longitude' => 106.8265753,
                'radius_meters' => 100,
                'description' => 'Test location for office',
                'is_active' => true,
            ]);

        $response->assertCreated()
            ->assertJson([
                'success' => true,
                'message' => 'Lokasi berhasil ditambahkan',
            ]);

        $this->assertDatabaseHas('locations', [
            'name' => 'Test Office',
            'code' => 'TEST-OFFICE',
            'latitude' => '-6.22938670',
            'longitude' => '106.82657530',
            'radius_meters' => 100,
        ]);
    }

    /** @test */
    public function admin_can_list_locations(): void
    {
        Location::factory(5)->create();

        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/locations');

        $response->assertOk()
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'code',
                        'address',
                        'latitude',
                        'longitude',
                        'radius_meters',
                        'description',
                        'is_active',
                        'created_at',
                        'updated_at',
                    ],
                ],
                'total',
                'current_page',
                'last_page',
                'per_page',
            ]);
    }

    /** @test */
    public function admin_can_view_specific_location(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->getJson("/api/locations/{$this->location->id}");

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'data' => $this->location->toArray(),
            ]);
    }

    /** @test */
    public function admin_can_update_location(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->putJson("/api/locations/{$this->location->id}", [
                'name' => 'Updated Office Name',
                'code' => 'UPD-OFFICE',
                'address' => '456 Updated Street',
                'latitude' => -6.2300000,
                'longitude' => 106.8300000,
                'radius_meters' => 150,
                'description' => 'Updated test location',
                'is_active' => false,
            ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Lokasi berhasil diperbarui',
            ]);

        $this->assertDatabaseHas('locations', [
            'id' => $this->location->id,
            'name' => 'Updated Office Name',
            'code' => 'UPD-OFFICE',
            'latitude' => '-6.23000000',
            'longitude' => '106.83000000',
            'radius_meters' => 150,
            'is_active' => false,
        ]);
    }

    /** @test */
    public function admin_can_delete_location(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->deleteJson("/api/locations/{$this->location->id}");

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Lokasi berhasil dihapus',
            ]);

        $this->assertSoftDeleted('locations', [
            'id' => $this->location->id,
        ]);
    }

    /** @test */
    public function location_has_coordinates_attribute(): void
    {
        $location = Location::factory()->create([
            'latitude' => -6.2293867,
            'longitude' => 106.8265753,
        ]);

        $this->assertEquals([
            'latitude' => -6.2293867,
            'longitude' => 106.8265753,
        ], $location->coordinates);
    }

    /** @test */
    public function location_audits_log_changes(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        // Create location
        $response = $this->actingAs($user)
            ->postJson('/api/locations', [
                'name' => 'Audit Test Office',
                'code' => 'AUDIT-TEST',
                'address' => '123 Audit Street',
                'latitude' => -6.2293867,
                'longitude' => 106.8265753,
                'radius_meters' => 100,
                'description' => 'Test location for audit',
                'is_active' => true,
            ]);

        $response->assertCreated();

        // Update location
        $locationId = $response->json('data.id');
        $this->actingAs($user)
            ->putJson("/api/locations/{$locationId}", [
                'name' => 'Updated Audit Office',
                'code' => 'AUDIT-TEST',
                'address' => '456 Updated Audit Street',
                'latitude' => -6.2300000,
                'longitude' => 106.8300000,
                'radius_meters' => 150,
                'description' => 'Updated test location for audit',
                'is_active' => false,
            ]);

        // Check audit logs
        $auditLogs = LocationAuditLog::where('location_id', $locationId)->get();
        $this->assertCount(2, $auditLogs); // Created + Updated

        $createdLog = $auditLogs->firstWhere('action', 'created');
        $updatedLog = $auditLogs->firstWhere('action', 'updated');

        $this->assertNotNull($createdLog);
        $this->assertNotNull($updatedLog);

        $this->assertEquals('created', $createdLog->action);
        $this->assertEquals('updated', $updatedLog->action);
    }

    /** @test */
    public function regular_users_cannot_manage_locations(): void
    {
        // Attempt to create location
        $response = $this->actingAs($this->regularUser)
            ->postJson('/api/locations', [
                'name' => 'Unauthorized Location',
                'code' => 'UNAUTH',
                'address' => 'Unauthorized Street',
                'latitude' => -6.2293867,
                'longitude' => 106.8265753,
                'radius_meters' => 100,
            ]);

        $response->assertForbidden();

        // Attempt to update location
        $response = $this->actingAs($this->regularUser)
            ->putJson("/api/locations/{$this->location->id}", [
                'name' => 'Unauthorized Update',
            ]);

        $response->assertForbidden();

        // Attempt to delete location
        $response = $this->actingAs($this->regularUser)
            ->deleteJson("/api/locations/{$this->location->id}");

        $response->assertForbidden();
    }

    /** @test */
    public function validates_required_fields(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/locations', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'code', 'address', 'latitude', 'longitude', 'radius_meters']);
    }

    /** @test */
    public function validates_gps_coordinates_format(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/locations', [
                'name' => 'Invalid GPS Location',
                'code' => 'INVALID-GPS',
                'address' => 'Invalid GPS Street',
                'latitude' => 100, // Invalid latitude
                'longitude' => 200, // Invalid longitude
                'radius_meters' => 100,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['latitude', 'longitude']);
    }

    /** @test */
    public function validates_unique_location_code(): void
    {
        $existingLocation = Location::factory()->create(['code' => 'DUPLICATE']);
        
        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/locations', [
                'name' => 'Duplicate Location',
                'code' => 'DUPLICATE', // Same code
                'address' => 'Duplicate Street',
                'latitude' => -6.2293867,
                'longitude' => 106.8265753,
                'radius_meters' => 100,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['code']);
    }

    /** @test */
    public function admin_can_view_location_stats(): void
    {
        Location::factory(5)->create(['is_active' => true]);
        Location::factory(3)->create(['is_active' => false]);

        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/locations-stats');

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_locations' => 9, // 1 existing + 5 active + 3 inactive
                    'active_locations' => 6, // 1 existing + 5 active
                    'inactive_locations' => 3,
                ],
            ]);
    }

    /** @test */
    public function location_can_be_deleted(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $location = Location::factory()->create();

        $response = $this->actingAs($admin)->deleteJson("/api/locations/{$location->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('locations', [
            'id' => $location->id,
        ]);
    }

    /** @test */
    public function admin_cannot_delete_location_in_use(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $location = Location::factory()->create();
        $employee = Employee::factory()->create();
        $schedule = EmployeeSchedule::factory()->create([
            'employee_id' => $employee->id,
            'location_id' => $location->id,
            'day_of_week' => 1, // Monday
            'start_time' => '08:00:00',
            'end_time' => '17:00:00',
            'late_tolerance_minutes' => 15,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->deleteJson("/api/locations/{$location->id}");

        $response->assertStatus(422);
        $this->assertDatabaseHas('locations', [
            'id' => $location->id,
        ]);
    }

    /** @test */
    public function location_audit_logs_are_recorded(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $location = Location::factory()->create();

        // Perform update action
        $this->actingAs($admin)->putJson("/api/locations/{$location->id}", [
            'name' => 'Updated Name',
        ]);

        // Check audit logs
        $response = $this->actingAs($admin)->getJson("/api/locations/{$location->id}/audit-logs");

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                '*' => ['id', 'action', 'user_id', 'location_id']
            ],
            'total',
            'current_page',
            'last_page',
        ]);
    }
}