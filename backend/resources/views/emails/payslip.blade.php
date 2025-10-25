<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payslip - {{ $period }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #4F46E5;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background-color: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
        }
        .employee-info {
            margin-bottom: 30px;
            padding: 15px;
            background-color: white;
            border-radius: 4px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        .label {
            font-weight: bold;
            color: #6b7280;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #111827;
            margin-top: 25px;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #4F46E5;
        }
        .payroll-table {
            width: 100%;
            border-collapse: collapse;
            background-color: white;
            border-radius: 4px;
            overflow: hidden;
        }
        .payroll-table th {
            background-color: #f3f4f6;
            padding: 12px;
            text-align: left;
            font-weight: bold;
            color: #374151;
        }
        .payroll-table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
        }
        .payroll-table tr:last-child td {
            border-bottom: none;
        }
        .amount {
            text-align: right;
            font-weight: 500;
        }
        .total-row {
            background-color: #f3f4f6;
            font-weight: bold;
            font-size: 16px;
        }
        .net-salary-row {
            background-color: #4F46E5;
            color: white;
            font-size: 18px;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            padding: 20px;
            background-color: #f9fafb;
            border-radius: 4px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .deduction {
            color: #dc2626;
        }
        .earning {
            color: #059669;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Payslip</h1>
        <p>{{ $period }}</p>
    </div>

    <div class="content">
        <!-- Employee Information -->
        <div class="employee-info">
            <div class="info-row">
                <span class="label">Employee Name:</span>
                <span>{{ $employee_name }}</span>
            </div>
            <div class="info-row">
                <span class="label">Employee Code:</span>
                <span>{{ $employee_code }}</span>
            </div>
            @if(isset($payroll['position']))
            <div class="info-row">
                <span class="label">Position:</span>
                <span>{{ $payroll['position'] }}</span>
            </div>
            @endif
            @if(isset($payroll['department']))
            <div class="info-row">
                <span class="label">Department:</span>
                <span>{{ $payroll['department'] }}</span>
            </div>
            @endif
        </div>

        <!-- Earnings -->
        <h2 class="section-title">Earnings</h2>
        <table class="payroll-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="amount">Amount (IDR)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Base Salary</td>
                    <td class="amount earning">{{ number_format($payroll['earnings']['base_salary'], 0, ',', '.') }}</td>
                </tr>
                @if(isset($payroll['earnings']['overtime_pay']) && $payroll['earnings']['overtime_pay'] > 0)
                <tr>
                    <td>Overtime Pay</td>
                    <td class="amount earning">{{ number_format($payroll['earnings']['overtime_pay'], 0, ',', '.') }}</td>
                </tr>
                @endif
                @if(isset($payroll['earnings']['allowances']) && is_array($payroll['earnings']['allowances']))
                    @foreach($payroll['earnings']['allowances'] as $key => $value)
                    <tr>
                        <td>{{ ucfirst(str_replace('_', ' ', $key)) }} Allowance</td>
                        <td class="amount earning">{{ number_format($value, 0, ',', '.') }}</td>
                    </tr>
                    @endforeach
                @endif
                @if(isset($payroll['earnings']['bonuses']) && $payroll['earnings']['bonuses'] > 0)
                <tr>
                    <td>Bonuses</td>
                    <td class="amount earning">{{ number_format($payroll['earnings']['bonuses'], 0, ',', '.') }}</td>
                </tr>
                @endif
                <tr class="total-row">
                    <td>Total Earnings</td>
                    <td class="amount">{{ number_format($payroll['earnings']['total_earnings'], 0, ',', '.') }}</td>
                </tr>
            </tbody>
        </table>

        <!-- Deductions -->
        <h2 class="section-title">Deductions</h2>
        <table class="payroll-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="amount">Amount (IDR)</th>
                </tr>
            </thead>
            <tbody>
                @if(isset($payroll['deductions']['fixed_deductions']) && $payroll['deductions']['fixed_deductions'] > 0)
                <tr>
                    <td>Fixed Deductions</td>
                    <td class="amount deduction">{{ number_format($payroll['deductions']['fixed_deductions'], 0, ',', '.') }}</td>
                </tr>
                @endif
                @if(isset($payroll['deductions']['tax_deductions']) && $payroll['deductions']['tax_deductions'] > 0)
                <tr>
                    <td>Tax (PPh 21)</td>
                    <td class="amount deduction">{{ number_format($payroll['deductions']['tax_deductions'], 0, ',', '.') }}</td>
                </tr>
                @endif
                <tr class="total-row">
                    <td>Total Deductions</td>
                    <td class="amount">{{ number_format($payroll['deductions']['total_deductions'], 0, ',', '.') }}</td>
                </tr>
            </tbody>
        </table>

        <!-- Net Salary -->
        <table class="payroll-table" style="margin-top: 20px;">
            <tbody>
                <tr class="net-salary-row">
                    <td>NET SALARY</td>
                    <td class="amount">Rp {{ number_format($payroll['net_salary'], 0, ',', '.') }}</td>
                </tr>
            </tbody>
        </table>

        <!-- Attendance Summary -->
        @if(isset($payroll['attendance_summary']))
        <h2 class="section-title">Attendance Summary</h2>
        <table class="payroll-table">
            <tbody>
                <tr>
                    <td>Days Present</td>
                    <td class="amount">{{ $payroll['attendance_summary']['days_present'] ?? 0 }} days</td>
                </tr>
                <tr>
                    <td>Days Absent</td>
                    <td class="amount">{{ $payroll['attendance_summary']['days_absent'] ?? 0 }} days</td>
                </tr>
                <tr>
                    <td>Days Late</td>
                    <td class="amount">{{ $payroll['attendance_summary']['days_late'] ?? 0 }} days</td>
                </tr>
                <tr>
                    <td>Total Hours</td>
                    <td class="amount">{{ $payroll['attendance_summary']['total_hours'] ?? 0 }} hours</td>
                </tr>
                @if(isset($payroll['attendance_summary']['overtime_hours']) && $payroll['attendance_summary']['overtime_hours'] > 0)
                <tr>
                    <td>Overtime Hours</td>
                    <td class="amount">{{ $payroll['attendance_summary']['overtime_hours'] }} hours</td>
                </tr>
                @endif
            </tbody>
        </table>
        @endif
    </div>

    <div class="footer">
        <p>This is a computer-generated payslip and does not require a signature.</p>
        <p>For any queries, please contact the HR department.</p>
        <p><strong>SMP Saraswati</strong> | HR Management System</p>
    </div>
</body>
</html>
