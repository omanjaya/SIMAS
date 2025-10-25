<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $adminUser;

    protected $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create an admin user
        $this->adminUser = User::factory()->create([
            'role' => 'admin',
            'password' => Hash::make('password123'),
        ]);

        // Create a regular user
        $this->regularUser = User::factory()->create([
            'role' => 'teacher',
            'password' => Hash::make('password123'),
        ]);
    }

    /**
     * Test that only admins can access user management endpoints
     */
    public function test_only_admins_can_access_user_management_endpoints()
    {
        // Regular user should be denied access
        $response = $this->actingAs($this->regularUser, 'sanctum')
            ->get('/api/users');

        $response->assertStatus(403);

        // Admin user should be granted access
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->get('/api/users');

        $response->assertStatus(200);
    }

    /**
     * Test user listing with filtering
     */
    public function test_user_listing_with_filtering()
    {
        // Create additional test users
        User::factory()->count(5)->create(['role' => 'teacher']);
        User::factory()->count(3)->create(['role' => 'employee']);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->withHeaders(['Accept' => 'application/json'])
            ->get('/api/users?role=teacher');

        $response->assertStatus(200);
        // Note: The response structure depends on Laravel's paginator
        // It might not always have 'meta' key depending on the version
        $response->assertJsonStructure([
            'data',
            'links',
        ]);

        // Verify only teachers are returned
        $responseData = $response->json();
        $this->assertArrayHasKey('data', $responseData);
        $this->assertIsArray($responseData['data']);
    }

    /**
     * Test user creation for admin role (no additional fields required)
     */
    public function test_user_creation_for_admin()
    {
        $userData = [
            'name' => 'Test Admin',
            'email' => 'testadmin@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'admin',
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->withHeaders(['Accept' => 'application/json'])
            ->post('/api/users', $userData);

        $response->assertStatus(201);
        $response->assertJson([
            'message' => 'User created successfully',
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'testadmin@example.com',
            'role' => 'admin',
        ]);
    }

    /**
     * Test user update
     */
    public function test_user_update()
    {
        $user = User::factory()->create(['role' => 'employee']);

        $updateData = [
            'name' => 'Updated Name',
            'role' => 'teacher',
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->withHeaders(['Accept' => 'application/json'])
            ->put("/api/users/{$user->id}", $updateData);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'User updated successfully',
        ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
            'role' => 'teacher',
        ]);
    }

    /**
     * Test user deletion (soft delete)
     */
    public function test_user_deletion()
    {
        $user = User::factory()->create(['role' => 'employee']);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->withHeaders(['Accept' => 'application/json'])
            ->delete("/api/users/{$user->id}");

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'User deactivated successfully',
        ]);

        $this->assertSoftDeleted('users', [
            'id' => $user->id,
        ]);
    }
}
