# Analytics API Documentation

## Overview
Analytics endpoints provide aggregated data for reporting and visualization.

## Authentication
All endpoints require Bearer token authentication with admin role.

## Endpoints

### 1. GET /api/analytics/attendance-trends

**Description**: Returns attendance statistics over a date range.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| start_date | string (YYYY-MM-DD) | Yes | Start date |
| end_date | string (YYYY-MM-DD) | Yes | End date |
| department | string | No | Filter by department |
| employee_id | integer | No | Filter by specific employee |
| group_by | enum: day, week, month | No | Grouping interval (default: day) |

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "period": { 
      "start": "2025-01-01", 
      "end": "2025-01-31" 
    },
    "trends": [
      {
        "date": "2025-01-01",
        "total_employees": 50,
        "present": 45,
        "late": 3,
        "absent": 2,
        "attendance_rate": 96.0
      }
    ],
    "summary": {
      "avg_attendance_rate": 94.5,
      "total_working_days": 22,
      "peak_attendance_date": "2025-01-15",
      "lowest_attendance_date": "2025-01-03"
    }
  }
}
```

**Example**:
```bash
curl -X GET "http://localhost:8000/api/analytics/attendance-trends?start_date=2025-01-01&end_date=2025-01-31&group_by=day" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. GET /api/analytics/overtime

**Description**: Returns overtime analysis for employees.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| start_date | string (YYYY-MM-DD) | Yes | Start date |
| end_date | string (YYYY-MM-DD) | Yes | End date |
| department | string | No | Filter by department |
| employee_id | integer | No | Filter by specific employee |
| threshold_hours | number | No | Normal working hours per day (default: 8) |

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "overtime_summary": {
      "total_overtime_hours": 245.5,
      "total_employees": 15,
      "avg_overtime_per_employee": 16.37
    },
    "by_employee": [
      {
        "employee_id": 1,
        "employee_name": "John Doe",
        "department": "IT",
        "total_hours_worked": 180.5,
        "regular_hours": 160,
        "overtime_hours": 20.5,
        "overtime_days": 8
      }
    ],
    "by_department": [
      {
        "department": "IT",
        "total_overtime_hours": 85.5,
        "employee_count": 5
      }
    ]
  }
}
```

**Example**:
```bash
curl -X GET "http://localhost:8000/api/analytics/overtime?start_date=2025-01-01&end_date=2025-01-31&threshold_hours=8" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. GET /api/analytics/leave-forecast

**Description**: Returns leave balance forecast for employees.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| year | integer | Yes | Year for forecast |
| department | string | No | Filter by department |
| employee_id | integer | No | Filter by specific employee |

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "forecast_year": 2025,
    "employees": [
      {
        "employee_id": 1,
        "employee_name": "John Doe",
        "department": "IT",
        "leave_entitlement": 12,
        "leave_taken": 5,
        "leave_pending": 2,
        "leave_remaining": 5,
        "forecast_exhausted_date": "2025-09-15",
        "risk_level": "low"
      }
    ],
    "summary": {
      "total_leave_taken": 245,
      "total_leave_pending": 45,
      "avg_remaining_per_employee": 6.5,
      "high_risk_employees": 3
    }
  }
}
```

**Example**:
```bash
curl -X GET "http://localhost:8000/api/analytics/leave-forecast?year=2025" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. GET /api/analytics/payroll-cost

**Description**: Returns payroll cost analysis.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| start_date | string (YYYY-MM-DD) | Yes | Start date |
| end_date | string (YYYY-MM-DD) | Yes | End date |
| department | string | No | Filter by department |
| group_by | enum: month, department, position | No | Grouping criteria |

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "period": { 
      "start": "2025-01-01", 
      "end": "2025-12-31" 
    },
    "total_cost": 5500000000,
    "by_month": [
      {
        "month": "2025-01",
        "total_gross": 500000000,
        "total_allowances": 50000000,
        "total_deductions": 25000000,
        "total_net": 525000000,
        "employee_count": 50
      }
    ],
    "by_department": [
      {
        "department": "IT",
        "total_cost": 1200000000,
        "employee_count": 10,
        "avg_salary": 120000000
      }
    ],
    "by_position": [
      {
        "position": "Senior Developer",
        "total_cost": 800000000,
        "employee_count": 5,
        "avg_salary": 160000000
      }
    ]
  }
}
```

**Example**:
```bash
curl -X GET "http://localhost:8000/api/analytics/payroll-cost?start_date=2025-01-01&end_date=2025-12-31&group_by=month" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    // Validation errors if applicable
  }
}
```

## Rate Limiting

Analytics endpoints are cached for 5 minutes to improve performance.

## Caching

Responses are cached for 5 minutes using Redis or file cache. Cache is automatically invalidated when relevant data changes.