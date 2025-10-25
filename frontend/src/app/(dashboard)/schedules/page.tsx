'use client';

import { useState, useEffect } from 'react';
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Plus, Calendar, Filter, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { scheduleService } from '@/lib/api/schedules';
import { TeacherSchedule } from '@/types/schedules';

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<TeacherSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSchedules, setTotalSchedules] = useState(0);
  const [perPage, setPerPage] = useState(10);

  // Fetch schedules from API
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        page: currentPage,
        per_page: perPage
      };
      
      const result = await scheduleService.getSchedules(params);

      setSchedules(Array.isArray(result?.data) ? result.data : []);
      setTotalPages(result?.last_page ?? 1);
      setTotalSchedules(result?.total ?? 0);
      setPerPage(result?.per_page ?? perPage);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch schedules on initial load and when search/pagination changes
  useEffect(() => {
    fetchSchedules();
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

  // Group schedules by day of the week
  const groupSchedulesByDay = () => {
    const grouped: Record<string, TeacherSchedule[]> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    };

    const safeSchedules = Array.isArray(schedules) ? schedules : [];

    safeSchedules.forEach(schedule => {
      if (!grouped[schedule.day_of_week]) {
        grouped[schedule.day_of_week] = [];
      }
      grouped[schedule.day_of_week].push(schedule);
    });

    return grouped;
  };

  const groupedSchedules = groupSchedulesByDay();

  // Convert day of week to Indonesian
  const dayToIndonesian = (day: string) => {
    switch(day) {
      case 'monday': return 'Senin';
      case 'tuesday': return 'Selasa';
      case 'wednesday': return 'Rabu';
      case 'thursday': return 'Kamis';
      case 'friday': return 'Jumat';
      case 'saturday': return 'Sabtu';
      case 'sunday': return 'Minggu';
      default: return day;
    }
  };

  return (
    <>
      <Header />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Jadwal Guru</h1>
          <p className="text-muted-foreground">
            Kelola jadwal mengajar guru SMP Saraswati Denpasar
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Jadwal Mengajar</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button asChild>
                <Link href="/schedules/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Jadwal
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
                  placeholder="Cari guru atau mata pelajaran..."
                  className="pl-8 w-full rounded-md border px-3 py-2"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {Object.entries(groupedSchedules).map(([day, daySchedules]) => (
                daySchedules.length > 0 && (
                  <div key={day} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4" />
                      <h3 className="font-semibold">{dayToIndonesian(day)}</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      {daySchedules.map((schedule) => (
                        <li key={schedule.id} className="flex justify-between">
                          <span>{schedule.room_number ? `${schedule.room_number} ` : ''}- {schedule.subject}</span>
                          <span>{schedule.class_name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
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
                      <th className="text-left p-3">Guru</th>
                      <th className="text-left p-3">Mata Pelajaran</th>
                      <th className="text-left p-3">Kelas</th>
                      <th className="text-left p-3">Hari</th>
                      <th className="text-left p-3">Waktu</th>
                      <th className="text-left p-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((schedule) => (
                      <tr key={schedule.id} className="border-b">
                        <td className="p-3">{schedule.employee_id}</td> {/* We'll need to fetch employee details */}
                        <td className="p-3">{schedule.subject}</td>
                        <td className="p-3">{schedule.class_name}</td>
                        <td className="p-3">{dayToIndonesian(schedule.day_of_week)}</td>
                        <td className="p-3">{schedule.room_number ? schedule.room_number : '-'}</td>
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
                Menampilkan {schedules.length > 0 ? (currentPage - 1) * perPage + 1 : 0}-
                {Math.min(currentPage * perPage, totalSchedules)} dari {totalSchedules} jadwal
              </p>
              {totalPages > 1 && renderPagination()}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
