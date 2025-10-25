// src/components/shared/data-table.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Search, Filter, SortAsc, SortDesc } from "lucide-react";
import { ReactNode, useState } from "react";

interface ColumnDef<T> {
  accessorKey: string;
  header: string;
  cell?: (info: { getValue: () => any; row: T }) => ReactNode;
  enableSorting?: boolean;
  enableFiltering?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  onRowClick?: (row: T) => void;
  actions?: {
    label: string;
    onClick: (row: T) => void;
    icon?: ReactNode;
  }[];
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  searchable = false,
  filterable = false,
  sortable = false,
  onRowClick,
  actions,
  loading,
  error,
  emptyMessage = "No data found",
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Filtering logic
  const filteredData = data.filter(item => {
    // Search term filtering
    if (searchTerm) {
      const match = Object.values(item as Record<string, any>).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (!match) return false;
    }

    // Column filters
    for (const [key, value] of Object.entries(filters)) {
      if (value && (item as Record<string, any>)[key] !== value) {
        return false;
      }
    }

    return true;
  });

  // Sorting logic
  const sortedData = [...filteredData];
  if (sortConfig !== null) {
    sortedData.sort((a, b) => {
      const aValue = (a as Record<string, any>)[sortConfig.key];
      const bValue = (b as Record<string, any>)[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (columnKey: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
  };

  // Get unique values for filter dropdowns
  const getUniqueValues = (columnKey: string) => {
    return [...new Set(data.map(item => (item as Record<string, any>)[columnKey]))];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        Error loading data: {error}
      </div>
    );
  }

  if (sortedData.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(searchable || filterable) && (
        <div className="flex flex-wrap gap-2">
          {searchable && (
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          {filterable && columns.filter(col => col.enableFiltering).map(column => (
            <Select 
              key={column.accessorKey}
              value={filters[column.accessorKey] || ""} 
              onValueChange={(value) => handleFilterChange(column.accessorKey, value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={`Filter by ${column.header}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All {column.header}</SelectItem>
                {getUniqueValues(column.accessorKey).map(value => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(column => (
                <TableHead key={column.accessorKey}>
                  <div className="flex items-center gap-1">
                    {column.header}
                    {sortable && column.enableSorting && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0"
                        onClick={() => requestSort(column.accessorKey)}
                      >
                        {sortConfig?.key === column.accessorKey && sortConfig?.direction === 'asc' ? (
                          <SortAsc className="h-4 w-4" />
                        ) : (
                          <SortDesc className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </TableHead>
              ))}
              {actions && actions.length > 0 && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((row, rowIndex) => (
              <TableRow 
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
              >
                {columns.map(column => (
                  <TableCell key={column.accessorKey}>
                    {column.cell ? 
                      column.cell({ 
                        getValue: () => (row as Record<string, any>)[column.accessorKey], 
                        row 
                      }) : 
                      String((row as Record<string, any>)[column.accessorKey])
                    }
                  </TableCell>
                ))}
                {actions && actions.length > 0 && (
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {actions.map((action, index) => (
                          <DropdownMenuItem
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row);
                            }}
                          >
                            {action.icon && <span className="mr-2">{action.icon}</span>}
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}