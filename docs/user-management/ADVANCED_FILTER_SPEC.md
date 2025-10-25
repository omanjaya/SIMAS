# Advanced Filter Specification
## Feature: Multi-Criteria Employee Filtering

**Version:** 1.0
**Priority:** HIGH
**Estimated Effort:** 4-5 hours

---

## Table of Contents
1. [Overview](#overview)
2. [Filter Options](#filter-options)
3. [User Interface](#user-interface)
4. [Component Structure](#component-structure)
5. [API Integration](#api-integration)
6. [URL Query Parameters](#url-query-parameters)
7. [Implementation Code](#implementation-code)
8. [Testing Checklist](#testing-checklist)

---

## Overview

Advanced Filter memungkinkan admin untuk mencari pegawai berdasarkan multiple criteria secara simultan. Filter bersifat **AND logic** (semua kondisi harus terpenuhi).

### Goals
- Pencarian cepat dengan multiple criteria
- Filter options populated dari database (dynamic)
- URL shareable (filter tersimpan di query params)
- Clear visual indicator untuk active filters
- Reset filter dengan mudah

### Example Use Cases
1. "Tampilkan semua **Guru Matematika** yang **Aktif**"
2. "Tampilkan **Staff TU** yang **belum enroll biometrik**"
3. "Tampilkan pegawai yang **hired antara Jan-Mar 2025**"

---

## Filter Options

### 1. Status Filter
**Type:** Dropdown (Single Select)
**Options:**
- All (default)
- Active
- On Leave
- Suspended

**API Field:** `status`
**Query Param:** `?status=active`

---

### 2. Role Filter
**Type:** Dropdown (Single Select)
**Options:**
- All (default)
- Admin
- Teacher
- Employee

**API Field:** `role`
**Query Param:** `?role=teacher`

---

### 3. Position Filter
**Type:** Dropdown (Single Select) with Search
**Options:** Dynamic from database
- All (default)
- Guru Matematika
- Guru IPA
- Guru Bahasa Indonesia
- Staff TU
- Kepala Sekolah
- ... (loaded from API)

**API Field:** `position`
**Query Param:** `?position=Guru%20Matematika`

**Special Feature:**
- Search/filter within dropdown (for long list)
- Show count of employees for each position

```
┌──────────────────────────────┐
│ Search position...           │
├──────────────────────────────┤
│ All (254)                    │
│ Guru Matematika (45)         │
│ Guru IPA (38)                │
│ Guru Bahasa Indonesia (32)   │
│ Staff TU (15)                │
│ ...                          │
└──────────────────────────────┘
```

---

### 4. Department Filter
**Type:** Dropdown (Single Select)
**Options:** Dynamic from database
- All (default)
- Science
- Mathematics
- Language
- Administration
- ... (loaded from API)

**API Field:** `department`
**Query Param:** `?department=Science`

---

### 5. Hire Date Range Filter
**Type:** Date Range Picker
**Options:**
- From Date (start)
- To Date (end)

**API Field:** `hire_date_from`, `hire_date_to`
**Query Param:** `?hire_date_from=2025-01-01&hire_date_to=2025-03-31`

**Presets:**
- This Month
- Last 3 Months
- Last 6 Months
- This Year
- Last Year
- Custom Range

---

### 6. Biometric Status Filter
**Type:** Dropdown (Single Select)
**Options:**
- All (default)
- Enrolled (Has fingerprint/face data)
- Not Enrolled (No biometric data)

**API Field:** `has_biometric`
**Query Param:** `?has_biometric=true`

**Backend Check:**
```sql
-- Enrolled
SELECT * FROM employees e
WHERE EXISTS (
  SELECT 1 FROM biometric_templates bt
  WHERE bt.employee_id = e.id
)

-- Not Enrolled
SELECT * FROM employees e
WHERE NOT EXISTS (
  SELECT 1 FROM biometric_templates bt
  WHERE bt.employee_id = e.id
)
```

---

## User Interface

### Filter Button & Dropdown Panel

```
┌────────────────────────────────────────────────────────────┐
│  [🔽 Filter (3)] [Clear All]                               │
└────────────────────────────────────────────────────────────┘
                ↓ (Click Filter button)
┌────────────────────────────────────────────────────────────┐
│  Status:      [Dropdown: Active ▼]                         │
│  Role:        [Dropdown: Teacher ▼]                        │
│  Position:    [Dropdown: Guru Matematika ▼]               │
│  Department:  [Dropdown: All ▼]                            │
│  Hired Date:  [01/01/2025] - [31/03/2025]   [Presets ▼]   │
│  Biometric:   [Dropdown: All ▼]                            │
│                                                             │
│  [Clear Filters]          [Apply Filters]                  │
└────────────────────────────────────────────────────────────┘
```

### Active Filters Display (Badges)

```
Active Filters:
┌────────────────────────────────────────────────────────────┐
│  [Status: Active ✕] [Role: Teacher ✕] [Position: Guru... ✕]│
│  [Clear All]                                                │
└────────────────────────────────────────────────────────────┘
```

---

## Component Structure

### File: `components/users/advanced-filter.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';
import { format } from 'date-fns';

interface FilterOptions {
  positions: Array<{ value: string; label: string; count: number }>;
  departments: Array<{ value: string; label: string; count: number }>;
}

interface FilterValues {
  status?: string;
  role?: string;
  position?: string;
  department?: string;
  hire_date_from?: string;
  hire_date_to?: string;
  has_biometric?: string;
}

interface AdvancedFilterProps {
  onFilterChange: (filters: FilterValues) => void;
  activeFilters: FilterValues;
}

export function AdvancedFilter({ onFilterChange, activeFilters }: AdvancedFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterValues>(activeFilters);
  const [options, setOptions] = useState<FilterOptions>({
    positions: [],
    departments: [],
  });

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/employees/filter-options');
      const data = await response.json();
      setOptions(data.data);
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
    }
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    setIsOpen(false);
  };

  const handleClear = () => {
    const empty: FilterValues = {};
    setLocalFilters(empty);
    onFilterChange(empty);
  };

  const handleRemoveFilter = (key: keyof FilterValues) => {
    const updated = { ...localFilters };
    delete updated[key];
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className="space-y-3">
      {/* Filter Button */}
      <div className="flex items-center gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96" align="start">
            <div className="space-y-4">
              <h4 className="font-medium">Filter Pegawai</h4>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={localFilters.status || 'all'}
                  onValueChange={(value) =>
                    setLocalFilters({
                      ...localFilters,
                      status: value === 'all' ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Role Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select
                  value={localFilters.role || 'all'}
                  onValueChange={(value) =>
                    setLocalFilters({
                      ...localFilters,
                      role: value === 'all' ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Position Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Position</label>
                <Select
                  value={localFilters.position || 'all'}
                  onValueChange={(value) =>
                    setLocalFilters({
                      ...localFilters,
                      position: value === 'all' ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {options.positions.map((pos) => (
                      <SelectItem key={pos.value} value={pos.value}>
                        {pos.label} ({pos.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Department Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select
                  value={localFilters.department || 'all'}
                  onValueChange={(value) =>
                    setLocalFilters({
                      ...localFilters,
                      department: value === 'all' ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {options.departments.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label} ({dept.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Hired Date</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    className="flex-1 rounded-md border px-3 py-2 text-sm"
                    value={localFilters.hire_date_from || ''}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        hire_date_from: e.target.value || undefined,
                      })
                    }
                  />
                  <span className="self-center">-</span>
                  <input
                    type="date"
                    className="flex-1 rounded-md border px-3 py-2 text-sm"
                    value={localFilters.hire_date_to || ''}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        hire_date_to: e.target.value || undefined,
                      })
                    }
                  />
                </div>
              </div>

              {/* Biometric Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Biometric Status</label>
                <Select
                  value={localFilters.has_biometric || 'all'}
                  onValueChange={(value) =>
                    setLocalFilters({
                      ...localFilters,
                      has_biometric: value === 'all' ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Enrolled</SelectItem>
                    <SelectItem value="false">Not Enrolled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" size="sm" onClick={handleClear}>
                  Clear Filters
                </Button>
                <Button size="sm" onClick={handleApply}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClear}>
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters Badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, value]) => (
            <Badge key={key} variant="secondary" className="gap-1">
              {formatFilterLabel(key)}: {formatFilterValue(key, value)}
              <button
                onClick={() => handleRemoveFilter(key as keyof FilterValues)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper functions
function formatFilterLabel(key: string): string {
  const labels: Record<string, string> = {
    status: 'Status',
    role: 'Role',
    position: 'Position',
    department: 'Department',
    hire_date_from: 'Hired From',
    hire_date_to: 'Hired To',
    has_biometric: 'Biometric',
  };
  return labels[key] || key;
}

function formatFilterValue(key: string, value: string): string {
  if (key === 'has_biometric') {
    return value === 'true' ? 'Enrolled' : 'Not Enrolled';
  }
  return value;
}
```

---

## API Integration

### 1. Get Filter Options
```
GET /api/employees/filter-options
```

**Response:**
```json
{
  "success": true,
  "data": {
    "positions": [
      { "value": "Guru Matematika", "label": "Guru Matematika", "count": 45 },
      { "value": "Guru IPA", "label": "Guru IPA", "count": 38 },
      { "value": "Guru Bahasa Indonesia", "label": "Guru Bahasa Indonesia", "count": 32 },
      { "value": "Staff TU", "label": "Staff TU", "count": 15 }
    ],
    "departments": [
      { "value": "Science", "label": "Science", "count": 85 },
      { "value": "Mathematics", "label": "Mathematics", "count": 50 },
      { "value": "Language", "label": "Language", "count": 40 },
      { "value": "Administration", "label": "Administration", "count": 20 }
    ]
  }
}
```

**Laravel Implementation:**
```php
// app/Http/Controllers/Api/EmployeeController.php

public function getFilterOptions()
{
    // Get unique positions with count
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

    // Get unique departments with count
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

### 2. Get Employees with Filters
```
GET /api/employees?status=active&role=teacher&position=Guru%20Matematika&page=1
```

**Query Parameters:**
- `status` - active/on_leave/suspended
- `role` - admin/teacher/employee
- `position` - exact match
- `department` - exact match
- `hire_date_from` - YYYY-MM-DD
- `hire_date_to` - YYYY-MM-DD
- `has_biometric` - true/false
- `page` - pagination
- `per_page` - items per page

**Laravel Implementation:**
```php
// app/Http/Controllers/Api/EmployeeController.php

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

    // Search by name or email
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

## URL Query Parameters

### URL Structure
```
/users?status=active&role=teacher&position=Guru%20Matematika&page=2
```

### Benefits
1. **Shareable Links** - Admin can copy URL and share with colleagues
2. **Bookmarkable** - Save frequently used filters as bookmarks
3. **Browser Back/Forward** - Navigation works correctly
4. **Deep Linking** - Link directly to filtered view

### Implementation (Next.js 15)

```typescript
'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read filters from URL
  const filters = {
    status: searchParams.get('status') || undefined,
    role: searchParams.get('role') || undefined,
    position: searchParams.get('position') || undefined,
    // ... other filters
  };

  const handleFilterChange = (newFilters: FilterValues) => {
    // Build query string
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    // Update URL
    router.push(`/users?${params.toString()}`);
  };

  return (
    <AdvancedFilter
      activeFilters={filters}
      onFilterChange={handleFilterChange}
    />
  );
}
```

---

## Testing Checklist

### Functional Testing
- [ ] Single filter works (e.g., status=active)
- [ ] Multiple filters work together (AND logic)
- [ ] Position dropdown populated from API
- [ ] Department dropdown populated from API
- [ ] Date range filter works
- [ ] Biometric filter works (enrolled/not enrolled)
- [ ] Clear individual filter badge works
- [ ] Clear all filters works
- [ ] Apply button updates table
- [ ] URL params update when filter applied
- [ ] Page loads with filters from URL params
- [ ] Pagination works with filters
- [ ] Search works with filters

### UI/UX Testing
- [ ] Filter dropdown opens smoothly
- [ ] Active filter count badge shows correct number
- [ ] Filter badges are visible and clear
- [ ] Remove badge (X) works
- [ ] Dropdown scrollable for long lists
- [ ] Mobile responsive
- [ ] Dark mode compatible

### Edge Cases
- [ ] No results found message
- [ ] Filter options with 0 count
- [ ] Very long position/department names
- [ ] Special characters in filter values
- [ ] Invalid date ranges (from > to)

---

## Performance Optimization

### Frontend
1. **Debounce Search** - Wait 300ms before triggering API call
2. **Memoize Options** - Cache filter options to avoid re-fetch
3. **Lazy Load Dropdowns** - Load position/department on click

### Backend
1. **Index Database** - Add indexes on commonly filtered columns
```sql
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_position ON employees(position);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_hire_date ON employees(hire_date);
```

2. **Query Optimization** - Use EXISTS instead of JOIN for biometric check
3. **Cache Filter Options** - Cache position/department list for 1 hour

---

## Future Enhancements

1. **Saved Filter Presets** - Save common filter combinations
2. **Advanced Search** - Full-text search across all fields
3. **Multi-Select Filters** - Select multiple positions at once
4. **Export Filtered Results** - Export only filtered employees
5. **Filter History** - Show recently used filters

---

**End of Advanced Filter Specification**
