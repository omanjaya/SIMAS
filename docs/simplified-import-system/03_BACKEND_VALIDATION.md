# ✅ BACKEND VALIDATION - Strict Validation Logic

## 📋 OVERVIEW

Implementasi **STRICT validation** - Tidak bisa import jika ada 1 error pun.

---

## 🎯 VALIDATION STRATEGY

```
Upload CSV → Validate ALL rows → Show ALL errors
   ↓
❌ Ada error? → Return error list → User fix → Upload ulang
✅ Semua valid? → Proceed to import
```

**Key Principle**: **All or Nothing** - Tidak ada partial import.

---

## 📝 VALIDATION CONTROLLER

**File**: `app/Http/Controllers/API/ValidationController.php`

```php
<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Employee;
use Maatwebsite\Excel\Facades\Excel;

class ValidationController extends Controller
{
    /**
     * Validate import file before actual import
     *
     * POST /api/employees/validate-import
     */
    public function validateImport(Request $request)
    {
        // Validate file upload
        $fileValidator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:xlsx,csv,xls|max:10240', // 10MB
        ]);

        if ($fileValidator->fails()) {
            return response()->json([
                'valid' => false,
                'message' => 'File tidak valid',
                'errors' => [[
                    'row' => 0,
                    'data' => [],
                    'errors' => $fileValidator->errors()->all()
                ]]
            ], 422);
        }

        // Parse CSV/Excel
        try {
            $rows = Excel::toArray([], $request->file('file'))[0];
        } catch (\Exception $e) {
            return response()->json([
                'valid' => false,
                'message' => 'Gagal membaca file',
                'errors' => [[
                    'row' => 0,
                    'data' => [],
                    'errors' => ['File tidak bisa dibaca: ' . $e->getMessage()]
                ]]
            ], 422);
        }

        // Remove header row
        $header = array_shift($rows);

        if (empty($rows)) {
            return response()->json([
                'valid' => false,
                'message' => 'File kosong',
                'errors' => [[
                    'row' => 0,
                    'data' => [],
                    'errors' => ['File tidak mengandung data']
                ]]
            ], 422);
        }

        // Validate all rows
        $validationErrors = [];
        $existingEmails = Employee::pluck('email')->toArray();
        $emailsInFile = [];

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2; // +2 because row 1 = header, index starts from 0
            $rowData = $this->parseRow($row, $header);
            $rowErrors = [];

            // Validate full_name
            if (empty(trim($rowData['full_name'] ?? ''))) {
                $rowErrors[] = 'Nama tidak boleh kosong';
            } elseif (strlen($rowData['full_name']) < 3) {
                $rowErrors[] = 'Nama minimal 3 karakter';
            } elseif (strlen($rowData['full_name']) > 100) {
                $rowErrors[] = 'Nama maksimal 100 karakter';
            }

            // Validate email
            if (empty(trim($rowData['email'] ?? ''))) {
                $rowErrors[] = 'Email tidak boleh kosong';
            } elseif (!filter_var($rowData['email'], FILTER_VALIDATE_EMAIL)) {
                $rowErrors[] = "Email format tidak valid: '{$rowData['email']}'";
            } elseif (strlen($rowData['email']) > 255) {
                $rowErrors[] = 'Email maksimal 255 karakter';
            } elseif (in_array($rowData['email'], $existingEmails)) {
                $existingEmployee = Employee::where('email', $rowData['email'])->first();
                $empCode = $existingEmployee ? $existingEmployee->employee_code : 'Unknown';
                $rowErrors[] = "Email sudah terdaftar: '{$rowData['email']}' digunakan oleh {$empCode}";
            } elseif (in_array($rowData['email'], $emailsInFile)) {
                $firstRow = array_search($rowData['email'], $emailsInFile) + 2;
                $rowErrors[] = "Email duplicate dalam file: '{$rowData['email']}' sudah muncul di baris {$firstRow}";
            }

            if (!empty($rowData['email'])) {
                $emailsInFile[] = $rowData['email'];
            }

            // Validate hire_date
            if (empty($rowData['hire_date'])) {
                $rowErrors[] = 'Hire date tidak boleh kosong';
            } elseif (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $rowData['hire_date'])) {
                $rowErrors[] = "Hire date format salah: '{$rowData['hire_date']}' (harus: YYYY-MM-DD)";
            } elseif (strtotime($rowData['hire_date']) > time()) {
                $rowErrors[] = "Hire date tidak boleh masa depan: '{$rowData['hire_date']}'";
            } elseif (strtotime($rowData['hire_date']) < strtotime('1950-01-01')) {
                $rowErrors[] = "Hire date terlalu lama: '{$rowData['hire_date']}' (minimal: 1950-01-01)";
            }

            // Validate role
            if (empty(trim($rowData['role'] ?? ''))) {
                $rowErrors[] = 'Role tidak boleh kosong';
            } elseif (!in_array(strtolower($rowData['role']), ['admin', 'teacher', 'employee'])) {
                $rowErrors[] = "Role tidak valid: '{$rowData['role']}' (harus: admin/teacher/employee)";
            }

            // If there are errors, add to validation errors
            if (!empty($rowErrors)) {
                $validationErrors[] = [
                    'row' => $rowNumber,
                    'data' => $rowData,
                    'errors' => $rowErrors
                ];
            }
        }

        // Return result
        if (empty($validationErrors)) {
            // All valid - return summary
            $roleCounts = array_count_values(array_column($rows, 2)); // Assuming role is column 2

            return response()->json([
                'valid' => true,
                'total_rows' => count($rows),
                'error_count' => 0,
                'summary' => [
                    'admin' => $roleCounts['admin'] ?? 0,
                    'teacher' => $roleCounts['teacher'] ?? 0,
                    'employee' => $roleCounts['employee'] ?? 0,
                ],
                'message' => 'Semua data valid dan siap diimport'
            ]);
        } else {
            // Has errors
            return response()->json([
                'valid' => false,
                'total_rows' => count($rows),
                'error_count' => count($validationErrors),
                'errors' => $validationErrors,
                'message' => 'Ditemukan ' . count($validationErrors) . ' error yang harus diperbaiki'
            ], 422);
        }
    }

    /**
     * Parse row data from array
     */
    private function parseRow(array $row, array $header): array
    {
        $data = [];
        foreach ($header as $index => $columnName) {
            $data[$columnName] = $row[$index] ?? '';
        }
        return $data;
    }

    /**
     * Generate error report Excel file
     *
     * POST /api/employees/generate-error-report
     */
    public function generateErrorReport(Request $request)
    {
        $errors = $request->input('errors', []);

        if (empty($errors)) {
            return response()->json([
                'message' => 'No errors to report'
            ], 400);
        }

        // Generate CSV content
        $csvContent = "Baris,Nama Lengkap,Email,Hire Date,Role,Error\n";

        foreach ($errors as $error) {
            $row = $error['row'];
            $data = $error['data'];
            $errorMessages = implode(' | ', $error['errors']);

            $csvContent .= sprintf(
                "%d,%s,%s,%s,%s,%s\n",
                $row,
                $this->escapeCsv($data['full_name'] ?? ''),
                $this->escapeCsv($data['email'] ?? ''),
                $this->escapeCsv($data['hire_date'] ?? ''),
                $this->escapeCsv($data['role'] ?? ''),
                $this->escapeCsv($errorMessages)
            );
        }

        $filename = 'import_errors_' . date('Y-m-d_His') . '.csv';

        return response($csvContent, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Escape CSV value
     */
    private function escapeCsv($value): string
    {
        if (strpos($value, ',') !== false || strpos($value, '"') !== false || strpos($value, "\n") !== false) {
            return '"' . str_replace('"', '""', $value) . '"';
        }
        return $value;
    }
}
```

