'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  Info,
  Loader2
} from 'lucide-react';
import { BulkImportProgress } from '@/types/bulk-import';

interface BulkImportPageProps {
  onImport: (file: File) => Promise<void>;
  onDownloadTemplate: () => void;
  progress: BulkImportProgress;
}

export const BulkImportPage: React.FC<BulkImportPageProps> = ({ 
  onImport, 
  onDownloadTemplate,
  progress 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
      } else {
        alert('Please upload a CSV file');
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
      } else {
        alert('Please upload a CSV file');
      }
    }
  };

  const onButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImport = async () => {
    if (file) {
      await onImport(file);
    }
  };

  const resetFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Import Data Pegawai
          </CardTitle>
          <CardDescription>
            Upload file CSV untuk menambahkan banyak data pegawai sekaligus
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Download Section */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-medium">Template CSV</h3>
              <p className="text-sm text-muted-foreground">
                Unduh template untuk memastikan format data benar
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={onDownloadTemplate}
              className="gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:opacity-90"
            >
              <Download className="w-4 h-4" />
              Unduh Template
            </Button>
          </div>

          <Separator />

          {/* Upload Area */}
          <div className="space-y-4">
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleChange}
                className="hidden"
              />
              
              {!file ? (
                <>
                  <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                  <p className="mb-2 font-medium">Drop file CSV di sini atau klik untuk memilih</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Format yang didukung: .csv (maks. 10MB)
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={onButtonClick}
                    className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg hover:opacity-90"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Pilih File
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col items-center">
                    <FileSpreadsheet className="h-12 w-12 text-green-500 mb-2" />
                    <p className="font-medium truncate max-w-xs">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  
                  <div className="flex gap-2 justify-center">
                    <Button 
                      onClick={handleImport}
                      disabled={progress.status === 'processing'}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90"
                    >
                      {progress.status === 'processing' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Mengimpor...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Proses Impor
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={resetFile}
                      className="border-red-200 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Ganti File
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {progress.status !== 'idle' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    {progress.status === 'uploading' && 'Mengunggah...'}
                    {progress.status === 'processing' && 'Memproses...'}
                    {progress.status === 'completed' && 'Selesai'}
                    {progress.status === 'failed' && 'Gagal'}
                  </span>
                  <span>{Math.round(progress.progress)}%</span>
                </div>
                <Progress value={progress.progress} className="h-2" />
                <p className="text-xs text-muted-foreground">{progress.message}</p>
              </div>
            )}

            {/* Import Status Alert */}
            {progress.status === 'completed' && (
              <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-200">Impor Berhasil!</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  Proses impor selesai. Silakan periksa riwayat impor untuk detail.
                </AlertDescription>
              </Alert>
            )}

            {progress.status === 'failed' && (
              <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertTitle className="text-red-800 dark:text-red-200">Impor Gagal!</AlertTitle>
                <AlertDescription className="text-red-700 dark:text-red-300">
                  {progress.message}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* CSV Format Requirements */}
          <div className="mt-6">
            <h3 className="font-medium flex items-center gap-2 mb-2">
              <Info className="w-4 h-4" />
              Format CSV yang Diperlukan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">Wajib</Badge>
                  <span>employee_code</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">Wajib</Badge>
                  <span>first_name</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">Wajib</Badge>
                  <span>last_name</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">Wajib</Badge>
                  <span>email</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">Opsional</Badge>
                  <span>phone</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">Opsional</Badge>
                  <span>position</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">Opsional</Badge>
                  <span>department</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">Opsional</Badge>
                  <span>hire_date</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Contoh: employee_code,first_name,last_name,email,phone,position,department,hire_date
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};