<?php

use App\Http\Controllers\Api\AttendanceAnalyticsController;
use App\Http\Controllers\API\AttendanceController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\BackupController;
use App\Http\Controllers\Api\BiometricEnrollmentController;
use App\Http\Controllers\Api\BulkImportController;
use App\Http\Controllers\API\BulkUserController;
use App\Http\Controllers\API\EmployeeController;
use App\Http\Controllers\API\EmployeeScheduleController;
use App\Http\Controllers\API\FaceTemplateController;
use App\Http\Controllers\API\FaceEnrollmentController;
use App\Http\Controllers\API\LeaveRequestController;
use App\Http\Controllers\API\LocationController;
use App\Http\Controllers\API\MyAttendanceController;
use App\Http\Controllers\API\MyDashboardController;
use App\Http\Controllers\API\MyProfileController;
use App\Http\Controllers\API\MyScheduleController;
use App\Http\Controllers\API\AttendanceCorrectionController;
use App\Http\Controllers\API\PasswordManagementController;
use App\Http\Controllers\API\PayrollApprovalController;
use App\Http\Controllers\API\PeriodController;
use App\Http\Controllers\Api\ProfileCompletionController;
use App\Http\Controllers\API\SalaryController;
use App\Http\Controllers\API\SchoolCalendarController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\API\TeacherScheduleController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\UserImportController;
use App\Http\Controllers\API\AttendanceValidationController;
use App\Http\Controllers\Auth\AuthenticateController;
use App\Http\Controllers\Auth\ProfileController;
use App\Http\Controllers\Auth\RegisterController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthenticateController::class, 'login'])->middleware(['guest', 'throttle:5,1']);

