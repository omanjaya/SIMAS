<?php

namespace Tests\Feature\API;

use App\Models\AuditLog;
use App\Models\BiometricImport;
use App\Models\Employee;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminToolsAPITest extends TestCase
{
    use RefreshDatabase;

    public function test_bulk_enrollment_api(): void
    {
        // Fake job dispatching to prevent actual job execution
        Bus::fake();

        // Create admin user
        $admin = User::factory()->admin()->create();
        $token = $admin->createToken('test-token')->plainTextToken;

        // Create test employees
        $employee1 = Employee::factory()->create([
            'employee_code' => 'EMP001',
        ]);
        $employee2 = Employee::factory()->create([
            'employee_code' => 'EMP002',
        ]);

        // Create a CSV file for testing
        $csvContent = "employee_code,image_path\nEMP001,/test/image1.jpg\nEMP002,/test/image2.jpg";
        $csvFile = UploadedFile::fake()->createWithContent('test_biometric_upload.csv', $csvContent);

        // Test bulk enrollment API
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->post('/api/biometrics/bulk-enrollment', [
                'csv_file' => $csvFile,
            ]);

        // The response should be successful (as the job is queued)
        $response->assertStatus(202); // 202 Accepted

        // Check if an import record was created
        $this->assertDatabaseHas('biometric_imports', [
            'user_id' => $admin->id,
            'status' => 'pending',
        ]);

        // Assert that the job was dispatched
        Bus::assertDispatched(\App\Jobs\ProcessBiometricBulkEnrollment::class);
    }

    public function test_get_import_history(): void
    {
        // Create admin user
        $admin = User::factory()->admin()->create();
        $token = $admin->createToken('test-token')->plainTextToken;

        // Create a biometric import record
        $import = BiometricImport::factory()->create([
            'user_id' => $admin->id,
        ]);

        // Test getting import history
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/biometrics/imports');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data',
            'pagination' => [
                'current_page',
                'per_page',
                'total',
                'last_page',
            ],
        ]);
    }

    public function test_get_import_details(): void
    {
        // Create admin user
        $admin = User::factory()->admin()->create();
        $token = $admin->createToken('test-token')->plainTextToken;

        // Create a biometric import record
        $import = BiometricImport::factory()->create([
            'user_id' => $admin->id,
        ]);

        // Test getting import details
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson("/api/biometrics/imports/{$import->id}");

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'id',
                'filename',
                'user_id',
                'total_records',
                'successful_records',
                'failed_records',
                'status',
                'created_at',
                'user' => [
                    'id',
                    'name',
                ],
            ],
        ]);
    }

    public function test_settings_crud_operations(): void
    {
        // Create admin user
        $admin = User::factory()->admin()->create();
        $token = $admin->createToken('test-token')->plainTextToken;

        // Test creating a setting
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/settings/geofence.radius', [
                'value' => '50',
                'type' => 'integer',
                'category' => 'geofence',
                'description' => 'Maximum allowed distance from work location in meters',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('settings', [
            'key' => 'geofence.radius',
            'value' => '50',
        ]);

        // Test getting all settings
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/settings');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data',
        ]);

        // Test getting specific setting
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/settings/geofence.radius');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'id',
                'key',
                'value',
                'type',
                'category',
                'description',
            ],
        ]);

        // Test bulk update settings
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/settings/bulk-update', [
                'settings' => [
                    [
                        'key' => 'payroll.tax_percentage',
                        'value' => '5',
                        'type' => 'integer',
                        'category' => 'payroll',
                        'description' => 'Default tax percentage for payroll calculations',
                    ],
                    [
                        'key' => 'notification.email_enabled',
                        'value' => 'true',
                        'type' => 'boolean',
                        'category' => 'notification',
                        'description' => 'Enable email notifications',
                    ],
                ],
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('settings', [
            'key' => 'payroll.tax_percentage',
            'value' => '5',
        ]);
        $this->assertDatabaseHas('settings', [
            'key' => 'notification.email_enabled',
            'value' => '1', // boolean true becomes '1' in string format
        ]);
    }

    public function test_audit_logs_api(): void
    {
        // Create admin user
        $admin = User::factory()->admin()->create();
        $token = $admin->createToken('test-token')->plainTextToken;

        // Create some audit log entries
        AuditLog::create([
            'user_id' => $admin->id,
            'action' => 'User@update',
            'model' => 'User',
            'payload' => ['id' => 1, 'name' => 'Test User'],
            'ip_address' => '127.0.0.1',
        ]);

        // Test getting audit logs
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/audit-logs');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data',
            'pagination' => [
                'current_page',
                'per_page',
                'total',
                'last_page',
            ],
        ]);

        // Test getting specific audit log
        $auditLog = AuditLog::first();
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson("/api/audit-logs/{$auditLog->id}");

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'id',
                'user_id',
                'action',
                'model',
                'payload',
                'ip_address',
                'created_at',
                'user' => [
                    'id',
                    'name',
                    'email',
                ],
            ],
        ]);
    }

    public function test_backup_api(): void
    {
        // Mock Artisan calls to prevent actual command execution
        Artisan::shouldReceive('call')
            ->with('attendance:backup', \Mockery::any())
            ->andReturn(0); // Return success exit code

        Artisan::shouldReceive('output')
            ->andReturn('Backup created successfully');

        // Create admin user
        $admin = User::factory()->admin()->create();
        $token = $admin->createToken('test-token')->plainTextToken;

        // Create a fake backup directory
        Storage::fake('local');
        Storage::makeDirectory('backups');

        // Test getting list of backups (should be empty initially)
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/backups');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data',
        ]);

        // Test creating a backup
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->post('/api/backups/run', [
                'filename' => 'test_backup_'.time().'.zip',
            ]);

        // The backup might take time, so we expect either success or a job queued response
        $response->assertStatus(200);
    }
}
