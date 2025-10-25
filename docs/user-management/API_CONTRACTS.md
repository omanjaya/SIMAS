# API Contracts Documentation
## Employee Management APIs - TIER 1 Features

**Version:** 1.0
**Base URL:** `/api`
**Authentication:** Bearer Token (Laravel Sanctum)

---

## Table of Contents
1. [Authentication](#authentication)
2. [Employee List & Filter](#employee-list--filter)
3. [Employee Stats](#employee-stats)
4. [Filter Options](#filter-options)
5. [Bulk Import](#bulk-import)
6. [Export](#export)
7. [Error Responses](#error-responses)

---

## Authentication

All API requests require authentication using Laravel Sanctum token.

**Header:**
```
Authorization: Bearer {token}
```

**Token Source:** Retrieved from login endpoint
```javascript
const token = localStorage.getItem('token');
```

---

## Employee List & Filter

### GET /api/employees

**Description:** Get paginated list of employees with optional filters

**Query Parameters:**

| Parameter       | Type    | Required | Description                    | Example                 |
|-----------------|---------|----------|--------------------------------|-------------------------|
| page            | integer | No       | Page number (default: 1)       | `?page=2`               |
| per_page        | integer | No       | Items per page (default: 10)   | `?per_page=25`          |
| search          | string  | No       | Search in name/email           | `?search=john`          |
| status          | string  | No       | Filter by status               | `?status=active`        |
| role            | string  | No       | Filter by role                 | `?role=teacher`         |
| position        | string  | No       | Filter by position             | `?position=Guru%20IPA`  |
| department      | string  | No       | Filter by department           | `?department=Science`   |
| hire_date_from  | date    | No       | Hired on or after (YYYY-MM-DD) | `?hire_date_from=2025-01-01` |
| hire_date_to    | date    | No       | Hired on or before (YYYY-MM-DD)| `?hire_date_to=2025-12-31`   |
| has_biometric   | boolean | No       | Has biometric data             | `?has_biometric=true`   |

**Status Values:**
- `active`
- `on_leave`
- `suspended`

**Role Values:**
- `admin`
- `teacher`
- `employee`

**Example Request:**
```bash
GET /api/employees?status=active&role=teacher&page=1&per_page=10
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@school.com",
      "phone": "+6281234567890",
      "position": "Guru Matematika",
      "department": "Mathematics",
      "status": "active",
      "role": "teacher",
      "hire_date": "2025-01-15",
      "has_biometric": true,
      "avatar_url": "https://example.com/avatars/1.jpg",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-10-20T15:30:00Z"
    },
    // ... more employees
  ],
  "total": 180,
  "current_page": 1,
  "last_page": 18,
  "per_page": 10,
  "from": 1,
  "to": 10
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Unauthenticated."
}
```

**Error Response (422 Validation Error):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "status": ["Invalid status value"],
    "hire_date_from": ["Invalid date format"]
  }
}
```

---

## Employee Stats

### GET /api/employees/stats

**Description:** Get employee statistics for dashboard cards

**Query Parameters:** None

**Example Request:**
```bash
GET /api/employees/stats
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total_active": 254,
    "total_active_trend": 5.2,
    "total_teachers": 180,
    "total_teachers_trend": 2.1,
    "total_staff": 74,
    "total_staff_trend": 8.3,
    "on_leave_today": 3,
    "on_leave_today_trend": -1,
    "last_updated": "2025-10-20T10:30:00Z"
  }
}
```

**Field Descriptions:**

| Field                    | Type   | Description                                      |
|--------------------------|--------|--------------------------------------------------|
| total_active             | int    | Count of employees with status='active'          |
| total_active_trend       | float  | Percentage change vs last month                  |
| total_teachers           | int    | Count of active teachers                         |
| total_teachers_trend     | float  | Percentage change vs last month                  |
| total_staff              | int    | Count of active staff/employees                  |
| total_staff_trend        | float  | Percentage change vs last month                  |
| on_leave_today           | int    | Count of employees on leave today                |
| on_leave_today_trend     | int    | Absolute change vs yesterday                     |
| last_updated             | string | ISO 8601 timestamp of last calculation           |

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Unauthenticated."
}
```

---

## Filter Options

### GET /api/employees/filter-options

**Description:** Get available filter options with counts

**Query Parameters:** None

**Example Request:**
```bash
GET /api/employees/filter-options
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "positions": [
      {
        "value": "Guru Matematika",
        "label": "Guru Matematika",
        "count": 45
      },
      {
        "value": "Guru IPA",
        "label": "Guru IPA",
        "count": 38
      },
      {
        "value": "Guru Bahasa Indonesia",
        "label": "Guru Bahasa Indonesia",
        "count": 32
      },
      {
        "value": "Staff TU",
        "label": "Staff TU",
        "count": 15
      }
    ],
    "departments": [
      {
        "value": "Science",
        "label": "Science",
        "count": 85
      },
      {
        "value": "Mathematics",
        "label": "Mathematics",
        "count": 50
      },
      {
        "value": "Language",
        "label": "Language",
        "count": 40
      },
      {
        "value": "Administration",
        "label": "Administration",
        "count": 20
      }
    ]
  }
}
```

**Note:** Only unique, non-empty values are returned, sorted alphabetically.

---

## Bulk Import

### 1. Download Template

#### GET /api/employees/import-template

**Description:** Download Excel template for bulk import

**Query Parameters:** None

**Example Request:**
```bash
GET /api/employees/import-template
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Success Response (200 OK):**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename="employees_template.xlsx"`
- File contains example data and headers

**Template Structure:**
```
| first_name | last_name | email            | phone          | position        | department | status | role    | hire_date  |
|------------|-----------|------------------|----------------|-----------------|------------|--------|---------|------------|
| John       | Doe       | john@school.com  | +6281234567890 | Guru Matematika | Math       | active | teacher | 2025-01-15 |
```

---

### 2. Check Duplicate Emails

#### POST /api/employees/check-duplicates

**Description:** Check if emails already exist in database

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "emails": [
    "john@school.com",
    "jane@school.com",
    "bob@school.com"
  ]
}
```

**Example Request:**
```bash
POST /api/employees/check-duplicates
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
Content-Type: application/json

{
  "emails": ["john@school.com", "jane@school.com"]
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "duplicates": [
      "john@school.com"
    ]
  }
}
```

**Field Descriptions:**

| Field      | Type  | Description                          |
|------------|-------|--------------------------------------|
| duplicates | array | List of emails that already exist    |

---

### 3. Bulk Import

#### POST /api/employees/bulk-import

**Description:** Import multiple employees from file or JSON array

**Content-Type:** `multipart/form-data` OR `application/json`

**Option 1: File Upload (multipart/form-data)**

**Request Body:**
```
file: [Excel/CSV file]
```

**Example Request:**
```bash
POST /api/employees/bulk-import
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="file"; filename="employees.xlsx"
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

[binary file content]
--boundary--
```

**Option 2: JSON Array (application/json)**

**Request Body:**
```json
{
  "rows": [
    {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@school.com",
      "phone": "+6281234567890",
      "position": "Guru Matematika",
      "department": "Mathematics",
      "status": "active",
      "role": "teacher",
      "hire_date": "2025-01-15"
    },
    {
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane@school.com",
      "phone": "+6281234567891",
      "position": "Staff TU",
      "department": "Administration",
      "status": "active",
      "role": "employee",
      "hire_date": "2025-02-01"
    }
  ]
}
```

**Validation Rules:**

| Field      | Required | Type   | Max Length | Validation                           |
|------------|----------|--------|------------|--------------------------------------|
| first_name | Yes      | string | 100        | Letters and spaces only              |
| last_name  | Yes      | string | 100        | Letters and spaces only              |
| email      | Yes      | email  | 255        | Valid email, unique                  |
| phone      | No       | string | 20         | Format: +62xxx or 08xxx              |
| position   | No       | string | 100        | -                                    |
| department | No       | string | 100        | -                                    |
| status     | No       | enum   | -          | active, on_leave, suspended          |
| role       | No       | enum   | -          | admin, teacher, employee             |
| hire_date  | No       | date   | -          | Format: YYYY-MM-DD                   |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Import completed",
  "data": {
    "total": 100,
    "success": 95,
    "failed": 5,
    "errors": [
      {
        "row": 3,
        "email": "duplicate@school.com",
        "message": "Email already exists"
      },
      {
        "row": 12,
        "message": "Missing required field: first_name"
      },
      {
        "row": 45,
        "email": "invalid@email",
        "message": "Invalid email format"
      },
      {
        "row": 67,
        "message": "Invalid status value: 'inactive'"
      },
      {
        "row": 89,
        "message": "Invalid hire_date format"
      }
    ]
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "file": ["The file must be a file of type: xlsx, csv."],
    "rows": ["The rows field is required when file is not present."]
  }
}
```

**Error Response (413 Payload Too Large):**
```json
{
  "success": false,
  "message": "File too large. Maximum 10MB allowed."
}
```

**Error Response (422 Unprocessable Entity):**
```json
{
  "success": false,
  "message": "Too many rows. Maximum 1000 rows per import."
}
```

---

## Export

### POST /api/employees/export

**Description:** Export employees to Excel/CSV with optional filters

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "format": "xlsx",
  "filters": {
    "status": "active",
    "role": "teacher",
    "position": "Guru Matematika",
    "department": "Mathematics",
    "hire_date_from": "2025-01-01",
    "hire_date_to": "2025-12-31"
  }
}
```

**Field Descriptions:**

| Field   | Type   | Required | Description                    | Values       |
|---------|--------|----------|--------------------------------|--------------|
| format  | string | Yes      | Export file format             | xlsx, csv    |
| filters | object | No       | Same filters as GET /employees | -            |

**Example Request:**
```bash
POST /api/employees/export
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
Content-Type: application/json

