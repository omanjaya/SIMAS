'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X, 
  RotateCcw,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client';

interface ImportResult {
  import_id: number;
  status: string;
  filename: string;
  created_at: string;
  total_records?: number;
  successful_records?: number;
  failed_records?: number;
  errors?: any[];
}

interface PreviewData {
  header: string[];
  preview_data: any[];
  total_rows: number;
}

export const BulkUserImportForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.csv') && !selectedFile.name.toLowerCase().endsWith('.txt')) {
      toast.error('Hanya file CSV atau TXT yang diperbolehkan');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
      toast.error('Ukuran file tidak boleh melebihi 10MB');
      return;
    }

    setFile(selectedFile);
    setPreviewData(null);
    setImportResult(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePreview = async () => {
    if (!file) return;

    setIsPreviewing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/user-imports/preview', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setPreviewData(response.data);
      toast.success('Pratinjau data berhasil dimuat');
    } catch (error: any) {
      console.error('Preview error:', error);
      toast.error(error.response?.data?.message || 'Gagal memuat pratinjau data');
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('csv_file', file);

      const response = await apiClient.post('/user-imports/bulk-import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total 
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total) 
            : 0;
          setUploadProgress(progress);
        },
      });

      setImportResult(response.data);
      setUploadProgress(100);
      toast.success('File berhasil diunggah, proses impor sedang berjalan');
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.response?.data?.message || 'Gagal mengimpor data');
    } finally {
      setIsImporting(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreviewData(null);
    setImportResult(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'border-gray-300 dark:border-gray-600'
        }`}
        onClick={onButtonClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".csv,.txt"
          onChange={handleChange}
        />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-blue-600">Klik untuk mengunggah</span> atau seret file ke sini
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Format: CSV atau TXT, maksimal 10MB
        </p>
      </div>

      {file && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium truncate max-w-xs">{file.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                resetForm();
              }}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 flex space-x-2">
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={isPreviewing || isImporting}
              className="flex items-center"
            >
              <Eye className="h-4 w-4 mr-2" />
              {isPreviewing ? 'Memuat...' : 'Pratinjau'}
            </Button>
            <Button
              onClick={handleImport}
              disabled={isImporting || isPreviewing}
              className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? 'Mengimpor...' : 'Impor Sekarang'}
            </Button>
          </div>

          {(isImporting || uploadProgress > 0) && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Proses unggah</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
        </Card>
      )}

      {/* Preview Section */}
      {previewData && (
        <Card>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Pratinjau Data</h3>
              <Badge variant="secondary">{previewData.total_rows} baris</Badge>
            </div>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {previewData.header.map((header, index) => (
                      <th 
                        key={index} 
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {previewData.preview_data.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      {previewData.header.map((header, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-2 text-sm max-w-xs truncate">
                          {row[header] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Result */}
      {importResult && (
        <Card>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Hasil Impor</h3>
              {importResult.status === 'completed' ? (
                <Badge variant="default" className="bg-green-500">Selesai</Badge>
              ) : importResult.status === 'processing' ? (
                <Badge variant="default" className="bg-yellow-500">Diproses</Badge>
              ) : (
                <Badge variant="destructive">Gagal</Badge>
              )}
            </div>
          </div>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Nama File:</span>
                <span className="font-medium">{importResult.filename}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-medium capitalize">{importResult.status}</span>
              </div>
              
              {importResult.successful_records !== undefined && (
                <div className="flex justify-between">
                  <span>Berhasil:</span>
                  <span className="text-green-600 font-medium">{importResult.successful_records}</span>
                </div>
              )}
              
              {importResult.failed_records !== undefined && (
                <div className="flex justify-between">
                  <span>Gagal:</span>
                  <span className="text-red-600 font-medium">{importResult.failed_records}</span>
                </div>
              )}
              
              {importResult.total_records !== undefined && (
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-medium">{importResult.total_records}</span>
                </div>
              )}

              {importResult.errors && importResult.errors.length > 0 && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {importResult.errors.length} kesalahan ditemukan. Silakan periksa file dan coba lagi.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            <div className="flex space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/users/import-history/${importResult.import_id}`)}
                className="flex items-center"
              >
                <Eye className="h-4 w-4 mr-2" />
                Lihat Detail
              </Button>
              <Button
                variant="outline"
                onClick={resetForm}
                className="flex items-center"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Ulangi
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};