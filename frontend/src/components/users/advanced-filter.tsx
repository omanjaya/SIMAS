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
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';
import { employeeService } from '@/lib/api/employees';

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
      const data = await employeeService.getFilterOptions();
      setOptions(data);
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
    }
  };

  const handleApply = () => {
    // Remove empty values before applying
    const cleanedFilters: FilterValues = {};
    Object.entries(localFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        cleanedFilters[key as keyof FilterValues] = value;
      }
    });
    onFilterChange(cleanedFilters);
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