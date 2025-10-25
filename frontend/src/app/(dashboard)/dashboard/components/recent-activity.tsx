'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useAuth } from '@/context/auth-context';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import apiClient from '@/lib/api/client';

interface AuditEntry {
  id: number;
  action: string;
  model: string | null;
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
}

const statusVariant = (action: string) => {
  if (action.toLowerCase().includes('delete')) return 'destructive';
  if (action.toLowerCase().includes('update')) return 'secondary';
  if (action.toLowerCase().includes('create') || action.toLowerCase().includes('store'))
    return 'default';
  return 'outline';
};

export default function RecentActivity() {
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      // Don't make API calls if user is not authenticated or auth is still loading
      if (!isAuthenticated || authIsLoading) {
        return;
      }

      try {
        const response = await apiClient.get('/audit-logs?per_page=5');
        const data = response.data?.data ?? [];
        setEntries(Array.isArray(data) ? data : []);
      } catch (error: any) {
        // Don't log 401 errors as they are expected when session expires
        if (error?.response?.status !== 401) {
          console.error('Failed to load audit logs', error);
        }
      }
    };

    fetchLogs();
  }, [isAuthenticated, authIsLoading]);

  const renderedRows = useMemo(() => {
    if (authIsLoading) {
      return (
        <TableRow>
          <TableCell colSpan={4} className='py-6 text-center text-sm text-muted-foreground'>
            Memuat data...
          </TableCell>
        </TableRow>
      );
    }

    if (!entries.length) {
      return (
        <TableRow>
          <TableCell colSpan={4} className='py-6 text-center text-sm text-muted-foreground'>
            Belum ada aktivitas terbaru.
          </TableCell>
        </TableRow>
      );
    }

    return entries.map((entry) => {
      const actionLabel = entry.action.replace('App\\Http\\Controllers\\', '');
      const timestamp = format(new Date(entry.created_at), 'dd MMM yyyy HH:mm');
      return (
        <TableRow key={entry.id}>
          <TableCell>
            <div className='flex flex-col'>
              <span className='font-medium text-slate-200'>{entry.user?.name ?? 'Admin'}</span>
              <span className='text-xs text-slate-400'>{entry.user?.email ?? '-'}</span>
            </div>
          </TableCell>
          <TableCell>
            <Badge variant={statusVariant(entry.action)}>{actionLabel}</Badge>
          </TableCell>
          <TableCell>{entry.model ?? '—'}</TableCell>
          <TableCell className='text-xs text-slate-300'>{timestamp}</TableCell>
        </TableRow>
      );
    });
  }, [entries]);

  return (
    <Card className='h-full'>
      <CardHeader className='flex flex-row items-center justify-between p-4'>
        <CardTitle>Aktivitas Admin Terbaru</CardTitle>
        <Link href='/audit-logs' className='text-xs text-blue-300 underline underline-offset-4'>
          Lihat semua
        </Link>
      </CardHeader>
      <CardContent className='h-[calc(100%_-_68px)] overflow-auto px-2 pt-0'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pengguna</TableHead>
              <TableHead>Aksi</TableHead>
              <TableHead>Modul</TableHead>
              <TableHead>Waktu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderedRows}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
