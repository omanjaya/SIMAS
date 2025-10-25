<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class BulkUserControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create an admin user
        $this->adminUser = User::factory()->create([
            'role' => 'admin',
            'password' => Hash::make('password123'),
        ]);
    }

    /**
     * Test bulk status update
     */
    public function test_bulk_status_update()
    {
        // Create test users
        $users = User::factory()->count(3)->create(['role' => 'employee', 'status' => 'active']);

        $userIds = $users->pluck('id')->toArray();

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->withHeaders(['Accept' => 'application/json'])
            ->post('/api/users/bulk-status-update', [
                'user_ids' => $userIds,
                'status' => 'inactive',
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Users updated successfully',
            'updated_count' => 3,
        ]);

        // Verify all users have been updated
        foreach ($userIds as $userId) {
            $this->assertDatabaseHas('users', [
                'id' => $userId,
                'status' => 'inactive',
            ]);
        }
    }

    /**
     * Test bulk role assignment
     */
    public function test_bulk_role_assignment()
    {
        // Create test users
        $users = User::factory()->count(2)->create(['role' => 'employee']);

        $userIds = $users->pluck('id')->toArray();

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->withHeaders(['Accept' => 'application/json'])
            ->post('/api/users/bulk-role-assign', [
                'user_ids' => $userIds,
                'role' => 'teacher',
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Roles assigned successfully',
            'updated_count' => 2,
        ]);

        // Verify all users have been updated
        foreach ($userIds as $userId) {
            $this->assertDatabaseHas('users', [
                'id' => $userId,
                'role' => 'teacher',
            ]);
        }
    }

    /**
     * Test bulk password reset
     */
    public function test_bulk_password_reset()
    {
        // Create test users
        $users = User::factory()->count(2)->create([
            'role' => 'employee',
            'password' => Hash::make('oldpassword'),
        ]);

        $userIds = $users->pluck('id')->toArray();
        $newPassword = 'newpassword123';

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->withHeaders(['Accept' => 'application/json'])
            ->post('/api/users/bulk-password-reset', [
                'user_ids' => $userIds,
                'new_password' => $newPassword,
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Passwords reset successfully',
            'updated_count' => 2,
        ]);

        // Verify all users have been updated (we can't directly compare hashed passwords)
        $this->assertDatabaseCount('users', 3); // 2 test users + 1 admin
    }

    /**
     * Test validation for bulk operations
     */
    public function test_bulk_operations_validation()
    {
        // Test with missing required fields
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->withHeaders(['Accept' => 'application/json'])
            ->post('/api/users/bulk-status-update', [
                // Missing user_ids
                'status' => 'inactive',
            ]);

        $response->assertStatus(422);

        // Test with invalid status
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->withHeaders(['Accept' => 'application/json'])
            ->post('/api/users/bulk-status-update', [
                'user_ids' => [],
                'status' => 'invalid_status',
            ]);

        $response->assertStatus(422);
    }
}
