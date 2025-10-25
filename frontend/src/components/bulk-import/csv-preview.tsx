'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  FileSpreadsheet, 
  AlertCircle,
  CheckCircle,
  XCircle,
  RotateCcw
} from 'lucide-react';

interface CSVPreviewProps {
  file: File | null;
  onValidate: (valid: boolean, message?: string) => void;
  onPreviewClose: () => void;
}

export const CSVPreview: React.FC<CSVPreviewProps> = ({
  file,
  onValidate,
  onPreviewClose
}) => {
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Required headers for employee import
  const requiredHeaders = [
    'employee_code',
    'first_name', 
    'last_name', 
    'email'
  ];

  // Read and parse CSV file
  useEffect(() => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        setLoading(true);
        setError(null);
        
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length === 0) {
          throw new Error('File CSV kosong');
        }

        // Get headers (first line)
        const headerLine = lines[0];
        const headerFields = parseCSVLine(headerLine);
        setHeaders(headerFields);

        // Get preview data (next 5 lines)
        const previewLines = lines.slice(1, 6); // Skip header, get next 5
        const parsedPreview = previewLines.map(line => parseCSVLine(line));
        setPreviewData(parsedPreview);
        
        // Validate headers
        validateHeaders(headerFields);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error memproses file CSV';
        setError(errorMessage);
        onValidate(false, errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Error membaca file');
      onValidate(false, 'Error membaca file');
      setLoading(false);
    };
    
    reader.readAsText(file);
  }, [file, onValidate]);

  // Parse a single CSV line considering quoted values
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          // Double quotes inside quoted field
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    return result;
  };

  // Validate headers against required fields
  const validateHeaders = (headerFields: string[]) => {
    const missingHeaders = requiredHeaders.filter(
      header => !headerFields.some(h => h.toLowerCase().trim() === header.toLowerCase())
    );
    
    if (missingHeaders.length > 0) {
      const errorMsg = `Header wajib tidak ditemukan: ${missingHeaders.join(', ')}`;
      setError(errorMsg);
      onValidate(false, errorMsg);
    } else {
      onValidate(true);
    }
  };

  return (
    <Card className="border-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Pratinjau CSV
            </CardTitle>
            <CardDescription>
              {file ? `Pratinjau dari ${file.name}` : 'Pilih file CSV untuk melihat pratinjau'}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onPreviewClose}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Ganti File
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              <p>Membaca file CSV...</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-800 dark:text-red-200">Error CSV</h3>
                <p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && headers.length > 0 && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Struktur Kolom
              </h4>
              
              <div className="flex flex-wrap gap-2">
                {headers.map((header, index) => {
                  const isRequired = requiredHeaders.some(req => 
                    req.toLowerCase() === header.toLowerCase()
                  );
                  
                  return (
                    <Badge 
                      key={index}
                      variant={isRequired ? 'default' : 'secondary'}
                      className={isRequired 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                      }
                    >
                      {header}
                      {isRequired && <CheckCircle className="w-3 h-3 ml-1" />}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Pratinjau Data (Baris 1-5)</h4>
              
              <ScrollArea className="h-80 rounded-md border">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow className="bg-gray-100 dark:bg-gray-800">
                      {headers.map((header, index) => (
                        <TableHead key={index} className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.length > 0 ? (
                      previewData.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <TableCell key={cellIndex} className="whitespace-nowrap max-w-xs truncate">
                              {cell}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={headers.length} className="text-center py-8 text-muted-foreground">
                          Tidak ada data untuk ditampilkan
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </div>
        )}

        {!loading && !error && headers.length === 0 && file && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mb-3" />
            <h3 className="font-medium">File Kosong atau Tidak Valid</h3>
            <p className="text-sm text-muted-foreground mt-1">
              File tidak berisi data CSV yang valid
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};