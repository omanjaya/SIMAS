'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, Download } from 'lucide-react';
import { BulkImportWizard } from './bulk-import-wizard';
import { bulkImportService } from '@/lib/api/bulk-import';

interface BulkImportDialogProps {
  onImportComplete: () => void;
}

export function BulkImportDialog({ onImportComplete }: BulkImportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDownloadTemplate = async () => {
    // Download simplified template from API (4 columns only)
    try {
      const blob = await bulkImportService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'simplified_employees_template.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download template from API:', error);
      // Fallback: create simplified CSV template (4 columns only)
      const csvContent = [
        'full_name,email,hire_date,role',
        'I Wayan Sudiarta,wayan.sudiarta@sekolah.com,2024-01-15,teacher',
        'Ni Made Sari,made.sari@sekolah.com,2024-02-01,employee',
        'Komang Agus,agus.komang@sekolah.com,2024-03-01,admin'
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'simplified_employees_template.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Import Excel/CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Pegawai</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Upload file CSV dengan 4 kolom: Nama Lengkap, Email, Tanggal Masuk, Role.
            Employee code dan password akan di-generate otomatis.
          </p>
        </DialogHeader>

        <div className="mb-4">
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </div>

        <BulkImportWizard
          onComplete={() => {
            setIsOpen(false);
            onImportComplete();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}