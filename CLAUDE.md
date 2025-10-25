# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Face Recognition Attendance System** built as a full-stack application with Laravel 12 (PHP 8.2+) backend and Next.js 15 frontend using TypeScript and Tailwind CSS 4. The system manages employee attendance, schedules, leave requests, and payroll with biometric face recognition capabilities.

## Tech Stack

**Backend:**
- Laravel 12.x (PHP 8.2+)
- PostgreSQL 15+ (configured for production, SQLite in .env.example)
- Laravel Sanctum for API authentication
- PHPUnit for testing

**Frontend:**
- Next.js 15.1.1 with App Router
- React 19 with TypeScript (strict mode enabled)
- Tailwind CSS 4.0.2 with shadcn/ui components
- Axios for API communication
- Motion library for animations

## Development Commands

### Backend (from `backend/` directory)

**Setup:**
```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
```

**Development:**
```bash
# Start Laravel dev server (port 8000)
php artisan serve --host=0.0.0.0 --port=8000

# Start both backend and frontend concurrently
composer run dev  # runs scripts/dev.sh

# Run queue worker (for background jobs)
php artisan queue:work --tries=3

# Run scheduled tasks (in development)
php artisan schedule:work
```

**Testing:**
```bash
# Run all tests
php artisan test
# OR
composer test

# Run with coverage (if configured)
php artisan test --coverage

# Run specific test suite
php artisan test --testsuite=Feature
php artisan test --testsuite=Unit

# Run single test file
php artisan test tests/Feature/Auth/LoginTest.php
```

**Code Quality:**
```bash
# Apply Laravel Pint code formatting
vendor/bin/pint
# OR
composer exec pint
```

**Database:**
```bash
# Run migrations
php artisan migrate

# Rollback last migration
php artisan migrate:rollback

# Fresh migration (drops all tables)
php artisan migrate:fresh

# Fresh migration with seeding
php artisan migrate:fresh --seed
```

**Debugging:**
```bash
# Laravel Tinker (REPL)
php artisan tinker

# Tail logs in real-time
php artisan log:tail

# Clear caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### Frontend (from `frontend/` directory)

**Setup:**
```bash
npm install
cp .env.local.example .env.local  # if exists
```

**Development:**
```bash
# Start dev server with Turbopack (port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Linting
npm run lint

# Lint with auto-fix
npm run lint:fix
```

**Type Checking:**
```bash
# TypeScript compiler check
npx tsc --noEmit
```

## Environment Configuration

### Backend `.env`
- Copy `.env.example` to `.env`
- **IMPORTANT:** Use PostgreSQL in production, not SQLite
- Run `php artisan key:generate` to set `APP_KEY`
- Configure database: `DB_CONNECTION=pgsql`, `DB_HOST`, `DB_PORT=5432`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- Set `SANCTUM_STATEFUL_DOMAINS` and `SESSION_DOMAIN` for CORS/authentication

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Architecture & Code Organization

### Backend Structure

The backend follows **Laravel's MVC pattern** with additional service/repository layers:

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Auth/          # AuthenticateController, ProfileController, RegisterController
│   │   └── API/           # EmployeeController, AttendanceController, etc.
│   ├── Middleware/        # RoleMiddleware for RBAC
│   └── Requests/          # Form request validation classes
├── Models/                # Eloquent models (User, Employee, Attendance, etc.)
├── Providers/             # Service providers
└── Policies/              # Authorization policies
```

**Key Models:**
- `User` - Authentication (roles: admin, teacher, employee)
- `Employee` - Employee details (linked to User via `user_id`, nullable for non-user employees)
- `Attendance` - Clock in/out records with period associations
- `Period` - Work period definitions (shifts)
- `TeacherSchedule` - Teaching schedule assignments
- `SchoolCalendar` - Holidays and school events
- `LeaveRequest` - Leave applications with approval workflow
- `Salary` - Salary configurations and calculations
- `FaceTemplate` - Encrypted biometric data for face recognition

