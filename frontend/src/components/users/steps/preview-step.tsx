'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Eye, X } from 'lucide-react';
import { ImportRow } from '@/types/bulk-import';

interface PreviewStepProps {
  rows: ImportRow[];
  onBack: () => void;
  onProceed: () => void;
}

export function PreviewStep({ rows, onBack, onProceed }: PreviewStepProps) {
  const [showAllErrors, setShowAllErrors] = useState(false);

  // Limit to first 10 rows for preview
  const previewRows = rows.slice(0, 10);
  const totalValid = rows.filter(r => r.isValid).length;
  const totalInvalid = rows.filter(r => !r.isValid).length;
  const hasErrors = totalInvalid > 0;

  // Detect format type (simplified vs legacy)
  const isSimplified = rows.length > 0 && 'full_name' in rows[0].data && !('employee_code' in rows[0].data);

  // Show error details for invalid rows
  const invalidRows = rows.filter(r => !r.isValid);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Pratinjau Data</h3>

        {isSimplified && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Format Simplified Import terdeteksi. Employee code dan password akan di-generate otomatis oleh sistem.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
            <div className="text-2xl font-bold">{rows.length}</div>
            <div className="text-sm text-muted-foreground">Total Baris</div>
          </div>
          <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
            <div className="text-2xl font-bold">{totalValid}</div>
            <div className="text-sm text-muted-foreground">Valid</div>
          </div>
          <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg">
            <div className="text-2xl font-bold">{totalInvalid}</div>
            <div className="text-sm text-muted-foreground">Tidak Valid</div>
          </div>
        </div>

        {hasErrors && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Ditemukan {totalInvalid} baris dengan kesalahan. Silakan perbaiki sebelum melanjutkan.
            </AlertDescription>
          </Alert>
        )}

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Row</TableHead>
                {isSimplified ? (
                  <>
                    <TableHead>Nama Lengkap</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tanggal Masuk</TableHead>
                    <TableHead>Role</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead>Kode Pegawai</TableHead>
                    <TableHead>Nama Depan</TableHead>
                    <TableHead>Nama Belakang</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                  </>
                )}
                <TableHead>Valid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewRows.map((row, index) => (
                <TableRow key={row.rowNumber} className={row.isValid ? '' : 'bg-red-50 dark:bg-red-950/20'}>
                  <TableCell className="font-medium">{row.rowNumber}</TableCell>
                  {isSimplified ? (
                    <>
                      <TableCell>{row.data.full_name || '-'}</TableCell>
                      <TableCell>{row.data.email || '-'}</TableCell>
                      <TableCell>{row.data.hire_date || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {row.data.role || '-'}
                        </Badge>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{row.data.employee_code || '-'}</TableCell>
                      <TableCell>{row.data.first_name || '-'}</TableCell>
                      <TableCell>{row.data.last_name || '-'}</TableCell>
                      <TableCell>{row.data.email || '-'}</TableCell>
                      <TableCell>{row.data.status || '-'}</TableCell>
                    </>
                  )}
                  <TableCell>
                    {row.isValid ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Valid
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Tidak Valid
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {previewRows.length < rows.length && (
          <p className="text-sm text-muted-foreground">
            Menampilkan {previewRows.length} dari {rows.length} baris
          </p>
        )}

        {hasErrors && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Detail Kesalahan</h4>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAllErrors(!showAllErrors)}
              >
                {showAllErrors ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Sembunyikan
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Tampilkan Semua ({totalInvalid})
                  </>
                )}
              </Button>
            </div>

            {showAllErrors && (
              <div className="space-y-2">
                {invalidRows.map((row) => (
                  <div key={row.rowNumber} className="p-3 bg-red-50 dark:bg-red-950/20 rounded-md">
                    <div className="font-medium">Baris {row.rowNumber}:</div>
                    <ul className="list-disc pl-5 text-sm">
                      {row.errors.map((error, idx) => (
                        <li key={idx} className="text-red-700 dark:text-red-300">{error}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Kembali
        </Button>
        <Button 
          onClick={onProceed} 
          disabled={hasErrors}
          className={hasErrors ? 'opacity-50 cursor-not-allowed' : ''}
        >
          {hasErrors ? 'Perbaiki Kesalahan' : 'Lanjutkan Import'}
        </Button>
      </div>
    </div>
  );
}