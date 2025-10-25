<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserImportControllerTest extends TestCase
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
     * Test downloading the user import template
     */
    public function test_download_user_import_template()
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->get('/api/user-import/template');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv');
        $response->assertHeader('Content-Disposition', 'attachment; filename="user_import_template.csv"');
    }

    /**
     * Test previewing import data
     */
    public function test_preview_import_data()
    {
        // Create a mock CSV file
        $csvContent = "Name,Email,Role,Password\nJohn Doe,john@example.com,employee,password123\nJane Smith,jane@example.com,teacher,password123";
        $file = UploadedFile::fake()->createWithContent('users.csv', $csvContent);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->post('/api/user-import/preview', [
                'file' => $file,
            ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'header',
            'preview_data',
            'total_rows',
        ]);

        $responseData = $response->json();
        $this->assertEquals(['Name', 'Email', 'Role', 'Password'], $responseData['header']);
        $this->assertCount(2, $responseData['preview_data']);
        $this->assertEquals(2, $responseData['total_rows']);
    }

    /**
     * Test importing users from CSV
     */
    public function test_import_users_from_csv()
    {
        // Create a mock CSV file
        $csvContent = "Name,Email,Role,Password\nJohn Doe,john@example.com,employee,password123\nJane Smith,jane@example.com,teacher,password123";
        $file = UploadedFile::fake()->createWithContent('users.csv', $csvContent);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->post('/api/user-import/import', [
                'file' => $file,
                'default_department' => 'IT',
                'default_position' => 'Developer',
            ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'message',
            'result' => [
                'success_count',
                'error_count',
                'errors',
            ],
        ]);

        // Check that users were created
        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
            'role' => 'employee',
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'jane@example.com',
            'role' => 'teacher',
        ]);
    }

    /**
     * Test that only admins can access import endpoints
     */
    public function test_only_admins_can_access_import_endpoints()
    {
        // Create a regular user
        $regularUser = User::factory()->create([
            'role' => 'teacher',
            'password' => Hash::make('password123'),
        ]);

        // Regular user should be denied access
        $response = $this->actingAs($regularUser, 'sanctum')
            ->get('/api/user-import/template');

        $response->assertStatus(403);
    }
}
