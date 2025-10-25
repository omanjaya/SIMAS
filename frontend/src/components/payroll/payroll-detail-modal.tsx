"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from
"@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Eye, Download } from "lucide-react"

interface PayrollDetailModalProps {
  employeeId: number
  employeeName: string
  month: number
  year: number
  payrollData: {
    base_salary: number
    allowances: number
    deductions: number
    net_salary: number
    attendance_summary?: {
      days_present: number
      days_absent: number
      days_late: number
      total_hours: number
    }
    salary_breakdown?: Array<{
      component: string
      amount: number
      type: 'earning' | 'deduction'
    }>
  }
}

export function PayrollDetailModal({ 
  employeeId, 
  employeeName, 
  month, 
  year, 
  payrollData 
}: PayrollDetailModalProps) {
  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long'
})

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleDownloadPayslip = () => {
    // TODO: Generate PDF payslip
    console.log('Downloading payslip for', employeeId, month, year)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="mr-1 h-4 w-4" />
          Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payroll Details</DialogTitle>
          <DialogDescription>
            {employeeName} - {monthName} {year}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Attendance Summary */}
          {payrollData.attendance_summary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Attendance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {payrollData.attendance_summary.days_present}
                    </div>
                    <div className="text-xs text-muted-foreground">Days Present</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {payrollData.attendance_summary.days_absent}
                    </div>
                    <div className="text-xs text-muted-foreground">Days Absent</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {payrollData.attendance_summary.days_late}
                    </div>
                    <div className="text-xs text-muted-foreground">Days Late</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {payrollData.attendance_summary.total_hours}h
                    </div>
                    <div className="text-xs text-muted-foreground">Total Hours</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Salary Breakdown */}
          <div>
            <h3 className="font-semibold mb-3">Salary Breakdown</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Base Salary</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(payrollData.base_salary)}
                  </TableCell>
                </TableRow>

                {payrollData.salary_breakdown?.filter(item => item.type ===
'earning').map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-8">{item.component}</TableCell>
                    <TableCell className="text-right text-green-600">
                      +{formatCurrency(item.amount)}
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow className="font-medium">
                  <TableCell>Total Earnings</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(payrollData.base_salary + payrollData.allowances)}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={2}>
                    <Separator />
                  </TableCell>
                </TableRow>

                {payrollData.salary_breakdown?.filter(item => item.type ===
'deduction').map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-8">{item.component}</TableCell>
                    <TableCell className="text-right text-red-600">
                      -{formatCurrency(item.amount)}
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow className="font-medium">
                  <TableCell>Total Deductions</TableCell>
                  <TableCell className="text-right text-red-600">
                    -{formatCurrency(payrollData.deductions)}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={2}>
                    <Separator className="my-2" />
                  </TableCell>
                </TableRow>

                <TableRow className="text-lg font-bold">
                  <TableCell>NET SALARY</TableCell>
                  <TableCell className="text-right text-primary">
                    {formatCurrency(payrollData.net_salary)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button onClick={handleDownloadPayslip}>
              <Download className="mr-2 h-4 w-4" />
              Download Payslip
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}