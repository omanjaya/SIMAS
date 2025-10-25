# Quick Stats Cards Specification
## Feature: Employee Statistics Dashboard Cards

**Version:** 1.0
**Priority:** HIGH
**Estimated Effort:** 3-4 hours

---

## Table of Contents
1. [Overview](#overview)
2. [Design Requirements](#design-requirements)
3. [Statistics Breakdown](#statistics-breakdown)
4. [Component Structure](#component-structure)
5. [API Endpoints](#api-endpoints)
6. [Implementation Code](#implementation-code)
7. [State Management](#state-management)
8. [Testing Checklist](#testing-checklist)

---

## Overview

Quick Stats Cards memberikan overview cepat tentang status pegawai tanpa perlu membuka dashboard terpisah. Cards ini ditampilkan di atas tabel employee list.

### Goals
- Admin dapat melihat statistik penting dalam sekali pandang
- Klik card untuk filter tabel sesuai kategori
- Auto-update saat filter diterapkan
- Visual yang menarik dan informatif

---

## Design Requirements

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│  [Card 1]        [Card 2]        [Card 3]        [Card 4]           │
│  👥 254          👨‍🏫 180         👔 74           🏖 3               │
│  Total Aktif     Guru            Staff           Cuti               │
│  +5% vs last mo  +2% vs last mo  +8% vs last mo  -1 vs yesterday   │
└─────────────────────────────────────────────────────────────────────┘
```

### Responsive Behavior
- **Desktop (≥1024px):** 4 cards in a row
- **Tablet (768-1023px):** 2 cards per row
- **Mobile (<768px):** 1 card per row, stacked

### Visual States
1. **Normal State:** White background (light mode), dark background (dark mode)
2. **Hover State:** Slight elevation/shadow, cursor pointer
3. **Loading State:** Skeleton animation
4. **Active State:** Border highlight when filter applied
5. **Error State:** Red border, error icon

---

## Statistics Breakdown

### Card 1: Total Pegawai Aktif
**Metric:** Count of employees with `status = 'active'`

**Display:**
- **Number:** Large, bold (e.g., 254)
- **Label:** "Total Aktif" or "Pegawai Aktif"
- **Icon:** 👥 (Users) from lucide-react
- **Trend:** `+5%` (green) or `-2%` (red) vs last month
- **Sub-text:** "vs bulan lalu"

**Click Behavior:**
- Filter table to show only `status = 'active'`
- Card gets highlighted border
- Badge shows: "Status: Active ✕"

**API Query:**
```sql
SELECT COUNT(*) FROM employees WHERE status = 'active'
```

---

### Card 2: Total Guru
**Metric:** Count of employees with `role = 'teacher'` OR `position LIKE '%guru%'`

**Display:**
- **Number:** Large, bold (e.g., 180)
- **Label:** "Guru" or "Total Guru"
- **Icon:** 👨‍🏫 (GraduationCap) from lucide-react
- **Trend:** `+2%` (green) or `-1%` (red) vs last month
- **Sub-text:** "vs bulan lalu"

**Click Behavior:**
- Filter table to show only `role = 'teacher'`
- Card gets highlighted border
- Badge shows: "Role: Teacher ✕"

**API Query:**
```sql
SELECT COUNT(*) FROM employees
WHERE role = 'teacher' OR position LIKE '%guru%'
AND status = 'active'
```

---

### Card 3: Total Staff
**Metric:** Count of employees with `role = 'employee'` OR `position LIKE '%staff%' OR position LIKE '%TU%'`

**Display:**
- **Number:** Large, bold (e.g., 74)
- **Label:** "Staff" or "Staff/TU"
- **Icon:** 👔 (Briefcase) from lucide-react
- **Trend:** `+8%` (green) or `-3%` (red) vs last month
- **Sub-text:** "vs bulan lalu"

**Click Behavior:**
- Filter table to show only `role = 'employee'`
- Card gets highlighted border
- Badge shows: "Role: Employee ✕"

**API Query:**
```sql
SELECT COUNT(*) FROM employees
WHERE (role = 'employee' OR position LIKE '%staff%' OR position LIKE '%TU%')
AND status = 'active'
```

---

### Card 4: Pegawai Cuti
**Metric:** Count of employees with `status = 'on_leave'` TODAY

**Display:**
- **Number:** Large, bold (e.g., 3)
- **Label:** "Cuti Hari Ini" or "Sedang Cuti"
- **Icon:** 🏖 (Palmtree) from lucide-react or Calendar
- **Trend:** `-1` (green) or `+2` (red) vs yesterday
- **Sub-text:** "vs kemarin"

**Click Behavior:**
- Filter table to show only `status = 'on_leave'`
- Card gets highlighted border
- Badge shows: "Status: On Leave ✕"

**API Query:**
```sql
SELECT COUNT(*) FROM employees
WHERE status = 'on_leave'
```

---

## Component Structure

### File: `components/users/stats-cards.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, GraduationCap, Briefcase, Calendar, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stat {
  id: string;
  label: string;
  value: number;
  trend: number;
  trendLabel: string;
  icon: React.ElementType;
  filterKey: string;
  filterValue: string;
}

interface StatsCardsProps {
  onFilterApply: (filterKey: string, filterValue: string) => void;
  activeFilter?: { key: string; value: string } | null;
}

export function StatsCards({ onFilterApply, activeFilter }: StatsCardsProps) {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employees/stats');
      const data = await response.json();

      setStats([
        {
          id: 'total-active',
          label: 'Total Aktif',
          value: data.total_active,
          trend: data.total_active_trend,
          trendLabel: 'vs bulan lalu',
          icon: Users,
          filterKey: 'status',
          filterValue: 'active',
        },
        {
          id: 'total-teachers',
          label: 'Guru',
          value: data.total_teachers,
          trend: data.total_teachers_trend,
          trendLabel: 'vs bulan lalu',
          icon: GraduationCap,
          filterKey: 'role',
          filterValue: 'teacher',
        },
        {
          id: 'total-staff',
          label: 'Staff',
          value: data.total_staff,
          trend: data.total_staff_trend,
          trendLabel: 'vs bulan lalu',
          icon: Briefcase,
          filterKey: 'role',
          filterValue: 'employee',
        },
        {
          id: 'on-leave',
          label: 'Cuti Hari Ini',
          value: data.on_leave_today,
          trend: data.on_leave_today_trend,
          trendLabel: 'vs kemarin',
          icon: Calendar,
          filterKey: 'status',
          filterValue: 'on_leave',
        },
      ]);
    } catch (err) {
      setError('Failed to load statistics');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-8 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-destructive rounded-lg bg-destructive/10 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isActive = activeFilter?.key === stat.filterKey && activeFilter?.value === stat.filterValue;
        const isPositiveTrend = stat.trend >= 0;

        return (
          <Card
            key={stat.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              isActive && 'ring-2 ring-primary'
            )}
            onClick={() => onFilterApply(stat.filterKey, stat.filterValue)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="space-y-1">
                <h3 className="text-3xl font-bold tracking-tight">
                  {stat.value.toLocaleString()}
                </h3>

                <div className="flex items-center gap-1 text-xs">
                  {isPositiveTrend ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={cn(
                      'font-medium',
                      isPositiveTrend ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {isPositiveTrend ? '+' : ''}{stat.trend}%
                  </span>
                  <span className="text-muted-foreground">{stat.trendLabel}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
```

---

## API Endpoints

### GET /api/employees/stats

**Description:** Get employee statistics for dashboard cards

**Response:**
```json
{
  "success": true,
  "data": {
    "total_active": 254,
    "total_active_trend": 5.2,
    "total_teachers": 180,
    "total_teachers_trend": 2.1,
    "total_staff": 74,
    "total_staff_trend": 8.3,
    "on_leave_today": 3,
    "on_leave_today_trend": -1,
    "last_updated": "2025-10-20T10:30:00Z"
  }
}
```

**Laravel Implementation:**
```php
// app/Http/Controllers/Api/EmployeeController.php

public function getStats()
{
    // Current month stats
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

    // Last month stats for trend calculation
    $lastMonthStart = now()->subMonth()->startOfMonth();
    $lastMonthEnd = now()->subMonth()->endOfMonth();

    $lastMonthActive = Employee::where('status', 'active')
        ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
        ->count();

    $lastMonthTeachers = Employee::where('status', 'active')
        ->where(function($q) {
            $q->where('role', 'teacher')
              ->orWhere('position', 'LIKE', '%guru%');
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

    // Yesterday's on_leave count
    $yesterdayOnLeave = Employee::where('status', 'on_leave')
        ->whereDate('updated_at', now()->subDay())
        ->count();

    // Calculate trends (percentage change)
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

---

## State Management

### Integration with Users Page

**File: `app/(dashboard)/users/page.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { StatsCards } from '@/components/users/stats-cards';
import { UserTable } from '@/components/users/user-table';

export default function UsersPage() {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const handleStatsFilterApply = (key: string, value: string) => {
    // Toggle filter - if same filter clicked again, remove it
    if (filters[key] === value) {
      const newFilters = { ...filters };
      delete newFilters[key];
      setFilters(newFilters);
    } else {
      setFilters({ ...filters, [key]: value });
    }
  };

  const handleFilterClear = () => {
    setFilters({});
  };

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
        onFilterApply={handleStatsFilterApply}
        activeFilter={
          Object.keys(filters).length > 0
            ? { key: Object.keys(filters)[0], value: Object.values(filters)[0] }
            : null
        }
      />

      {/* Active Filters Badge */}
      {Object.keys(filters).length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {Object.entries(filters).map(([key, value]) => (
            <Badge key={key} variant="secondary">
              {key}: {value}
              <button
                onClick={() => {
                  const newFilters = { ...filters };
                  delete newFilters[key];
                  setFilters(newFilters);
                }}
                className="ml-2"
              >
                ✕
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={handleFilterClear}>
            Clear All
          </Button>
        </div>
      )}

      {/* User Table */}
      <UserTable filters={filters} />
    </div>
  );
}
```

---

## Custom Hook (Optional)

**File: `lib/hooks/use-employee-stats.ts`**

```typescript
'use client';

import { useState, useEffect } from 'react';

interface EmployeeStats {
  total_active: number;
  total_active_trend: number;
  total_teachers: number;
  total_teachers_trend: number;
  total_staff: number;
  total_staff_trend: number;
  on_leave_today: number;
  on_leave_today_trend: number;
  last_updated: string;
}

export function useEmployeeStats(refreshInterval = 60000) {
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/employees/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data.data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Auto-refresh every X milliseconds (default 60 seconds)
    const interval = setInterval(fetchStats, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { stats, loading, error, refetch: fetchStats };
}
```

**Usage:**
```typescript
import { useEmployeeStats } from '@/lib/hooks/use-employee-stats';

export function StatsCards() {
  const { stats, loading, error, refetch } = useEmployeeStats(60000); // Refresh every 60s

  // ... rest of component
}
```

---

## Testing Checklist

### Functional Testing
- [ ] Stats cards display correct numbers
- [ ] Clicking card applies filter to table
- [ ] Clicking same card again removes filter
- [ ] Active card has highlighted border
- [ ] Trend indicators show correct direction (up/down)
- [ ] Trend percentages are accurate
- [ ] Loading skeleton shows while fetching
- [ ] Error state displays when API fails
- [ ] Auto-refresh works (if implemented)

### Visual Testing
- [ ] Cards are responsive (desktop: 4 cols, tablet: 2 cols, mobile: 1 col)
- [ ] Hover effect works
- [ ] Icons display correctly
- [ ] Typography is readable
- [ ] Colors match design system
- [ ] Dark mode looks good
- [ ] Animations are smooth

### Integration Testing
- [ ] Filter from stats card works with table
- [ ] Multiple filters can coexist
- [ ] Clear filter badge works
- [ ] URL params reflect active filter (optional)
- [ ] Export respects stats filter

### Performance Testing
- [ ] Stats API responds < 200ms
- [ ] No memory leaks on auto-refresh
- [ ] Cards don't re-render unnecessarily

---

## Accessibility

- **ARIA Labels:** Add `aria-label` to cards
- **Keyboard Navigation:** Cards should be focusable with Tab
- **Screen Reader:** Announce stats values
- **Color Contrast:** Ensure WCAG AA compliance

```typescript
<Card
  role="button"
  tabIndex={0}
  aria-label={`${stat.label}: ${stat.value} employees`}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onFilterApply(stat.filterKey, stat.filterValue);
    }
  }}
>
  {/* ... */}
</Card>
```

---

## Future Enhancements

1. **Sparkline Charts** - Show trend graph in card
2. **More Stats** - Add cards for: Birthdays this month, New hires, Probation ending
3. **Customizable** - Let admin choose which stats to display
4. **Drill Down** - Click to see detailed breakdown modal
5. **Comparison** - Compare to same period last year

---

**End of Quick Stats Specification**
