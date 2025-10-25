# Admin Tools & Governance Features (Phase 10)

This document provides detailed information about the new admin tools and governance features added to the SIMAS Saraswati attendance system.

## Table of Contents
1. [Face Template Bulk Enrollment](#face-template-bulk-enrollment)
2. [Audit Logs](#audit-logs)
3. [System Configuration](#system-configuration)
4. [Backup & Restore](#backup--restore)
5. [API Endpoints](#api-endpoints)
6. [Database Changes](#database-changes)

## Face Template Bulk Enrollment

### Overview
The bulk enrollment feature allows administrators to import multiple face templates at once using a CSV file. This is particularly useful for enrolling many employees simultaneously.

### CSV Format
The CSV file must contain the following columns:
- `employee_code`: The unique employee code (must match existing employee records)
- `image_path`: Path to the image file in storage or base64 encoded image data

Example:
```
employee_code,image_path
EMP001,/images/employee1.jpg
EMP002,/images/employee2.jpg
EMP003,/images/employee3.jpg
```

### Process
1. Upload CSV file through the admin interface
2. System validates each record against existing employees
3. Processing happens in background using queue jobs
4. Results are stored in the biometric_imports table
5. Success/error rates are displayed in the import history

### API Endpoints
- `POST /api/biometrics/bulk-enrollment` - Upload and process CSV
- `GET /api/biometrics/imports` - Get import history
- `GET /api/biometrics/imports/{id}` - Get specific import details

## Audit Logs

### Overview
Comprehensive logging of system activities to maintain security and compliance. All important user actions are automatically logged.

### What's Logged
- Login/logout events
- CRUD operations on sensitive data
- Payroll processing and approvals
- Leave request approvals/rejections
- Setting changes
- Backup creation and restoration
- Any action that modifies system state

### Log Details
Each audit log entry contains:
- User ID and information
- Action performed
- Model affected
- Payload with request/response data
- IP address
- User agent
- Timestamp

### API Endpoints
- `GET /api/audit-logs` - Retrieve audit logs with filtering options
- `GET /api/audit-logs/{id}` - Get specific audit log entry

### Filters Available
- `user_id`: Filter by specific user
- `action`: Filter by action type
- `model`: Filter by model affected
- `date_from`: Filter from specific date
- `date_to`: Filter to specific date
- `search`: Search term for action field

## System Configuration

### Overview
Centralized system configuration management through the admin interface. Allows administrators to configure various operational parameters without code changes.

### Configuration Categories

#### Geofence Settings
- `geofence.radius`: Maximum distance (in meters) from work location for valid clock-in/out
- `geofence.center_lat`: Latitude of work location center
- `geofence.center_lng`: Longitude of work location center

#### Payroll Settings
- `payroll.tax_percentage`: Default tax percentage
- `payroll.overtime_rate`: Overtime pay multiplier
- `payroll.calculation_method`: Payroll calculation method

#### Notification Settings
- `notification.email_enabled`: Enable email notifications
- `notification.sms_enabled`: Enable SMS notifications
- `notification.attendance_reminder`: Enable attendance reminder notifications

### API Endpoints
- `GET /api/settings` - Retrieve all settings
- `GET /api/settings/{key}` - Get specific setting
- `PUT /api/settings/{key}` - Update specific setting
- `POST /api/settings/bulk-update` - Update multiple settings at once

## Backup & Restore

### Overview
Comprehensive backup and restore functionality for system data and files to ensure business continuity.

### Backup Process
- Creates a zip archive containing:
  - Database dump (SQL format)
  - Storage files (images, documents, etc.)
- Stored in `storage/app/backups/` directory
- Uses Artisan commands for reliability

### Artisan Commands
- `php artisan attendance:backup` - Create a backup
- `php artisan attendance:restore {filename}` - Restore from backup
- `php artisan attendance:list-backups` - List available backups

### API Endpoints
- `POST /api/backups/run` - Create new backup via API
- `GET /api/backups` - List available backups
- `GET /api/backups/{filename}` - Get backup details
- `GET /api/backups/{filename}/download` - Download backup file

### Restore Process
> **Important**: The restore process is currently designed as a manual procedure for security reasons. 
> To restore from a backup, please contact your system administrator who can run the 
> restore command directly on the server. The web interface for restore will be 
> implemented in a future release after proper approval workflows are established.

## API Endpoints

### Biometric Bulk Enrollment
```
POST /api/biometrics/bulk-enrollment
GET /api/biometrics/imports
GET /api/biometrics/imports/{id}
```

### Audit Logs
```
GET /api/audit-logs
GET /api/audit-logs/{id}
```

### Settings Management
```
GET /api/settings
GET /api/settings/{key}
PUT /api/settings/{key}
POST /api/settings/bulk-update
```

### Backup Management
```
POST /api/backups/run
GET /api/backups
GET /api/backups/{filename}
GET /api/backups/{filename}/download
```

## Database Changes

### New Tables

#### audit_logs
- `id`: Primary key
- `user_id`: User who performed the action (nullable)
- `action`: Action performed (e.g., "EmployeeController@update")
- `model`: Model affected (e.g., "Employee")
- `payload`: JSON payload with request/response data
- `ip_address`: IP address of the request
- `user_agent`: User agent string
- `created_at`: Timestamp

#### biometric_imports
- `id`: Primary key
- `filename`: Name of the imported file
- `user_id`: User who initiated the import
- `total_records`: Total number of records in the file
- `successful_records`: Number of records processed successfully
- `failed_records`: Number of records that failed processing
- `summary`: JSON summary of results
- `errors`: JSON array of errors
- `status`: Current status (pending, processing, completed, failed)
- `completed_at`: When processing was completed
- `created_at`: When import was created

#### settings
- `id`: Primary key
- `key`: Unique setting key
- `value`: Setting value (text format)
- `type`: Data type (string, integer, boolean, json)
- `category`: Setting category (geofence, payroll, notification, etc.)
- `description`: Human-readable description
- `is_public`: Whether the setting can be accessed by non-admins
- `created_at`: When setting was created
- `updated_at`: When setting was last updated

## Security Considerations

### Access Control
- All new API endpoints require admin role authentication
- Audit logs are automatically generated for all important actions
- Backup downloads are logged for security tracking

### Data Protection
- Backup files are stored securely with restricted access
- Only administrators can create, download, or restore backups
- Sensitive configuration values are properly validated

### Compliance
- Audit logs maintain detailed records of system changes
- Configuration changes are logged for compliance tracking
- Backup procedures follow industry best practices