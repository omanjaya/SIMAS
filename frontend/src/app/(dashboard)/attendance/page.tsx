'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { attendanceService, MonthlySummaryResponse } from '@/lib/api/attendance';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Briefcase,
  HeartPulse,
  Plane,
  FileText,
} from 'lucide-react';

export default function AttendancePage() {
  const [summary, setSummary] = useState<MonthlySummaryResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState((currentDate.getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());

  const months = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = currentDate.getFullYear() - 2 + i;
    return { value: year.toString(), label: year.toString() };
  });

  useEffect(() => {
    fetchMonthlySummary();
  }, [selectedMonth, selectedYear]);

  const fetchMonthlySummary = async () => {
    try {
      setLoading(true);
      const data = await attendanceService.monthlySummary(
        parseInt(selectedMonth),
        parseInt(selectedYear)
      );
      setSummary(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch monthly summary:', err);
      setError(err.response?.data?.message || 'Gagal memuat data kehadiran');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <AttendanceSkeleton />;
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Data kehadiran tidak ditemukan</p>
      </div>
    );
  }

  const monthName = months.find(m => m.value === selectedMonth)?.label || '';

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laporan Kehadiran</h1>
          <p className="text-muted-foreground">
            Ringkasan kehadiran bulanan pegawai
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Pilih Bulan" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Pilih Tahun" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Main Attendance Rate Card */}
      <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Tingkat Kehadiran {monthName} {selectedYear}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-6xl font-bold text-primary">
                {summary.summary.attendance_rate.toFixed(1)}%
              </p>
              <p className="mt-2 text-lg text-muted-foreground">
                {summary.summary.present} dari {summary.summary.working_days} hari kerja
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          icon={<CheckCircle className="h-5 w-5" />}
          label="Hadir"
          value={summary.summary.present}
          color="green"
        />
        <StatCard
          icon={<XCircle className="h-5 w-5" />}
          label="Tidak Hadir"
          value={summary.summary.absent}
          color="red"
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5" />}
          label="Tepat Waktu"
          value={summary.summary.on_time}
          color="blue"
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Terlambat"
          value={summary.summary.late}
          color="yellow"
        />
      </div>

      {/* Leave Breakdown Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Rincian Izin & Cuti</CardTitle>
          </div>
          <CardDescription>Breakdown jenis ketidakhadiran pada bulan {monthName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <LeaveCard
              icon={<Plane className="h-5 w-5" />}
              label="Cuti"
              value={summary.summary.leaves.annual}
              color="purple"
            />
            <LeaveCard
              icon={<HeartPulse className="h-5 w-5" />}
              label="Sakit"
              value={summary.summary.leaves.sick}
              color="orange"
            />
            <LeaveCard
              icon={<Briefcase className="h-5 w-5" />}
              label="Dinas/Diklat"
              value={summary.summary.leaves.official_duty}
              color="indigo"
            />
            <LeaveCard
              icon={<FileText className="h-5 w-5" />}
              label="Ijin"
              value={summary.summary.leaves.permission}
              color="pink"
            />
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Total Izin/Cuti/Sakit:
            </span>
            <span className="text-2xl font-bold text-primary">
              {summary.summary.leaves.total} Hari
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Kalender Kehadiran</CardTitle>
          </div>
          <CardDescription>Detail kehadiran per hari pada bulan {monthName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
              <div key={day} className="text-center font-semibold text-sm text-muted-foreground p-2">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {summary.daily.map((day, index) => {
              const date = new Date(day.date);
              const dayOfMonth = date.getDate();
              const isWeekend = day.day_of_week === 0 || day.day_of_week === 6;

              // Determine color based on status
              let bgColor = 'bg-gray-100 dark:bg-gray-800';
              let textColor = 'text-muted-foreground';
              let borderColor = 'border-transparent';

              if (isWeekend) {
                bgColor = 'bg-gray-200 dark:bg-gray-700';
              } else if (day.has_attendance) {
                if (day.status === 'present' || day.status === 'on_time') {
                  bgColor = 'bg-green-100 dark:bg-green-900';
                  textColor = 'text-green-700 dark:text-green-300';
                  borderColor = 'border-green-500';
                } else if (day.status === 'late') {
                  bgColor = 'bg-yellow-100 dark:bg-yellow-900';
                  textColor = 'text-yellow-700 dark:text-yellow-300';
                  borderColor = 'border-yellow-500';
                }
              } else if (day.leave_type) {
                // Leave types
                if (day.leave_type === 'annual') {
                  bgColor = 'bg-purple-100 dark:bg-purple-900';
                  textColor = 'text-purple-700 dark:text-purple-300';
                  borderColor = 'border-purple-500';
                } else if (day.leave_type === 'sick') {
                  bgColor = 'bg-orange-100 dark:bg-orange-900';
                  textColor = 'text-orange-700 dark:text-orange-300';
                  borderColor = 'border-orange-500';
                } else if (day.leave_type === 'official_duty') {
                  bgColor = 'bg-indigo-100 dark:bg-indigo-900';
                  textColor = 'text-indigo-700 dark:text-indigo-300';
                  borderColor = 'border-indigo-500';
                } else if (day.leave_type === 'permission') {
                  bgColor = 'bg-pink-100 dark:bg-pink-900';
                  textColor = 'text-pink-700 dark:text-pink-300';
                  borderColor = 'border-pink-500';
                }
              } else if (!isWeekend) {
                // Absent on working day
                bgColor = 'bg-red-100 dark:bg-red-900';
                textColor = 'text-red-700 dark:text-red-300';
                borderColor = 'border-red-500';
              }

              return (
                <div
                  key={index}
                  className={`
                    aspect-square rounded-lg border-2 ${borderColor} ${bgColor}
                    flex flex-col items-center justify-center p-2 text-center
                    hover:shadow-md transition-shadow cursor-pointer
                  `}
                  title={`${day.date} - ${day.status || day.leave_type || 'Weekend'}`}
                >
                  <span className={`text-lg font-bold ${textColor}`}>{dayOfMonth}</span>
                  {day.clock_in_time && (
                    <span className="text-xs text-muted-foreground mt-1">
                      {day.clock_in_time.substring(0, 5)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <Separator className="my-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <LegendItem color="bg-green-100 dark:bg-green-900 border-green-500" label="Hadir" />
            <LegendItem color="bg-yellow-100 dark:bg-yellow-900 border-yellow-500" label="Terlambat" />
            <LegendItem color="bg-red-100 dark:bg-red-900 border-red-500" label="Tidak Hadir" />
            <LegendItem color="bg-gray-200 dark:bg-gray-700 border-gray-400" label="Libur" />
            <LegendItem color="bg-purple-100 dark:bg-purple-900 border-purple-500" label="Cuti" />
            <LegendItem color="bg-orange-100 dark:bg-orange-900 border-orange-500" label="Sakit" />
            <LegendItem color="bg-indigo-100 dark:bg-indigo-900 border-indigo-500" label="Dinas/Diklat" />
            <LegendItem color="bg-pink-100 dark:bg-pink-900 border-pink-500" label="Ijin" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============ COMPONENTS ============

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'green' | 'red' | 'blue' | 'yellow';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300',
    red: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300',
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300',
    yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300',
  };

  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface LeaveCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'purple' | 'orange' | 'indigo' | 'pink';
}

function LeaveCard({ icon, label, value, color }: LeaveCardProps) {
  const colorClasses = {
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300',
    orange: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300',
    indigo: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300',
    pink: 'bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300',
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border">
      <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{value} Hari</p>
      </div>
    </div>
  );
}

interface LegendItemProps {
  color: string;
  label: string;
}

function LegendItem({ color, label }: LegendItemProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 rounded border-2 ${color}`} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function AttendanceSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-[150px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
      </div>

      <Skeleton className="h-px w-full" />

      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-96" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
