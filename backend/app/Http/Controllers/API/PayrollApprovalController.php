<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Jobs\SendPayslipEmail;
use App\Models\PayrollApproval;
use App\Services\PayrollService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PayrollApprovalController extends Controller
{
    protected $payrollService;

    public function __construct(PayrollService $payrollService)
    {
        $this->payrollService = $payrollService;
    }

    /**
     * Get all payroll approvals with optional filters
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = PayrollApproval::with(['employee', 'approver']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by period
        if ($request->has('year') && $request->has('month')) {
            $query->forPeriod($request->year, $request->month);
        }

        // Filter by employee
        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        $perPage = $request->get('per_page', 15);
        $approvals = $query->latest()->paginate($perPage);

        return response()->json($approvals);
    }

    /**
     * Get a single payroll approval
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $approval = PayrollApproval::with(['employee', 'approver'])->findOrFail($id);

        return response()->json([
            'data' => $approval,
        ]);
    }

    /**
     * Generate bulk payroll for a period
     * POST /api/payroll/generate-bulk
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateBulk(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'year' => 'required|integer|min:2020|max:2100',
            'month' => 'required|integer|min:1|max:12',
            'employee_ids' => 'nullable|array',
            'employee_ids.*' => 'exists:employees,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $year = $request->year;
        $month = $request->month;
        $employeeIds = $request->employee_ids ?? [];

        try {
            $results = $this->payrollService->generateBulkPayroll($year, $month, $employeeIds);

            return response()->json([
                'message' => 'Bulk payroll generation completed',
                'data' => $results,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Bulk payroll generation failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get payroll summary for a period
     * GET /api/payroll/summary
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function summary(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'year' => 'required|integer',
            'month' => 'required|integer|min:1|max:12',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $summary = $this->payrollService->getPayrollSummary(
            $request->year,
            $request->month
        );

        return response()->json([
            'data' => $summary,
        ]);
    }

    /**
     * Approve a payroll
     * POST /api/payroll-approvals/{id}/approve
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function approve(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $approval = PayrollApproval::findOrFail($id);

        if (! $approval->isPending()) {
            return response()->json([
                'message' => 'Payroll has already been processed',
                'current_status' => $approval->status,
            ], 400);
        }

        $approval->approve($request->user()->id, $request->notes);

        return response()->json([
            'message' => 'Payroll approved successfully',
            'data' => $approval->fresh(['employee', 'approver']),
        ]);
    }

    /**
     * Reject a payroll
     * POST /api/payroll-approvals/{id}/reject
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function reject(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'rejection_reason' => 'required|string|max:500',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $approval = PayrollApproval::findOrFail($id);

        if (! $approval->isPending()) {
            return response()->json([
                'message' => 'Payroll has already been processed',
                'current_status' => $approval->status,
            ], 400);
        }

        $approval->reject(
            $request->user()->id,
            $request->rejection_reason,
            $request->notes
        );

        return response()->json([
            'message' => 'Payroll rejected successfully',
            'data' => $approval->fresh(['employee', 'approver']),
        ]);
    }

    /**
     * Bulk approve multiple payrolls
     * POST /api/payroll-approvals/bulk-approve
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkApprove(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'approval_ids' => 'required|array',
            'approval_ids.*' => 'exists:payroll_approvals,id',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $approved = 0;
        $skipped = 0;

        foreach ($request->approval_ids as $approvalId) {
            $approval = PayrollApproval::find($approvalId);

            if ($approval && $approval->isPending()) {
                $approval->approve($request->user()->id, $request->notes);
                $approved++;
            } else {
                $skipped++;
            }
        }

        return response()->json([
            'message' => 'Bulk approval completed',
            'approved' => $approved,
            'skipped' => $skipped,
        ]);
    }

    /**
     * Send payslip email to employee
     * POST /api/payroll-approvals/{id}/send-payslip
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendPayslip($id)
    {
        $approval = PayrollApproval::with('employee')->findOrFail($id);

        if (! $approval->isApproved()) {
            return response()->json([
                'message' => 'Cannot send payslip for unapproved payroll',
                'current_status' => $approval->status,
            ], 400);
        }

        try {
            // Dispatch job to send email
            SendPayslipEmail::dispatch($approval);

            return response()->json([
                'message' => 'Payslip email queued for sending',
                'employee_email' => $approval->employee->email,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to queue payslip email',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Send payslips to multiple employees
     * POST /api/payroll-approvals/bulk-send-payslips
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkSendPayslips(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'approval_ids' => 'required|array',
            'approval_ids.*' => 'exists:payroll_approvals,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $sent = 0;
        $skipped = 0;

        foreach ($request->approval_ids as $approvalId) {
            $approval = PayrollApproval::with('employee')->find($approvalId);

            if ($approval && $approval->isApproved()) {
                SendPayslipEmail::dispatch($approval);
                $sent++;
            } else {
                $skipped++;
            }
        }

        return response()->json([
            'message' => 'Bulk payslip sending completed',
            'sent' => $sent,
            'skipped' => $skipped,
        ]);
    }
}