{
  "format": "xlsx",
  "filters": {
    "status": "active",
    "role": "teacher"
  }
}
```

**Success Response (200 OK):**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (xlsx)
  OR `text/csv` (csv)
- Content-Disposition: `attachment; filename="employees_export_2025-10-20.xlsx"`
- File contains filtered employee data

**Export Columns:**
```
| ID | First Name | Last Name | Email | Phone | Position | Department | Status | Role | Hire Date | Created At |
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid format. Must be xlsx or csv."
}
```

---

## Error Responses

### Standard Error Format

All error responses follow this structure:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": {
    "field_name": ["Error detail 1", "Error detail 2"]
  }
}
```

### HTTP Status Codes

| Status Code | Description           | Common Causes                          |
|-------------|-----------------------|----------------------------------------|
| 200         | OK                    | Request successful                     |
| 400         | Bad Request           | Invalid request format                 |
| 401         | Unauthorized          | Missing or invalid token               |
| 403         | Forbidden             | Insufficient permissions               |
| 404         | Not Found             | Resource doesn't exist                 |
| 413         | Payload Too Large     | File size exceeds limit                |
| 422         | Unprocessable Entity  | Validation failed                      |
| 500         | Internal Server Error | Server error (check logs)              |

### Common Error Messages

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthenticated."
}
```

**Solution:** Ensure Authorization header is included with valid token.

#### 422 Validation Error
```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email has already been taken."],
    "first_name": ["The first name field is required."]
  }
}
```

**Solution:** Fix validation errors in request body.

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Server Error"
}
```

