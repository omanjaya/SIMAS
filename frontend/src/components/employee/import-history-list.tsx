'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Eye, 
  Download, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client';
import { formatDateTime } from '@/lib/utils';

interface ImportRecord {
  id: number;
  filename: string;
  total_records: number;
  successful_records: number;
  failed_records: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at: string | null;
  user: {
    name: string;
  };
  summary?: {
    total: number;
    successful: number;
    failed: number;
    success_rate: number;
  };
}

export const ImportHistoryList = () => {
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalImports, setTotalImports] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchImports = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/user-imports/history?page=${pageNum}&per_page=10`);
      const { data, pagination } = response.data;
      
      setImports(data);
      setTotalPages(pagination.last_page);
      setTotalImports(pagination.total);
    } catch (error: any) {
      console.error('Error fetching import history:', error);
      toast.error('Gagal memuat riwayat impor: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchImports(page);
  }, [page]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchImports(page);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Selesai</Badge>;
      case 'processing':
        return <Badge variant="secondary">Diproses</Badge>;
      case 'pending':
        return <Badge variant="outline">Menunggu</Badge>;
      case 'failed':
        return <Badge variant="destructive">Gagal</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
      case 'pending':
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Semua Riwayat Impor</h3>
          <p className="text-sm text-muted-foreground">
            Menampilkan {imports.length} dari {totalImports} impor
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Memuat...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Segarkan
            </>
          )}
        </Button>
      </div>

      {imports.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Belum ada riwayat impor</p>
        </div>
      ) : (
        <>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama File</TableHead>
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Berhasil</TableHead>
                  <TableHead>Gagal</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {imports.map((importRecord) => (
                  <TableRow key={importRecord.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {getStatusIcon(importRecord.status)}
                        <span className="ml-2 truncate max-w-xs">{importRecord.filename}</span>
                      </div>
                    </TableCell>
                    <TableCell>{importRecord.user?.name || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getStatusBadge(importRecord.status)}
                      </div>
                    </TableCell>
                    <TableCell>{importRecord.total_records}</TableCell>
                    <TableCell className="text-green-600">{importRecord.successful_records}</TableCell>
                    <TableCell className="text-red-600">{importRecord.failed_records}</TableCell>
                    <TableCell>{formatDateTime(importRecord.created_at)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          window.location.href = `/users/import-history/${importRecord.id}`;
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Halaman {page} dari {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  Berikutnya
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};