# Tech Stack Document for SIMAS

This document explains, in everyday language, the technology choices behind SIMAS (Sistem Informasi Manajemen Absensi & Penggajian). You don’t need a technical background to understand why each part was picked and how it helps the system work smoothly.

## 1. Frontend Technologies
The frontend is what you see and interact with in your browser. We chose tools that make the interface fast, accessible, and easy to build and maintain.  

- **Next.js (React Framework)**  
  Provides server-side rendering and fast page loads, plus a clear structure for pages and layouts.  
- **React & App Router**  
  Lets us break the UI into modular components and organize routes logically (e.g., login, dashboard, profile).  
- **TypeScript**  
  Adds type checking so we catch mistakes early, making the code more reliable.  
- **Tailwind CSS**  
  A utility-first styling approach that speeds up design by using small, reusable classes.  
- **Shadcn UI & Radix UI**  
  Pre-built, accessible UI components (buttons, modals, forms) that we can style to match our branding.  
- **React Hook Form & Zod**  
  Simplifies building and validating forms, with clear error messages and strict data checks.  
- **next-themes**  
  Enables dark/light mode switching so users can pick a theme that’s easy on their eyes.  
- **MDX**  
  Lets us mix Markdown and React components for any in-app documentation or help guides.  
- **Custom React Hooks & Context**  
  (`useAuth`, `useEmployees`, `useLeaveRequests`, etc.) keep data fetching and state management organized and reusable.

Together, these tools ensure a responsive, consistent, and accessible user experience.

## 2. Backend Technologies
The backend runs on a server, handling data storage, business rules, and secure communications. Here’s how we built it:

- **Laravel (PHP Framework)**  
  A proven framework that gives us structure (controllers, routes, middleware) and many built-in features (authentication, queues).  
- **PHP 8.x**  
  The latest stable version of PHP for better performance and modern language features.  
- **Eloquent ORM**  
  Makes database operations feel like working with simple objects, speeding up development and keeping queries readable.  
- **MySQL / PostgreSQL**  
  Reliable relational databases to store employee records, attendance logs, leave requests, payroll data, etc.  
- **Artisan CLI & Commands**  
  Custom commands (e.g., payroll generation, backups) run from the command line or on a schedule.  
- **Queue System**  
  Handles tasks such as sending payslip emails or processing biometric data in the background (using Redis or database queues) so the user isn’t left waiting.  
- **Middleware**  
  - **Authentication & Authorization** (`auth`, `RoleMiddleware`)  
  - **Profile Completion Check** (`CheckProfileCompletion`)  
  - **Audit Logging** (`AuditLogMiddleware`)  
  These intercept requests to enforce security and record who did what.  
- **Service Layer**  
  Encapsulates business rules (e.g., `PayrollService`, `TaxCalculationService`, `AnalyticsService`, `FaceRecognitionService`) for clear separation of concerns.  
- **Form Requests**  
  Centralize server-side validation before any data reaches business logic.  
- **Controllers, Models, Jobs, Tests**  
  Standard Laravel structure—controllers route requests, models map to database tables, jobs handle async work, and tests ensure everything behaves correctly.

These choices give us a solid, secure backbone for handling data and user actions.

## 3. Infrastructure and Deployment
How we host, deploy, and version-control SIMAS for reliability and easy updates:

- **Version Control: Git & GitHub**  
  Tracks code changes, supports collaboration, and serves as the single source of truth.  
- **CI/CD: GitHub Actions**  
  Automatically runs tests, linting, and builds on every push or pull request, reducing manual steps and catching issues early.  
- **Frontend Hosting: Vercel**  
  Optimized for Next.js with instant deploy previews, global edge network for fast page loads, and built-in SSL.  
- **Backend Hosting: Cloud Provider (e.g., AWS, DigitalOcean, or Heroku)**  
  Runs the Laravel API on managed servers or containers, auto-scaling as needed.  
