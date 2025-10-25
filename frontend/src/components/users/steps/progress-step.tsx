'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ImportRow, BulkImportResult } from '@/types/bulk-import';
import { bulkImportService } from '@/lib/api/bulk-import';
import { toast } from 'sonner';

interface ProgressStepProps {
  rows: ImportRow[];
  file: File;  // Adding file prop that should be passed from the upload step
  onComplete: (result: BulkImportResult) => void;
  onBack: () => void;
}

export function ProgressStep({ rows, file, onComplete, onBack }: ProgressStepProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Mempersiapkan data...');

  useEffect(() => {
    const importData = async () => {
      try {
        setStatus('Mengunggah data...');
        
        // Update progress during import
        setProgress(20);
        setStatus('Mengunggah file...');
        
        // Use the bulk import service to import the file
        const response = await bulkImportService.importEmployees(file);

        setProgress(100);
        setStatus('Selesai! Data berhasil diimpor.');

        // Convert BulkImportResponse to BulkImportResult
        const result: BulkImportResult = {
          success: response.success,
          failed: response.failed,
          errors: response.results
            .filter(r => r.status === 'error')
            .map(r => ({ row: r.row_number, message: r.message }))
        };

        onComplete(result);
      } catch (error: any) {
        console.error('Import error:', error);
        console.error('Error response:', error.response);

        // Extract error message from response
        const errorMessage = error.response?.data?.message ||
                            error.message ||
                            'Terjadi kesalahan saat mengimpor data';

        const errorDetails = error.response?.data?.data?.errors?.[0]?.message || '';

        toast.error(errorMessage, {
          description: errorDetails,
          duration: 10000
        });

        setStatus(`Error: ${errorMessage}`);
        setProgress(0);

        // Return an error result
        onComplete({
          success: 0,
          failed: rows.length,
          errors: error.response?.data?.data?.errors?.map((err: any) => ({
            row: err.row || 0,
            message: err.message || 'Gagal mengimpor baris ini'
          })) || rows.map(row => ({ row: row.rowNumber, message: 'Gagal mengimpor baris ini' }))
        });
      }
    };

    importData();
  }, [file, rows, onComplete]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Proses Import</CardTitle>
          <CardDescription>
            Sedang mengimpor {rows.length} baris data pegawai
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>{status}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
            
            <div className="text-center text-sm text-muted-foreground">
              <span>Memproses file: {file.name}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="outline" onClick={onBack} disabled={progress > 0 && progress < 100}>
            Kembali
          </Button>
          <Button disabled={progress < 100}>
            Selesai
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}