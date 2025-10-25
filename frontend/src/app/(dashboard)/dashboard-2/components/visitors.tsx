'use client';

import { useEffect, useMemo, useState } from 'react';
import { Pie, PieChart, Cell, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/context/auth-context';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import apiClient from '@/lib/api/client';

interface StatusSummary {
  label: string;
  value: number;
  color: string;
}

export default function AttendanceStatusPie() {
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const [data, setData] = useState<StatusSummary[]>([]);

  useEffect(() => {
    const fetchTodaySummary = async () => {
      // Don't make API calls if user is not authenticated or auth is still loading
      if (!isAuthenticated || authIsLoading) {
        return;
      }

      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await apiClient.get(`/analytics/attendance-trends?start_date=${today}&end_date=${today}`);
        const trend = response.data?.data?.trends?.[0];
        if (trend) {
          setData([
            { label: 'Hadir', value: trend.present ?? 0, color: 'var(--chart-1)' },
            { label: 'Terlambat', value: trend.late ?? 0, color: 'var(--chart-2)' },
            { label: 'Tidak Hadir', value: trend.absent ?? 0, color: 'var(--chart-3)' },
          ]);
        } else {
          setData([]);
        }
      } catch (error: any) {
        // Don't log 401 errors as they are expected when session expires
        if (error?.response?.status !== 401) {
          console.error('Failed to load daily attendance summary', error);
        }
        setData([]);
      }
    };

    fetchTodaySummary();
  }, [isAuthenticated, authIsLoading]);

  const total = useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data]);

  return (
    <Card className='flex h-full flex-col'>
      <CardHeader className='items-center pb-0 text-center'>
        <CardTitle>Distribusi Kehadiran Hari Ini</CardTitle>
        <CardDescription>{new Date().toLocaleDateString('id-ID')}</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        {data.length ? (
          <ResponsiveContainer width='100%' height={220} minHeight={200}>
            <PieChart>
              <Pie data={data} dataKey='value' innerRadius={60} outerRadius={90} paddingAngle={2}>
                {data.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className='flex h-full items-center justify-center text-sm text-slate-300'>
            Tidak ada data kehadiran untuk hari ini.
          </div>
        )}
      </CardContent>
      <CardFooter className='flex flex-col gap-3 text-sm'>
        <div className='flex items-center justify-center text-2xl font-semibold text-slate-50'>
          {total.toLocaleString('id-ID')} masuk
        </div>
        <div className='flex flex-col gap-1 text-xs text-slate-300'>
          {data.map((item) => (
            <div key={item.label} className='flex items-center justify-between'>
              <span>{item.label}</span>
              <span>{item.value.toLocaleString('id-ID')} orang</span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