**Authentication & Authorization:**
- Uses **Laravel Sanctum** for token-based API authentication
- Role-based access control via `RoleMiddleware` (roles: admin, teacher, employee)
- Admin-only routes wrapped in `middleware(['role:admin'])`
- Route definitions in `routes/api.php`

**API Endpoints:**
- Base URL: `http://localhost:8000/api` (development)
- Authentication: `POST /login`, `POST /logout`, `GET /me`
- Resources: `/employees`, `/periods`, `/teacher-schedules`, `/school-calendars`, `/attendances`, `/leave-requests`, `/salaries`, `/face-templates`
- Special endpoints: `POST /clock-in`, `POST /clock-out`, `PUT /leave-requests/{id}/approve`, `GET /payroll/export`

### Frontend Structure

Next.js App Router with **route groups** for organization:

```
src/
├── app/
│   ├── (auth)/           # Login page (unauthenticated routes)
│   ├── (dashboard)/      # Main app (authenticated routes)
│   │   ├── admin/        # Admin-specific pages
│   │   ├── attendance/   # Attendance management
│   │   ├── employees/    # Employee CRUD
│   │   ├── leave-requests/ # Leave management
│   │   ├── payroll/      # Salary reports
│   │   ├── schedules/    # Teacher schedules
│   │   ├── school-calendar/ # Calendar management
│   │   ├── sidebar.tsx   # Dashboard navigation
│   │   └── topbar.tsx    # Dashboard header
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # shadcn/ui base components
│   ├── auth/             # Authentication components
│   ├── employee/         # Employee-specific components
│   ├── leave-request/    # Leave request forms/tables
│   ├── salary/           # Salary/payroll components
│   ├── schedule/         # Schedule components
│   ├── school-calendar/  # Calendar components
│   └── shared/           # Shared/common components
├── lib/
│   ├── api/              # API client and service layer
│   │   ├── client.ts     # Axios singleton with interceptors
│   │   ├── auth.ts       # Auth API methods
│   │   ├── employees.ts  # Employee API methods
│   │   └── ...           # Other resource services
│   └── utils.ts          # Utility functions
├── context/
│   └── auth-context.tsx  # Global auth state (React Context)
├── hooks/                # Custom React hooks
└── types/                # TypeScript type definitions
```

**Authentication Flow:**
- `AuthProvider` (React Context) wraps the app in `app/layout.tsx`
- `useAuth()` hook provides: `user`, `isAuthenticated`, `isLoading`, `login()`, `logout()`
- API client (`lib/api/client.ts`) handles token storage in localStorage
- Automatic 401 redirect to `/login`
- Bearer token attached to all requests via Axios interceptor

**API Service Pattern:**
- Each resource has a dedicated service file in `lib/api/`
- Services use the singleton `apiClient` instance
- Type-safe responses with TypeScript interfaces

## Database Seeding

Default seeder creates:
- **Admin user:** `admin@example.com` / `password`
- **Teacher user:** `teacher@example.com` / `password`
- **Staff user:** `staff@example.com` / `password`
- Sample periods (Morning/Afternoon/Evening shifts)
- School calendar events
- 20+ additional employees, schedules, leave requests, salaries, face templates, and 100 attendance records

## Face Recognition Implementation

**Current Status:** Architecture in place, actual face recognition logic is a placeholder.

**Expected Integration:**
- Biometric data stored in `face_templates` table (encrypted)
- Face enrollment via `POST /face-templates`
- Attendance clock-in/out can integrate face verification
- Consider Python microservice (OpenCV/FaceNet) or third-party SaaS
- Document model files, storage paths, and GPU/CPU requirements when implemented

## Role-Based Access Control (RBAC)

- **Admin:** Full access to all resources, user management, payroll export
- **Teacher:** Access to own schedule, attendance, leave requests
- **Employee:** Access to own attendance, leave requests, profile

Middleware checks role via `User` model's `role` field.

## Development Workflow

1. **Backend changes:** Modify controllers/models, run migrations if schema changes, test with `php artisan test`
2. **Frontend changes:** Update components/pages, ensure type safety with `npx tsc --noEmit`, lint with `npm run lint:fix`
3. **API changes:** Update both backend routes and frontend service files
4. **Database changes:** Create migration (`php artisan make:migration`), update model, run `php artisan migrate`

