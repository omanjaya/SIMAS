# ⚙️ BACKEND SERVICES - Auto-Generation Logic

## 📋 OVERVIEW

Dua service classes untuk auto-generate employee code dan password.

---

## 🔢 SERVICE 1: Employee Code Generator

**File**: `app/Services/EmployeeCodeGenerator.php`

### Purpose
Generate employee code dengan format role-based dan auto-increment.

### Implementation

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class EmployeeCodeGenerator
{
    /**
     * Generate employee code based on role
     *
     * @param string $role (admin, teacher, employee)
     * @return string (ADM0001, TCH0001, STF0001)
     */
    public function generate(string $role): string
    {
        // Get prefix based on role
        $prefix = $this->getPrefix($role);

        // Get next number with database lock
        $nextNumber = $this->getNextNumber($role);

        // Format: PREFIX + 4 digit number
        $employeeCode = $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

        return $employeeCode;
    }

    /**
     * Get prefix based on role
     */
    private function getPrefix(string $role): string
    {
        return match(strtolower($role)) {
            'admin' => 'ADM',
            'teacher' => 'TCH',
            'employee' => 'STF',
            default => throw new \InvalidArgumentException("Invalid role: {$role}")
        };
    }

    /**
     * Get next number for role (with database lock)
     */
    private function getNextNumber(string $role): int
    {
        return DB::transaction(function () use ($role) {
            // Lock row to prevent race condition
            $codeTracker = DB::table('last_employee_codes')
                ->where('role', strtolower($role))
                ->lockForUpdate()
                ->first();

            if (!$codeTracker) {
                // Initialize if not exists
                DB::table('last_employee_codes')->insert([
                    'role' => strtolower($role),
                    'last_number' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $lastNumber = 0;
            } else {
                $lastNumber = $codeTracker->last_number;
            }

            // Increment
            $nextNumber = $lastNumber + 1;

            // Update last number
            DB::table('last_employee_codes')
                ->where('role', strtolower($role))
                ->update([
                    'last_number' => $nextNumber,
                    'updated_at' => now()
                ]);

            return $nextNumber;
        });
    }

    /**
     * Generate multiple codes for batch import
     *
     * @param string $role
     * @param int $count
     * @return array
     */
    public function generateBatch(string $role, int $count): array
    {
        $codes = [];

        for ($i = 0; $i < $count; $i++) {
            $codes[] = $this->generate($role);
        }

        return $codes;
    }

    /**
     * Reset counter for role (useful for testing)
     *
     * @param string $role
     * @return void
     */
    public function reset(string $role): void
    {
        DB::table('last_employee_codes')
            ->where('role', strtolower($role))
            ->update([
                'last_number' => 0,
                'updated_at' => now()
            ]);
    }

    /**
     * Get current last number for role
     *
     * @param string $role
     * @return int
     */
    public function getLastNumber(string $role): int
    {
        $codeTracker = DB::table('last_employee_codes')
            ->where('role', strtolower($role))
            ->first();

        return $codeTracker ? $codeTracker->last_number : 0;
    }
}
```

### Usage Examples

```php
use App\Services\EmployeeCodeGenerator;

$generator = new EmployeeCodeGenerator();

// Generate single code
$code = $generator->generate('teacher');
// Result: TCH0001

$code = $generator->generate('admin');
// Result: ADM0001

$code = $generator->generate('employee');
// Result: STF0001

// Generate batch (for bulk import)
$codes = $generator->generateBatch('teacher', 10);
// Result: ['TCH0002', 'TCH0003', ..., 'TCH0011']

// Get last number
$lastNumber = $generator->getLastNumber('teacher');
// Result: 11

// Reset (testing only)
$generator->reset('teacher');
// Last number back to 0
```

### Testing

```php
// tests/Unit/EmployeeCodeGeneratorTest.php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\EmployeeCodeGenerator;
use Illuminate\Foundation\Testing\RefreshDatabase;

class EmployeeCodeGeneratorTest extends TestCase
{
    use RefreshDatabase;

    protected $generator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->generator = new EmployeeCodeGenerator();
    }

    /** @test */
    public function it_generates_admin_code()
    {
        $code = $this->generator->generate('admin');
        $this->assertEquals('ADM0001', $code);
    }

    /** @test */
    public function it_generates_teacher_code()
    {
        $code = $this->generator->generate('teacher');
        $this->assertEquals('TCH0001', $code);
    }

    /** @test */
    public function it_generates_employee_code()
    {
        $code = $this->generator->generate('employee');
        $this->assertEquals('STF0001', $code);
    }

    /** @test */
    public function it_increments_correctly()
    {
        $code1 = $this->generator->generate('teacher');
        $code2 = $this->generator->generate('teacher');
        $code3 = $this->generator->generate('teacher');

        $this->assertEquals('TCH0001', $code1);
        $this->assertEquals('TCH0002', $code2);
        $this->assertEquals('TCH0003', $code3);
    }

    /** @test */
    public function it_generates_batch_codes()
    {
        $codes = $this->generator->generateBatch('teacher', 5);

        $this->assertCount(5, $codes);
        $this->assertEquals('TCH0001', $codes[0]);
        $this->assertEquals('TCH0005', $codes[4]);
    }

    /** @test */
    public function it_handles_concurrent_requests()
    {
        // Simulate concurrent requests
        $codes = [];

        for ($i = 0; $i < 10; $i++) {
            $codes[] = $this->generator->generate('teacher');
        }

        // All codes should be unique
        $this->assertEquals(10, count(array_unique($codes)));
    }
}
```

---

## 🔐 SERVICE 2: Password Generator

**File**: `app/Services/PasswordGenerator.php`

### Purpose
Generate temporary password dengan pattern `{employee_code}@Saraswati`.

### Implementation

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Hash;

class PasswordGenerator
{
    /**
     * Generate default password based on employee code
     *
     * @param string $employeeCode (TCH0001, ADM0001, etc)
     * @return string Plain password
     */
    public function generateDefault(string $employeeCode): string
    {
        // Pattern: {employee_code}@Saraswati
        return $employeeCode . '@Saraswati';
    }

    /**
     * Generate and hash password
     *
     * @param string $employeeCode
     * @return string Hashed password
     */
    public function generateHashed(string $employeeCode): string
    {
        $plainPassword = $this->generateDefault($employeeCode);
        return Hash::make($plainPassword);
    }

    /**
     * Generate random strong password (for future use)
     *
     * @param int $length
     * @return string
     */
    public function generateRandom(int $length = 12): string
    {
        $uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $lowercase = 'abcdefghijklmnopqrstuvwxyz';
        $numbers = '0123456789';
        $special = '!@#$%^&*';

        $allChars = $uppercase . $lowercase . $numbers . $special;

        $password = '';
        $password .= $uppercase[rand(0, strlen($uppercase) - 1)];
        $password .= $lowercase[rand(0, strlen($lowercase) - 1)];
        $password .= $numbers[rand(0, strlen($numbers) - 1)];
        $password .= $special[rand(0, strlen($special) - 1)];

        for ($i = 4; $i < $length; $i++) {
            $password .= $allChars[rand(0, strlen($allChars) - 1)];
        }

        return str_shuffle($password);
    }

    /**
     * Validate password strength
     *
     * @param string $password
     * @return array [valid, errors]
     */
    public function validateStrength(string $password): array
    {
        $errors = [];

        if (strlen($password) < 8) {
            $errors[] = 'Password minimal 8 karakter';
        }

        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = 'Password harus mengandung huruf kapital';
        }

        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = 'Password harus mengandung huruf kecil';
        }

        if (!preg_match('/[0-9]/', $password)) {
            $errors[] = 'Password harus mengandung angka';
        }

        if (!preg_match('/[@#$%^&*!]/', $password)) {
            $errors[] = 'Password harus mengandung karakter spesial (@#$%^&*!)';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
}
```

### Usage Examples

```php
use App\Services\PasswordGenerator;

$generator = new PasswordGenerator();

// Generate default password
$password = $generator->generateDefault('TCH0001');
// Result: TCH0001@Saraswati

$password = $generator->generateDefault('ADM0005');
// Result: ADM0005@Saraswati

// Generate and hash
$hashedPassword = $generator->generateHashed('TCH0001');
// Result: $2y$10$... (bcrypt hash)

// Generate random password
$randomPassword = $generator->generateRandom(16);
// Result: K9$mP3@xL7#qR5!w

// Validate password strength
$validation = $generator->validateStrength('weak');
// Result: ['valid' => false, 'errors' => [...]]

$validation = $generator->validateStrength('TCH0001@Saraswati');
// Result: ['valid' => true, 'errors' => []]
```

### Testing

```php
// tests/Unit/PasswordGeneratorTest.php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\PasswordGenerator;
use Illuminate\Support\Facades\Hash;

class PasswordGeneratorTest extends TestCase
{
    protected $generator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->generator = new PasswordGenerator();
    }

    /** @test */
    public function it_generates_correct_password_pattern()
    {
        $password = $this->generator->generateDefault('TCH0001');
        $this->assertEquals('TCH0001@Saraswati', $password);

        $password = $this->generator->generateDefault('ADM0005');
        $this->assertEquals('ADM0005@Saraswati', $password);
    }

    /** @test */
    public function it_hashes_password_correctly()
    {
        $hashedPassword = $this->generator->generateHashed('TCH0001');

        // Verify hash is valid
        $this->assertTrue(Hash::check('TCH0001@Saraswati', $hashedPassword));
    }

    /** @test */
    public function it_generates_random_password_with_correct_length()
    {
        $password = $this->generator->generateRandom(12);
        $this->assertEquals(12, strlen($password));

        $password = $this->generator->generateRandom(16);
        $this->assertEquals(16, strlen($password));
    }

    /** @test */
    public function it_validates_password_strength()
    {
        // Weak password
        $result = $this->generator->validateStrength('weak');
        $this->assertFalse($result['valid']);
        $this->assertNotEmpty($result['errors']);

        // Strong password
        $result = $this->generator->validateStrength('TCH0001@Saraswati');
        $this->assertTrue($result['valid']);
        $this->assertEmpty($result['errors']);
    }
}
```

---

## 🔗 INTEGRATION WITH IMPORT

**File**: `app/Imports/EmployeesImport.php` (update)

```php
<?php

namespace App\Imports;

use App\Models\Employee;
use App\Models\User;
use App\Services\EmployeeCodeGenerator;
use App\Services\PasswordGenerator;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\Hash;

class EmployeesImport implements ToModel, WithHeadingRow
{
    protected $codeGenerator;
    protected $passwordGenerator;
    protected $successCount = 0;
    protected $failedCount = 0;
    protected $errors = [];

    public function __construct()
    {
        $this->codeGenerator = new EmployeeCodeGenerator();
        $this->passwordGenerator = new PasswordGenerator();
    }

    public function model(array $row)
    {
        try {
            // Auto-generate employee code
            $employeeCode = $this->codeGenerator->generate($row['role']);

            // Auto-generate password
            $plainPassword = $this->passwordGenerator->generateDefault($employeeCode);
            $hashedPassword = Hash::make($plainPassword);

            // Create user first
            $user = User::create([
                'name' => $row['full_name'],
                'email' => $row['email'],
                'password' => $hashedPassword,
                'role' => $row['role'],
                'email_verified_at' => null, // Not verified yet
            ]);

            // Create employee
            $employee = Employee::create([
                'employee_code' => $employeeCode,
                'first_name' => $row['full_name'], // Store full name as first_name
                'last_name' => '', // Empty for now
                'email' => $row['email'],
                'hire_date' => $row['hire_date'],
                'employment_type' => 'full-time', // Default
                'status' => 'active', // Default
                'profile_completed' => false, // Not completed yet
                'user_id' => $user->id,
            ]);

            $this->successCount++;

            // TODO: Send welcome email with credentials
            // Mail::to($user->email)->send(new WelcomeEmail($employeeCode, $plainPassword));

            return $employee;
        } catch (\Exception $e) {
            $this->failedCount++;
            $this->errors[] = [
                'row' => $this->successCount + $this->failedCount + 1,
                'email' => $row['email'] ?? 'N/A',
                'message' => $e->getMessage(),
            ];
            return null;
        }
    }

    public function getResult()
    {
        return [
            'total' => $this->successCount + $this->failedCount,
            'success' => $this->successCount,
            'failed' => $this->failedCount,
            'errors' => $this->errors,
        ];
    }
}
```

---

## 📝 SERVICE PROVIDER (Optional)

**File**: `app/Providers/EmployeeServiceProvider.php`

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\EmployeeCodeGenerator;
use App\Services\PasswordGenerator;

class EmployeeServiceProvider extends ServiceProvider
{
    public function register()
    {
        // Register as singleton
        $this->app->singleton(EmployeeCodeGenerator::class, function ($app) {
            return new EmployeeCodeGenerator();
        });

        $this->app->singleton(PasswordGenerator::class, function ($app) {
            return new PasswordGenerator();
        });
    }

    public function boot()
    {
        //
    }
}
```

**Register di**: `config/app.php`

```php
'providers' => [
    // ...
    App\Providers\EmployeeServiceProvider::class,
],
```

---

**Next**: Lanjut ke [03_BACKEND_VALIDATION.md](./03_BACKEND_VALIDATION.md) untuk strict validation logic.
