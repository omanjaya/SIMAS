# SMP Saraswati Attendance System API Documentation

## Overview
The SMP Saraswati Attendance System provides a comprehensive API for managing employee attendance, scheduling, leave requests, and payroll. The API uses token-based authentication with Laravel Sanctum.

## Authentication
All API endpoints (except login) require a Bearer token in the Authorization header:

```
Authorization: Bearer {token}
```

### Login
Authenticate and receive a token:
```
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

Response:
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "admin"
  },
  "token": "token_value",
  "token_type": "Bearer"
}
```

### Logout
Revoke the current token:
```
POST /api/logout
Authorization: Bearer {token}
```

## User Management (Admin Only)

### Get All Users
```
GET /api/users
Authorization: Bearer {token}
```

### Get User
```
GET /api/users/{id}
Authorization: Bearer {token}
```

### Create User
```
POST /api/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "employee_code": "EMP001",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "position": "Teacher",
  "department": "Mathematics",
  "status": "active",
  "role": "teacher"
}
```

## Employee Management (Admin Only)

### Get All Employees
```
GET /api/employees?search={query}&page={page}&per_page={perPage}
Authorization: Bearer {token}
```

### Get Employee Stats
```
GET /api/employees/stats
Authorization: Bearer {token}
```

### Create Employee
```
POST /api/employees
Authorization: Bearer {token}
Content-Type: application/json

{
  "employee_code": "EMP001",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "position": "Teacher",
  "department": "Mathematics",
  "status": "active"
}
```

## Attendance Management

### Clock In
```
POST /api/clock-in
Authorization: Bearer {token}
Content-Type: application/json

{
  "employee_id": 1,
  "attendance_type": "face_recognition",
  "check_in_location": "SMP Saraswati"
}
```

### Clock Out
```
POST /api/clock-out
Authorization: Bearer {token}
Content-Type: application/json

{
  "employee_id": 1,
  "attendance_type": "face_recognition",
  "check_out_location": "SMP Saraswati"
}
```

### Get Attendance Records
```
GET /api/attendances?date={date}&employee_id={id}&page={page}&per_page={perPage}
Authorization: Bearer {token}
```

## Leave Requests

### Get Leave Requests
```
GET /api/leave-requests?status={status}&employee_id={id}&page={page}&per_page={perPage}
Authorization: Bearer {token}
```

### Create Leave Request
```
POST /api/leave-requests
Authorization: Bearer {token}
Content-Type: application/json

{
  "employee_id": 1,
  "leave_type": "sick",
  "start_date": "2025-10-25",
  "end_date": "2025-10-27",
  "reason": "Medical appointment",
  "is_paid": true
}
```

### Approve/Reject Leave Request
```
PUT /api/leave-requests/{id}/approve
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "approved",
  "admin_notes": "Approved"
}
```

## Schedules (Admin Only)

### Get All Schedules
```
GET /api/teacher-schedules?employee_id={id}&period_id={id}&page={page}&per_page={perPage}
Authorization: Bearer {token}
```

### Create Schedule
```
POST /api/teacher-schedules
Authorization: Bearer {token}
Content-Type: application/json

{
  "employee_id": 1,
  "period_id": 1,
  "subject": "Mathematics",
  "class_name": "VII A",
  "day_of_week": "monday",
  "is_active": true
}
```

## Periods (Admin Only)

### Get All Periods
```
GET /api/periods?is_active={true/false}&page={page}&per_page={perPage}
Authorization: Bearer {token}
```

### Create Period
```
POST /api/periods
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Morning",
  "start_time": "07:00:00",
  "end_time": "11:00:00",
  "code": "MOR",
  "order": 1,
  "is_active": true
}
```

## School Calendar (Admin Only)

### Get Calendar Events
```
GET /api/school-calendars?start_date={date}&end_date={date}&event_type={type}&page={page}&per_page={perPage}
Authorization: Bearer {token}
```

### Create Calendar Event
```
POST /api/school-calendars
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Hari Raya Nyepi",
  "description": "National holiday",
  "start_date": "2025-03-22",
  "end_date": "2025-03-22",
  "event_type": "holiday",
  "is_active": true
}
```

## Analytics (Admin Only)

### Attendance Trends
```
GET /api/analytics/attendance-trends?start_date={date}&end_date={date}&department={dept}&group_by={day/week/month}
Authorization: Bearer {token}
```

### Overtime Analysis
```
GET /api/analytics/overtime?start_date={date}&end_date={date}&department={dept}&employee_id={id}
Authorization: Bearer {token}
```

## Role-Based Access
- **Admin**: Full access to all API endpoints
- **Teacher**: Access to attendance, schedules, leave requests, calendar, reports
- **Employee**: Access to attendance, leave requests (for own records), calendar, reports

## Error Responses
API responses follow this structure for errors:
```json
{
  "message": "Error message",
  "errors": {
    "field": ["Validation message"]
  }
}
```