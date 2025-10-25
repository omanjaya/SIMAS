# 💾 DATABASE SCHEMA - Migrations & Changes

## 📋 OVERVIEW

Total: **3 migrations** untuk support simplified import system.

---

## 🗄️ MIGRATION 1: Add Profile Completion Tracking

**File**: `database/migrations/2025_10_20_100000_add_profile_completion_to_employees.php`

### Purpose
Track apakah employee sudah melengkapi profile atau belum.

### Schema Changes

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            // Track profile completion status
            $table->boolean('profile_completed')->default(false)->after('status');

            // Track first login timestamp
            $table->timestamp('first_login_at')->nullable()->after('profile_completed');

            // Add index for query performance
            $table->index('profile_completed');
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropIndex(['profile_completed']);
            $table->dropColumn(['profile_completed', 'first_login_at']);
        });
    }
};
```

### Columns Detail

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `profile_completed` | boolean | NO | false | Apakah user sudah complete profile |
| `first_login_at` | timestamp | YES | NULL | Timestamp first login user |

### Usage Example

```php
// Check if profile completed
if (!$employee->profile_completed) {
    return redirect('/complete-profile');
}

// Set profile completed
$employee->update([
    'profile_completed' => true
]);

// Track first login
if (!$employee->first_login_at) {
    $employee->update([
        'first_login_at' => now()
    ]);
}
```

---

## 🗄️ MIGRATION 2: Make Optional Fields Nullable

**File**: `database/migrations/2025_10_20_100001_make_employee_fields_nullable.php`

### Purpose
Make personal fields nullable karena akan diisi saat profile completion.

### Schema Changes

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            // Make personal info nullable (filled during profile completion)
            $table->string('first_name')->nullable()->change();
            $table->string('last_name')->nullable()->change();
            $table->string('phone')->nullable()->change();
            $table->string('address')->nullable()->change();
            $table->date('date_of_birth')->nullable()->change();
            $table->enum('gender', ['male', 'female'])->nullable()->change();
            $table->string('position')->nullable()->change();
            $table->string('department')->nullable()->change();

            // Salary will be set by payroll admin
            $table->decimal('salary', 10, 2)->nullable()->change();
            $table->enum('salary_type', ['hourly', 'monthly'])->nullable()->change();

            // Employment type has default
            $table->enum('employment_type', ['full-time', 'part-time', 'contract', 'intern'])
                  ->default('full-time')->change();
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->string('first_name')->nullable(false)->change();
            $table->string('last_name')->nullable(false)->change();
            // Note: Reverting all nullable changes might cause issues
            // if data already exists. Handle with care.
        });
    }
};
```

### Fields Made Nullable

**Personal Info** (diisi saat profile completion):
- `first_name` - Will be filled from full_name initially
- `last_name` - User can split name later
- `phone` - Required di profile completion
- `address` - Optional di profile completion
- `date_of_birth` - Required di profile completion
- `gender` - Required di profile completion
- `position` - Required di profile completion
- `department` - Optional di profile completion

**Salary Info** (diisi oleh payroll admin):
- `salary` - Set manually by admin
- `salary_type` - Set manually by admin

---

## 🗄️ MIGRATION 3: Last Employee Codes Table

**File**: `database/migrations/2025_10_20_100002_create_last_employee_codes_table.php`

### Purpose
Track last number untuk auto-generate employee code per role.

