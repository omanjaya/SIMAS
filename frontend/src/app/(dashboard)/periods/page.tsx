'use client';

import { useState, useEffect } from 'react';
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Plus, Calendar, ToggleLeft, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { periodService } from '@/lib/api/periods';
import { Period } from '@/types/periods';

export default function PeriodsPage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPeriods, setTotalPeriods] = useState(0);
  const [perPage, setPerPage] = useState(10);

  // Fetch periods from API
  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        page: currentPage,
        per_page: perPage
      };
      
      const result = await periodService.getPeriods(params);

      setPeriods(Array.isArray(result?.data) ? result.data : []);
      setTotalPages(result?.last_page ?? 1);
      setTotalPeriods(result?.total ?? 0);
      setPerPage(result?.per_page ?? perPage);
    } catch (error) {
      console.error('Failed to fetch periods:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch periods on initial load and when search/pagination changes
  useEffect(() => {
    fetchPeriods();
  }, [searchTerm, currentPage]);

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

  // Format time to HH:MM format
  const formatTime = (timeString: string) => {
    if (!timeString) return '-';
    return timeString.substring(0, 5); // Get HH:MM part
  };

  return (
    <>
      <Header />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Periode & Jam Kerja</h1>
          <p className="text-muted-foreground">
            Kelola periode waktu dan jam kerja SMP Saraswati Denpasar
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Daftar Periode</CardTitle>
              <Button asChild>
                <Link href="/periods/new">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Periode
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari periode..."
                  className="pl-8 w-full rounded-md border px-3 py-2"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {(Array.isArray(periods) ? periods : []).map((period) => (
                <div 
                  key={period.id} 
                  className={`border rounded-lg p-4 ${period.is_active ? 'bg-blue-50 dark:bg-blue-950' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4" />
                    <h3 className="font-semibold">{period.name}</h3>
                  </div>
                  <p className="text-sm">{formatTime(period.start_time)} - {formatTime(period.end_time)}</p>
                  <div className="flex items-center mt-2">
                    <ToggleLeft 
                      className={`h-4 w-4 mr-1 ${period.is_active ? 'text-green-500' : 'text-red-500'}`} 
                    />
                    <span className={`text-xs ${period.is_active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {period.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="border rounded-md">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-3">Nama</th>
                      <th className="text-left p-3">Kode</th>
                      <th className="text-left p-3">Waktu Mulai</th>
                      <th className="text-left p-3">Waktu Selesai</th>
                      <th className="text-left p-3">Urutan</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(periods) ? periods : []).map((period) => (
                      <tr key={period.id} className="border-b">
                        <td className="p-3">{period.name}</td>
                        <td className="p-3">{period.code}</td>
                        <td className="p-3">{formatTime(period.start_time)}</td>
                        <td className="p-3">{formatTime(period.end_time)}</td>
                        <td className="p-3">{period.order}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            period.is_active 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                          }`}>
                            {period.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="p-3">
                          <Button variant="outline" size="sm">Edit</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Menampilkan {periods.length > 0 ? (currentPage - 1) * perPage + 1 : 0}-
                {Math.min(currentPage * perPage, totalPeriods)} dari {totalPeriods} periode
              </p>
              {totalPages > 1 && renderPagination()}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