- **Docker for Local Development**  
  Ensures every developer runs the same environment (PHP, Node.js, database) on their machine.  
- **Process Management: Supervisor or PM2**  
  Keeps queue workers and scheduled tasks running smoothly on the server.  
- **Storage & Assets: AWS S3 or DigitalOcean Spaces**  
  Stores uploaded files, payslips, and any static assets outside of the main server for durability and scalability.  
- **Environment Configuration**  
  Uses `.env` files (Laravel) and environment variables (Next.js) to keep API URLs, database credentials, and feature flags consistent across environments.

This setup ensures we can deploy updates quickly, recover from failures, and scale as the number of users grows.

## 4. Third-Party Integrations
SIMAS connects to external services to extend its capabilities without reinventing the wheel:

- **Email Service (e.g., SendGrid, Mailgun, or SMTP)**  
  Delivers payslips, notifications for leave approvals, and other system emails reliably.  
- **Biometric / Face Recognition API**  
  Integrates with a third-party service (or library) for facial recognition when clocking in/out.  
- **Analytics & Monitoring (e.g., Google Analytics, Sentry)**  
  Tracks user interactions on the frontend and captures runtime errors or performance issues on both client and server.  
- **MDX Content**  
  Pulls in documentation or dynamic help content written in Markdown with embedded React components.  

These integrations save development time and leverage specialized services to keep SIMAS robust.

## 5. Security and Performance Considerations
We’ve built in safeguards and optimizations at every layer:

Security Measures
- **Authentication & Role-Based Access Control (RBAC)**  
  Only authorized users can see or act on specific features (e.g., managers approve leave, admins manage payroll).  
- **CSRF & XSS Protection**  
  Laravel’s built-in defenses plus careful output encoding in templates prevent common web attacks.  
- **Data Validation**  
  Double-checked on client (Zod) and server (Form Requests) to ensure only clean, expected data is processed.  
- **Audit Logging**  
  Records every important action (who, what, when) for accountability and troubleshooting.  
- **Encrypted Storage**  
  Sensitive data (e.g., bank details, personal information) is stored securely and—where applicable—encrypted at rest.

Performance Optimizations
- **Server-Side Rendering & Caching**  
  Next.js pre-renders pages and caches API responses where appropriate for faster load times.  
- **Database Indexing & Query Optimization**  
  Eloquent queries are profiled and indexed to handle large data sets efficiently.  
- **Background Job Processing**  
  Long-running tasks (email sends, bulk imports) move off the main thread via queues.  
- **Asset Optimization**  
  Images and static files are compressed and served via a CDN (e.g., Vercel Edge, CloudFront).  
- **Code Splitting & Lazy Loading**  
  Next.js splits JavaScript bundles so users download only what they need for each page.

These steps help SIMAS stay fast, responsive, and secure as it grows.

## 6. Conclusion and Overall Tech Stack Summary
SIMAS brings together a modern, proven set of technologies to manage attendance and payroll:

- Frontend powered by **Next.js, React, TypeScript, Tailwind CSS, Shadcn UI/Radix UI, React Hook Form, Zod**, and **next-themes** for a fast, accessible interface.  
- Backend built on **Laravel (PHP), Eloquent ORM, MySQL/PostgreSQL, Artisan commands, queues, middleware**, and a clear **service layer** for business logic.  
- Infrastructure using **GitHub, GitHub Actions, Vercel, Docker, Cloud hosting**, and **S3**-style storage to ensure smooth deployments, scalability, and reliability.  
- Integrations with **email delivery**, **biometric APIs**, and **analytics tools** to round out core features.  
- Strong **security** (RBAC, CSRF/XSS protection, audit logs) and **performance** (SSR, caching, queueing) practices built in from day one.

By aligning these choices with the project’s goals—streamlined employee management, accurate attendance tracking, efficient payroll processing, and clear reporting—SIMAS delivers a reliable, easy-to-use system for organizations of any size.