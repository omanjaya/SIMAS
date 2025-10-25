# Project Requirements Document (PRD) for SIMAS

---

## 1. Project Overview

SIMAS (Sistem Informasi Manajemen Absensi & Penggajian) is a web-based system that centralizes all aspects of employee attendance and payroll management. It provides administrators and staff with an intuitive dashboard—built using Next.js and Shadcn UI—while leveraging a Laravel-powered REST API for data processing. Key modules include employee profiles, clock‐in/clock‐out tracking, leave requests, payroll calculations, schedule management, analytics dashboards, and audit logs.

Organizations often juggle spreadsheets and manual calculations, leading to errors, delays, and compliance headaches. SIMAS solves these pain points by automating attendance capture (including biometric integration), streamlining leave and payroll workflows, and providing real‐time visibility into labor metrics. Success is measured by reduced processing time, fewer payroll errors, higher user adoption rates, and on‐time compliance reporting.

---

## 2. In-Scope vs. Out-of-Scope

### In-Scope (Version 1.0)
- User authentication and role-based access control (RBAC) for employees and managers.
- Profile completion wizard (emergency contacts, tax and bank details).
- Employee CRUD (Create, Read, Update, Delete) via RESTful API.
- Attendance tracking: clock‐in/clock‐out UI, manual adjustments, and optional biometric stub.
- Leave management: submit, approve/reject, balance tracking, and email notifications.
- Payroll processing: salary calculation (base, allowances, deductions), payslip generation, and multi‐step approval workflow.
- Work schedule management: shift creation, editing, and sync with attendance records.
- Reporting & analytics dashboard: hours worked, overtime trends, cost summaries, export to CSV.
- Audit logging for critical operations (user, action, timestamp, context).
- Frontend built with Next.js, TypeScript, Tailwind CSS, Shadcn UI & Radix UI.
- Backend built with Laravel, Eloquent ORM, MySQL/PostgreSQL, Redis-backed queues, and API validation.

### Out-of-Scope (Planned for Later Phases)
- Native mobile apps (iOS/Android) or offline mode.
- Third-party payroll provider integrations (e.g., ADP, Paylocity).
- Advanced BI/AI analytics or forecasting modules.
- Multi‐currency and multi‐company/tenant support.
- Real-time push notifications beyond email (e.g., mobile, Slack).
- GDPR-specific data export workflows or consent management.
- Bulk legacy data migration tools (beyond simple CSV import).

---

## 3. User Flow

When a new employee logs in for the first time (via an invitation link or signup form), they land on a profile completion wizard. This step-by-step form collects personal details, emergency contacts, tax IDs, and bank info. Upon completion, they are redirected to the main dashboard, which presents a sidebar with core modules: Attendance, Leave, Payslips, and Profile.

Regular employees use the Attendance page to clock in/out and view their daily logs. They navigate to Leave to submit or track requests, receiving email updates upon approval or rejection. Managers see additional menu items—Employee Management, Schedule Management, Payroll Approvals, and Analytics. They can add or edit employee records, define shifts, review leave requests, approve payroll batches, and drill into interactive reports.

---

## 4. Core Features

- **Authentication & Authorization**: Secure login, password reset, JWT or Laravel Sanctum, role-based guards.
- **Profile Wizard**: Multi-step form with React Hook Form & Zod validation.
- **Employee Management**: REST API endpoints for CRUD operations, search, and role assignment.
- **Attendance Tracking**: Clock-in/clock-out buttons, manual entries, timestamp storage, late/early flags.
- **Leave Management**: Request creation, manager approval/rejection, leave balance calculation, email alerts.
- **Payroll Processing**: Automated salary computations, payslip PDF generation, approval workflow, batch export.
- **Schedule Management**: Create/Edit shifts, assign to employees, holiday exceptions, sync with attendance.
- **Reporting & Analytics**: Dashboard widgets (total hours, overtime, costs), date filters, CSV export.
- **Audit Logging**: Middleware capturing user actions (model, operation, timestamp, metadata).
- **Notifications**: Outbound email service (Laravel Mail) for key events (leave status, payslip delivery).

---

## 5. Tech Stack & Tools

- **Frontend**
  - Next.js (React) with App Router
  - TypeScript for type safety
  - Tailwind CSS for utility-first styling
  - Shadcn UI & Radix UI for component library
  - React Hook Form & Zod for form state and validation
  - next-themes for theme switching (dark/light)
  - MDX for in-app documentation or content blocks

- **Backend**
  - Laravel 9+ (PHP 8.1+)
  - Eloquent ORM for database models
  - MySQL or PostgreSQL as primary data store
  - Redis for queue jobs and caching
  - Laravel Sanctum or Passport for API authentication
  - Artisan commands and scheduled tasks (cron) for payroll runs

- **Dev Tools**
  - VS Code with ESLint & Prettier
  - EditorConfig for consistent styling
  - PHPUnit & Pest for backend tests
  - Jest & React Testing Library for frontend tests

---

## 6. Non-Functional Requirements

- **Performance**: API endpoints should respond within 300ms under normal load (<500 concurrent users). Initial page load <2s.
- **Scalability**: Support up to 2,000 employee records and 100 concurrent payroll batch jobs.
- **Security**: OWASP Top 10 compliance, CSRF/XSS protection, input validation, secure password storage (bcrypt).
- **Availability**: 99.9% uptime SLA, with automated health checks and monitoring.
- **Usability**: WCAG 2.1 AA accessibility, responsive design for desktop/tablet.
- **Data Compliance**: Audit logs retained for at least 1 year, encrypted at rest and in transit (TLS).

---

## 7. Constraints & Assumptions

- **Environment**: Node.js 16+, PHP 8.1+, Redis server, relational DB.
- **User Accounts**: Each employee has a unique company email.
- **Biometric Stub**: Facial/fingerprint SDKs are simulated; actual hardware integration in later phases.
- **Single Region**: All users operate in one time zone (server timezone alignment).
- **No Mobile Offline**: Browser-based access only.

---

## 8. Known Issues & Potential Pitfalls

- **Time Zone Handling**: Ensure clock-in/out stamps respect user and server time zones; implement clear conversion logic.
- **Concurrent Clock-ins**: Prevent duplicate entries if a user clicks "Clock In" multiple times quickly; use database locks or idempotency tokens.
- **Payroll Rounding**: Handle edge cases (leap years, overtime fractions) consistently; define rounding rules (e.g., to nearest minute).
- **Queue Failures**: Monitor and retry failed jobs (e.g., email sends, payroll generation) to avoid data loss.
- **Data Migrations**: Evolving schema (new fields, tables) may break existing clients; plan DB migrations and API versioning.

Mitigation strategies include rigorous unit/integration tests, clear logging, and adopting feature flags for any disruptive changes.

---

This document provides a clear, unambiguous foundation for SIMAS’s first version. It will guide AI-driven tech specs, frontend guidelines, backend structures, and further architectural artifacts without missing critical details.