// Authenticated routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthenticateController::class, 'logout']);
    Route::get('/me', [AuthenticateController::class, 'me']);

    // Profile management
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    // Employee management (Admin only)
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/employees/stats', [EmployeeController::class, 'getStats']);
        Route::get('/employees/filter-options', [EmployeeController::class, 'getFilterOptions']);
        Route::apiResource('employees', EmployeeController::class)->whereNumber('employee');

        // Bulk import routes
        Route::get('/employees/import-template', [BulkImportController::class, 'downloadTemplate']);
        Route::post('/employees/check-duplicates', [EmployeeController::class, 'checkDuplicates']);
        Route::post('/employees/bulk-import', [BulkImportController::class, 'import']);

        // Export route
        Route::post('/employees/export', [EmployeeController::class, 'export']);

        // Additional duplicate check route
        Route::post('/employees/check-duplicate-codes', [EmployeeController::class, 'checkDuplicateCodes']);

        // Profile completion routes
        Route::get('/profile-completion/status', [ProfileCompletionController::class, 'getStatus']);
        Route::post('/profile-completion/complete', [ProfileCompletionController::class, 'completeProfile']);
        Route::put('/profile-completion/update', [ProfileCompletionController::class, 'updateProfile']);

        // Simplified import template
        Route::get('/employees/simplified-template', [BulkImportController::class, 'downloadSimplifiedTemplate']);
        Route::apiResource('periods', PeriodController::class);
        Route::apiResource('teacher-schedules', TeacherScheduleController::class);
        Route::apiResource('school-calendars', SchoolCalendarController::class);
        Route::apiResource('face-templates', FaceTemplateController::class);
        Route::apiResource('salaries', SalaryController::class);
        Route::apiResource('locations', LocationController::class);
        Route::get('/locations/{location}/audit-logs', [LocationController::class, 'auditLogs']);
        Route::get('/locations-stats', [LocationController::class, 'stats']);
        Route::apiResource('employee-schedules', EmployeeScheduleController::class);
        Route::get('/employees/{employee}/schedules', [EmployeeScheduleController::class, 'getEmployeeSchedules']);
        Route::post('/employees/{employee}/schedules/bulk-assign', [EmployeeScheduleController::class, 'bulkAssign']);
        // Admin can manage leave requests: list all, view any, but not store (that's user-specific)
        Route::apiResource('leave-requests', LeaveRequestController::class)->only(['index', 'show', 'destroy', 'update']);

        // Export payroll data
        Route::get('/payroll/export', [SalaryController::class, 'exportPayroll']);

        // Payroll Approval Management (Admin only)
        Route::apiResource('payroll-approvals', PayrollApprovalController::class)->only(['index', 'show']);
        Route::post('/payroll/generate-bulk', [PayrollApprovalController::class, 'generateBulk']);
        Route::get('/payroll/summary', [PayrollApprovalController::class, 'summary']);
        Route::post('/payroll-approvals/{id}/approve', [PayrollApprovalController::class, 'approve']);
        Route::post('/payroll-approvals/{id}/reject', [PayrollApprovalController::class, 'reject']);
        Route::post('/payroll-approvals/bulk-approve', [PayrollApprovalController::class, 'bulkApprove']);
        Route::post('/payroll-approvals/{id}/send-payslip', [PayrollApprovalController::class, 'sendPayslip']);
        Route::post('/payroll-approvals/bulk-send-payslips', [PayrollApprovalController::class, 'bulkSendPayslips']);

        // User management
        Route::apiResource('users', UserController::class);
        Route::post('/users/{user}/restore', [UserController::class, 'restore']);

        // Bulk user operations
        Route::prefix('users')->group(function () {
            Route::post('/bulk-status-update', [BulkUserController::class, 'bulkUpdateStatus']);
            Route::post('/bulk-role-assign', [BulkUserController::class, 'bulkAssignRole']);
            Route::post('/bulk-password-reset', [BulkUserController::class, 'bulkResetPassword']);
        });

        // User import functionality
        Route::prefix('user-import')->group(function () {
            Route::post('/import', [UserImportController::class, 'import']);
            Route::get('/template', [UserImportController::class, 'downloadTemplate']);
            Route::post('/preview', [UserImportController::class, 'preview']);
        });

        // Password management
        Route::prefix('password-management')->group(function () {
            Route::post('/{user}/force-change', [PasswordManagementController::class, 'forcePasswordChange']);
            Route::post('/{user}/generate-random', [PasswordManagementController::class, 'generateRandomPassword']);
            Route::post('/{user}/reset', [PasswordManagementController::class, 'resetPassword']);
        });

        // User registration (Admin only)
        Route::post('/users', [RegisterController::class, 'store']);

        // Biometric bulk enrollment routes
        Route::prefix('biometrics')->group(function () {
            Route::post('/bulk-enrollment', [BiometricEnrollmentController::class, 'bulkEnrollment']);
            Route::get('/imports', [BiometricEnrollmentController::class, 'getImportHistory']);
            Route::get('/imports/{id}', [BiometricEnrollmentController::class, 'getImportDetails']);
        });

        // Settings routes
        Route::prefix('settings')->group(function () {
            Route::get('/', [SettingsController::class, 'index']);
            Route::get('/{key}', [SettingsController::class, 'show']);
            Route::put('/{key}', [SettingsController::class, 'update']);
            Route::post('/bulk-update', [SettingsController::class, 'bulkUpdate']);
        });

        // Backup routes
        Route::prefix('backups')->group(function () {
            Route::post('/run', [BackupController::class, 'runBackup']);
            Route::get('/', [BackupController::class, 'getBackups']);
            Route::get('/{filename}', [BackupController::class, 'getBackup']);
            Route::get('/{filename}/download', [BackupController::class, 'downloadBackup']);
        });

        // Audit log routes
        Route::prefix('audit-logs')->group(function () {
            Route::get('/', [AuditLogController::class, 'index']);
            Route::get('/{id}', [AuditLogController::class, 'show']);
        });
    });

    // Admin can approve/reject leave requests (separate route outside admin group but checked in controller)
    Route::put('/leave-requests/{leaveRequest}/approve', [LeaveRequestController::class, 'approve']);

    // Regular users can create, view their own, and delete their own (if pending) leave requests
    Route::post('/leave-requests', [LeaveRequestController::class, 'store']);
    Route::get('/leave-requests', [LeaveRequestController::class, 'index']);
    Route::get('/leave-requests/{leaveRequest}', [LeaveRequestController::class, 'show']);
    Route::delete('/leave-requests/{leaveRequest}', [LeaveRequestController::class, 'destroy']);

    // Attendance management
    Route::apiResource('attendances', AttendanceController::class)->except(['create', 'edit']);
    Route::post('/clock-in', [AttendanceController::class, 'clockIn']);
    Route::post('/clock-out', [AttendanceController::class, 'clockOut']);

    // Admin only: Validation logs
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/attendance-validations/failed', [AttendanceValidationController::class, 'failedAttempts']);
        Route::get('/attendance-validations/statistics', [AttendanceValidationController::class, 'statistics']);
        Route::get('/attendance-validations/{attendanceValidation}', [AttendanceValidationController::class, 'show']);
    });

    // Face template enrollment (employee can enroll own, admin can manage all)
    Route::get('/face-templates/{faceTemplate}', [FaceTemplateController::class, 'show']);
    Route::post('/face-templates', [FaceTemplateController::class, 'store']);

    // Face enrollment with validation (Phase 5)
    Route::post('/face/enroll', [FaceEnrollmentController::class, 'enroll']);
    Route::post('/face/verify', [FaceEnrollmentController::class, 'verify']);
    Route::get('/face/health', [FaceEnrollmentController::class, 'healthCheck']);

    // Salary management
    Route::get('/salaries/{salary}', [SalaryController::class, 'show']);
    Route::get('/payroll-summary/{employeeId?}', [SalaryController::class, 'payrollSummary']);

    // Analytics routes (Admin only)
    Route::prefix('analytics')->middleware(['role:admin'])->group(function () {
        Route::get('attendance-trends', [AttendanceAnalyticsController::class, 'attendanceTrends']);
        Route::get('overtime', [AttendanceAnalyticsController::class, 'overtime']);
        Route::get('leave-forecast', [AttendanceAnalyticsController::class, 'leaveForecast']);
        Route::get('payroll-cost', [AttendanceAnalyticsController::class, 'payrollCost']);
    });

    // Teacher-only routes
    Route::middleware(['role:teacher'])->group(function () {
        // Teacher specific routes would go here
    });

    // Employee-only routes
    Route::middleware(['role:employee'])->group(function () {
        // Employee specific routes would go here
    });

    // User Endpoints (Phase 6) - Available to all authenticated users
    Route::prefix('my')->name('my.')->group(function () {
        // Dashboard
        Route::get('/dashboard', [MyDashboardController::class, 'index'])->name('dashboard');

        // Schedule
        Route::get('/schedules', [MyScheduleController::class, 'index'])->name('schedules.index');
        Route::get('/schedules/weekly', [MyScheduleController::class, 'weekly'])->name('schedules.weekly');
        Route::get('/schedules/monthly', [MyScheduleController::class, 'monthly'])->name('schedules.monthly');

        // Attendance
        Route::get('/attendance', [MyAttendanceController::class, 'index'])->name('attendance.index');
        Route::get('/attendance/today', [MyAttendanceController::class, 'today'])->name('attendance.today');
        Route::get('/attendance/statistics', [MyAttendanceController::class, 'statistics'])->name('attendance.statistics');
        Route::get('/attendance/summary/{month}', [MyAttendanceController::class, 'monthlySummary'])->name('attendance.summary');

        // Profile
        Route::get('/profile', [MyProfileController::class, 'show'])->name('profile.show');
        Route::put('/profile', [MyProfileController::class, 'update'])->name('profile.update');
        Route::put('/profile/password', [MyProfileController::class, 'updatePassword'])->name('profile.password');
        Route::post('/profile/face', [MyProfileController::class, 'uploadFace'])->name('profile.face.upload');
        Route::delete('/profile/face', [MyProfileController::class, 'deleteFace'])->name('profile.face.delete');
    });

    // Attendance Correction - User Endpoints
    Route::prefix('my/attendance-corrections')->name('my.attendance-corrections.')->group(function () {
        Route::get('/', [AttendanceCorrectionController::class, 'index'])->name('index');
        Route::post('/', [AttendanceCorrectionController::class, 'store'])->name('store');
        Route::get('/{id}', [AttendanceCorrectionController::class, 'show'])->name('show');
        Route::delete('/{id}', [AttendanceCorrectionController::class, 'destroy'])->name('destroy');
    });

    // Attendance Correction - Admin Endpoints
    Route::middleware(['role:admin'])->group(function () {
        Route::post('/attendance-corrections/{id}/review', [AttendanceCorrectionController::class, 'review'])->name('attendance-corrections.review');
    });
});
