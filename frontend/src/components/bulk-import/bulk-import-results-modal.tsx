'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  Eye,
  Copy
} from 'lucide-react';
import { BulkImportResponse, BulkImportResult } from '@/types/bulk-import';

interface BulkImportResultsModalProps {
  open: boolean;
  onClose: () => void;
  results: BulkImportResponse;
  onExportResults: () => void;
  onCopyResults: () => void;
}

export const BulkImportResultsModal: React.FC<BulkImportResultsModalProps> = ({
  open,
  onClose,
  results,
  onExportResults,
  onCopyResults
}) => {
  const successResults = results.results.filter(r => r.status === 'success');
  const failedResults = results.results.filter(r => r.status === 'error');

  const [activeTab, setActiveTab] = useState<'all' | 'success' | 'failed'>('all');

  const renderResultRows = (resultList: BulkImportResult[]) => {
    return (
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {resultList.map((result) => (
          <div key={`${result.row_number}-${result.employee_code}`} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                {result.status === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                )}
                <div>
                  <div className="font-medium">
                    {result.first_name} {result.last_name} ({result.employee_code})
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Baris {result.row_number}: {result.email}
                  </div>
                </div>
              </div>
              <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                {result.status === 'success' ? 'Berhasil' : 'Gagal'}
              </Badge>
            </div>
            {result.status === 'error' && (
              <div className="mt-2 ml-8 text-sm text-red-600 dark:text-red-400">
                {result.message}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] gap-0 p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Hasil Impor Data Pegawai
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-0">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 rounded-xl border">
              <div className="text-sm text-muted-foreground">Total Baris</div>
              <div className="text-2xl font-bold mt-1">{results.total}</div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 p-4 rounded-xl border border-green-200 dark:border-green-800">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Berhasil
              </div>
              <div className="text-2xl font-bold mt-1 text-green-700 dark:text-green-300">{results.success}</div>
            </div>
            <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10 p-4 rounded-xl border border-red-200 dark:border-red-800">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <XCircle className="w-4 h-4 text-red-500" />
                Gagal
              </div>
              <div className="text-2xl font-bold mt-1 text-red-700 dark:text-red-300">{results.failed}</div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Semua ({results.results.length})</TabsTrigger>
              <TabsTrigger value="success">Berhasil ({successResults.length})</TabsTrigger>
              <TabsTrigger value="failed">Gagal ({failedResults.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <ScrollArea className="h-96 rounded-md border">
                {results.results.length > 0 ? (
                  renderResultRows(results.results)
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center p-4 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mb-3" />
                    <h3 className="font-medium">Tidak Ada Data</h3>
                    <p className="text-sm mt-1">Tidak ada hasil impor untuk ditampilkan</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="success" className="mt-4">
              <ScrollArea className="h-96 rounded-md border">
                {successResults.length > 0 ? (
                  renderResultRows(successResults)
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center p-4 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mb-3 text-green-500" />
                    <h3 className="font-medium">Impor Berhasil</h3>
                    <p className="text-sm mt-1">Semua data berhasil diimpor</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="failed" className="mt-4">
              <ScrollArea className="h-96 rounded-md border">
                {failedResults.length > 0 ? (
                  renderResultRows(failedResults)
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center p-4 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mb-3 text-green-500" />
                    <h3 className="font-medium">Tidak Ada Kegagalan</h3>
                    <p className="text-sm mt-1">Semua data berhasil diimpor</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <Separator className="my-4" />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={onCopyResults} 
              variant="outline" 
              className="flex-1 gap-2"
            >
              <Copy className="w-4 h-4" />
              Salin Hasil
            </Button>
            <Button 
              onClick={onExportResults} 
              variant="outline" 
              className="flex-1 gap-2"
            >
              <Download className="w-4 h-4" />
              Ekspor ke CSV
            </Button>
            <Button 
              onClick={onClose} 
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-90 flex-1"
            >
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};