# Bulk Biometric Enrollment - CSV Format Specification

## Overview
This document specifies the required format for CSV files used in the bulk biometric enrollment feature.

## File Format
- File must be in CSV (Comma-Separated Values) format
- UTF-8 encoding is required
- First row must contain headers (column names)
- Maximum file size: 10MB

## Required Columns

### employee_code (Required)
- **Description**: Unique identifier for the employee
- **Format**: Alphanumeric string (e.g., EMP001, TEACHER123)
- **Validation**: Must match existing employee record in the system

### image_path (Required)
- **Description**: Path to the face image or base64 encoded image data
- **Format**: Either:
  - Path to image file in storage (e.g., `/images/employee1.jpg`)
  - Base64 encoded image string (e.g., `data:image/jpeg;base64,/9j/4AAQSkZJRg...`)
- **Supported formats**: JPG, PNG, JPEG, GIF
- **Quality requirements**: Clear face image, front-facing, good lighting

## Example CSV Content
```
employee_code,image_path
EMP001,/images/employees/employee1.jpg
EMP002,/images/employees/employee2.jpg
EMP003,data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...
EMP004,/images/employees/employee4.png
```

## Validation Rules
1. Each line must have both `employee_code` and `image_path` values
2. Employee must exist in the system (validated against employees table)
3. Image file must exist in storage or be a valid base64 string
4. Maximum 10,000 rows per file (enforced by system)

## Processing Results
After upload, the system will process each row and provide:
- Total records processed
- Successful enrollments
- Failed records with specific error messages
- Success rate percentage

## Error Handling
Common error scenarios:
- **Employee not found**: `employee_code` doesn't match any existing employee
- **Invalid image**: `image_path` doesn't point to a valid image file
- **Corrupted data**: Malformed CSV or invalid base64 string
- **Permission denied**: User doesn't have admin privileges

## Best Practices
1. Always test with a small sample file first
2. Ensure employee codes exactly match the system records
3. Verify image files are accessible and in correct format
4. Keep file sizes manageable (under 5MB recommended)
5. Include error handling in the CSV creation process

## Template
Use the following template for your CSV files:

```csv
employee_code,image_path
EMP001,
EMP002,
EMP003,
```

Replace the placeholders with actual employee codes and image paths before uploading.