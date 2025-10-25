<?php

namespace App\Jobs;

use App\Models\PayrollApproval;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendPayslipEmail implements ShouldQueue
{
    use Queueable;

    protected $payrollApproval;

    /**
     * Create a new job instance.
     */
    public function __construct(PayrollApproval $payrollApproval)
    {
        $this->payrollApproval = $payrollApproval;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $approval = $this->payrollApproval;
            $employee = $approval->employee;
            $payrollData = $approval->payroll_data;

            // Format data for email
            $data = [
                'employee_name' => $employee->full_name,
                'employee_code' => $employee->employee_code,
                'period' => $approval->formatted_period,
                'payroll' => $payrollData,
            ];

            // Send email (stub implementation)
            // TODO: Create proper Mailable class and email template
            Mail::send('emails.payslip', $data, function ($message) use ($employee, $approval) {
                $message->to($employee->email, $employee->full_name)
                    ->subject("Payslip - {$approval->formatted_period}");

                // TODO: Attach PDF payslip
                // $pdfPath = $this->generatePayslipPDF($approval);
                // $message->attach($pdfPath);
            });

            Log::info("Payslip email sent successfully to {$employee->email} for period {$approval->formatted_period}");

        } catch (\Exception $e) {
            Log::error('Failed to send payslip email: '.$e->getMessage());

            // Re-throw exception to retry the job
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('SendPayslipEmail job failed: '.$exception->getMessage(), [
            'approval_id' => $this->payrollApproval->id,
            'employee_id' => $this->payrollApproval->employee_id,
        ]);
    }

    /**
     * TODO: Generate PDF payslip
     *
     * @return string Path to PDF file
     */
    protected function generatePayslipPDF(PayrollApproval $approval): string
    {
        // Stub implementation
        // In production, use libraries like:
        // - barryvdh/laravel-dompdf
        // - spatie/laravel-pdf
        // - mpdf/mpdf

        return '';
    }
}