---

## 🛣️ ROUTES

**File**: `routes/api.php`

```php
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Validation endpoint
    Route::post('/employees/validate-import', [ValidationController::class, 'validateImport']);
    Route::post('/employees/generate-error-report', [ValidationController::class, 'generateErrorReport']);

    // Actual import (after validation)
    Route::post('/employees/bulk-import', [BulkImportController::class, 'import']);
});
```

---

## 📋 VALIDATION RULES DETAIL

### 1. FULL_NAME

| Rule | Value | Error Message |
|------|-------|---------------|
| Required | NOT NULL | "Nama tidak boleh kosong" |
| Min Length | 3 characters | "Nama minimal 3 karakter" |
| Max Length | 100 characters | "Nama maksimal 100 karakter" |

**Valid Examples**:
- "I Wayan Sudiarta"
- "Ni Made Sari"
- "Drs. I Ketut Wirawan, S.Pd"

**Invalid Examples**:
- "" (kosong)
- "Ab" (< 3 karakter)

---

### 2. EMAIL

| Rule | Value | Error Message |
|------|-------|---------------|
| Required | NOT NULL | "Email tidak boleh kosong" |
| Format | Valid email | "Email format tidak valid: '{email}'" |
| Max Length | 255 characters | "Email maksimal 255 karakter" |
| Unique (DB) | Not in database | "Email sudah terdaftar: '{email}' digunakan oleh {code}" |
| Unique (File) | Not duplicate in file | "Email duplicate dalam file: '{email}' sudah muncul di baris {row}" |

