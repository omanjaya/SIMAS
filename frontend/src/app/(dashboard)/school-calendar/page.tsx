'use client';

import { useState, useEffect } from 'react';
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Filter, School, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { schoolCalendarService } from '@/lib/api/school-calendar';
import { SchoolCalendar } from '@/types/school-calendar';

export default function SchoolCalendarPage() {
  const [events, setEvents] = useState<SchoolCalendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [perPage, setPerPage] = useState(10);

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        page: currentPage,
        per_page: perPage
      };
      
      const result = await schoolCalendarService.getEvents(params);
      
      setEvents(result.data);
      setTotalPages(result.last_page);
      setTotalEvents(result.total);
      setPerPage(result.per_page);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch events on initial load and when search/pagination changes
  useEffect(() => {
    fetchEvents();
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

  // Format date to DD MMM YYYY format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Format date range
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startFormatted = start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    const endFormatted = end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    
    if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
      return `${start.getDate()}-${end.getDate()} ${start.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}`;
    } else {
      return `${startFormatted} - ${endFormatted}`;
    }
  };

  // Get icon based on event type
  const getEventIcon = (eventType: string) => {
    switch(eventType) {
      case 'holiday':
        return <Calendar className="h-4 w-4 text-red-500" />;
      case 'event':
        return <School className="h-4 w-4 text-blue-500" />;
      case 'exam':
        return <Calendar className="h-4 w-4 text-green-500" />;
      default:
        return <Calendar className="h-4 w-4 text-purple-500" />;
    }
  };

  // Get badge style based on event type
  const getBadgeStyle = (eventType: string) => {
    switch(eventType) {
      case 'holiday':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'event':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'exam':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      default:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
    }
  };

  // Get event type label in Indonesian
  const eventTypeIndonesian = (eventType: string) => {
    switch(eventType) {
      case 'holiday':
        return 'Libur';
      case 'event':
        return 'Kegiatan';
      case 'exam':
        return 'Ujian';
      case 'break':
        return 'Istirahat';
      default:
        return eventType;
    }
  };

  return (
    <>
      <Header />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Kalender Sekolah</h1>
          <p className="text-muted-foreground">
            Jadwal kegiatan, libur nasional, dan acara sekolah SMP Saraswati Denpasar
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Daftar Kegiatan</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button asChild>
                <Link href="/school-calendar/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Kegiatan
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
                  placeholder="Cari kegiatan..."
                  className="pl-8 w-full rounded-md border px-3 py-2"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {loading ? (
                <div className="flex items-center justify-center h-64 col-span-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getEventIcon(event.event_type)}
                      <h3 className="font-semibold">{event.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{formatDateRange(event.start_date, event.end_date)}</p>
                    <p className="text-xs mt-1">
                      {event.description || '-'}
                    </p>
                  </div>
                ))
              )}
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
                      <th className="text-left p-3">Judul</th>
                      <th className="text-left p-3">Tanggal Mulai</th>
                      <th className="text-left p-3">Tanggal Selesai</th>
                      <th className="text-left p-3">Jenis</th>
                      <th className="text-left p-3">Deskripsi</th>
                      <th className="text-left p-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id} className="border-b">
                        <td className="p-3">{event.title}</td>
                        <td className="p-3">{formatDate(event.start_date)}</td>
                        <td className="p-3">{formatDate(event.end_date)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${getBadgeStyle(event.event_type)}`}>
                            {eventTypeIndonesian(event.event_type)}
                          </span>
                        </td>
                        <td className="p-3">{event.description || '-'}</td>
                        <td className="p-3">
                          <Button variant="outline" size="sm">Lihat</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Menampilkan {events.length > 0 ? (currentPage - 1) * perPage + 1 : 0}-
                {Math.min(currentPage * perPage, totalEvents)} dari {totalEvents} kegiatan
              </p>
              {totalPages > 1 && renderPagination()}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
