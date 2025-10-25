'use client';

import React, { useState, useEffect } from 'react';
import { Header } from "@/components/layout/header";
import { BulkImportPage } from '@/components/bulk-import/bulk-import-page';
import { BulkImportResultsModal } from '@/components/bulk-import/bulk-import-results-modal';
import { ImportHistoryDashboard } from '@/components/bulk-import/import-history-dashboard';
import { CSVPreview } from '@/components/bulk-import/csv-preview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BulkImportResponse, BulkImportHistory, BulkImportProgress } from '@/types/bulk-import';
import { bulkImportService } from '@/lib/api/bulk-import';

export default function BulkImportPage() {
  // State management
  const [activeTab, setActiveTab] = useState<'import' | 'history'>('import');
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [importResults, setImportResults] = useState<BulkImportResponse | null>(null);
  const [importProgress, setImportProgress] = useState<BulkImportProgress>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  const [showPreview, setShowPreview] = useState(false);
  const [csvValid, setCsvValid] = useState(false);
  const [csvErrorMessage, setCsvErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<BulkImportHistory[]>([]);

  // Load history on component mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setImportProgress({
        status: 'processing',
        progress: 0,
        message: 'Memuat riwayat...'
      });
      
      const historyData = await bulkImportService.getImportHistory();
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading import history:', error);
    } finally {
      setImportProgress({
        status: 'idle',
        progress: 0,
        message: ''
      });
    }
  };

  // Handle file import
  const handleImport = async (file: File) => {
    // Show preview first if not already shown
    if (!showPreview) {
      setCurrentFile(file);
      setShowPreview(true);
      return;
    }

    try {
      // Start import process
      setImportProgress({
        status: 'uploading',
        progress: 10,
        message: 'Menggunggah file...'
      });

      // Perform the import
      const results = await bulkImportService.importEmployees(file);
      setImportResults(results);

      // Update progress during import
      for (let i = 10; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setImportProgress(prev => ({
          ...prev,
          progress: i,
          message: i < 50 ? 'Menggunggah file...' : 
                   i < 80 ? 'Memproses data...' : 
                   'Menyimpan hasil...'
        }));
      }

      // Complete the process
      setImportProgress({
        status: 'completed',
        progress: 100,
        message: 'Impor selesai'
      });

      // Load updated history
      await loadHistory();

      // Show results modal after a short delay
      setTimeout(() => {
        setShowResultsModal(true);
      }, 1000);
    } catch (error) {
      console.error('Import failed:', error);
      setImportProgress({
        status: 'failed',
        progress: 100,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengimpor'
      });
    }
  };

  // Handle CSV validation
  const handleCSVValidation = (valid: boolean, message?: string) => {
    setCsvValid(valid);
    setCsvErrorMessage(message || null);
  };

  // Handle CSV preview close (to go back to import page)
  const handlePreviewClose = () => {
    setShowPreview(false);
    setCurrentFile(null);
  };

  // Handle CSV preview approve (to proceed with import)
  const handlePreviewApprove = () => {
    if (currentFile && csvValid) {
      setShowPreview(false);
      handleImport(currentFile);
    }
  };

  // Handle download template
  const handleDownloadTemplate = () => {
    // Create CSV content
    const csvContent = [
      ['employee_code', 'first_name', 'last_name', 'email', 'phone', 'position', 'department', 'hire_date'],
      ['EMP001', 'John', 'Doe', 'john.doe@sekolah.com', '081234567890', 'Guru Matematika', 'Pendidikan', '2025-01-01'],
      ['EMP002', 'Jane', 'Smith', 'jane.smith@sekolah.com', '081234567891', 'Guru Bahasa', 'Pendidikan', '2025-01-01'],
      ['EMP003', 'Bob', 'Johnson', 'bob.johnson@sekolah.com', '081234567892', 'Staff Admin', 'Admin', '2025-01-01']
    ]
    .map(row => row.join(','))
    .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_import_pegawai.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Handle export results
  const handleExportResults = async () => {
    if (!importResults) return;
    
    try {
      const csvBlob = await bulkImportService.exportResultsToCSV(importResults);
      const url = window.URL.createObjectURL(csvBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hasil_impor_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting results:', error);
      alert('Gagal mengekspor hasil impor');
    }
  };

  // Handle copy results to clipboard
  const handleCopyResults = async () => {
    if (!importResults) return;
    
    try {
      const csvContent = [
        ['employee_code', 'first_name', 'last_name', 'email', 'status', 'message', 'row_number'],
        ...importResults.results.map(result => [
          result.employee_code,
          result.first_name,
          result.last_name,
          result.email,
          result.status,
          result.message,
          result.row_number
        ])
      ]
      .map(row => row.join(','))
      .join('\n');
      
      await navigator.clipboard.writeText(csvContent);
      alert('Hasil impor berhasil disalin ke clipboard');
    } catch (error) {
      console.error('Error copying results:', error);
      alert('Gagal menyalin hasil impor ke clipboard');
    }
  };

  // Handle export history
  const handleExportHistory = async (id: number) => {
    try {
      const historyItem = history.find(item => item.id === id);
      if (!historyItem) {
        alert('Riwayat tidak ditemukan');
        return;
      }
      
      const csvBlob = await bulkImportService.exportHistoryToCSV([historyItem]);
      const url = window.URL.createObjectURL(csvBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `riwayat_impor_${id}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting history:', error);
      alert('Gagal mengekspor riwayat impor');
    }
  };

  // Handle refresh history
  const handleRefreshHistory = async () => {
    await loadHistory();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Import Massal Pegawai</h1>
          <p className="text-muted-foreground mt-2">
            Impor data pegawai dalam jumlah besar menggunakan file CSV
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Impor Data</TabsTrigger>
            <TabsTrigger value="history">Riwayat Impor</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="mt-6">
            {showPreview && currentFile ? (
              <div className="space-y-6">
                <CSVPreview 
                  file={currentFile} 
                  onValidate={handleCSVValidation}
                  onPreviewClose={handlePreviewClose}
                />
                
                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    onClick={handlePreviewClose}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Kembali
                  </button>
                  <button 
                    onClick={handlePreviewApprove}
                    disabled={!csvValid}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      csvValid 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:opacity-90' 
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Lanjutkan Impor
                  </button>
                </div>
              </div>
            ) : (
              <BulkImportPage 
                onImport={handleImport}
                onDownloadTemplate={handleDownloadTemplate}
                progress={importProgress}
              />
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <ImportHistoryDashboard 
              history={history}
              onExportHistory={handleExportHistory}
              onRefresh={handleRefreshHistory}
              loading={importProgress.status === 'processing'}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Results Modal */}
      <BulkImportResultsModal 
        open={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        results={importResults || { total: 0, success: 0, failed: 0, results: [] }}
        onExportResults={handleExportResults}
        onCopyResults={handleCopyResults}
      />
    </div>
  );
}