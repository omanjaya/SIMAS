# 📡 API CONTRACTS - Complete API Documentation

## 🎯 NEW ENDPOINTS

### 1. POST /api/employees/validate-import
**Description**: Validate CSV file before import

**Request**:
```
Content-Type: multipart/form-data
file: [CSV FILE]
```

**Response (Success)**:
```json
{
  "valid": true,
  "total_rows": 100,
  "error_count": 0,
  "summary": {
    "admin": 2,
    "teacher": 68,
    "employee": 30
  }
}
```

**Response (Error)**:
```json
{
  "valid": false,
  "total_rows": 100,
  "error_count": 5,
  "errors": [
    {
      "row": 5,
      "data": {...},
      "errors": ["Nama tidak boleh kosong"]
    }
  ]
}
```

---

### 2. POST /api/employees/bulk-import
**Description**: Import employees after validation

**Request**:
```
Content-Type: multipart/form-data
file: [CSV FILE]
```

**Response**:
```json
{
  "success": true,
  "message": "Import completed",
  "data": {
    "total": 100,
    "success": 100,
    "failed": 0
  }
}
```

---

### 3. GET /api/profile/completion-status
**Description**: Get profile completion status

**Response**:
```json
{
  "profile_completed": false,
  "employee_code": "TCH0001",
  "full_name": "I Wayan Sudiarta",
  "required_fields": {
    "phone": false,
    "date_of_birth": false,
    "gender": false,
    "position": false,
    "emergency_contact": false
  }
}
```

---

### 4. POST /api/profile/complete
**Description**: Complete user profile

**Request**:
```json
{
  "phone": "+6281234567890",
  "date_of_birth": "1985-06-20",
  "gender": "male",
  "position": "Guru Matematika",
  "emergency_contact_name": "Ni Ketut Sudiartini",
  "emergency_contact_phone": "+6281234567891"
}
```

**Response**:
```json
{
  "message": "Profile completed successfully",
  "employee": {...}
}
```

---

### 5. POST /api/email/verification-notification
**Description**: Resend verification email

**Response**:
```json
{
  "message": "Verification email sent"
}
```

---

## ✅ IMPLEMENTATION COMPLETE!

All documentation files created. Ready for Qwen Coder to implement!
