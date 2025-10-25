# Bulk Import/Export Specification
## Feature: Bulk Import & Export Employees

**Version:** 1.0
**Priority:** CRITICAL
**Estimated Effort:** 8-12 hours

---

## Table of Contents
1. [Overview](#overview)
2. [User Flow](#user-flow)
3. [Template Format](#template-format)
4. [Validation Rules](#validation-rules)
5. [Component Structure](#component-structure)
6. [API Endpoints](#api-endpoints)
7. [Implementation Code](#implementation-code)
8. [Error Handling](#error-handling)
9. [Testing Checklist](#testing-checklist)

---

## Overview

Fitur ini memungkinkan admin untuk:
- Import ratusan pegawai sekaligus dari Excel/CSV
- Download template yang sudah sesuai format
- Validasi data sebelum import
- Melihat progress real-time
- Mendapatkan summary hasil import
- Export data pegawai yang sudah ada

---

## User Flow

```
[Users Page]
    ↓
[Click "Import Excel/CSV" button]
    ↓
[Upload Modal Opens]
    ├→ Option 1: Click "Download Template" → Get example.xlsx
    └→ Option 2: Upload file (drag & drop or browse)
         ↓
    [File uploaded → Parse file]
         ↓
    [Show Preview Table (first 10 rows)]
         ├→ ✅ Valid rows (green highlight)
         └→ ❌ Invalid rows (red highlight with error message)
         ↓
    [Summary: X valid, Y invalid]
         ├→ If errors > 0: Show warning
         └→ Option: "Import valid records only" or "Fix and re-upload"
         ↓
    [Click "Start Import"]
         ↓
    [Progress Modal]
         ├→ Progress bar: 0% → 100%
         ├→ Status: "Processing row 45/100..."
         └→ Cancel button (optional)
         ↓
    [Import Complete]
         ↓
    [Summary Modal]
         ├→ ✅ 95 records imported
         ├→ ❌ 5 records failed
         ├→ List of failed rows with reasons
         ├→ [Download Error Log] button
         └→ [Close] button
         ↓
    [Table Refreshes → Show new data]
```

---

## Template Format

### Excel Template (employees_template.xlsx)

**Sheet Name:** "Employees"

**Columns:**

| Column Name    | Required | Data Type | Max Length | Example               | Notes                          |
|----------------|----------|-----------|------------|------------------------|--------------------------------|
| first_name     | ✅ Yes   | String    | 100        | "John"                 | No numbers allowed             |
| last_name      | ✅ Yes   | String    | 100        | "Doe"                  | No numbers allowed             |
| email          | ✅ Yes   | Email     | 255        | "john.doe@school.com"  | Must be unique                 |
| phone          | ❌ No    | String    | 20         | "+6281234567890"       | Format: +62xxx or 08xxx        |
| position       | ❌ No    | String    | 100        | "Guru Matematika"      | Free text                      |
| department     | ❌ No    | String    | 100        | "Science"              | Free text                      |
| status         | ❌ No    | Enum      | -          | "active"               | active/on_leave/suspended      |
| role           | ❌ No    | Enum      | -          | "teacher"              | admin/teacher/employee         |
| hire_date      | ❌ No    | Date      | -          | "2025-01-15"           | Format: YYYY-MM-DD             |
| salary         | ❌ No    | Number    | -          | "5000000"              | Numbers only                   |
| address        | ❌ No    | Text      | 500        | "Jl. Raya No. 123"     | Free text                      |

**Default Values (if not provided):**
- status: "active"
- role: "employee"
- hire_date: Current date

**Example Rows:**
```
first_name  | last_name | email              | phone          | position       | status | role    | hire_date
------------|-----------|--------------------|-----------------|-----------------------------------------
John        | Doe       | john@school.com    | +6281234567890 | Guru Matematika| active | teacher | 2025-01-15
Jane        | Smith     | jane@school.com    | 08123456789    | Staff TU       | active | employee| 2025-02-01
Bob         | Johnson   | bob@school.com     |                | Kepala Sekolah | active | admin   | 2024-12-01
```

---

## Validation Rules

### Frontend Validation (Immediate feedback)

```typescript
interface ValidationRule {
  field: string;
  rules: Array<{
    type: 'required' | 'email' | 'unique' | 'enum' | 'min' | 'max' | 'regex';
    value?: any;
    message: string;
  }>;
}

const VALIDATION_RULES: ValidationRule[] = [
  {
    field: 'first_name',
    rules: [
      { type: 'required', message: 'First name is required' },
      { type: 'min', value: 2, message: 'First name must be at least 2 characters' },
      { type: 'max', value: 100, message: 'First name cannot exceed 100 characters' },
      { type: 'regex', value: /^[a-zA-Z\s]+$/, message: 'First name can only contain letters' }
    ]
  },
  {
    field: 'last_name',
    rules: [
      { type: 'required', message: 'Last name is required' },
      { type: 'min', value: 2, message: 'Last name must be at least 2 characters' },
      { type: 'max', value: 100, message: 'Last name cannot exceed 100 characters' }
    ]
  },
  {
    field: 'email',
    rules: [
      { type: 'required', message: 'Email is required' },
      { type: 'email', message: 'Invalid email format' },
      { type: 'unique', message: 'Email already exists in database' }, // Check against API
      { type: 'max', value: 255, message: 'Email cannot exceed 255 characters' }
    ]
  },
  {
    field: 'phone',
    rules: [
      { type: 'regex', value: /^(\+62|08)\d{8,12}$/, message: 'Phone must start with +62 or 08 and have 8-12 digits' }
    ]
  },
  {
    field: 'status',
    rules: [
      { type: 'enum', value: ['active', 'on_leave', 'suspended'], message: 'Status must be: active, on_leave, or suspended' }
    ]
  },
  {
    field: 'role',
    rules: [
      { type: 'enum', value: ['admin', 'teacher', 'employee'], message: 'Role must be: admin, teacher, or employee' }
    ]
  },
  {
    field: 'hire_date',
    rules: [
      { type: 'regex', value: /^\d{4}-\d{2}-\d{2}$/, message: 'Date must be in format YYYY-MM-DD' }
    ]
  }
];
```

### Backend Validation (Laravel)

```php
// app/Http/Requests/BulkImportRequest.php

public function rules(): array
{
    return [
        'file' => 'required|file|mimes:xlsx,csv|max:10240', // 10MB max
        'rows' => 'required|array|max:1000', // Max 1000 rows per import
        'rows.*.first_name' => 'required|string|max:100',
        'rows.*.last_name' => 'required|string|max:100',
        'rows.*.email' => 'required|email|unique:employees,email|max:255',
        'rows.*.phone' => 'nullable|string|regex:/^(\+62|08)\d{8,12}$/|max:20',
        'rows.*.position' => 'nullable|string|max:100',
        'rows.*.department' => 'nullable|string|max:100',
        'rows.*.status' => 'nullable|in:active,on_leave,suspended',
        'rows.*.role' => 'nullable|in:admin,teacher,employee',
        'rows.*.hire_date' => 'nullable|date_format:Y-m-d',
        'rows.*.salary' => 'nullable|numeric|min:0',
        'rows.*.address' => 'nullable|string|max:500',
    ];
}
```

### Duplicate Email Check

**Frontend:**
```typescript
// Check against existing emails in file
const checkDuplicateInFile = (email: string, currentIndex: number, allRows: any[]) => {
  return allRows.findIndex((row, idx) =>
    idx !== currentIndex && row.email.toLowerCase() === email.toLowerCase()
  ) !== -1;
};

// Check against database (batch API call)
const checkDuplicateInDatabase = async (emails: string[]) => {
  const response = await apiClient.post('/api/employees/check-duplicates', { emails });
  return response.data.duplicates; // Returns array of duplicate emails
};
```

**Backend:**
```php
// app/Http/Controllers/Api/EmployeeController.php

public function checkDuplicates(Request $request)
{
    $emails = $request->input('emails', []);

    $duplicates = Employee::whereIn('email', $emails)
        ->pluck('email')
        ->toArray();

    return response()->json([
        'duplicates' => $duplicates
    ]);
}
```

---

## Component Structure

### File: `components/users/bulk-import-dialog.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, Download } from 'lucide-react';
import { BulkImportWizard } from './bulk-import-wizard';

interface BulkImportDialogProps {
  onImportComplete: () => void;
}

export function BulkImportDialog({ onImportComplete }: BulkImportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDownloadTemplate = async () => {
    // Download template from API
    const response = await fetch('/api/employees/import-template');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees_template.xlsx';
    a.click();
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
            Upload file Excel atau CSV untuk import data pegawai dalam jumlah banyak
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
```

### File: `components/users/bulk-import-wizard.tsx`

```typescript
'use client';

import { useState } from 'react';
import { FileUploadStep } from './steps/file-upload-step';
import { PreviewStep } from './steps/preview-step';
import { ProgressStep } from './steps/progress-step';
import { SummaryStep } from './steps/summary-step';

type Step = 'upload' | 'preview' | 'progress' | 'summary';

interface ImportRow {
  rowNumber: number;
  data: Record<string, any>;
  isValid: boolean;
  errors: string[];
}

interface BulkImportWizardProps {
  onComplete: () => void;
}

export function BulkImportWizard({ onComplete }: BulkImportWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    errors: Array<{ row: number; message: string }>;
  } | null>(null);

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        <StepIndicator step={1} active={currentStep === 'upload'} label="Upload" />
        <div className="h-px flex-1 bg-border" />
        <StepIndicator step={2} active={currentStep === 'preview'} label="Preview" />
        <div className="h-px flex-1 bg-border" />
        <StepIndicator step={3} active={currentStep === 'progress'} label="Import" />
        <div className="h-px flex-1 bg-border" />
        <StepIndicator step={4} active={currentStep === 'summary'} label="Summary" />
      </div>

      {/* Step Content */}
      {currentStep === 'upload' && (
        <FileUploadStep
          onFileSelected={(file, parsedRows) => {
            setFile(file);
            setRows(parsedRows);
            setCurrentStep('preview');
          }}
        />
      )}

      {currentStep === 'preview' && (
        <PreviewStep
          rows={rows}
          onBack={() => setCurrentStep('upload')}
          onProceed={() => setCurrentStep('progress')}
        />
      )}

      {currentStep === 'progress' && (
        <ProgressStep
          rows={rows.filter(r => r.isValid)}
          onComplete={(result) => {
            setImportResult(result);
            setCurrentStep('summary');
          }}
        />
      )}

      {currentStep === 'summary' && importResult && (
        <SummaryStep
          result={importResult}
          onClose={onComplete}
        />
      )}
    </div>
  );
}

function StepIndicator({ step, active, label }: { step: number; active: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
        ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
      `}>
        {step}
      </div>
      <span className="text-xs mt-1">{label}</span>
    </div>
  );
}
```

### File: `components/users/steps/file-upload-step.tsx`

```typescript
'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { toast } from '@/hooks/use-toast';
import { validateRow } from '@/lib/utils/validators';

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
      toast({
        title: 'Error',
        description: 'Failed to parse file. Please check the format.',
        variant: 'destructive',
      });
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
  // Batch check duplicate emails against database
  const emails = rows.map(r => r.email).filter(Boolean);
  const duplicateResponse = await fetch('/api/employees/check-duplicates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emails }),
  });
  const { duplicates } = await duplicateResponse.json();

  return rows.map((row, index) => {
    const errors: string[] = [];

    // Validate using rules
    const validationResult = validateRow(row);
    errors.push(...validationResult.errors);

    // Check duplicate in database
    if (duplicates.includes(row.email)) {
      errors.push('Email already exists in database');
    }

    // Check duplicate in file
    const duplicateInFile = rows.findIndex((r, i) =>
      i !== index && r.email?.toLowerCase() === row.email?.toLowerCase()
    ) !== -1;
    if (duplicateInFile) {
      errors.push('Duplicate email in file');
    }

    return {
      rowNumber: index + 2, // +2 because row 1 is header
      data: row,
      isValid: errors.length === 0,
      errors,
    };
  });
}
```

### File: `lib/utils/validators.ts`

```typescript
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateRow(row: any): ValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!row.first_name?.trim()) errors.push('First name is required');
  if (!row.last_name?.trim()) errors.push('Last name is required');
  if (!row.email?.trim()) errors.push('Email is required');

  // Email format
  if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
    errors.push('Invalid email format');
  }

  // Phone format (optional)
  if (row.phone && !/^(\+62|08)\d{8,12}$/.test(row.phone)) {
    errors.push('Phone must start with +62 or 08 and have 8-12 digits');
  }

  // Status enum
  if (row.status && !['active', 'on_leave', 'suspended'].includes(row.status)) {
    errors.push('Status must be: active, on_leave, or suspended');
  }

  // Role enum
  if (row.role && !['admin', 'teacher', 'employee'].includes(row.role)) {
    errors.push('Role must be: admin, teacher, or employee');
  }

  // Date format
  if (row.hire_date && !/^\d{4}-\d{2}-\d{2}$/.test(row.hire_date)) {
    errors.push('Hire date must be in format YYYY-MM-DD');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

---

## API Endpoints

### 1. Download Template
```
GET /api/employees/import-template
```

**Response:**
- File download: `employees_template.xlsx`

**Laravel Implementation:**
```php
// app/Http/Controllers/Api/EmployeeController.php

public function downloadImportTemplate()
{
    return (new EmployeeTemplateExport)->download('employees_template.xlsx');
}

// app/Exports/EmployeeTemplateExport.php
class EmployeeTemplateExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        // Return example data
        return collect([
            [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'email' => 'john.doe@school.com',
                'phone' => '+6281234567890',
                'position' => 'Guru Matematika',
                'department' => 'Science',
                'status' => 'active',
                'role' => 'teacher',
                'hire_date' => '2025-01-15',
            ]
        ]);
    }

    public function headings(): array
    {
        return [
            'first_name',
            'last_name',
            'email',
            'phone',
            'position',
            'department',
            'status',
            'role',
            'hire_date',
        ];
    }
}
```

### 2. Check Duplicate Emails
```
POST /api/employees/check-duplicates
```

**Request:**
```json
{
  "emails": [
    "john@school.com",
    "jane@school.com",
    "bob@school.com"
  ]
}
```

**Response:**
```json
{
  "duplicates": [
    "john@school.com"
  ]
}
```

### 3. Bulk Import
```
POST /api/employees/bulk-import
```

**Request (multipart/form-data):**
```
file: [Excel/CSV file]
```

**OR (JSON):**
```json
{
  "rows": [
    {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@school.com",
      "phone": "+6281234567890",
      "position": "Guru Matematika",
      "status": "active",
      "role": "teacher"
    },
    // ... more rows
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Import completed",
  "data": {
    "total": 100,
    "success": 95,
    "failed": 5,
    "errors": [
      {
        "row": 3,
        "email": "duplicate@school.com",
        "message": "Email already exists"
      },
      {
        "row": 12,
        "message": "Missing required field: first_name"
      }
    ]
  }
}
```

**Laravel Implementation:**
```php
// app/Http/Controllers/Api/BulkImportController.php

public function import(Request $request)
{
    $request->validate([
        'file' => 'nullable|file|mimes:xlsx,csv|max:10240',
        'rows' => 'nullable|array|max:1000',
    ]);

    if ($request->hasFile('file')) {
        // Import from file
        $import = new EmployeesImport();
        Excel::import($import, $request->file('file'));

        return response()->json([
            'success' => true,
            'message' => 'Import completed',
            'data' => $import->getResult(),
        ]);
    } else {
        // Import from JSON
        $service = new BulkImportService();
        $result = $service->importFromArray($request->input('rows'));

        return response()->json([
            'success' => true,
            'message' => 'Import completed',
            'data' => $result,
        ]);
    }
}
```

### 4. Export Employees
```
POST /api/employees/export
```

**Request:**
```json
{
  "filters": {
    "status": "active",
    "role": "teacher"
  },
  "format": "xlsx"  // or "csv"
}
```

**Response:**
- File download: `employees_export_2025-10-20.xlsx`

---

## Error Handling

### Frontend Error Messages
```typescript
const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'File size exceeds 10MB limit',
  INVALID_FORMAT: 'Invalid file format. Please upload .xlsx or .csv',
  PARSE_ERROR: 'Failed to parse file. Please check the format.',
  TOO_MANY_ROWS: 'Maximum 1000 rows allowed per import',
  NETWORK_ERROR: 'Network error. Please try again.',
  SERVER_ERROR: 'Server error. Please contact administrator.',
};
```

### Backend Error Responses
```json
// 400 Bad Request
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "rows.0.email": ["The email has already been taken."],
    "rows.5.first_name": ["The first name field is required."]
  }
}

// 413 Payload Too Large
{
  "success": false,
  "message": "File too large. Maximum 10MB allowed."
}

// 422 Unprocessable Entity
{
  "success": false,
  "message": "Too many rows. Maximum 1000 rows per import."
}
```

---

## Testing Checklist

### Manual Testing
- [ ] Upload valid Excel file (100 rows) → Success
- [ ] Upload valid CSV file (100 rows) → Success
- [ ] Upload file > 10MB → Error message shown
- [ ] Upload file with 1001 rows → Error message shown
- [ ] Upload file with invalid format (.txt) → Error message shown
- [ ] Upload file with duplicate emails → Show errors in preview
- [ ] Upload file with missing required fields → Show errors in preview
- [ ] Upload file with invalid email format → Show errors in preview
- [ ] Upload file with invalid phone format → Show errors in preview
- [ ] Upload file with invalid status → Show errors in preview
- [ ] Import valid records only (skip invalid) → Works correctly
- [ ] Cancel during progress → Import stops
- [ ] Download error log → Contains all failed rows
- [ ] Download template → Opens in Excel without errors
- [ ] Export with filters → Only filtered records exported
- [ ] Export all records → All records exported

### Unit Testing
```typescript
// Example test for validator
describe('validateRow', () => {
  it('should validate required fields', () => {
    const row = { first_name: '', last_name: '', email: '' };
    const result = validateRow(row);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('First name is required');
    expect(result.errors).toContain('Last name is required');
    expect(result.errors).toContain('Email is required');
  });

  it('should validate email format', () => {
    const row = { first_name: 'John', last_name: 'Doe', email: 'invalid-email' };
    const result = validateRow(row);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid email format');
  });

  it('should pass valid row', () => {
    const row = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@school.com',
      phone: '+6281234567890',
      status: 'active',
      role: 'teacher'
    };
    const result = validateRow(row);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
```

---

## Performance Considerations

1. **Chunked Processing** - Process import in chunks of 100 rows
2. **Background Jobs** - Use queue for imports > 500 rows
3. **Progress Updates** - WebSocket or polling for real-time progress
4. **Duplicate Check** - Batch check instead of one-by-one
5. **Memory Management** - Stream large files instead of loading all at once

---

## Next Steps

After implementing this feature:
1. Test with real data (100-1000 rows)
2. Monitor performance and optimize if needed
3. Add import history page (Track who imported what and when)
4. Add ability to rollback failed imports

---

**End of Bulk Import Specification**