## Running the Full Stack

**Option 1: Concurrent (Recommended)**
```bash
cd backend
composer run dev  # Starts Laravel on :8000 and Next.js on :3000
```

**Option 2: Separate Terminals**
```bash
# Terminal 1 (Backend)
cd backend
php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2 (Frontend)
cd frontend
npm run dev

# Terminal 3 (Optional - Queue Worker)
cd backend
php artisan queue:work
```

Access:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api`
- Laravel Debugbar: Auto-enabled in `APP_ENV=local`

## Code Style & Conventions

**Backend:**
- Follow PSR-12 coding standard (enforced by Laravel Pint)
- Use type hints for method parameters and return types
- Eloquent models use property type declarations
- Service layer for business logic, controllers stay thin

**Frontend:**
- TypeScript strict mode enabled
- React functional components with hooks
- Use `@/` path alias for imports (e.g., `@/components/ui/button`)
- shadcn/ui components for UI consistency
- Client components marked with `'use client'` directive

## Testing Strategy

**Backend:**
- Feature tests in `tests/Feature/` (test full request/response cycle)
- Unit tests in `tests/Unit/` (test individual classes/methods)
- Use database transactions in tests (automatic rollback)
- Factory pattern for test data

**Frontend:**
- (No test framework currently configured - consider adding Jest/Playwright)

## Deployment Considerations

- Use PostgreSQL in production (not SQLite)
- Set `APP_ENV=production`, `APP_DEBUG=false`
- Run `php artisan migrate --force`, `php artisan storage:link`
- Set up queue workers (Supervisor/systemd)
- Configure cron for `php artisan schedule:run`
- Build frontend: `npm run build`
- Enforce HTTPS, configure CORS properly
- Manage `.npmrc` token for shadcnblocks registry securely

## Phase 8: Payroll Enhancements

### Overview
Phase 8 introduces advanced payroll features including bulk processing, approval workflows, automated tax calculations, and email distribution.

### New Models & Tables

**1. TaxSetting Model**
- **File:** `app/Models/TaxSetting.php`
- **Table:** `tax_settings`
- **Purpose:** Configure progressive tax brackets (Indonesian PPh 21)
- **Columns:**
  - `bracket_name` - Name/description of tax bracket
  - `min_income` - Minimum income for this bracket
  - `max_income` - Maximum income (NULL = unlimited)
  - `tax_rate` - Tax rate as decimal (e.g., 0.05 = 5%)
  - `is_active` - Active status

**2. PayrollApproval Model**
- **File:** `app/Models/PayrollApproval.php`
- **Table:** `payroll_approvals`
- **Purpose:** Track payroll calculations and approval status
- **Columns:**
  - `employee_id` - Foreign key to employees
  - `period_year` - Payroll year
  - `period_month` - Payroll month
  - `payroll_data` - JSON with complete payroll calculation
  - `status` - ENUM: pending, approved, rejected
  - `approved_by` - Foreign key to users (approver)
  - `approved_at` - Approval timestamp
  - `rejection_reason` - Rejection explanation
  - `notes` - Additional notes

### Services

**1. TaxCalculationService**
- **File:** `app/Services/TaxCalculationService.php`
- **Methods:**
  - `calculateProgressiveTax($annualIncome, $ptkp)` - Progressive tax calculation
  - `calculateMonthlyTax($monthlyGross, $ptkp)` - Monthly tax from gross salary
  - `calculatePTKP($status, $dependents)` - PTKP calculation based on marital status
  - `calculateTotalTax($baseSalary, $allowances, $deductions, $maritalStatus, $dependents)` - Complete tax calculation
  - `getTaxBracketsSummary()` - Get all active tax brackets

**2. PayrollService**
- **File:** `app/Services/PayrollService.php`
- **Methods:**
  - `calculateEmployeePayroll($employeeId, $year, $month)` - Calculate single employee payroll
  - `generateBulkPayroll($year, $month, $employeeIds)` - Bulk payroll generation
  - `getPayrollSummary($year, $month)` - Get period summary statistics

### API Endpoints

**Payroll Approval Management** (All routes require admin role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payroll-approvals` | List all payroll approvals (with filters) |
| GET | `/api/payroll-approvals/{id}` | Get specific payroll approval |
| POST | `/api/payroll/generate-bulk` | Generate bulk payroll for a period |
| GET | `/api/payroll/summary` | Get payroll summary for a period |
| POST | `/api/payroll-approvals/{id}/approve` | Approve a payroll |
| POST | `/api/payroll-approvals/{id}/reject` | Reject a payroll |
| POST | `/api/payroll-approvals/bulk-approve` | Bulk approve multiple payrolls |
| POST | `/api/payroll-approvals/{id}/send-payslip` | Send payslip email |
| POST | `/api/payroll-approvals/bulk-send-payslips` | Send payslips to multiple employees |

