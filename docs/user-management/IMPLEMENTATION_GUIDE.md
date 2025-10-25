# Implementation Guide
## Step-by-Step Guide for TIER 1 User Management Features

**Version:** 1.0
**Target:** Qwen Coder
**Prerequisites:** Next.js 15, Laravel 12, PostgreSQL setup complete

---

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites Check](#prerequisites-check)
3. [Implementation Order](#implementation-order)
4. [Step-by-Step Instructions](#step-by-step-instructions)
5. [Testing Guide](#testing-guide)
6. [Troubleshooting](#troubleshooting)
7. [FAQ](#faq)

---

## Overview

This guide will help you implement all TIER 1 features:
1. ✅ Quick Stats Cards
2. ✅ Advanced Filter
3. ✅ Bulk Import/Export
4. ✅ Biometric Status Display

**Total Estimated Time:** 15-20 hours

---

## Prerequisites Check

Before starting implementation, ensure you have:

### Frontend (Next.js)
- [x] Next.js 15 with App Router
- [x] shadcn/ui components installed
- [x] Tailwind CSS configured
- [x] Auth context working (`/src/context/auth-context.tsx`)
- [x] API client configured (`/src/lib/api/client.ts`)

### Backend (Laravel)
- [x] Laravel 12 installed
- [x] PostgreSQL database connected
- [x] Sanctum authentication working
- [x] Employee model exists
- [x] Employee migration exists

### Dependencies
```bash
# Check if these are installed
cd frontend && npm list xlsx papaparse react-dropzone

# If not installed, install them
npm install xlsx papaparse react-dropzone
npm install @types/papaparse --save-dev
```

### Laravel Packages
```bash
cd backend && composer show maatwebsite/excel

# If not installed
composer require maatwebsite/excel
```

---

## Implementation Order

**Recommended order** (easiest to hardest):

1. **Stats Cards** (3-4 hours)
   - Backend: Stats API endpoint
   - Frontend: Stats cards component
   - Integration with users page

2. **Advanced Filter** (4-5 hours)
   - Backend: Filter options API
   - Backend: Enhanced employees index with filters
   - Frontend: Filter component
   - URL query params

3. **Biometric Status** (2-3 hours)
   - Backend: Add biometric check to employee query
   - Frontend: Badge component
   - Integration with table

4. **Bulk Import/Export** (8-12 hours)
   - Backend: Import template endpoint
   - Backend: Duplicate check endpoint
   - Backend: Bulk import logic
   - Backend: Export logic
   - Frontend: Upload component
   - Frontend: Preview component
   - Frontend: Progress component
   - Frontend: Summary component

---

## Step-by-Step Instructions

---

## STEP 1: Quick Stats Cards

### Backend Implementation

#### 1.1 Create Stats Endpoint

**File:** `backend/app/Http/Controllers/Api/EmployeeController.php`

Add this method:

```php
public function getStats()
{
    // Current counts
    $totalActive = Employee::where('status', 'active')->count();

    $totalTeachers = Employee::where('status', 'active')
        ->where(function($q) {
            $q->where('role', 'teacher')
              ->orWhere('position', 'LIKE', '%guru%');
        })
        ->count();

    $totalStaff = Employee::where('status', 'active')
        ->where(function($q) {
            $q->where('role', 'employee')
              ->orWhere('position', 'LIKE', '%staff%')
              ->orWhere('position', 'LIKE', '%TU%');
        })
        ->count();

    $onLeaveToday = Employee::where('status', 'on_leave')->count();

    // Last month for trend
    $lastMonthStart = now()->subMonth()->startOfMonth();
    $lastMonthEnd = now()->subMonth()->endOfMonth();

    $lastMonthActive = Employee::where('status', 'active')
        ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
        ->count();

    $lastMonthTeachers = Employee::where('status', 'active')
        ->where(function($q) {
            $q->where('role', 'teacher')->orWhere('position', 'LIKE', '%guru%');
        })
        ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
        ->count();

    $lastMonthStaff = Employee::where('status', 'active')
        ->where(function($q) {
            $q->where('role', 'employee')
              ->orWhere('position', 'LIKE', '%staff%')
              ->orWhere('position', 'LIKE', '%TU%');
        })
        ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
        ->count();

    $yesterdayOnLeave = Employee::where('status', 'on_leave')
        ->whereDate('updated_at', now()->subDay())
        ->count();

    // Calculate trends
    $totalActiveTrend = $lastMonthActive > 0
        ? round((($totalActive - $lastMonthActive) / $lastMonthActive) * 100, 1)
        : 0;

    $totalTeachersTrend = $lastMonthTeachers > 0
        ? round((($totalTeachers - $lastMonthTeachers) / $lastMonthTeachers) * 100, 1)
        : 0;

    $totalStaffTrend = $lastMonthStaff > 0
        ? round((($totalStaff - $lastMonthStaff) / $lastMonthStaff) * 100, 1)
        : 0;

    $onLeaveTodayTrend = $onLeaveToday - $yesterdayOnLeave;

    return response()->json([
        'success' => true,
        'data' => [
            'total_active' => $totalActive,
            'total_active_trend' => $totalActiveTrend,
            'total_teachers' => $totalTeachers,
            'total_teachers_trend' => $totalTeachersTrend,
            'total_staff' => $totalStaff,
            'total_staff_trend' => $totalStaffTrend,
            'on_leave_today' => $onLeaveToday,
            'on_leave_today_trend' => $onLeaveTodayTrend,
            'last_updated' => now()->toIso8601String(),
        ]
    ]);
}
```

#### 1.2 Add Route

**File:** `backend/routes/api.php`

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/employees/stats', [EmployeeController::class, 'getStats']);
    // ... other routes
});
```

#### 1.3 Test API

```bash
curl -X GET "http://localhost:8000/api/employees/stats" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

Expected: JSON with stats data

---

### Frontend Implementation

#### 1.4 Create Stats Component

**File:** `frontend/src/components/users/stats-cards.tsx`

Copy the full code from `QUICK_STATS_SPEC.md` section "Component Structure".

#### 1.5 Update Users Page

**File:** `frontend/src/app/(dashboard)/users/page.tsx`

Add stats cards above the table:

```typescript
import { StatsCards } from '@/components/users/stats-cards';

export default function UsersPage() {
  const [filters, setFilters] = useState<Record<string, string>>({});

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Manajemen Pegawai</h1>
        <p className="text-muted-foreground">
          Kelola data pegawai, guru, dan staff SMP Saraswati Denpasar
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards
        onFilterApply={(key, value) => {
          setFilters({ [key]: value });
        }}
        activeFilter={
          Object.keys(filters).length > 0
            ? { key: Object.keys(filters)[0], value: Object.values(filters)[0] }
            : null
        }
      />

      {/* Table (existing) */}
      {/* ... */}
    </div>
  );
}
```

#### 1.6 Test Stats Cards

1. Run `npm run dev`
2. Navigate to `/users`
3. Check if 4 cards display
4. Click a card → should filter table
5. Click same card → should remove filter

---

## STEP 2: Advanced Filter

### Backend Implementation

#### 2.1 Filter Options Endpoint

**File:** `backend/app/Http/Controllers/Api/EmployeeController.php`

Add this method:

```php
public function getFilterOptions()
{
    $positions = Employee::select('position', DB::raw('COUNT(*) as count'))
        ->whereNotNull('position')
        ->where('position', '!=', '')
        ->groupBy('position')
        ->orderBy('position')
        ->get()
        ->map(function($item) {
            return [
                'value' => $item->position,
                'label' => $item->position,
                'count' => $item->count,
            ];
        });

    $departments = Employee::select('department', DB::raw('COUNT(*) as count'))
        ->whereNotNull('department')
        ->where('department', '!=', '')
        ->groupBy('department')
        ->orderBy('department')
        ->get()
        ->map(function($item) {
            return [
                'value' => $item->department,
                'label' => $item->department,
                'count' => $item->count,
            ];
        });

    return response()->json([
        'success' => true,
        'data' => [
            'positions' => $positions,
            'departments' => $departments,
        ]
    ]);
}
```

#### 2.2 Add Route

**File:** `backend/routes/api.php`

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/employees/filter-options', [EmployeeController::class, 'getFilterOptions']);
    // ... other routes
});
```

#### 2.3 Enhance Index Method

**File:** `backend/app/Http/Controllers/Api/EmployeeController.php`

Update the `index` method to support filters:

```php
public function index(Request $request)
{
    $query = Employee::query();

    // Apply filters
    if ($request->has('status')) {
        $query->where('status', $request->status);
    }

    if ($request->has('role')) {
        $query->where('role', $request->role);
    }

    if ($request->has('position')) {
        $query->where('position', $request->position);
    }

    if ($request->has('department')) {
        $query->where('department', $request->department);
    }

    if ($request->has('hire_date_from')) {
        $query->whereDate('hire_date', '>=', $request->hire_date_from);
    }

    if ($request->has('hire_date_to')) {
        $query->whereDate('hire_date', '<=', $request->hire_date_to);
    }

    if ($request->has('has_biometric')) {
        $hasBiometric = filter_var($request->has_biometric, FILTER_VALIDATE_BOOLEAN);

        if ($hasBiometric) {
            $query->whereHas('biometricTemplates');
        } else {
            $query->whereDoesntHave('biometricTemplates');
        }
    }

    // Search
    if ($request->has('search')) {
        $search = $request->search;
        $query->where(function($q) use ($search) {
            $q->where('first_name', 'LIKE', "%{$search}%")
              ->orWhere('last_name', 'LIKE', "%{$search}%")
              ->orWhere('email', 'LIKE', "%{$search}%");
        });
    }

    // Pagination
    $perPage = $request->get('per_page', 10);
    $employees = $query->paginate($perPage);

    return response()->json([
        'success' => true,
        'data' => $employees->items(),
        'total' => $employees->total(),
        'current_page' => $employees->currentPage(),
        'last_page' => $employees->lastPage(),
        'per_page' => $employees->perPage(),
    ]);
}
```

---

### Frontend Implementation

#### 2.4 Create Filter Component

**File:** `frontend/src/components/users/advanced-filter.tsx`

Copy the full code from `ADVANCED_FILTER_SPEC.md` section "Component Structure".

#### 2.5 Update Users Page

Add filter component:

```typescript
import { AdvancedFilter } from '@/components/users/advanced-filter';

export default function UsersPage() {
  const [filters, setFilters] = useState<Record<string, string>>({});

  return (
    <div className="p-6 space-y-6">
      {/* Header */}

      {/* Stats */}

      {/* Filter */}
      <AdvancedFilter
        activeFilters={filters}
        onFilterChange={setFilters}
      />

      {/* Table */}
      <UserTable filters={filters} />
    </div>
  );
}
```

#### 2.6 Test Filter

1. Click "Filter" button
2. Select filters (status, role, position)
3. Click "Apply"
4. Table should update
5. URL should update with query params

---

## STEP 3: Bulk Import/Export

### Backend Implementation

#### 3.1 Install Laravel Excel

```bash
cd backend
composer require maatwebsite/excel
php artisan vendor:publish --provider="Maatwebsite\Excel\ExcelServiceProvider"
```

#### 3.2 Create Import Class

**File:** `backend/app/Imports/EmployeesImport.php`

```php
<?php

namespace App\Imports;

use App\Models\Employee;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class EmployeesImport implements ToModel, WithHeadingRow, WithValidation
{
    private $successCount = 0;
    private $failedCount = 0;
    private $errors = [];

    public function model(array $row)
    {
        try {
            $employee = Employee::create([
                'first_name' => $row['first_name'],
                'last_name' => $row['last_name'],
                'email' => $row['email'],
                'phone' => $row['phone'] ?? null,
                'position' => $row['position'] ?? null,
                'department' => $row['department'] ?? null,
                'status' => $row['status'] ?? 'active',
                'role' => $row['role'] ?? 'employee',
                'hire_date' => $row['hire_date'] ?? now(),
            ]);

            $this->successCount++;
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

    public function rules(): array
    {
        return [
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|unique:employees,email|max:255',
            'phone' => 'nullable|string|max:20',
            'status' => 'nullable|in:active,on_leave,suspended',
            'role' => 'nullable|in:admin,teacher,employee',
        ];
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

#### 3.3 Create Controller

**File:** `backend/app/Http/Controllers/Api/BulkImportController.php`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Imports\EmployeesImport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class BulkImportController extends Controller
{
    public function downloadTemplate()
    {
        // Return template file
        $filePath = storage_path('app/templates/employees_template.xlsx');

        if (!file_exists($filePath)) {
            return response()->json([
                'success' => false,
                'message' => 'Template file not found'
            ], 404);
        }

        return response()->download($filePath);
    }

    public function checkDuplicates(Request $request)
    {
        $emails = $request->input('emails', []);

        $duplicates = Employee::whereIn('email', $emails)
            ->pluck('email')
            ->toArray();

        return response()->json([
            'success' => true,
            'data' => [
                'duplicates' => $duplicates
            ]
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,csv|max:10240',
        ]);

        $import = new EmployeesImport();

        try {
            Excel::import($import, $request->file('file'));

            return response()->json([
                'success' => true,
                'message' => 'Import completed',
                'data' => $import->getResult(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
```

#### 3.4 Add Routes

**File:** `backend/routes/api.php`

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/employees/import-template', [BulkImportController::class, 'downloadTemplate']);
    Route::post('/employees/check-duplicates', [BulkImportController::class, 'checkDuplicates']);
    Route::post('/employees/bulk-import', [BulkImportController::class, 'import']);
});
```

---

### Frontend Implementation

#### 3.5 Create Upload Component

**File:** `frontend/src/components/users/bulk-import-dialog.tsx`

Copy the full code from `BULK_IMPORT_SPEC.md` section "Component Structure".

Also create:
- `bulk-import-wizard.tsx`
- `steps/file-upload-step.tsx`
- `steps/preview-step.tsx`
- `steps/progress-step.tsx`
- `steps/summary-step.tsx`

#### 3.6 Create Validators

**File:** `frontend/src/lib/utils/validators.ts`

Copy code from `BULK_IMPORT_SPEC.md`.

#### 3.7 Update Users Page

Add import button:

```typescript
import { BulkImportDialog } from '@/components/users/bulk-import-dialog';

export default function UsersPage() {
  const handleImportComplete = () => {
    // Refresh table
    fetchEmployees();
  };

  return (
    <div>
      {/* Header with Import button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Pegawai</h1>
        <BulkImportDialog onImportComplete={handleImportComplete} />
      </div>

      {/* ... rest */}
    </div>
  );
}
```

---

## Testing Guide

### Manual Testing Checklist

#### Stats Cards
- [ ] All 4 cards display correctly
- [ ] Numbers are accurate
- [ ] Trend indicators show correct direction
- [ ] Clicking card filters table
- [ ] Clicking same card removes filter
- [ ] Loading skeleton shows while fetching
- [ ] Dark mode works

#### Filter
- [ ] Filter button opens dropdown
- [ ] All filter options populated from API
- [ ] Multiple filters work together
- [ ] Active filters show as badges
- [ ] Remove badge (X) works
- [ ] Clear all filters works
- [ ] URL updates with filters
- [ ] Page loads with filters from URL

#### Bulk Import
- [ ] Template download works
- [ ] Upload Excel file works
- [ ] Upload CSV file works
- [ ] File validation works (size, format)
- [ ] Preview shows correct data
- [ ] Validation errors highlighted
- [ ] Import progress shows
- [ ] Summary displays success/fail counts
- [ ] Error log downloadable

---

## Troubleshooting

### Issue: Stats API returns 401 Unauthorized

**Solution:** Check token in Authorization header.

```bash
# Verify token
curl -X GET "http://localhost:8000/api/user" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Issue: Filter options not loading

**Solution:** Check database has data in position/department columns.

```sql
SELECT position, COUNT(*) FROM employees GROUP BY position;
SELECT department, COUNT(*) FROM employees GROUP BY department;
```

### Issue: Bulk import fails with "File too large"

**Solution:** Increase upload limits.

**File:** `backend/.env`
```env
UPLOAD_MAX_FILESIZE=10M
POST_MAX_SIZE=10M
```

**File:** `backend/php.ini`
```ini
upload_max_filesize = 10M
post_max_size = 10M
```

Restart server after changes.

---

## FAQ

**Q: How to add more filter options?**

A: Edit `AdvancedFilter` component and add new Select component. Add corresponding filter logic in backend.

**Q: Can I import more than 1000 rows?**

A: Yes, but need to increase `BULK_IMPORT_MAX_ROWS` in `.env` and adjust validation.

**Q: How to customize stats cards?**

A: Edit `getStats()` method in backend and update `StatsCards` component.

**Q: Export not working?**

A: Ensure Laravel Excel is installed and `storage/app/exports` folder is writable.

---

## Next Steps

After completing TIER 1:

1. **Test everything** with real data
2. **Optimize performance** if slow
3. **Add error handling** for edge cases
4. **Write unit tests** (optional)
5. **Move to TIER 2 features** (if needed)

---

**Good luck with implementation!** 🚀

If you encounter issues not covered here, check:
- Laravel logs: `backend/storage/logs/laravel.log`
- Browser console for frontend errors
- Network tab for API request/response

**End of Implementation Guide**
