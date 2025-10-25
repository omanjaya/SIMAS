'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  Download, 
  Search, 
  Calendar,
  FileSpreadsheet,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { BulkImportHistory } from '@/types/bulk-import';

interface ImportHistoryDashboardProps {
  history: BulkImportHistory[];
  onExportHistory: (id: number) => void;
  onRefresh: () => void;
  loading?: boolean;
}

export const ImportHistoryDashboard: React.FC<ImportHistoryDashboardProps> = ({
  history,
  onExportHistory,
  onRefresh,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter history based on search term
  const filteredHistory = history.filter(item => 
    item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="border-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Riwayat Impor
            </CardTitle>
            <CardDescription>
              Lacak semua aktivitas impor data pegawai sebelumnya
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memuat...
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Segarkan
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari riwayat impor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileSpreadsheet className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
            <h3 className="font-medium">Tidak Ada Riwayat Impor</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Impor data pegawai untuk melihat riwayat di sini
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama File</TableHead>
                  <TableHead>Diproses Oleh</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Detail</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                          {item.filename}
                        </div>
                      </TableCell>
                      <TableCell>{item.user_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-4 h-4" />
                          {new Date(item.created_at).toLocaleDateString('id-ID')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            item.status === 'completed' ? 'default' : 
                            item.status === 'processing' ? 'secondary' : 
                            'destructive'
                          }
                          className={`
                            ${item.status === 'completed' 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                              : item.status === 'processing' 
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500' 
                                : 'bg-gradient-to-r from-red-500 to-rose-500'}
                          `}
                        >
                          {item.status === 'completed' && (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Selesai
                            </>
                          )}
                          {item.status === 'processing' && (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Memproses
                            </>
                          )}
                          {item.status === 'failed' && (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Gagal
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30">
                            Total: {item.total_records}
                          </Badge>
                          <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30">
                            Berhasil: {item.success_count}
                          </Badge>
                          <Badge variant="secondary" className="bg-red-100 dark:bg-red-900/30">
                            Gagal: {item.failed_count}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onExportHistory(item.id)}
                          className="gap-1"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Tidak ditemukan riwayat impor yang cocok
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};