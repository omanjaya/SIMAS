'use client';

import { useEffect, useState } from 'react';
import { CalendarCheck, DollarSign, Users, ClipboardList } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

import apiClient from '@/lib/api/client';
import StatsCard from './stats-card';

interface StatsSummary {
  totalEmployees: number | null;
  pendingLeaves: number | null;
  upcomingAgendas: number | null;
  payrollNet: number | null;
}

const formatNumber = (value: number | null) =>
  value === null ? '—' : new Intl.NumberFormat('id-ID').format(value);

const formatCurrency = (value: number | null) =>
  value === null
    ? '—'
    : new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);

export default function Stats() {
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const [summary, setSummary] = useState<StatsSummary>({
    totalEmployees: null,
    pendingLeaves: null,
    upcomingAgendas: null,
    payrollNet: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      // Don't make API calls if user is not authenticated or auth is still loading
      if (!isAuthenticated || authIsLoading) {
        return;
      }

      try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
          .toISOString()
          .split('T')[0];
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
          .toISOString()
          .split('T')[0];
        const nextThirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];

        const [employeesRes, pendingLeavesRes, calendarRes, payrollRes] = await Promise.all([
          apiClient.get('/employees?per_page=1'),
          apiClient.get('/leave-requests?status=pending'),
          apiClient.get(`/school-calendars?start_date=${today
            .toISOString()
            .split('T')[0]}&end_date=${nextThirtyDays}`),
          apiClient.get(`/analytics/payroll-cost?start_date=${startOfMonth}&end_date=${endOfMonth}`),
        ]);

        const totalEmployees =
          employeesRes.data?.total ?? employeesRes.data?.data?.length ?? null;
        const pendingLeaves = Array.isArray(pendingLeavesRes.data)
          ? pendingLeavesRes.data.length
          : null;
        const upcomingAgendas = Array.isArray(calendarRes.data)
          ? calendarRes.data.length
          : null;
        const payrollNet = payrollRes.data?.data?.totals?.net ?? null;

        setSummary({
          totalEmployees,
          pendingLeaves,
          upcomingAgendas,
          payrollNet,
        });
      } catch (error: any) {
        // Don't log 401 errors as they are expected when session expires
        if (error?.response?.status !== 401) {
          console.error('Failed to fetch dashboard stats:', error);
        }
      }
    };

    fetchStats();
  }, [isAuthenticated, authIsLoading]);

  // Show loading state or empty state when not authenticated
  if (authIsLoading) {
    return (
      <div className='col-span-6 grid grid-cols-6 gap-4'>
        <div className='col-span-3'>
          <StatsCard
            label='Pegawai Terdaftar'
            value='...'
            description='Memuat data...'
            icon={<Users className='h-4 w-4' />}
            accent='blue'
          />
        </div>
        <div className='col-span-3'>
          <StatsCard
            label='Izin Menunggu'
            value='...'
            description='Memuat data...'
            icon={<ClipboardList className='h-4 w-4' />}
            accent='orange'
          />
        </div>
        <div className='col-span-3'>
          <StatsCard
            label='Agenda 30 Hari'
            value='...'
            description='Memuat data...'
            icon={<CalendarCheck className='h-4 w-4' />}
            accent='green'
          />
        </div>
        <div className='col-span-3'>
          <StatsCard
            label='Estimasi Payroll Bulan Ini'
            value='...'
            description='Memuat data...'
            icon={<DollarSign className='h-4 w-4' />}
            accent='red'
          />
        </div>
      </div>
    );
  }

  return (
    <div className='col-span-6 grid grid-cols-6 gap-4'>
      <div className='col-span-3'>
        <StatsCard
          label='Pegawai Terdaftar'
          value={formatNumber(summary.totalEmployees)}
          description='Guru, staff TU, dan karyawan kontrak aktif.'
          icon={<Users className='h-4 w-4' />}
          accent='blue'
        />
      </div>
      <div className='col-span-3'>
        <StatsCard
          label='Izin Menunggu'
          value={formatNumber(summary.pendingLeaves)}
          description='Pengajuan cuti/izin yang menunggu persetujuan.'
          icon={<ClipboardList className='h-4 w-4' />}
          accent='orange'
        />
      </div>
      <div className='col-span-3'>
        <StatsCard
          label='Agenda 30 Hari'
          value={formatNumber(summary.upcomingAgendas)}
          description='Kegiatan & libur di kalender sekolah.'
          icon={<CalendarCheck className='h-4 w-4' />}
          accent='green'
        />
      </div>
      <div className='col-span-3'>
        <StatsCard
          label='Estimasi Payroll Bulan Ini'
          value={formatCurrency(summary.payrollNet)}
          description='Total gaji bersih yang perlu diproses.'
          icon={<DollarSign className='h-4 w-4' />}
          accent='red'
        />
      </div>
    </div>
  );
}
