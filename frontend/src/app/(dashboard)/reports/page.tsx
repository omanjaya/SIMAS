'use client';

import { useState, useEffect } from 'react';
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText, Users, Calendar, Clock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { analyticsService } from '@/lib/api/analytics';

interface StatsData {
  monthlyReports: number;
  annualReports: number;
  activeEmployees: number;
  attendanceRate: number;
}

export default function ReportsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('all');
  const [dateRange, setDateRange] = useState('current_month');
  const [department, setDepartment] = useState('all');

  // Fetch analytics data
  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, we would call analytics endpoints to get these values
      // For now, we'll simulate this with some basic data
      // In a real implementation, you might call:
      // const attendanceTrends = await analyticsService.getAttendanceTrends({/* filters */});
      // const employeeCount = await employeeService.getStats(); // from employees endpoint
      
      // Simulated data for demo purposes
      setStats({
        monthlyReports: 12,
        annualReports: 3,
        activeEmployees: 48, // This would come from the employee stats API
        attendanceRate: 94.2
      });
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Handle report generation
  const handleGenerateReport = () => {
    // In a real implementation, this would call the backend to generate a report
    // and download it or show a preview
    console.log('Generating report with filters:', { reportType, dateRange, department });
  };

  return (
    <>
      <Header />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Laporan & Statistik</h1>
          <p className="text-muted-foreground">
            Laporan kehadiran, izin, dan statistik sistem SMP Saraswati Denpasar
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg mr-4">
                    <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Laporan Bulanan</p>
                    <p className="text-xl font-bold">{stats?.monthlyReports || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg mr-4">
                    <FileText className="h-6 w-6 text-green-600 dark:text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Laporan Tahunan</p>
                    <p className="text-xl font-bold">{stats?.annualReports || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg mr-4">
                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pegawai Aktif</p>
                    <p className="text-xl font-bold">{stats?.activeEmployees || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg mr-4">
                    <Clock className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rata-rata Kehadiran</p>
                    <p className="text-xl font-bold">{stats?.attendanceRate || 0}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Tersedia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Laporan Kehadiran Bulanan</h3>
                    <p className="text-sm text-muted-foreground">Oktober 2025</p>
                  </div>
                  <Badge variant="secondary">PDF</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Laporan Izin Pegawai</h3>
                    <p className="text-sm text-muted-foreground">Januari - September 2025</p>
                  </div>
                  <Badge variant="secondary">Excel</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Statistik Kehadiran Tahunan</h3>
                    <p className="text-sm text-muted-foreground">Tahun Ajaran 2024/2025</p>
                  </div>
                  <Badge variant="secondary">PDF</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Laporan Penggajian</h3>
                    <p className="text-sm text-muted-foreground">September 2025</p>
                  </div>
                  <Badge variant="secondary">PDF</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Filter Laporan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Jenis Laporan</label>
                  <select 
                    className="w-full rounded-md border px-3 py-2 mt-1"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option value="all">Semua Jenis</option>
                    <option value="attendance">Laporan Kehadiran</option>
                    <option value="leave">Laporan Izin</option>
                    <option value="stats">Statistik</option>
                    <option value="payroll">Laporan Penggajian</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Rentang Waktu</label>
                  <select 
                    className="w-full rounded-md border px-3 py-2 mt-1"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                  >
                    <option value="current_month">Bulan Ini</option>
                    <option value="last_3_months">3 Bulan Terakhir</option>
                    <option value="year">Tahun Ini</option>
                    <option value="last_year">Tahun Lalu</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Unit/Fakultas</label>
                  <select 
                    className="w-full rounded-md border px-3 py-2 mt-1"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="all">Semua Unit</option>
                    <option value="teachers">Guru</option>
                    <option value="staff">Staff TU</option>
                    <option value="cleaning">Kebersihan</option>
                    <option value="security">Keamanan</option>
                  </select>
                </div>
                
                <Button className="w-full" onClick={handleGenerateReport}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    'Generate Laporan'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}