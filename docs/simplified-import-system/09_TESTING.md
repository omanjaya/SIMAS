# 🧪 TESTING - Test Cases & Scenarios

## 📋 TEST SCENARIOS

### 1. ✅ Import with All Valid Data
- Upload CSV with 4 columns, all data valid
- Expected: Show preview, import success

### 2. ❌ Import with Empty Name
- Row has empty full_name
- Expected: Show error "Nama tidak boleh kosong (Baris X)"

### 3. ❌ Import with Invalid Email
- Row has invalid email format
- Expected: Show error "Email format tidak valid"

### 4. ❌ Import with Duplicate Email (Database)
- Row email already exists in database
- Expected: Show error "Email sudah terdaftar: {email} digunakan oleh {code}"

### 5. ❌ Import with Duplicate Email (File)
- Two rows have same email in file
- Expected: Show error "Email duplicate dalam file"

### 6. ❌ Import with Future Hire Date
- Row hire_date is future date
- Expected: Show error "Hire date tidak boleh masa depan"

### 7. ❌ Import with Invalid Role
- Row role is "guru" instead of "teacher"
- Expected: Show error "Role tidak valid: 'guru'"

### 8. ✅ Employee Code Generation
- Import 5 teacher, 3 admin, 2 employee
- Expected: TCH0001-TCH0005, ADM0001-ADM0003, STF0001-STF0002

### 9. ✅ Password Generation
- Employee code: TCH0001
- Expected password: TCH0001@Saraswati

### 10. ✅ First Login Redirect
- User login with incomplete profile
- Expected: Redirect to /complete-profile

### 11. ✅ Complete Profile
- User submit complete profile form
- Expected: profile_completed = true, redirect to dashboard

### 12. ✅ Access Dashboard After Complete
- User with completed profile access dashboard
- Expected: Access granted

---

**Next**: [10_API_CONTRACTS.md](./10_API_CONTRACTS.md)