**Request Examples:**

```bash
# Generate bulk payroll for October 2025
POST /api/payroll/generate-bulk
{
  "year": 2025,
  "month": 10,
  "employee_ids": [1, 2, 3]  # Optional: specific employees only
}

# Approve payroll
POST /api/payroll-approvals/123/approve
{
  "notes": "Approved by Finance Manager"
}

# Reject payroll
POST /api/payroll-approvals/123/reject
{
  "rejection_reason": "Incorrect overtime calculation",
  "notes": "Please review attendance records"
}

# Get payroll summary
GET /api/payroll/summary?year=2025&month=10
```

### Background Jobs

**SendPayslipEmail Job**
- **File:** `app/Jobs/SendPayslipEmail.php`
- **Queue:** Default queue
- **Purpose:** Send payslip emails asynchronously
- **Trigger:** Via API endpoint or manually
- **Email Template:** `resources/views/emails/payslip.blade.php`

**To Process Jobs:**
```bash
# Run queue worker
php artisan queue:work --tries=3

# Or use Horizon (if installed)
php artisan horizon
```

### Artisan Commands

**Generate Monthly Payroll**
```bash
# Generate payroll for current month
php artisan payroll:generate

# Generate for specific period
php artisan payroll:generate --year=2025 --month=10

# Generate for specific employee
php artisan payroll:generate --employee=123

# Force regeneration
php artisan payroll:generate --force
```

**Seed Tax Brackets**
```bash
php artisan db:seed --class=TaxSettingSeeder
```

### Tax Calculation Logic

**Indonesian PPh 21 Progressive Tax Brackets (2024):**

| Bracket | Annual Income Range | Tax Rate |
|---------|-------------------|----------|
| 1 | 0 - 60,000,000 | 5% |
| 2 | 60,000,000 - 250,000,000 | 15% |
| 3 | 250,000,000 - 500,000,000 | 25% |
| 4 | 500,000,000 - 5,000,000,000 | 30% |
| 5 | > 5,000,000,000 | 35% |

**PTKP (Tax-Free Threshold) Calculation:**
- TK (Single): Rp 54,000,000
- K (Married): Rp 58,500,000
- K/I (Married, combined income): Rp 112,500,000
- +Rp 4,500,000 per dependent (max 3)

**Payroll Calculation Flow:**
1. Get active salary record for employee in period
2. Fetch attendance records for the month
3. Calculate:
   - Overtime pay (overtime_hours × overtime_rate)
   - Total allowances (sum of allowances JSON)
   - Gross salary = base_salary + overtime + allowances + bonuses
4. Calculate tax using `TaxCalculationService`
5. Total deductions = fixed_deductions + tax
6. Net salary = gross_salary - total_deductions
7. Store in `payroll_approvals` with status='pending'

### Workflow

**1. Bulk Payroll Generation**
```
Admin → Generate Bulk → PayrollService → Calculate All Employees
  ↓
Store in payroll_approvals (status='pending')
  ↓
Admin Review → Approve/Reject
  ↓
Send Payslip Email (Queue Job)
```

