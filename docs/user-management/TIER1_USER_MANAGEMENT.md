# TIER 1 User Management Features
## SIMAS - SMP Saraswati Denpasar

**Version:** 1.0
**Last Updated:** 2025-10-20
**Target Implementation:** Sprint 1-2

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Feature List](#feature-list)
3. [User Stories](#user-stories)
4. [Acceptance Criteria](#acceptance-criteria)
5. [Tech Stack](#tech-stack)
6. [Dependencies](#dependencies)
7. [File Structure](#file-structure)

---

## Overview

Dokumen ini menjelaskan implementasi fitur TIER 1 untuk halaman User Management (`/users`) di sistem SIMAS. Fitur-fitur ini adalah yang paling critical dan harus diimplementasikan terlebih dahulu.

### Goals
- Mempermudah admin dalam mengelola ratusan data pegawai
- Mengurangi waktu input data manual dengan bulk import
- Memberikan overview cepat tentang status pegawai
- Meningkatkan efisiensi pencarian dan filtering data

### Success Metrics
- Admin dapat import 100+ pegawai dalam < 5 menit
- Waktu pencarian pegawai berkurang dari ~30 detik ke ~3 detik
- Admin dapat melihat statistik pegawai tanpa membuka dashboard terpisah

---

## Feature List

### 1. Bulk Import/Export ⭐ (Priority: CRITICAL)
**Deskripsi:** Import data pegawai dalam jumlah banyak menggunakan file Excel/CSV

**Sub-features:**
- Upload file (.xlsx, .csv) dengan drag & drop
- Download template import yang sudah sesuai format
- Preview data sebelum import (lihat 10 row pertama)
- Validasi data real-time:
  - Email tidak duplikat
  - Required fields tidak kosong
  - Format email/phone valid
  - Status harus valid (active/on_leave/suspended)
- Progress bar saat import (0-100%)
- Summary hasil import:
  - ✅ X records berhasil
  - ❌ Y records gagal
  - Detail error per row
- Export data pegawai ke Excel/CSV
- Export dengan filter (hanya yang di-display)

**Expected UI:**
```
[Button: Import Excel/CSV] [Button: Export Data]

Modal Import:
┌─────────────────────────────────────────────┐
│  Drag & drop file atau klik untuk upload   │
│  ┌───────────────────────────────────────┐ │
│  │      📁 Drop Excel/CSV file here      │ │
│  │          atau klik browse             │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  [Button: Download Template]                │
│                                             │
│  Preview Data (10 rows):                    │
│  ┌───────────────────────────────────────┐ │
│  │ Nama    │ Email       │ Status │ ✓/✗ │ │
│  │ John    │ john@x.com  │ active │ ✓   │ │
│  │ Jane    │ invalid     │ active │ ✗   │ │  <- Error: invalid email
│  └───────────────────────────────────────┘ │
│                                             │
│  ⚠ 1 error found, 9 valid                  │
│                                             │
│  [Cancel] [Import Valid Records Only]       │
└─────────────────────────────────────────────┘

Progress:
┌─────────────────────────────────────────────┐
│  Importing...  [████████░░] 80%            │
│  80 / 100 records processed                 │
└─────────────────────────────────────────────┘

Summary:
┌─────────────────────────────────────────────┐
│  ✅ Import Complete!                        │
│                                             │
│  ✓ 95 records imported successfully         │
│  ✗ 5 records failed                         │
│                                             │
│  Failed Records:                            │
│  Row 3: Duplicate email                     │
│  Row 12: Missing required field: first_name │
│  Row 45: Invalid status value               │
│                                             │
│  [Download Error Log] [Close]               │
└─────────────────────────────────────────────┘
```

---

### 2. Quick Stats Cards ⭐ (Priority: HIGH)
**Deskripsi:** Cards yang menampilkan statistik pegawai di atas tabel

**Stats yang ditampilkan:**
1. **Total Pegawai Aktif** - Jumlah pegawai dengan status "active"
2. **Total Guru** - Pegawai dengan role "teacher" atau position mengandung "guru"
3. **Total Staff** - Pegawai dengan role "employee" atau position staff/TU
4. **Pegawai Cuti** - Pegawai dengan status "on_leave" hari ini

**Expected UI:**
```
┌────────────┬────────────┬────────────┬────────────┐
│ 👥 254     │ 👨‍🏫 180    │ 👔 74      │ 🏖 3       │
│ Total Aktif│ Guru       │ Staff      │ Cuti       │
│ +5%        │ +2%        │ +8%        │ -1 vs yday│
└────────────┴────────────┴────────────┴────────────┘
```

**Interactivity:**
- Klik card → Filter tabel sesuai kategori
- Hover → Show tooltip dengan detail
- Auto refresh setiap 60 detik (optional)

---

### 3. Advanced Filter ⭐ (Priority: HIGH)
**Deskripsi:** Filter data pegawai dengan multiple criteria

**Filter Options:**
1. **Status** - Active, On Leave, Suspended, All
2. **Role** - Admin, Teacher, Employee, All
3. **Position** - Guru Matematika, Guru IPA, TU, Kepala Sekolah, dll (dynamic dari database)
4. **Department** - Science, Math, Administration, dll (dynamic)
5. **Date Range** - Hired date from - to
6. **Has Biometric** - Yes, No, All

**Expected UI:**
```
[🔽 Filter] button →

Dropdown Panel:
┌─────────────────────────────────────────────┐
│  Status:      [Dropdown: All ▼]             │
│  Role:        [Dropdown: All ▼]             │
│  Position:    [Dropdown: All ▼]             │
│  Department:  [Dropdown: All ▼]             │
│  Hired:       [Date] - [Date]               │
│  Biometric:   [Dropdown: All ▼]             │
│                                             │
│  [Clear Filters] [Apply]                    │
└─────────────────────────────────────────────┘

Active Filters (badges):
[Status: Active ✕] [Role: Teacher ✕] [Clear All]
```

---

### 4. Biometric Link ⭐ (Priority: MEDIUM)
**Deskripsi:** Link ke enrollment biometrik langsung dari user detail

**Features:**
- Badge di tabel: "✅ Enrolled" atau "⚠️ Not Enrolled"
- Button "Enroll Biometric" di user detail page
- Link ke `/dashboard/biometric/enroll/{user_id}`
- Quick action: "Re-enroll" jika fingerprint/face error

**Expected UI in Table:**
```
┌────────────────────────────────────────────────┐
│ Nama      │ Email      │ Biometric │ Actions  │
├────────────────────────────────────────────────┤
│ John Doe  │ john@x.com │ ✅ Enrolled│ [View]  │
│ Jane Doe  │ jane@x.com │ ⚠️  None   │ [Enroll]│
└────────────────────────────────────────────────┘
```

---

## User Stories

### US-1: Bulk Import
```
AS AN admin
I WANT TO import multiple employees from Excel file
SO THAT I don't have to manually input 200+ employees one by one

Acceptance Criteria:
- Admin can upload .xlsx or .csv file
- System validates data before import
- Admin sees preview of data
- System shows progress bar during import
- Admin receives summary report after import
- Failed records are logged with reasons
```

### US-2: Quick Stats
```
AS AN admin
I WANT TO see employee statistics at a glance
SO THAT I can quickly understand the current workforce status

Acceptance Criteria:
- Stats cards show accurate numbers in real-time
- Cards are clickable to filter the table
- Numbers update when filters are applied
- Visual indicators for trends (up/down)
```

### US-3: Advanced Filter
```
AS AN admin
I WANT TO filter employees by multiple criteria
SO THAT I can find specific groups of employees quickly

Acceptance Criteria:
- Multiple filters can be applied simultaneously
- Filter options are populated from actual database data
- Active filters are visible as badges
- Clear all filters in one click
- Filtered results reflect immediately in table
- Export respects active filters
```

### US-4: Biometric Status
```
AS AN admin
I WANT TO see which employees have enrolled biometric data
SO THAT I can track enrollment progress and ensure all employees are registered

Acceptance Criteria:
- Biometric status is visible in table
- Can filter by enrolled/not enrolled
- Quick link to enroll from user detail
- Badge shows clear status
```

---

## Acceptance Criteria

### Bulk Import
- [x] Accepts .xlsx and .csv files
- [x] File size limit: 10MB
- [x] Max records: 1000 per import
- [x] Validates:
  - Email format (regex)
  - Email uniqueness (no duplicate in file + database)
  - Required fields: first_name, last_name, email
  - Status values: active, on_leave, suspended
  - Phone format (optional): +62xxx or 08xxx
- [x] Shows preview before import
- [x] Progress bar updates every 10%
- [x] Summary shows success/fail counts
- [x] Error log downloadable as .txt or .csv
- [x] Template download includes example data

### Quick Stats
- [x] Shows 4 cards: Total Aktif, Guru, Staff, Cuti
- [x] Numbers are accurate (+/- 0 tolerance)
- [x] Updates when filters applied
- [x] Clickable to filter table
- [x] Responsive on mobile (stack vertically)
- [x] Loading skeleton while fetching

### Advanced Filter
- [x] 6 filter options available
- [x] Dropdowns populated from API
- [x] Multiple filters work together (AND logic)
- [x] Active filters shown as removable badges
- [x] Clear all filters button
- [x] Apply button triggers filter
- [x] URL params reflect filters (shareable link)

### Biometric Link
- [x] Badge shows enrolled status
- [x] Click badge opens enrollment page
- [x] Filter by enrollment status
- [x] Re-enroll option available

---

## Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **UI Library:** shadcn/ui + Tailwind CSS
- **State Management:** React hooks (useState, useEffect)
- **File Upload:** react-dropzone
- **Excel Parsing:** xlsx (SheetJS)
- **CSV Parsing:** papaparse
- **Forms:** react-hook-form + zod
- **API Calls:** Custom apiClient (axios-based)

### Backend (Laravel 12)
- **API:** RESTful API
- **Validation:** Laravel Validation Rules
- **File Processing:** Laravel Excel (Maatwebsite/Laravel-Excel)
- **Queue:** Laravel Queue (for async import)
- **Jobs:** BulkImportJob, ProcessImportRow
- **Storage:** Local (import files, error logs)

---

## Dependencies

### NPM Packages to Install
```bash
npm install xlsx papaparse react-dropzone
npm install @types/papaparse --save-dev
```

### Laravel Packages (Already installed)
```bash
composer require maatwebsite/excel
```

---

## File Structure

```
frontend/src/
├── app/
│   └── (dashboard)/
│       └── users/
│           ├── page.tsx                    # Main users page (ENHANCED)
│           ├── bulk-import/
│           │   └── page.tsx                # NEW: Bulk import page
│           └── import-history/
│               └── page.tsx                # NEW: Import history page
│
├── components/
│   ├── users/
│   │   ├── bulk-import-dialog.tsx          # NEW: Import modal
│   │   ├── bulk-import-wizard.tsx          # NEW: Step wizard
│   │   ├── import-preview-table.tsx        # NEW: Preview table
│   │   ├── import-progress.tsx             # NEW: Progress bar
│   │   ├── import-summary.tsx              # NEW: Summary modal
│   │   ├── export-dialog.tsx               # NEW: Export modal
│   │   ├── stats-cards.tsx                 # NEW: Stats cards
│   │   ├── advanced-filter.tsx             # NEW: Filter component
│   │   └── user-table.tsx                  # ENHANCED: Table component
│   │
│   └── ui/
│       ├── file-upload.tsx                 # NEW: File upload dropzone
│       └── progress-bar.tsx                # NEW: Progress component
│
├── lib/
│   ├── api/
│   │   └── employees.ts                    # ENHANCED: Add bulk import APIs
│   │
│   ├── utils/
│   │   ├── excel-parser.ts                 # NEW: Parse Excel files
│   │   ├── csv-parser.ts                   # NEW: Parse CSV files
│   │   └── validators.ts                   # NEW: Data validation
│   │
│   └── hooks/
│       ├── use-employees.ts                # ENHANCED: Add stats hook
│       └── use-bulk-import.ts              # NEW: Bulk import hook
│
└── types/
    ├── employees.ts                        # ENHANCED: Add import types
    └── bulk-import.ts                      # NEW: Import types

backend/app/
├── Http/
│   └── Controllers/
│       └── Api/
│           ├── EmployeeController.php       # ENHANCED
│           └── BulkImportController.php     # NEW
│
├── Services/
│   └── BulkImportService.php               # NEW
│
├── Jobs/
│   ├── ProcessBulkImport.php               # NEW
│   └── ProcessImportRow.php                # NEW
│
├── Imports/
│   └── EmployeesImport.php                 # NEW (Laravel Excel)
│
└── Http/
    └── Requests/
        └── BulkImportRequest.php           # NEW
```

---

## Next Steps

1. Read **BULK_IMPORT_SPEC.md** for detailed bulk import implementation
2. Read **QUICK_STATS_SPEC.md** for stats cards implementation
3. Read **ADVANCED_FILTER_SPEC.md** for filter implementation
4. Read **API_CONTRACTS.md** for all API endpoints
5. Read **IMPLEMENTATION_GUIDE.md** for step-by-step guide

---

## Questions & Support

Jika ada pertanyaan tentang dokumentasi ini:
1. Check FAQ di IMPLEMENTATION_GUIDE.md
2. Review API_CONTRACTS.md untuk API details
3. Contact: admin@smp-saraswati.sch.id

---

**Document prepared for:** Qwen Coder
**Prepared by:** Claude (AI Assistant)
**Date:** 2025-10-20
