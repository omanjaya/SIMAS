<?php

namespace Tests\Feature\Auth;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_can_register_through_admin(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/users', [
                'name' => 'Test Employee',
                'email' => 'test@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'role' => 'employee',
                'first_name' => 'Test',
                'last_name' => 'Employee',
                'employee_code' => 'EMP001',
                'hire_date' => now()->toDateString(),
                'employment_type' => 'full-time',
                'department' => 'IT',
                'position' => 'Developer',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'role' => 'employee',
        ]);
        $this->assertDatabaseHas('employees', [
            'email' => 'test@example.com',
            'employee_code' => 'EMP001',
        ]);
    }

    public function test_users_can_login(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user',
                'token',
                'token_type',
            ]);
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/logout');

        $response->assertStatus(200);
    }

    public function test_users_can_view_profile(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/me');

        $response->assertStatus(200)
            ->assertJson([
                'id' => $user->id,
                'email' => $user->email,
            ]);
    }

    public function test_users_can_update_profile(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/profile', [
                'name' => 'Updated Name',
                'email' => 'updated@example.com',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
        ]);
    }

    public function test_users_can_update_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('oldpassword'),
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/profile/password', [
                'current_password' => 'oldpassword',
                'new_password' => 'newpassword123',
                'new_password_confirmation' => 'newpassword123',
            ]);

        $response->assertStatus(200);
    }

    public function test_role_middleware_blocks_unauthorized_access(): void
    {
        $employee = User::factory()->employee()->create();
        $token = $employee->createToken('test-token')->plainTextToken;

        // Try to access admin-only route as employee
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/users', [
                'name' => 'Another User',
                'email' => 'another@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'role' => 'employee',
                'first_name' => 'Another',
                'last_name' => 'User',
                'employee_code' => 'EMP002',
                'hire_date' => now()->toDateString(),
                'employment_type' => 'full-time',
                'department' => 'Finance',
                'position' => 'Accountant',
            ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_access_admin_routes(): void
    {
        $admin = User::factory()->admin()->create();
        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/users', [
                'name' => 'New Employee',
                'email' => 'newemployee@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'role' => 'employee',
                'first_name' => 'New',
                'last_name' => 'Employee',
                'employee_code' => 'EMP003',
                'hire_date' => now()->toDateString(),
                'employment_type' => 'full-time',
                'department' => 'HR',
                'position' => 'Manager',
            ]);

        $response->assertStatus(201);
    }
}
