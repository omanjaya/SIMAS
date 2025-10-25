# SIMAS Backend Structure Document

This document outlines the backend architecture, database setup, APIs, hosting environment, infrastructure components, security measures, monitoring, and maintenance strategies for SIMAS (Sistem Informasi Manajemen Absensi & Penggajian). It is written in everyday language to ensure clarity for both technical and non-technical readers.

## 1. Backend Architecture

### Overall Design
- We use a **service-oriented** approach in Laravel (a PHP framework). Controllers handle HTTP requests and delegate business logic to dedicated **services**. This keeps code organized and easy to maintain.
- **Eloquent ORM** connects models (like Employee, Attendance) to database tables using familiar object-oriented code.
- **Middleware** layers enforce authentication, check user roles, ensure profiles are complete, and log important actions.
- **Queue workers** process time-consuming tasks—such as sending payslips or importing biometric data—in the background.

### How It Supports Key Goals
- **Scalability:** Services are stateless. We can add more server instances behind a load balancer to handle increased traffic. Queues let us process jobs asynchronously without blocking user requests.
- **Maintainability:** Separation of concerns (controllers vs. services vs. middleware) means each piece is small and focused. New features or bug fixes can be added without touching unrelated parts.
- **Performance:** Caching frequently accessed data (e.g., employee lists) in Redis reduces database load. Queued jobs and optimized database queries keep response times low.

## 2. Database Management

### Technologies Used
- **Relational Database (SQL):** PostgreSQL (or MySQL as an alternative) stores structured data like employees, attendance records, and payroll details.
- **Caching Store:** Redis is used for caching query results, session storage, and as the queue backend for Laravel.

### Data Handling Practices
- **Data Organization:** Tables are normalized to reduce duplication. Foreign keys ensure referential integrity (e.g., each attendance record links to a valid employee).
- **Access Patterns:** Read-heavy operations (dashboards and reports) benefit from caching. Write operations (clock-in, leave requests) go directly to the database and are logged for audit purposes.
- **Backups & Retention:** Nightly automated backups of the database are stored off-site. We retain at least 30 days of backups to support recovery.

## 3. Database Schema

Below is a simplified, human-readable overview of the main tables, followed by the actual SQL statements for a PostgreSQL setup.

### Human-Readable Schema
- **employees:** Stores personal and employment details (name, email, role, bank info).
- **attendances:** Records each clock-in/out event with timestamps and status (on-time, late).
- **leave_requests:** Tracks leave submissions (type of leave, start/end dates, approval status).
- **payroll_approvals:** Holds payroll batch data, totals, and approval metadata (who approved, when).
- **schedules:** Defines work schedules (shifts, break times, exceptions).
- **audit_logs:** Logs critical actions (who did what and when) for accountability.

### PostgreSQL Schema (Example)

