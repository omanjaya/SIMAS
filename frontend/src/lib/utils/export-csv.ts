export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportPayrollToCSV(payrollData: any[], month: number, year: number) {
  const formattedData = payrollData.map(item => ({
    'Employee Code': item.employee_code,
    'Employee Name': item.employee_name,
    'Position': item.position,
    'Department': item.department,
    'Base Salary': item.base_salary,
    'Allowances': item.allowances,
    'Deductions': item.deductions,
    'Net Salary': item.net_salary,
    'Days Present': item.days_present,
    'Days Absent': item.days_absent,
    'Total Hours': item.total_hours,
  }));

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
  exportToCSV(formattedData, `Payroll_${monthName}_${year}`);
}