'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useAuth } from '@/context/auth-context';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import apiClient from '@/lib/api/client';

interface TrendPoint {
  date: string;
  present: number;
  late: number;
  absent: number;
}

const chartConfig: ChartConfig = {
  present: { label: 'Hadir', color: 'var(--chart-1)' },
  late: { label: 'Terlambat', color: 'var(--chart-2)' },
  absent: { label: 'Tidak Hadir', color: 'var(--chart-3)' },
};

export default function AttendanceTrendChart() {
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [data, setData] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Don't make API calls if user is not authenticated or auth is still loading
      if (!isAuthenticated || authIsLoading) {
        return;
      }

      setLoading(true);
      try {
        const start = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
        const end = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];
        const response = await apiClient.get(`/analytics/attendance-trends?start_date=${start}&end_date=${end}`);
        const trends = response.data?.data?.trends ?? [];
        const formatted = trends.map((item: any) => ({
          date: item.date,
          present: item.present ?? 0,
          late: item.late ?? 0,
          absent: item.absent ?? 0,
        }));
        setData(formatted);
      } catch (error: any) {
        // Don't log 401 errors as they are expected when session expires
        if (error?.response?.status !== 401) {
          console.error('Failed to load attendance trends', error);
        }
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear, isAuthenticated, authIsLoading]);

  const totalAttendance = useMemo(() => {
    return data.reduce(
      (acc, curr) => {
        acc.present += curr.present;
        acc.late += curr.late;
        acc.absent += curr.absent;
        return acc;
      },
      { present: 0, late: 0, absent: 0 }
    );
  }, [data]);

  return (
    <Card className='h-full'>
      <CardHeader className='p-4'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>Tren Kehadiran Bulanan</CardTitle>
            <CardDescription className='flex items-center gap-2 text-xs text-slate-400'>
              <Calendar className='h-3 w-3' />
              Data hadir, terlambat, dan tidak hadir per hari dalam bulan terpilih.
            </CardDescription>
          </div>
          <div className='flex gap-2'>
            <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
              <SelectTrigger className='w-[110px]'>
                <SelectValue placeholder='Bulan' />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <SelectItem key={month} value={month.toString()}>
                    {new Date(0, month - 1).toLocaleString('id-ID', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className='w-[90px]'>
                <SelectValue placeholder='Tahun' />
              </SelectTrigger>
              <SelectContent>
                {[selectedYear - 1, selectedYear, selectedYear + 1].map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className='flex items-center gap-2 text-xs text-slate-200'>
          <Badge variant='outline'>Hadir: {totalAttendance.present}</Badge>
          <Badge variant='outline'>Terlambat: {totalAttendance.late}</Badge>
          <Badge variant='outline'>Tidak hadir: {totalAttendance.absent}</Badge>
        </div>
      </CardHeader>
      <CardContent className='h-[calc(100%_-_138px)] px-4 pt-0'>
        {loading ? (
          <div className='flex h-full items-center justify-center text-slate-300'>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Memuat data...
          </div>
        ) : (
          <ResponsiveContainer width='100%' height='100%' minHeight={200}>
            <ChartContainer config={chartConfig}>
              <BarChart data={data}>
                <ChartLegend content={<ChartLegendContent />} />
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey='date'
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(-2)}
                />
                <YAxis allowDecimals={false} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator='dashed' />} />
                <Bar dataKey='present' barSize={18} fill='var(--color-present)' radius={4} />
                <Bar dataKey='late' barSize={18} fill='var(--color-late)' radius={4} />
                <Bar dataKey='absent' barSize={18} fill='var(--color-absent)' radius={4} />
              </BarChart>
            </ChartContainer>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}