# SIMAS Saraswati: Sistem Informasi Manajemen Absensi SMP Saraswati Denpasar

A comprehensive attendance system with face recognition capabilities, built with Laravel backend and Next.js frontend.

## Tech Stack

## Prerequisites
- PHP 8.2+ with extensions: `pdo_pgsql`, `mbstring`, `openssl`, `curl`, `json`, `fileinfo`, and whichever library is selected for face processing (`gd`/`imagick` if image manipulation is required)
- Composer 2.6+
- PostgreSQL 15+ server and CLI tools
- Node.js 18+ with npm 9+ (pnpm/yarn optional)
- Git and make (for local tooling scripts if needed)

### Backend
- **Framework**: Laravel 11.x
- **Database**: PostgreSQL 15+
- **Language**: PHP 8.2+
- **API**: RESTful API with Laravel Sanctum for authentication

### Frontend
- **Framework**: Next.js 15
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Language**: TypeScript
- **Design**: Responsive across all device sizes

## Features

1. **Multi-permission Login System**
   - Role-based access control (Admin, Teacher, Employee)
   - Secure authentication with multiple permission levels

2. **Employee Management (CRUD)**
   - Create, read, update, delete employee records
   - Profile management with face enrollment
   - Bulk import functionality with CSV support

3. **Attendance Management**
   - Clock in/out with face recognition
   - Attendance tracking and validation
   - Geofencing and location verification
   - Monthly attendance summaries

4. **Leave/Cuti Request System**
   - Submit leave requests
   - Approval workflow for leave applications
   - Leave balance tracking

5. **Advanced Payroll System**
   - Progressive tax calculation (PPh 21)
   - Payroll approval workflows
   - Bulk payroll generation
   - Email payslip distribution
   - Salary export capabilities

6. **School Calendar Management**
   - Manage school holidays and special events
   - Define non-working days
   - Academic year planning

7. **Teacher Schedule Management**
   - Assign teaching schedules to teachers
   - View and manage class schedules
   - Period-based scheduling

8. **Analytics & Reporting**
   - Attendance trends analysis
   - Comprehensive dashboards
   - Cost tracking and forecasting
   - Export capabilities

9. **Admin Tools & Governance**
   - Face template bulk enrollment
   - Audit logs and activity tracking
   - System configuration management
   - User management with role assignments

## Documentation

For detailed documentation, please refer to the [`docs/`](./docs/) directory:

- **📖 [General Documentation](./docs/README.md)** - Complete documentation overview
- **🔧 [Development Guide](./docs/development/)** - Design system and implementation guides
- **📡 [API Documentation](./docs/api/API_DOCUMENTATION.md)** - Complete REST API reference
- **👥 [User Management](./docs/guides/user-management/)** - User system documentation
- **📊 [Analytics Guide](./docs/guides/ANALYTICS_USER_GUIDE.md)** - Analytics features guide

## Face Recognition Features

- Real-time face detection and recognition
- Secure biometric data storage and processing
- Employee face enrollment system
- Attendance logging via face recognition

## Security Features

- Security-by-design approach throughout the system
- Encrypted biometric data storage
- Role-based access controls
- API rate limiting
- Secure session management
- Database encryption for sensitive data
- Proper input validation and sanitization

## Folder Architecture

### Backend (`backend/`)
```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── V1/
│   │   │   │   │   ├── Auth/
│   │   │   │   │   ├── Employee/
│   │   │   │   │   ├── Schedule/
│   │   │   │   │   ├── Leave/
│   │   │   │   │   ├── Salary/
│   │   │   │   │   └── Biometric/
│   │   │   └── Web/
│   │   ├── Middleware/
│   │   └── Requests/
│   ├── Models/
│   ├── Services/
│   ├── Repositories/
│   ├── Events/
│   ├── Listeners/
│   ├── Jobs/
│   ├── Exceptions/
│   └── Helpers/
├── config/
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── factories/
└── resources/
```

### Frontend (`frontend/`)
```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── api/
│   │   ├── biometric/
│   │   └── reports/
│   ├── components/
│   │   ├── ui/
│   │   ├── common/
│   │   ├── auth/
│   │   ├── attendance/
│   │   └── biometric/
│   ├── lib/
│   ├── hooks/
│   └── services/
├── public/
└── tests/
```

## Database Schema (PostgreSQL)

### Core Tables
- `users` - Authentication and basic user info
- `employees` - Employee details and information
- `attendances` - Attendance records with timestamps
- `schedules` - Employee schedule information
- `periods` - Work period definitions
- `leaves` - Leave/permission requests
- `salaries` - Salary configuration and calculations
- `face_templates` - Encrypted biometric data
- `school_calendars` - Holiday and school event schedule

## Responsive Design

- Mobile-first responsive design
- Adapts to all screen sizes (mobile, tablet, desktop)
- Touch-friendly interface for face recognition
- Optimized layouts for different device types

## API Key Configuration

The system uses shadcnblocks API key for additional UI components:
```json
{
  "registries": {
    "@shadcnblocks": {
      "url": "https://shadcnblocks.com/r/{name}",
      "headers": {
        "Authorization": "Bearer ${SK_REPLACE_ME}"
      }
    }
  }
}
```
> **Security:** Replace `SK_REPLACE_ME` with a valid token stored in a `.npmrc` or environment variable. Do **not** commit active secrets to the repository. Document in the internal wiki how to request/refresh the key.
> **Dev Note:** Current `.npmrc` in `frontend/` uses the development token you provided; rotate it before going public.