**2. Approval Workflow**
```
Pending → Admin Review → Approve ✓ or Reject ✗
                             ↓              ↓
                    Status: approved   Status: rejected
                             ↓              ↓
                    Can send payslip  Needs recalculation
```

### Email Configuration

**Development (Log Driver):**
```env
MAIL_MAILER=log
```

**Production (Example with Gmail):**
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@saraswati.sch.id
MAIL_FROM_NAME="SMP Saraswati"
```

### Testing Payroll Features

**Example Test Flow:**
```bash
# 1. Seed tax brackets
php artisan db:seed --class=TaxSettingSeeder

# 2. Generate payroll for current month
php artisan payroll:generate

# 3. Check payroll approvals
php artisan tinker
>>> PayrollApproval::pending()->count()

# 4. View a payroll calculation
>>> $approval = PayrollApproval::first()
>>> $approval->payroll_data

# 5. Approve via API (use Postman or curl)
POST http://localhost:8000/api/payroll-approvals/1/approve

# 6. Send payslip (triggers queue job)
POST http://localhost:8000/api/payroll-approvals/1/send-payslip

# 7. Process queue
php artisan queue:work
```

### TODO / Future Enhancements

**Backend:**
- [ ] PDF payslip generation (integrate barryvdh/laravel-dompdf or spatie/laravel-pdf)
- [ ] Real email service integration (SendGrid, Mailgun, Amazon SES)
- [ ] Payroll lock feature (prevent changes after approval)
- [ ] Payroll history/audit trail
- [ ] Multi-currency support
- [ ] Custom deduction types (loans, insurance, etc.)
- [ ] Bonus calculation rules engine
- [ ] Integration with accounting software

**Frontend:**
- [ ] Bulk payroll processing UI with progress bar
- [ ] Payroll approval workflow dashboard
- [ ] Tax breakdown visualization
- [ ] Email payslip trigger buttons
- [ ] Payroll comparison charts
- [ ] Employee payroll history view
- [ ] Downloadable PDF payslips

**Testing:**
- [ ] Unit tests for TaxCalculationService
- [ ] Feature tests for PayrollApprovalController
- [ ] Job tests for SendPayslipEmail
- [ ] Test tax calculation accuracy across brackets

### File Locations Summary

**Backend (Phase 8 Files):**
- `database/migrations/*_create_tax_settings_table.php`
- `database/migrations/*_create_payroll_approvals_table.php`
- `database/seeders/TaxSettingSeeder.php`
- `app/Models/TaxSetting.php`
- `app/Models/PayrollApproval.php`
- `app/Services/TaxCalculationService.php`
- `app/Services/PayrollService.php`
- `app/Http/Controllers/API/PayrollApprovalController.php`
- `app/Jobs/SendPayslipEmail.php`
- `app/Console/Commands/GenerateMonthlyPayroll.php`
- `resources/views/emails/payslip.blade.php`
- `routes/api.php` (updated with new routes)

**API Routes Added:**
- `/api/payroll-approvals` (GET, POST)
- `/api/payroll/generate-bulk` (POST)
- `/api/payroll/summary` (GET)
- `/api/payroll-approvals/{id}/approve` (POST)
- `/api/payroll-approvals/{id}/reject` (POST)
- `/api/payroll-approvals/bulk-approve` (POST)
- `/api/payroll-approvals/{id}/send-payslip` (POST)
- `/api/payroll-approvals/bulk-send-payslips` (POST)

## Important Notes

- Never commit `.env` files or actual API keys
- The `user_id` field in `employees` table is nullable (allows employees without user accounts)
- Laravel Debugbar is installed for development debugging
- The system uses Laravel 12 (latest version) - check documentation for breaking changes from v11
- Frontend uses Next.js 15 App Router (not Pages Router)
- Tailwind CSS 4 is used (newer syntax, check migration guides if issues arise)
- **NEW:** Payroll calculations use progressive tax rates - ensure tax_settings table is seeded
- **NEW:** Queue worker must be running for payslip emails to be sent
- **NEW:** Payroll approvals are final - approved payrolls cannot be edited (only new ones can be generated)