### Schema Changes

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('last_employee_codes', function (Blueprint $table) {
            $table->id();
            $table->string('role', 20)->unique(); // admin, teacher, employee
            $table->integer('last_number')->default(0); // Last generated number
            $table->timestamps();

            $table->index('role');
        });

        // Insert default values
        DB::table('last_employee_codes')->insert([
            ['role' => 'admin', 'last_number' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['role' => 'teacher', 'last_number' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['role' => 'employee', 'last_number' => 0, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('last_employee_codes');
    }
};
```

### Table Structure

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `role` | string(20) | Role: admin, teacher, employee |
| `last_number` | integer | Last generated number (0 = none yet) |
| `created_at` | timestamp | Created timestamp |
| `updated_at` | timestamp | Updated timestamp |

### Usage Example

```php
// Get next employee code for teacher
$codeTracker = DB::table('last_employee_codes')
    ->where('role', 'teacher')
    ->lockForUpdate() // Prevent race condition
    ->first();

$nextNumber = $codeTracker->last_number + 1;
$employeeCode = 'TCH' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
// Result: TCH0001

// Update last number
DB::table('last_employee_codes')
    ->where('role', 'teacher')
    ->update(['last_number' => $nextNumber]);
```

### Initial Data

```sql
INSERT INTO last_employee_codes (role, last_number) VALUES
('admin', 0),
('teacher', 0),
('employee', 0);
```

**After first import**:
```sql
-- If imported 2 admin, 15 teacher, 8 employee
-- admin: 2
-- teacher: 15
-- employee: 8
```

---

## 📊 UPDATED EMPLOYEES TABLE SCHEMA

Setelah semua migrations, table `employees` akan memiliki struktur:

```sql
CREATE TABLE employees (
    id BIGINT PRIMARY KEY,
    employee_code VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NULLABLE,
    last_name VARCHAR(255) NULLABLE,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255) NULLABLE,
    address VARCHAR(255) NULLABLE,
    date_of_birth DATE NULLABLE,
    gender ENUM('male', 'female') NULLABLE,
    position VARCHAR(255) NULLABLE,
    department VARCHAR(255) NULLABLE,
    hire_date DATE NOT NULL,
    employment_type ENUM('full-time', 'part-time', 'contract', 'intern') DEFAULT 'full-time',
    salary DECIMAL(10, 2) NULLABLE,
    salary_type ENUM('hourly', 'monthly') NULLABLE,
    emergency_contact JSON NULLABLE,
    profile_image VARCHAR(255) NULLABLE,
    status VARCHAR(255) DEFAULT 'active',
    profile_completed BOOLEAN DEFAULT FALSE,
    first_login_at TIMESTAMP NULLABLE,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULLABLE,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX (employee_code, status),
    INDEX (user_id),
    INDEX (profile_completed)
);
```

---

## 🔄 DATA MIGRATION (Existing Data)

Jika ada data lama, jalankan:

```php
// Set profile_completed = true untuk existing employees
DB::table('employees')
    ->whereNotNull('phone')
    ->whereNotNull('date_of_birth')
    ->whereNotNull('gender')
    ->whereNotNull('position')
    ->update(['profile_completed' => true]);

// Initialize last_employee_codes from existing data
$lastAdmin = DB::table('employees')
    ->join('users', 'employees.user_id', '=', 'users.id')
    ->where('users.role', 'admin')
    ->where('employees.employee_code', 'LIKE', 'ADM%')
    ->orderBy('employees.employee_code', 'desc')
    ->value('employee_code');

if ($lastAdmin) {
    $lastNumber = intval(substr($lastAdmin, 3));
    DB::table('last_employee_codes')
        ->where('role', 'admin')
        ->update(['last_number' => $lastNumber]);
}

// Repeat for teacher and employee
```

---

## ✅ VALIDATION CHECKS

Setelah run migrations, verify:

```bash
# Check columns exist
php artisan tinker
>>> Schema::hasColumn('employees', 'profile_completed');
=> true

>>> Schema::hasColumn('employees', 'first_login_at');
=> true

# Check table exists
>>> Schema::hasTable('last_employee_codes');
=> true

# Check initial data
>>> DB::table('last_employee_codes')->get();
=> Collection with 3 items (admin, teacher, employee)
```

---

## 🚀 RUN MIGRATIONS

```bash
# Run all migrations
php artisan migrate

# Rollback if needed
php artisan migrate:rollback --step=3

# Fresh migrate (DANGER: drops all data)
php artisan migrate:fresh

# Check migration status
php artisan migrate:status
```

---

**Next**: Lanjut ke [02_BACKEND_SERVICES.md](./02_BACKEND_SERVICES.md) untuk auto-generation logic.