**Valid Examples**:
- "wayan@gmail.com"
- "made.sari@smp-saraswati.sch.id"
- "ketut_wirawan@yahoo.co.id"

**Invalid Examples**:
- "" (kosong)
- "invalid" (no @ and domain)
- "test@" (no domain)
- "@domain.com" (no username)

---

### 3. HIRE_DATE

| Rule | Value | Error Message |
|------|-------|---------------|
| Required | NOT NULL | "Hire date tidak boleh kosong" |
| Format | YYYY-MM-DD | "Hire date format salah: '{date}' (harus: YYYY-MM-DD)" |
| Not Future | <= today | "Hire date tidak boleh masa depan: '{date}'" |
| Not Too Old | >= 1950-01-01 | "Hire date terlalu lama: '{date}' (minimal: 1950-01-01)" |

**Valid Examples**:
- "2024-01-15"
- "2020-12-31"
- "1990-06-20"

**Invalid Examples**:
- "" (kosong)
- "15/01/2024" (wrong format)
- "2024-13-01" (invalid month)
- "2025-12-31" (future date)
- "1949-01-01" (too old)

---

### 4. ROLE

| Rule | Value | Error Message |
|------|-------|---------------|
| Required | NOT NULL | "Role tidak boleh kosong" |
| In List | admin, teacher, employee | "Role tidak valid: '{role}' (harus: admin/teacher/employee)" |
| Case Insensitive | - | - |

**Valid Examples**:
- "admin"
- "teacher"
- "employee"
- "ADMIN" (case insensitive)
- "Teacher" (case insensitive)

**Invalid Examples**:
- "" (kosong)
- "guru" (should be "teacher")
- "staff" (should be "employee")
- "user" (invalid role)

---

## 📤 RESPONSE FORMATS

### SUCCESS Response (All Valid)

```json
{
  "valid": true,
  "total_rows": 100,
  "error_count": 0,
  "summary": {
    "admin": 2,
    "teacher": 68,
    "employee": 30
  },
  "message": "Semua data valid dan siap diimport"
}
```

### ERROR Response (Has Errors)

```json
{
  "valid": false,
  "total_rows": 100,
  "error_count": 5,
  "errors": [
    {
      "row": 5,
      "data": {
        "full_name": "",
        "email": "invalid",
        "hire_date": "2024-01-15",
        "role": "teacher"
      },
      "errors": [
        "Nama tidak boleh kosong",
        "Email format tidak valid: 'invalid'"
      ]
    },
    {
      "row": 10,
      "data": {
        "full_name": "I Made Sari",
        "email": "",
        "hire_date": "2024-02-01",
        "role": "teacher"
      },
      "errors": [
        "Email tidak boleh kosong"
      ]
    }
  ],
  "message": "Ditemukan 5 error yang harus diperbaiki"
}
```

