# 🎨 FRONTEND - Bulk Import UI Updates

## 📋 OVERVIEW

Update bulk import untuk 4 kolom dengan strict validation UI.

---

## 🔄 UPDATE FILES

### 1. Template Download
**File**: `components/users/bulk-import-dialog.tsx`

Update template to 4 columns:
```typescript
const template = "full_name,email,hire_date,role\n";
template += "I Wayan Sudiarta,wayan@gmail.com,2024-01-15,teacher\n";
template += "Ni Made Sari,made.sari@yahoo.com,2024-02-01,employee\n";
```

### 2. Validators
**File**: `lib/utils/validators.ts`

```typescript
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateRow(row: any): ValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!row.full_name?.trim()) errors.push('Full name is required');
  if (!row.email?.trim()) errors.push('Email is required');
  if (!row.hire_date?.trim()) errors.push('Hire date is required');
  if (!row.role?.trim()) errors.push('Role is required');

  // Email format
  if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
    errors.push('Invalid email format');
  }

  // Hire date format
  if (row.hire_date && !/^\d{4}-\d{2}-\d{2}$/.test(row.hire_date)) {
    errors.push('Hire date must be in format YYYY-MM-DD');
  }

  // Role validation
  if (row.role && !['admin', 'teacher', 'employee'].includes(row.role.toLowerCase())) {
    errors.push('Role must be: admin, teacher, or employee');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

### 3. Upload Step
**File**: `components/users/steps/file-upload-step.tsx`

Call validation API:
```typescript
const onDrop = useCallback(async (acceptedFiles: File[]) => {
  const file = acceptedFiles[0];
  if (!file) return;

  try {
    setLoading(true);

    // Call backend validation API
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/employees/validate-import', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });

    const result = await response.json();

    if (result.valid) {
      // All valid - proceed to preview
      onFileSelected(file, result);
    } else {
      // Has errors - show error screen
      onValidationError(file, result.errors);
    }
  } catch (error) {
    toast.error('Failed to validate file');
  } finally {
    setLoading(false);
  }
}, []);
```

### 4. Error Review Step (NEW)
**File**: `components/users/steps/error-review-step.tsx`

```typescript
export function ErrorReviewStep({ 
  errors, 
  onDownloadReport, 
  onUploadNew 
}: ErrorReviewStepProps) {
  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Validasi Gagal</AlertTitle>
        <AlertDescription>
          Ditemukan {errors.length} error yang harus diperbaiki
        </AlertDescription>
      </Alert>

      <div className="border rounded-lg max-h-96 overflow-y-auto">
        {errors.map((error, index) => (
          <div key={index} className="p-4 border-b last:border-b-0">
            <div className="font-medium text-red-600">
              Baris {error.row}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Data: {JSON.stringify(error.data)}
            </div>
            <ul className="mt-2 space-y-1">
              {error.errors.map((err, i) => (
                <li key={i} className="text-sm text-red-600">
                  • {err}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onDownloadReport}>
          <Download className="h-4 w-4 mr-2" />
          Download Error Report
        </Button>
        <Button onClick={onUploadNew}>
          <Upload className="h-4 w-4 mr-2" />
          Upload File Baru
        </Button>
      </div>
    </div>
  );
}
```

---

## 🎯 WIZARD FLOW

```
1. Upload File
   ↓
2. Call API Validation
   ↓
   ❌ Has errors? → Show ErrorReviewStep
   ✅ All valid? → Show PreviewStep
   ↓
3. Preview (show summary)
   ↓
4. Import
   ↓
5. Summary
```

---

**Next**: [07_FRONTEND_PROFILE.md](./07_FRONTEND_PROFILE.md)
