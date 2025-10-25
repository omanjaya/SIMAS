'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Eye, 
  Download, 
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client';
import { formatDateTime } from '@/lib/utils';

interface ImportDetail {
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
  errors?: Array<{
    line: number;
    error: string;
    data: any;
  }>;
  summary?: {
    total: number;
    successful: number;
    failed: number;
    success_rate: number;
  };
}

export default function ImportDetailPage() {
  const { id } = useParams();
  const [importDetail, setImportDetail] = useState<ImportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImportDetail = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/user-imports/${id}`);
        setImportDetail(response.data.data);
      } catch (err: any) {
        console.error('Error fetching import detail:', err);
        setError(err.response?.data?.message || 'Gagal memuat detail impor');
        toast.error('Gagal memuat detail impor');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchImportDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="p-6 flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Detail Impor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-lg font-medium">Gagal Memuat Data</p>
                <p className="text-gray-500 dark:text-gray-400">{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Coba Lagi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (!importDetail) {
    return (
      <>
        <Header />
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Detail Impor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Data impor tidak ditemukan</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Detail Impor: {importDetail.filename}</h1>
          <p className="text-muted-foreground">
            Lihat detail dari proses impor data pegawai
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Impor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Nama File:</span>
                  <span className="font-medium">{importDetail.filename}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pengguna:</span>
                  <span className="font-medium">{importDetail.user?.name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge 
                    variant={importDetail.status === 'completed' ? 'default' : 
                            importDetail.status === 'failed' ? 'destructive' : 
                            'secondary'}
                  >
                    {importDetail.status === 'completed' ? 'Selesai' : 
                     importDetail.status === 'failed' ? 'Gagal' : 
                     importDetail.status === 'processing' ? 'Diproses' : 'Menunggu'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal Dibuat:</span>
                  <span className="font-medium">{formatDateTime(importDetail.created_at)}</span>
                </div>
                {importDetail.completed_at && (
                  <div className="flex justify-between">
                    <span>Tanggal Selesai:</span>
                    <span className="font-medium">{formatDateTime(importDetail.completed_at)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistik</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Total Rekaman:</span>
                  <span className="font-medium">{importDetail.total_records}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    <span>Berhasil:</span>
                  </div>
                  <span className="font-medium text-green-600">{importDetail.successful_records}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                    <span>Gagal:</span>
                  </div>
                  <span className="font-medium text-red-600">{importDetail.failed_records}</span>
                </div>
                {importDetail.summary && (
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span>Tingkat Keberhasilan:</span>
                    <span className="font-medium">
                      {importDetail.summary.success_rate}%
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {importDetail.errors && importDetail.errors.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Kesalahan Impor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Baris</TableHead>
                      <TableHead>Kesalahan</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importDetail.errors.map((error, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{error.line}</TableCell>
                        <TableCell className="text-red-600">{error.error}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {JSON.stringify(error.data)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex space-x-3">
          <Button 
            variant="outline"
            onClick={() => window.history.back()}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/users/bulk-import'}
          >
            <Eye className="h-4 w-4 mr-2" />
            Impor Lagi
          </Button>
        </div>
      </div>
    </>
  );
}