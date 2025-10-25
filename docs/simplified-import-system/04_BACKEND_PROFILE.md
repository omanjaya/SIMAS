# 👤 BACKEND PROFILE COMPLETION - API & Middleware

## 📋 OVERVIEW

Implementasi sistem yang memaksa user melengkapi profil sebelum bisa akses sistem penuh.

---

## 🔒 MIDDLEWARE: CheckProfileCompleted

**File**: `app/Http/Middleware/CheckProfileCompleted.php`

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckProfileCompleted
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }

        // Get employee data
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'message' => 'Employee data not found'
            ], 404);
        }

        // Skip check for these routes
        $exemptedRoutes = [
            'api/profile/completion-status',
            'api/profile/complete',
            'api/logout',
            'api/me',
        ];

        foreach ($exemptedRoutes as $route) {
            if ($request->is($route)) {
                return $next($request);
            }
        }

        // Check if profile completed
        if (!$employee->profile_completed) {
            return response()->json([
                'message' => 'Please complete your profile first',
                'profile_completed' => false,
                'redirect_to' => '/complete-profile'
            ], 403);
        }

        return $next($request);
    }
}
```

### Register Middleware

**File**: `app/Http/Kernel.php`

```php
protected $middlewareAliases = [
    // ...
    'profile.completed' => \App\Http\Middleware\CheckProfileCompleted::class,
];
```

### Apply to Routes

**File**: `routes/api.php`

```php
Route::middleware(['auth:sanctum', 'profile.completed'])->group(function () {
    // All routes that require completed profile
    Route::apiResource('attendances', AttendanceController::class);
    Route::get('/dashboard-stats', [DashboardController::class, 'stats']);
    // ... other protected routes
});
```

---

## 🎯 CONTROLLER: CompleteProfileController

**File**: `app/Http/Controllers/API/CompleteProfileController.php`

```php
<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CompleteProfileController extends Controller
{
    /**
     * Get profile completion status
     *
     * GET /api/profile/completion-status
     */
    public function getStatus(Request $request)
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'message' => 'Employee data not found'
            ], 404);
        }

        return response()->json([
            'profile_completed' => $employee->profile_completed,
            'first_login_at' => $employee->first_login_at,
            'employee_code' => $employee->employee_code,
            'full_name' => $employee->first_name,
            'email' => $employee->email,
            'hire_date' => $employee->hire_date,
            'required_fields' => [
                'phone' => !empty($employee->phone),
                'date_of_birth' => !empty($employee->date_of_birth),
                'gender' => !empty($employee->gender),
                'position' => !empty($employee->position),
                'emergency_contact' => !empty($employee->emergency_contact),
            ]
        ]);
    }

    /**
     * Complete user profile
     *
     * POST /api/profile/complete
     */
    public function complete(Request $request)
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'message' => 'Employee data not found'
            ], 404);
        }

        // Validation rules
        $validator = Validator::make($request->all(), [
            // Required fields
            'phone' => 'required|string|max:20',
            'date_of_birth' => 'required|date|before:today',
            'gender' => 'required|in:male,female',
            'position' => 'required|string|max:255',
            'emergency_contact_name' => 'required|string|max:255',
            'emergency_contact_phone' => 'required|string|max:20',

            // Optional fields
            'first_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'department' => 'nullable|string|max:255',
            'emergency_contact_relation' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();

        // Update employee data
        $employee->update([
            'first_name' => $validated['first_name'] ?? $employee->first_name,
            'last_name' => $validated['last_name'] ?? '',
            'phone' => $validated['phone'],
            'address' => $validated['address'] ?? null,
            'date_of_birth' => $validated['date_of_birth'],
            'gender' => $validated['gender'],
            'position' => $validated['position'],
            'department' => $validated['department'] ?? null,
            'emergency_contact' => [
                'name' => $validated['emergency_contact_name'],
                'phone' => $validated['emergency_contact_phone'],
                'relation' => $validated['emergency_contact_relation'] ?? null,
            ],
            'profile_completed' => true,
            'first_login_at' => $employee->first_login_at ?? now(),
        ]);

        return response()->json([
            'message' => 'Profile completed successfully',
            'employee' => $employee->fresh()->load('user')
        ]);
    }

    /**
     * Update profile (after completion)
     *
     * PUT /api/profile/update
     */
    public function update(Request $request)
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'message' => 'Employee data not found'
            ], 404);
        }

        // Validation rules (same as complete but all optional)
        $validator = Validator::make($request->all(), [
            'first_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date|before:today',
            'gender' => 'nullable|in:male,female',
            'position' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'emergency_contact_relation' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();

        // Update only provided fields
        $updateData = array_filter($validated, function($value) {
            return $value !== null;
        });

        // Handle emergency contact separately
        if (isset($validated['emergency_contact_name']) ||
            isset($validated['emergency_contact_phone']) ||
            isset($validated['emergency_contact_relation'])) {

            $currentEmergencyContact = $employee->emergency_contact ?? [];
            $updateData['emergency_contact'] = [
                'name' => $validated['emergency_contact_name'] ?? $currentEmergencyContact['name'] ?? '',
                'phone' => $validated['emergency_contact_phone'] ?? $currentEmergencyContact['phone'] ?? '',
                'relation' => $validated['emergency_contact_relation'] ?? $currentEmergencyContact['relation'] ?? '',
            ];

            // Remove individual fields
            unset($updateData['emergency_contact_name']);
            unset($updateData['emergency_contact_phone']);
            unset($updateData['emergency_contact_relation']);
        }

        $employee->update($updateData);

        return response()->json([
            'message' => 'Profile updated successfully',
            'employee' => $employee->fresh()->load('user')
        ]);
    }
}
```

---

## 🛣️ ROUTES

**File**: `routes/api.php`

```php
Route::middleware(['auth:sanctum'])->group(function () {
    // Profile completion routes (no profile.completed middleware)
    Route::get('/profile/completion-status', [CompleteProfileController::class, 'getStatus']);
    Route::post('/profile/complete', [CompleteProfileController::class, 'complete']);
    Route::put('/profile/update', [CompleteProfileController::class, 'update']);
});
```

---

## 📋 REQUEST & RESPONSE EXAMPLES

### GET /api/profile/completion-status

**Response (Incomplete)**:
```json
{
  "profile_completed": false,
  "first_login_at": null,
  "employee_code": "TCH0001",
  "full_name": "I Wayan Sudiarta",
  "email": "wayan@gmail.com",
  "hire_date": "2024-01-15",
  "required_fields": {
    "phone": false,
    "date_of_birth": false,
    "gender": false,
    "position": false,
    "emergency_contact": false
  }
}
```

**Response (Complete)**:
```json
{
  "profile_completed": true,
  "first_login_at": "2024-01-16T10:30:00Z",
  "employee_code": "TCH0001",
  "full_name": "I Wayan Sudiarta",
  "email": "wayan@gmail.com",
  "hire_date": "2024-01-15",
  "required_fields": {
    "phone": true,
    "date_of_birth": true,
    "gender": true,
    "position": true,
    "emergency_contact": true
  }
}
```

---

### POST /api/profile/complete

**Request Body**:
```json
{
  "first_name": "I Wayan",
  "last_name": "Sudiarta",
  "phone": "+6281234567890",
  "address": "Jl. Raya Sesetan No. 25, Denpasar",
  "date_of_birth": "1985-06-20",
  "gender": "male",
  "position": "Guru Matematika",
  "department": "Matematika & IPA",
  "emergency_contact_name": "Ni Ketut Sudiartini",
  "emergency_contact_phone": "+6281234567891",
  "emergency_contact_relation": "Istri"
}
```

**Success Response (200)**:
```json
{
  "message": "Profile completed successfully",
  "employee": {
    "id": 1,
    "employee_code": "TCH0001",
    "first_name": "I Wayan",
    "last_name": "Sudiarta",
    "email": "wayan@gmail.com",
    "phone": "+6281234567890",
    "address": "Jl. Raya Sesetan No. 25, Denpasar",
    "date_of_birth": "1985-06-20",
    "gender": "male",
    "position": "Guru Matematika",
    "department": "Matematika & IPA",
    "hire_date": "2024-01-15",
    "employment_type": "full-time",
    "status": "active",
    "profile_completed": true,
    "first_login_at": "2024-01-16T10:30:00Z",
    "emergency_contact": {
      "name": "Ni Ketut Sudiartini",
      "phone": "+6281234567891",
      "relation": "Istri"
    },
    "user": {
      "id": 1,
      "name": "I Wayan Sudiarta",
      "email": "wayan@gmail.com",
      "role": "teacher"
    }
  }
}
```

**Error Response (422)**:
```json
{
  "message": "Validation failed",
  "errors": {
    "phone": ["The phone field is required."],
    "date_of_birth": ["The date of birth field is required."]
  }
}
```

---

## 🧪 TESTING

**File**: `tests/Feature/CompleteProfileTest.php`

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Employee;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CompleteProfileTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $employee;

    protected function setUp(): void
    {
        parent::setUp();

        // Create user and employee with incomplete profile
        $this->user = User::factory()->create([
            'email' => 'test@example.com',
            'role' => 'teacher'
        ]);

        $this->employee = Employee::factory()->create([
            'user_id' => $this->user->id,
            'employee_code' => 'TCH0001',
            'first_name' => 'Test User',
            'last_name' => '',
            'email' => 'test@example.com',
            'profile_completed' => false,
            'phone' => null,
            'date_of_birth' => null,
            'gender' => null,
            'position' => null,
        ]);
    }

    /** @test */
    public function it_returns_incomplete_profile_status()
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/profile/completion-status');

        $response->assertStatus(200)
                 ->assertJson([
                     'profile_completed' => false,
                     'employee_code' => 'TCH0001'
                 ]);
    }

    /** @test */
    public function it_completes_profile_successfully()
    {
        $data = [
            'phone' => '+6281234567890',
            'date_of_birth' => '1990-01-15',
            'gender' => 'male',
            'position' => 'Teacher',
            'emergency_contact_name' => 'Emergency Person',
            'emergency_contact_phone' => '+6281234567891',
        ];

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/profile/complete', $data);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Profile completed successfully'
                 ]);

        $this->employee->refresh();
        $this->assertTrue($this->employee->profile_completed);
    }

    /** @test */
    public function it_validates_required_fields()
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/profile/complete', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['phone', 'date_of_birth', 'gender', 'position']);
    }

    /** @test */
    public function it_blocks_access_to_protected_routes_when_profile_incomplete()
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/attendances');

        $response->assertStatus(403)
                 ->assertJson([
                     'message' => 'Please complete your profile first',
                     'profile_completed' => false
                 ]);
    }

    /** @test */
    public function it_allows_access_to_protected_routes_when_profile_complete()
    {
        $this->employee->update(['profile_completed' => true]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/attendances');

        $response->assertStatus(200); // or whatever the expected response is
    }
}
```

---

**Next**: Lanjut ke [05_BACKEND_EMAIL.md](./05_BACKEND_EMAIL.md) untuk email verification.
