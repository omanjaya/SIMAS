'use client';

import { useState, useEffect } from 'react';
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, Search, Loader2, Upload, Download, X, Lock } from "lucide-react";
import Link from "next/link";
import { employeeService } from '@/lib/api/employees';
import { Employee } from '@/types/employees';
import { Badge } from "@/components/ui/badge";
import { BulkImportDialog } from '@/components/users/bulk-import-dialog';
import { StatsCards } from '@/components/users/stats-cards';
import { AdvancedFilter } from '@/components/users/advanced-filter';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Check access rights - only admins can access this page
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (!user || user.role !== 'admin') {
        router.push('/unauthorized');
      }
    } else if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [user, isAuthenticated, isLoading, router]);

  // If still loading auth status, show loading spinner
  if (isLoading || (!isAuthenticated && !isLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Memeriksa otorisasi...</p>
        </div>
      </div>
    );
  }

  // If user is not admin, show unauthorized message
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Akses Ditolak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Halaman ini hanya dapat diakses oleh administrator.
            </p>
            <Button asChild>
              <Link href="/dashboard">
                Kembali ke Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch employees from API
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        page: currentPage,
        per_page: perPage,
        ...filters
      };
      
      const result = await employeeService.getEmployees(params);
      
      setEmployees(result.data);
      setTotalPages(result.last_page);
      setTotalEmployees(result.total);
      setPerPage(result.per_page);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees on initial load and when search/pagination/filters change
  useEffect(() => {
    fetchEmployees();
  }, [searchTerm, currentPage, filters]);

  // Handle search input changes with delay to avoid too many API calls
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleStatsFilterApply = (key: string, value: string) => {
    // Toggle filter - if same filter clicked again, remove it
    if (filters[key] === value) {
      const newFilters = { ...filters };
      delete newFilters[key];
      setFilters(newFilters);
    } else {
      setFilters({ ...filters, [key]: value });
    }
    // Reset to first page when filter changes
    setCurrentPage(1);
  };

  const handleFilterClear = () => {
    setFilters({});
  };

  // Render pagination controls
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Sebelumnya
        </Button>
        {pages}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Berikutnya
        </Button>
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="p-6 space-y-6">
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

        {/* Advanced Filter */}
        <AdvancedFilter
          activeFilters={filters}
          onFilterChange={setFilters}
        />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Data Pegawai</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/employees/export', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ filters: filters, format: 'xlsx' })
                    });
                    
                    if (!response.ok) throw new Error('Export failed');
                    
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `employees_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                  } catch (error) {
                    console.error('Export failed:', error);
                  }
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <BulkImportDialog onImportComplete={fetchEmployees} />
              <Button asChild>
                <Link href="/users/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Pegawai
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari pegawai..."
                  className="pl-8 w-full rounded-md border px-3 py-2"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-3">Nama</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Jabatan</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Biometric</th>
                        <th className="text-left p-3">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((employee) => (
                        <tr key={employee.id} className="border-b">
                          <td className="p-3">{employee.first_name} {employee.last_name}</td>
                          <td className="p-3">{employee.email}</td>
                          <td className="p-3">{employee.position || '-'}</td>
                          <td className="p-3">
                            <Badge 
                              variant={employee.status === 'active' ? 'default' : 'secondary'}
                              className={employee.status === 'on_leave' ? 'bg-yellow-100 text-yellow-800' : ''}
                            >
                              {employee.status === 'active' ? 'Aktif' : 
                               employee.status === 'on_leave' ? 'Cuti' : 
                               employee.status === 'suspended' ? 'Nonaktif' : 'Tidak Diketahui'}
                            </Badge>
                          </td>
                          <td className="p-3">
                            {employee.faceTemplate ? (
                              <Badge variant="default" className="bg-green-500">
                                ✅ Enrolled
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                ⚠️ Not Enrolled
                              </Badge>
                            )}
                          </td>
                          <td className="p-3">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/users/${employee.id}`}>
                                Lihat
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Menampilkan {employees.length > 0 ? (currentPage - 1) * perPage + 1 : 0}-
                    {Math.min(currentPage * perPage, totalEmployees)} dari {totalEmployees} pegawai
                  </p>
                  {totalPages > 1 && renderPagination()}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
