<?php

namespace App\Console\Commands;

use App\Services\PayrollService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class GenerateMonthlyPayroll extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payroll:generate
                            {--year= : The year for payroll generation (default: current year)}
                            {--month= : The month for payroll generation (default: current month)}
                            {--employee= : Specific employee ID (optional)}
                            {--force : Force regeneration even if payroll already exists}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate monthly payroll for all active employees';

    protected $payrollService;

    /**
     * Create a new command instance.
     */
    public function __construct(PayrollService $payrollService)
    {
        parent::__construct();
        $this->payrollService = $payrollService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $year = $this->option('year') ?? Carbon::now()->year;
        $month = $this->option('month') ?? Carbon::now()->month;
        $employeeId = $this->option('employee');
        $force = $this->option('force');

        $this->info("Generating payroll for {$year}-{$month}");

        if ($employeeId) {
            $this->info("Processing single employee ID: {$employeeId}");
            $employeeIds = [$employeeId];
        } else {
            $employeeIds = [];
            $this->info('Processing all active employees');
        }

        // Show progress bar
        $this->output->progressStart();

        try {
            $results = $this->payrollService->generateBulkPayroll($year, $month, $employeeIds);

            $this->output->progressFinish();
            $this->newLine();

            // Display results
            $this->info('✓ Payroll generation completed!');
            $this->newLine();

            $this->table(
                ['Metric', 'Count'],
                [
                    ['Total Employees', $results['total']],
                    ['Successfully Generated', $results['successful']],
                    ['Failed', $results['failed']],
                ]
            );

            // Display errors if any
            if (! empty($results['errors'])) {
                $this->newLine();
                $this->warn('Errors encountered:');

                $errorData = [];
                foreach ($results['errors'] as $error) {
                    $errorData[] = [
                        $error['employee_id'],
                        $error['employee_name'],
                        $error['error'],
                    ];
                }

                $this->table(
                    ['Employee ID', 'Name', 'Error'],
                    $errorData
                );
            }

            // Show summary statistics
            if ($results['successful'] > 0) {
                $this->newLine();
                $summary = $this->payrollService->getPayrollSummary($year, $month);

                $this->info('Payroll Summary:');
                $this->table(
                    ['Metric', 'Value'],
                    [
                        ['Total Gross Salary', 'Rp '.number_format($summary['totals']['gross_salary'], 0, ',', '.')],
                        ['Total Tax', 'Rp '.number_format($summary['totals']['total_tax'], 0, ',', '.')],
                        ['Total Deductions', 'Rp '.number_format($summary['totals']['total_deductions'], 0, ',', '.')],
                        ['Total Net Salary', 'Rp '.number_format($summary['totals']['net_salary'], 0, ',', '.')],
                        ['Average Net Salary', 'Rp '.number_format($summary['averages']['avg_net'], 0, ',', '.')],
                    ]
                );

                $this->newLine();
                $this->info('Status Breakdown:');
                $this->table(
                    ['Status', 'Count'],
                    [
                        ['Pending', $summary['status_breakdown']['pending']],
                        ['Approved', $summary['status_breakdown']['approved']],
                        ['Rejected', $summary['status_breakdown']['rejected']],
                    ]
                );
            }

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->output->progressFinish();
            $this->newLine();
            $this->error('Payroll generation failed: '.$e->getMessage());
            $this->error($e->getTraceAsString());

            return Command::FAILURE;
        }
    }
}