---

## 🧪 TESTING

**File**: `tests/Feature/ValidationControllerTest.php`

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Employee;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;

class ValidationControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin user
        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    /** @test */
    public function it_validates_all_valid_data()
    {
        $csvContent = "full_name,email,hire_date,role\n";
        $csvContent .= "I Wayan Sudiarta,wayan@gmail.com,2024-01-15,teacher\n";
        $csvContent .= "Ni Made Sari,made@gmail.com,2024-02-01,employee\n";

        $file = UploadedFile::fake()->createWithContent('test.csv', $csvContent);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/employees/validate-import', [
                'file' => $file
            ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'valid' => true,
                     'total_rows' => 2,
                     'error_count' => 0
                 ]);
    }

    /** @test */
    public function it_detects_empty_name()
    {
        $csvContent = "full_name,email,hire_date,role\n";
        $csvContent .= ",wayan@gmail.com,2024-01-15,teacher\n";

        $file = UploadedFile::fake()->createWithContent('test.csv', $csvContent);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/employees/validate-import', [
                'file' => $file
            ]);

        $response->assertStatus(422)
                 ->assertJson([
                     'valid' => false,
                     'error_count' => 1
                 ]);

        $this->assertStringContainsString('Nama tidak boleh kosong', json_encode($response->json()));
    }

    /** @test */
    public function it_detects_invalid_email()
    {
        $csvContent = "full_name,email,hire_date,role\n";
        $csvContent .= "I Wayan Sudiarta,invalid,2024-01-15,teacher\n";

        $file = UploadedFile::fake()->createWithContent('test.csv', $csvContent);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/employees/validate-import', [
                'file' => $file
            ]);

        $response->assertStatus(422);
        $this->assertStringContainsString('Email format tidak valid', json_encode($response->json()));
    }

    /** @test */
    public function it_detects_duplicate_email_in_database()
    {
        // Create existing employee
        $user = User::factory()->create(['email' => 'existing@gmail.com']);
        Employee::factory()->create([
            'email' => 'existing@gmail.com',
            'user_id' => $user->id,
            'employee_code' => 'TCH0001'
        ]);

        $csvContent = "full_name,email,hire_date,role\n";
        $csvContent .= "I Wayan Sudiarta,existing@gmail.com,2024-01-15,teacher\n";

        $file = UploadedFile::fake()->createWithContent('test.csv', $csvContent);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/employees/validate-import', [
                'file' => $file
            ]);

        $response->assertStatus(422);
        $this->assertStringContainsString('Email sudah terdaftar', json_encode($response->json()));
    }

    /** @test */
    public function it_detects_duplicate_email_in_file()
    {
        $csvContent = "full_name,email,hire_date,role\n";
        $csvContent .= "I Wayan Sudiarta,duplicate@gmail.com,2024-01-15,teacher\n";
        $csvContent .= "Ni Made Sari,duplicate@gmail.com,2024-02-01,employee\n";

        $file = UploadedFile::fake()->createWithContent('test.csv', $csvContent);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/employees/validate-import', [
                'file' => $file
            ]);

        $response->assertStatus(422);
        $this->assertStringContainsString('Email duplicate dalam file', json_encode($response->json()));
    }

    /** @test */
    public function it_detects_invalid_role()
    {
        $csvContent = "full_name,email,hire_date,role\n";
        $csvContent .= "I Wayan Sudiarta,wayan@gmail.com,2024-01-15,guru\n";

        $file = UploadedFile::fake()->createWithContent('test.csv', $csvContent);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/employees/validate-import', [
                'file' => $file
            ]);

        $response->assertStatus(422);
        $this->assertStringContainsString('Role tidak valid', json_encode($response->json()));
    }
}
```

---

**Next**: Lanjut ke [04_BACKEND_PROFILE.md](./04_BACKEND_PROFILE.md) untuk profile completion API.