**Solution:** Check server logs, contact administrator.

---

## Rate Limiting

API requests are rate limited to prevent abuse.

**Limits:**
- **General endpoints:** 60 requests per minute
- **Bulk import:** 5 requests per hour
- **Export:** 10 requests per hour

**Rate Limit Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1698765432
```

**Rate Limit Exceeded (429 Too Many Requests):**
```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "retry_after": 60
}
```

---

## Testing with cURL

### Get Employees
```bash
curl -X GET "http://localhost:8000/api/employees?status=active&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Get Stats
```bash
curl -X GET "http://localhost:8000/api/employees/stats" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Check Duplicates
```bash
curl -X POST "http://localhost:8000/api/employees/check-duplicates" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"emails":["john@school.com","jane@school.com"]}'
```

### Bulk Import (JSON)
```bash
curl -X POST "http://localhost:8000/api/employees/bulk-import" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "rows": [
      {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@school.com",
        "status": "active",
        "role": "teacher"
      }
    ]
  }'
```

### Export
```bash
curl -X POST "http://localhost:8000/api/employees/export" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"format":"xlsx","filters":{"status":"active"}}' \
  --output employees_export.xlsx
```

---

## Environment Variables

Required backend environment variables:

```env
# Database
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=simas_saraswati
DB_USERNAME=postgres
DB_PASSWORD=secret

# Laravel Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DRIVER=cookie

# File Upload
UPLOAD_MAX_SIZE=10240  # 10MB in KB
BULK_IMPORT_MAX_ROWS=1000
```

---

## Postman Collection

A Postman collection is available for testing all endpoints:

**Download:** `/docs/postman/SIMAS_Employee_Management.postman_collection.json`

**Import to Postman:**
1. Open Postman
2. File → Import
3. Select the JSON file
4. Update `{{base_url}}` and `{{token}}` variables

---

**End of API Contracts Documentation**
