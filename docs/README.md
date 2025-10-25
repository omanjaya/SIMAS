# SIMAS Saraswati Documentation

## Overview

This directory contains comprehensive documentation for the SMP Saraswati Attendance System (SIMAS).

## 📁 Documentation Structure

### **Development** (`development/`)
- `DESIGN_SYSTEM.md` - UI/UX design system and component guidelines
- `STYLE_GUIDE.md` - Implementation guide for design system
- `PHASE_8_SUMMARY.md` - Payroll system implementation summary
- `FRONTEND_COMPLETENESS_SUMMARY.md` - Frontend implementation status

### **API Documentation** (`api/`)
- `API_DOCUMENTATION.md` - Complete REST API reference

### **Guides** (`guides/`)
- `user-management/` - User management system documentation
  - `README.md` - User management overview
  - `IMPLEMENTATION_GUIDE.md` - Implementation guide
  - `API_CONTRACTS.md` - API specifications
  - `BULK_IMPORT_SPEC.md` - Bulk import format specification
  - `ADVANCED_FILTER_SPEC.md` - Advanced filtering features
  - `QUICK_STATS_SPEC.md` - Statistics specifications
  - `TIER1_USER_MANAGEMENT.md` - Tier 1 user management features

- `simplified-import-system/` - Import system documentation
  - `README.md` - Import system overview
  - `01_DATABASE_SCHEMA.md` - Database schema
  - `02_BACKEND_SERVICES.md` - Backend services
  - `03_BACKEND_VALIDATION.md` - Backend validation
  - `04_BACKEND_PROFILE.md` - Backend profile management
  - `05_BACKEND_EMAIL.md` - Backend email services
  - `06_FRONTEND_IMPORT.md` - Frontend import interface
  - `07_FRONTEND_PROFILE.md` - Frontend profile management
  - `08_FRONTEND_ADMIN.md` - Frontend admin interface
  - `09_TESTING.md` - Testing documentation
  - `10_API_CONTRACTS.md` - API contracts

### **General Documentation** (`guides/`)
- `ADMIN_TOOLS_DOCUMENTATION.md` - Admin tools documentation
- `ANALYTICS_USER_GUIDE.md` - Analytics feature guide
- `CSV_BULK_ENROLLMENT_FORMAT.md` - CSV bulk enrollment format

## 🚀 Getting Started

1. **For Developers**: Start with `development/DESIGN_SYSTEM.md`
2. **For API Users**: Start with `api/API_DOCUMENTATION.md`
3. **For System Administrators**: Start with `guides/ADMIN_TOOLS_DOCUMENTATION.md`

## 📊 System Features

### Core Features
- **Multi-role Authentication** (Admin, Teacher, Employee)
- **Employee Management** with bulk operations
- **Attendance Management** with face recognition
- **Leave Request System** with approval workflows
- **Advanced Payroll System** with tax calculations
- **School Calendar Management**
- **Teacher Schedule Management**

### Advanced Features
- **Face Recognition** (biometric attendance)
- **Progressive Tax Calculation** (PPh 21)
- **Payroll Approval Workflows**
- **Bulk Payroll Generation**
- **Email Payslip Distribution**
- **Geofencing & Location Tracking**
- **Comprehensive Analytics & Reporting**

## 🛠 Tech Stack

- **Backend**: Laravel 12 (PHP 8.2+) with PostgreSQL
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Authentication**: Laravel Sanctum
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL 15+

## 📞 Support

For technical support or questions about the documentation, please refer to the main project README.md or contact the development team.