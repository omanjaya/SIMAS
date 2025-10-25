// Bulk import types

export interface ImportRow {
  rowNumber: number;
  data: Record<string, any>;
  isValid: boolean;
  errors: string[];
}

export interface BulkImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
}

export interface BulkImportProgress {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
}

export interface BulkImportRequest {
  rows: ImportRow[];
}

export interface BulkImportResponse {
  total: number;
  success: number;
  failed: number;
  results: Array<{
    id: number;
    employee_code: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    status: 'success' | 'error';
    message: string;
    row_number: number;
  }>;
}

export interface BulkImportHistory {
  id: number;
  filename: string;
  total_records: number;
  success_count: number;
  failed_count: number;
  status: 'completed' | 'failed' | 'processing';
  created_at: string;
  user_id: number;
  user_name: string;
}

export interface ImportTemplateResponse {
  headers: string[];
  exampleData: any[];
}