'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { toast } from 'sonner';
import { employeeService } from '@/lib/api/employees';
import { validateRow } from '@/lib/utils/validators';
import { ImportRow } from '@/types/bulk-import';

interface FileUploadStepProps {
  onFileSelected: (file: File, rows: ImportRow[]) => void;
}

export function FileUploadStep({ onFileSelected }: FileUploadStepProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      // Parse file based on extension
      const rows = file.name.endsWith('.csv')
        ? await parseCSV(file)
        : await parseExcel(file);

      // Validate each row
      const validatedRows = await validateRows(rows);

      onFileSelected(file, validatedRows);
    } catch (error) {
      toast.error('Failed to parse file. Please check the format.');
      console.error('File parsing error:', error);
    }
  }, [onFileSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
        transition-colors
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-border'}
      `}
    >
      <input {...getInputProps()} />
      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      {isDragActive ? (
        <p className="text-lg">Drop file here...</p>
      ) : (
        <>
          <p className="text-lg mb-2">Drag & drop Excel or CSV file here</p>
          <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
          <p className="text-xs text-muted-foreground">
            Supported formats: .xlsx, .csv (Max 10MB, 1000 rows)
          </p>
        </>
      )}
    </div>
  );
}

// Helper: Parse Excel
async function parseExcel(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        resolve(json);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// Helper: Parse CSV
async function parseCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: reject,
    });
  });
}

// Helper: Validate rows
async function validateRows(rows: any[]): Promise<ImportRow[]> {
  if (rows.length > 1000) {
    toast.error('Maximum 1000 rows allowed per import');
    throw new Error('Too many rows');
  }

  // Check if this is simplified format (4 columns)
  const isSimplified = rows.length > 0 && 'full_name' in rows[0] && !('employee_code' in rows[0]);

  // Batch check duplicate emails against database
  const emails = rows.map(r => r.email).filter(Boolean);
  let duplicateEmails: string[] = [];
  let duplicateCodes: string[] = [];

  try {
    // Check duplicate emails
    duplicateEmails = await employeeService.checkDuplicates(emails);

    // Only check employee codes for legacy format
    if (!isSimplified) {
      const employeeCodes = rows.map(r => r.employee_code).filter(Boolean);
      duplicateCodes = await employeeService.checkDuplicateCodes(employeeCodes);
    }
  } catch (error) {
    console.error('Failed to check duplicates:', error);
    // Continue with validation even if duplicate check fails
  }

  return rows.map((row, index) => {
    const errors: string[] = [];

    // Validate using rules
    const validationResult = validateRow(row);
    errors.push(...validationResult.errors);

    // Check duplicate email in database
    if (duplicateEmails.includes(row.email)) {
      errors.push('Email sudah terdaftar di database');
    }

    // Check duplicate employee code in database (only for legacy format)
    if (!isSimplified && duplicateCodes.includes(row.employee_code)) {
      errors.push('Employee code already exists in database');
    }

    // Check duplicate email in file
    const duplicateEmailInFile = rows.findIndex((r, i) =>
      i !== index && r.email?.toLowerCase() === row.email?.toLowerCase()
    ) !== -1;
    if (duplicateEmailInFile) {
      errors.push('Email duplikat dalam file');
    }

    // Check duplicate employee code in file (only for legacy format)
    if (!isSimplified) {
      const duplicateCodeInFile = rows.findIndex((r, i) =>
        i !== index && r.employee_code === row.employee_code
      ) !== -1;
      if (duplicateCodeInFile) {
        errors.push('Duplicate employee code in file');
      }
    }

    return {
      rowNumber: index + 2, // +2 because row 1 is header
      data: row,
      isValid: errors.length === 0,
      errors,
    };
  });
}