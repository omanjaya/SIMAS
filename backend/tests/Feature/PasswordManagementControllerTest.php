<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PasswordManagementControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $adminUser;

    protected $testUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create an admin user
        $this->adminUser = User::factory()->create([
            'role' => 'admin',
            'password' => Hash::make('password123'),
        ]);

        // Create a test user
        $this->testUser = User::factory()->create([
            'role' => 'employee',
            'password' => Hash::make('oldpassword'),
        ]);
    }

    /**
     * Test generating random password for user
     */
    public function test_generate_random_password()
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->post("/api/password-management/{$this->testUser->id}/generate-random");

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Random password generated successfully',
        ]);

        // Check that password was actually changed (can't directly compare hashed passwords)
        $this->assertDatabaseMissing('users', [
            'id' => $this->testUser->id,
            'password' => Hash::make('oldpassword'),
        ]);
    }

    /**
     * Test resetting user password
     */
    public function test_reset_user_password()
    {
        $newPassword = 'newpassword123';

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->post("/api/password-management/{$this->testUser->id}/reset", [
                'new_password' => $newPassword,
                'new_password_confirmation' => $newPassword,
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Password reset successfully',
        ]);

        // Check that password was actually changed
        $this->assertDatabaseMissing('users', [
            'id' => $this->testUser->id,
            'password' => Hash::make('oldpassword'),
        ]);
    }

    /**
     * Test password reset validation
     */
    public function test_password_reset_validation()
    {
        // Test password confirmation mismatch
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->post("/api/password-management/{$this->testUser->id}/reset", [
                'new_password' => 'newpassword123',
                'new_password_confirmation' => 'differentpassword',
            ]);

        $response->assertStatus(422);

        // Test password too short
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->post("/api/password-management/{$this->testUser->id}/reset", [
                'new_password' => 'short',
                'new_password_confirmation' => 'short',
            ]);

        $response->assertStatus(422);
    }

    /**
     * Test that only admins can access password management endpoints
     */
    public function test_only_admins_can_access_password_management_endpoints()
    {
        // Create a regular user
        $regularUser = User::factory()->create([
            'role' => 'teacher',
            'password' => Hash::make('password123'),
        ]);

        // Regular user should be denied access
        $response = $this->actingAs($regularUser, 'sanctum')
            ->post("/api/password-management/{$this->testUser->id}/reset", [
                'new_password' => 'newpassword123',
                'new_password_confirmation' => 'newpassword123',
            ]);

        $response->assertStatus(403);
    }
}
