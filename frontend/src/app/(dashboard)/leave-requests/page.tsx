'use client';

import { useState, useEffect } from 'react';
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Filter, Clock, Check, X, Search, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { leaveRequestService } from '@/lib/api/leave-requests';
import { LeaveRequest } from '@/types/leave-requests';

interface StatsData {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function LeaveRequestsPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeaveRequests, setTotalLeaveRequests] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [stats, setStats] = useState<StatsData | null>(null);

  // Fetch leave requests from API
  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        page: currentPage,
        per_page: perPage
      };
      
      const result = await leaveRequestService.getLeaveRequests(params);
      
      setLeaveRequests(result.data);
      setTotalPages(result.last_page);
      setTotalLeaveRequests(result.total);
      setPerPage(result.per_page);
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats data
  const fetchStats = async () => {
    try {
      const allRequests = await leaveRequestService.getLeaveRequests({ per_page: 1000 }); // Get all requests to calculate stats
      const total = allRequests.total;
      const pending = allRequests.data.filter(req => req.status === 'pending').length;
      const approved = allRequests.data.filter(req => req.status === 'approved').length;
      const rejected = allRequests.data.filter(req => req.status === 'rejected').length;
      
      setStats({
        total,
        pending,
        approved,
        rejected
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Fetch leave requests and stats on initial load and when search/pagination changes
  useEffect(() => {
    fetchLeaveRequests();
    fetchStats();
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

  // Approve a leave request
  const handleApprove = async (id: number) => {
    try {
      await leaveRequestService.approve(id, { status: 'approved' });
      // Refresh the data
      fetchLeaveRequests();
      fetchStats();
    } catch (error) {
      console.error('Failed to approve leave request:', error);
    }
  };

  // Reject a leave request
  const handleReject = async (id: number) => {
    try {
      await leaveRequestService.reject(id, { status: 'rejected' });
      // Refresh the data
      fetchLeaveRequests();
      fetchStats();
    } catch (error) {
      console.error('Failed to reject leave request:', error);
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

  return (
    <>
      <Header />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Pengajuan Izin/Cuti</h1>
          <p className="text-muted-foreground">
            Kelola permohonan izin dan cuti pegawai SMP Saraswati Denpasar
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Daftar Pengajuan</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Ekspor
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {stats ? (
                <>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Total Pengajuan</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Menunggu</p>
                    <p className="text-2xl font-bold text-orange-500">{stats.pending}</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Disetujui</p>
                    <p className="text-2xl font-bold text-green-500">{stats.approved}</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Ditolak</p>
                    <p className="text-2xl font-bold text-red-500">{stats.rejected}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Total Pengajuan</p>
                    <p className="text-2xl font-bold">-</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Menunggu</p>
                    <p className="text-2xl font-bold text-orange-500">-</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Disetujui</p>
                    <p className="text-2xl font-bold text-green-500">-</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Ditolak</p>
                    <p className="text-2xl font-bold text-red-500">-</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari pegawai atau jenis izin..."
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
              <div className="border rounded-md">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-3">Pegawai</th>
                      <th className="text-left p-3">Jenis Izin</th>
                      <th className="text-left p-3">Tanggal</th>
                      <th className="text-left p-3">Durasi</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveRequests.map((request) => (
                      <tr key={request.id} className="border-b">
                        <td className="p-3">
                          {request.employee 
                            ? `${request.employee.first_name} ${request.employee.last_name}` 
                            : 'N/A'}
                        </td>
                        <td className="p-3">
                          {request.leave_type === 'sick' ? 'Sakit' :
                           request.leave_type === 'annual' ? 'Tahunan' :
                           request.leave_type === 'emergency' ? 'Darurat' :
                           request.leave_type === 'personal' ? 'Pribadi' :
                           request.leave_type === 'maternity' ? 'Melahirkan' :
                           request.leave_type === 'paternity' ? 'Paternity' :
                           request.leave_type === 'unpaid' ? 'Tanpa Bayar' : 
                           request.leave_type}
                        </td>
                        <td className="p-3">{formatDateRange(request.start_date, request.end_date)}</td>
                        <td className="p-3">{request.total_days} hari</td>
                        <td className="p-3">
                          {request.status === 'pending' ? (
                            <Badge variant="secondary">Menunggu</Badge>
                          ) : request.status === 'approved' ? (
                            <Badge variant="default">Disetujui</Badge>
                          ) : request.status === 'rejected' ? (
                            <Badge variant="destructive">Ditolak</Badge>
                          ) : (
                            <Badge variant="outline">{request.status}</Badge>
                          )}
                        </td>
                        <td className="p-3">
                          {request.status === 'pending' ? (
                            <div className="flex gap-1">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleApprove(request.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleReject(request.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button variant="outline" size="sm">Lihat</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Menampilkan {leaveRequests.length > 0 ? (currentPage - 1) * perPage + 1 : 0}-
                {Math.min(currentPage * perPage, totalLeaveRequests)} dari {totalLeaveRequests} pengajuan
              </p>
              {totalPages > 1 && renderPagination()}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}