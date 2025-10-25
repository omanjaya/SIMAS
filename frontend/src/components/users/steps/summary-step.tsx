'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Download } from 'lucide-react';
import { BulkImportResult } from '@/types/bulk-import';
import { toast } from 'sonner';

interface SummaryStepProps {
  result: BulkImportResult;
  onClose: () => void;
}

export function SummaryStep({ result, onClose }: SummaryStepProps) {
  const { success, failed, errors } = result;
  const total = success + failed;

  const handleDownloadErrorLog = () => {
    // Create CSV content for errors
    const csvContent = [
      ['Row Number', 'Error Message'],
      ...errors.map(error => [error.row, error.message])
    ]
    .map(row => row.join(','))
    .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import_errors_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Log error berhasil diunduh');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle>Import Selesai!</CardTitle>
          <CardDescription>Ringkasan hasil import data pegawai</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{success}</div>
              <div className="text-sm text-muted-foreground">Berhasil</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{failed}</div>
              <div className="text-sm text-muted-foreground">Gagal</div>
            </div>
          </div>

          {failed > 0 && (
            <>
              <h4 className="font-medium mb-2">Baris Gagal:</h4>
              <div className="border rounded-md max-h-60 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Baris</TableHead>
                      <TableHead>Kesalahan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {errors.map((error, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{error.row}</TableCell>
                        <TableCell>{error.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={handleDownloadErrorLog}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Unduh Log Kesalahan
                </Button>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={onClose} className="w-full">
            Tutup & Perbarui Data
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}