## Environment Configuration

### Backend (.env)
```
# copy .env.example to .env before filling values
APP_NAME=AttendanceSystem
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=attendance_system
DB_USERNAME=your_username
DB_PASSWORD=your_password

SANCTUM_STATEFUL_DOMAINS=localhost
SESSION_DOMAIN=localhost
```

1. Duplicate `.env.example` to `.env`.
2. Run `php artisan key:generate` to set `APP_KEY`.
3. Update database credentials to match your PostgreSQL instance.
4. Configure additional services (queues, cache, mail, biometric endpoints) as they are introduced.

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

1. Duplicate `.env.local.example` (if available) to `.env.local`.
2. Point `NEXT_PUBLIC_API_URL` to the Laravel API URL (`/api` suffix required).
3. Set `NEXT_PUBLIC_APP_URL` to whichever domain hosts the Next.js frontend.

> **Tip:** Keep environment files out of version control and define production values in the deployment platform (e.g., Vercel/Envoy/Ansible inventory).

## Installation

1. **Backend Setup**
   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate
   php artisan db:seed
   php artisan serve
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Running the Stack
- Ensure PostgreSQL service is running and accessible.
- Start Laravel API: `php artisan serve --host=0.0.0.0 --port=8000`.
- (Optional) Run queue worker: `php artisan queue:work --tries=3`.
- Start scheduled tasks: `php artisan schedule:work` or system cron (`* * * * * php artisan schedule:run`).
- Start Next.js app: `npm run dev -- --hostname 0.0.0.0 --port 3000`.
- Access frontend via `http://localhost:3000`, API via `http://localhost:8000/api`.
- Shortcut: from `backend/`, `composer run dev` launches both Laravel (`8000`) and Next.js (`3000`) concurrently (ctrl+c stops both).

## Face Recognition Dependencies
- Decide on the recognition backend (e.g., Python microservice with OpenCV/FaceNet, third-party SaaS, or native PHP binding). Document installation commands and network ports.
- Provide model files or download scripts (include checksum, size, storage path).
- Clarify how enrollment images are captured (webcam via WebRTC, static uploads) and storage location (e.g., `storage/app/biometric`).
- Note any GPU/CPU requirements for inference and fallback behaviour if unavailable.

## Key Architecture Principles

- Strict folder structure with consistent naming conventions
- Separation of concerns with Service and Repository patterns
- Security-by-design with encryption and access controls
- Modular component architecture
- Scalable database design with PostgreSQL features
- Responsive UI design for all screen sizes

## Deployment

- Provision Postgres instance, file storage (S3/minio/local), cache (Redis), queue worker, and scheduler.
- Configure production `.env` securely; ensure `APP_ENV=production`, `APP_DEBUG=false`, and correct `APP_URL`.
- Run `php artisan migrate --force`, `php artisan storage:link`, and seed only if necessary.
- Set up queue workers (Supervisor/systemd) and cron for `artisan schedule:run`.
- Build frontend (`npm run build`) and serve via Next.js runtime or static export, aligning `NEXT_PUBLIC_*` with backend URLs.
- Enforce HTTPS, configure CORS, rate limiting, and monitoring/log aggregation.

## Testing & Quality
- `php artisan test` for backend feature/unit tests (use `php artisan test --coverage` when coverage is configured).
- Apply code style: `composer exec pint` (if Pint is installed) or document alternative.
- `npm run lint` and `npm run test` (Jest/Playwright) on the frontend; add `npm run typecheck` if TypeScript strict mode is enabled.
- Document any snapshot/regression suites and how to update baselines.

## Debugging
- **Laravel Debugbar:** Installed and auto-enabled in `APP_ENV=local`. Tweak settings in `config/debugbar.php`; toggle via `.env` (`DEBUGBAR_ENABLED=false`) when needed.
- **Laravel logging:** Errors captured in `storage/logs/laravel.log`. Use `php artisan log:tail` for live view.
- **Tinker & Telescope (optional):** Use `php artisan tinker` for quick checks. Consider adding Telescope later for request/DB insight (dev-only).
- **Next.js dev tools:** Run `npm run dev` for hot reload and full stack traces; React DevTools extension recommended. Axios/fetch wrapper should log request errors to console in development.
- **Source maps:** Enabled by default in Next.js dev; keep `NODE_ENV=development` when debugging to avoid minified stacks.

## Sample Data & Seeding
- Default seeder (`php artisan db:seed`) should create base roles (Admin/Teacher/Employee) and demo accounts. Document generated credentials for QA.
- Consider additional seeders for schedules, calendar entries, and salary configurations; note how to enable/disable them.
- If biometric templates cannot be seeded, explain manual enrollment steps for testing.

## API Documentation
- Maintain a Postman collection or OpenAPI spec (`docs/api/attendance.yaml`). Include generation command, e.g., `php artisan scribe:generate`.
- Provide link/access instructions for Qwen (local URL or published docs) and expected authentication headers (Sanctum tokens, cookies).

## Contribution Workflow
- Branch naming: `feature/{short-description}` or `bugfix/{ticket}`.
- Follow commit convention (e.g., Conventional Commits) to keep history readable.
- Run full test suite before opening PR.
- Open PR with summary, testing evidence, and screenshots (UI changes) following project template.
- Use Git hooks/CI configs if available; document how to run them locally (`./scripts/check.sh`).
# SIMAS