```sql
-- Employees table
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL,
  date_of_hire DATE NOT NULL,
  bank_account TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance records
CREATE TABLE attendances (
  id SERIAL PRIMARY KEY,
  employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
  clock_in TIMESTAMP NOT NULL,
  clock_out TIMESTAMP,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leave requests
CREATE TABLE leave_requests (
  id SERIAL PRIMARY KEY,
  employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
  leave_type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP
);

-- Payroll approvals
CREATE TABLE payroll_approvals (
  id SERIAL PRIMARY KEY,
  payroll_date DATE NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  approved_by INT REFERENCES employees(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Work schedules
CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
  shift_start TIME NOT NULL,
  shift_end TIME NOT NULL,
  break_duration INTERVAL,
  effective_date DATE NOT NULL
);

-- Audit logs
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES employees(id),
  action VARCHAR(100) NOT NULL,
  target_table VARCHAR(50),
  target_id INT,
  changes JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 4. API Design and Endpoints

### Style and Approach
- We follow **RESTful** design principles: each resource (employees, attendances, etc.) has predictable URLs and standard HTTP methods (GET, POST, PUT/PATCH, DELETE).
- Consistent request/response formats (JSON) make it easy for the Next.js frontend or third-party tools to interact with the API.

### Key Endpoints

| Endpoint                     | Method | Purpose                                      |
|------------------------------|--------|----------------------------------------------|
| `/api/employees`             | GET    | List all employees                           |
| `/api/employees/{id}`        | GET    | Get details of a specific employee           |
| `/api/employees`             | POST   | Create a new employee profile                |
| `/api/attendances/clock-in`  | POST   | Record an employee clock-in                  |
| `/api/attendances/clock-out` | POST   | Record an employee clock-out                 |
| `/api/leave-requests`        | POST   | Submit a leave request                       |
| `/api/leave-requests/{id}`   | PUT    | Approve or reject a leave request            |
| `/api/payroll-approvals`     | GET    | View pending or past payroll approvals       |
| `/api/payroll-approvals`     | POST   | Trigger a new payroll batch                  |
| `/api/schedules`             | GET    | List or filter work schedules                |
| `/api/schedules`             | POST   | Create or update an employee’s schedule      |
| `/api/reports/analytics`     | GET    | Fetch dashboard metrics (hours, costs, etc.) |

Each endpoint uses **form requests** for validation, ensures the requester is authenticated, and checks roles via **RoleMiddleware**.

## 5. Hosting Solutions

SIMAS backend runs in the cloud for high availability and easy scaling. Our chosen setup uses Amazon Web Services (AWS):

- **Compute:** EC2 instances in an Auto Scaling Group behind an Application Load Balancer. This distributes incoming traffic and scales capacity automatically.
- **Database:** Amazon RDS for PostgreSQL with Multi-AZ deployment for failover and automated backups.
- **Caching & Queues:** Amazon ElastiCache (Redis) handles caching and powers Laravel’s queue system.
- **Object Storage:** Amazon S3 stores uploaded documents (e.g., payslips, profile photos).
- **DNS & CDN:** Amazon Route 53 for DNS and CloudFront as a CDN to speed up static asset delivery.

Benefits:
- **Reliability:** Managed services with SLAs and automated failover.
- **Scalability:** Auto scaling of EC2 and RDS read replicas as load grows.
- **Cost-Effectiveness:** Pay-as-you-go pricing and the ability to right-size resources.

## 6. Infrastructure Components

- **Load Balancer:** Distributes web traffic across multiple EC2 instances. Performs health checks and provides a single endpoint.
- **Caching Layer:** Redis caches frequent queries (e.g., employee lists) and reduces database load.
- **Queue Workers:** Multiple Laravel workers pull jobs from Redis, handling email sends, report generation, and biometric imports.
- **Content Delivery Network (CDN):** CloudFront caches static assets globally, reducing latency for users.
- **Reverse Proxy & SSL Termination:** Nginx or the AWS load balancer handles HTTPS certificates (managed by AWS Certificate Manager).

All components are defined in Infrastructure as Code (Terraform or AWS CloudFormation) to ensure consistency across environments.

## 7. Security Measures

- **Authentication & Authorization:** Laravel Sanctum or Passport issues secure tokens. RoleMiddleware enforces permissions per endpoint.
- **Data Encryption:**
  - **In Transit:** TLS/HTTPS for all web and API traffic.
  - **At Rest:** AWS encrypts RDS volumes and S3 buckets.
- **Input Validation:** Form requests and server-side rules prevent invalid or malicious data.
- **Rate Limiting:** Throttle endpoints to prevent abuse or brute-force attacks.
- **Audit Logging:** Every change is recorded in the `audit_logs` table with details for compliance.
- **Secrets Management:** Environment variables stored securely (AWS Systems Manager Parameter Store or AWS Secrets Manager).

## 8. Monitoring and Maintenance

### Monitoring Tools
- **Amazon CloudWatch:** Collects logs (Laravel logs, Nginx logs) and metrics (CPU, memory, request latency).
- **Laravel Telescope & Horizon:** Telescope for profiling requests and database queries in staging; Horizon dashboard for queue monitoring.
- **Alerting:** CloudWatch alarms notify the team (via email or Slack) if metrics cross thresholds (e.g., high error rate, low free memory).

### Maintenance Strategies
- **Automated Backups & Patching:** RDS automates backups and minor engine upgrades. EC2 instances follow a patch schedule via AWS Systems Manager.
- **Blue/Green Deployments:** New versions deployed to a separate environment and switched over after testing to minimize downtime.
- **Regular Security Audits:** Quarterly vulnerability scans and code reviews to catch new threats.

## 9. Conclusion and Overall Backend Summary

SIMAS backend is a robust, service-oriented Laravel application designed for reliability, scalability, and security. Key highlights:

- Clear separation of concerns with controllers, services, and middleware.
- A relational database schema optimized for employee management, attendance, leave, payroll, and audit logging.
- RESTful APIs that cleanly connect the Next.js frontend to backend services.
- A cloud-based hosting model on AWS, using managed services for database, caching, queues, and storage.
- Strong security practices, including encrypted communication, role-based access control, and audit logging.
- Comprehensive monitoring and maintenance plans that ensure uptime and performance.

This setup aligns with SIMAS’s goals of streamlining human resource processes, supporting growth, and maintaining data integrity and compliance. The modular structure also leaves room for future enhancements, such as additional biometric integrations or external API consumers.