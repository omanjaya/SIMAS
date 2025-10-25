// src/app/(dashboard)/payroll/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { usePayrollApproval, useApprovePayroll, useRejectPayroll, useSendPayslip } from "@/hooks/use-payroll";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowLeft, Check, X, Send, Download } from "lucide-react";

export default function PayrollApprovalDetail() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const payrollId = parseInt(id || "0");

  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const { approval, loading, error, refetch } = usePayrollApproval(payrollId);
  const { approvePayroll, loading: approving } = useApprovePayroll();
  const { rejectPayroll, loading: rejecting } = useRejectPayroll();
  const { sendPayslip, loading: sending } = useSendPayslip();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load payroll approval details",
        variant: "destructive",
      });
    }
  }, [error]);

  const handleApprove = async () => {
    try {
      await approvePayroll(payrollId);
      toast({
        title: "Success",
        description: "Payroll approved successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve payroll",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }

    try {
      await rejectPayroll(payrollId, rejectionReason, rejectionNotes);
      toast({
        title: "Success",
        description: "Payroll rejected successfully",
      });
      setShowRejectDialog(false);
      setRejectionReason("");
      setRejectionNotes("");
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject payroll",
        variant: "destructive",
      });
    }
  };

  const handleSendPayslip = async () => {
    try {
      await sendPayslip(payrollId);
      toast({
        title: "Success",
        description: "Payslip sent to employee successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send payslip",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !approval) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-2xl font-bold">Payroll Approval Not Found</div>
        <p className="text-muted-foreground">The requested payroll approval could not be found.</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payroll
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="text-lg py-1">Pending</Badge>;
      case "approved":
        return <Badge variant="default" className="text-lg py-1">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="text-lg py-1">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-lg py-1">{status}</Badge>;
    }
  };

  const payrollData = approval.payroll_data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Approval</h1>
          <p className="text-muted-foreground">
            Review and manage payroll approval for {approval.employee?.first_name} {approval.employee?.last_name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {(approval.employee?.first_name.charAt(0) || '') + (approval.employee?.last_name.charAt(0) || '')}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-lg">
                    {approval.employee?.first_name} {approval.employee?.last_name}
                  </div>
                  <div className="text-muted-foreground">
                    {approval.employee?.employee_code}
                  </div>
                  <div className="text-sm">
                    {approval.employee?.position}
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{approval.employee?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department:</span>
                  <span>{approval.employee?.department || '-'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payroll Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-2xl font-bold">
                  {format(new Date(approval.period_year, approval.period_month - 1), 'MMMM yyyy', { locale: id })}
                </div>
                <div className="text-muted-foreground">
                  {approval.period_month}/{approval.period_year}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="text-center">
                {getStatusBadge(approval.status)}
              </div>
              
              {approval.status === "rejected" && approval.rejection_reason && (
                <div className="bg-destructive/10 p-3 rounded-md w-full">
                  <div className="font-medium text-destructive">Rejection Reason</div>
                  <div className="text-sm">{approval.rejection_reason}</div>
                  {approval.notes && (
                    <div className="text-sm mt-2">
                      <span className="font-medium">Notes:</span> {approval.notes}
                    </div>
                  )}
                </div>
              )}

              {approval.status === "approved" && approval.approved_at && (
                <div className="text-center text-sm text-muted-foreground">
                  Approved on {format(new Date(approval.approved_at), 'PPP', { locale: id })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payroll Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Summary</CardTitle>
              <CardDescription>
                Detailed breakdown of earnings and deductions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Attendance Summary */}
                {payrollData.attendance_summary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {payrollData.attendance_summary.days_present}
                      </div>
                      <div className="text-xs text-muted-foreground">Days Present</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {payrollData.attendance_summary.days_absent}
                      </div>
                      <div className="text-xs text-muted-foreground">Days Absent</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {payrollData.attendance_summary.days_late}
                      </div>
                      <div className="text-xs text-muted-foreground">Days Late</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {payrollData.attendance_summary.total_hours}h
                      </div>
                      <div className="text-xs text-muted-foreground">Total Hours</div>
                    </div>
                  </div>
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

                      {payrollData.salary_breakdown?.filter(item => item.type === 'earning').map((item, i) => (
                        <TableRow key={i}>
                          <TableCell className="pl-8">{item.component}</TableCell>
                          <TableCell className="text-right text-green-600 dark:text-green-400">
                            +{formatCurrency(item.amount)}
                          </TableCell>
                        </TableRow>
                      ))}

                      <TableRow className="font-medium">
                        <TableCell>Total Earnings</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(payrollData.base_salary + (payrollData.allowances || 0))}
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell colSpan={2}>
                          <Separator />
                        </TableCell>
                      </TableRow>

                      {payrollData.salary_breakdown?.filter(item => item.type === 'deduction').map((item, i) => (
                        <TableRow key={i}>
                          <TableCell className="pl-8">{item.component}</TableCell>
                          <TableCell className="text-right text-red-600 dark:text-red-400">
                            -{formatCurrency(item.amount)}
                          </TableCell>
                        </TableRow>
                      ))}

                      <TableRow className="font-medium">
                        <TableCell>Total Deductions</TableCell>
                        <TableCell className="text-right text-red-600 dark:text-red-400">
                          -{formatCurrency(payrollData.deductions || 0)}
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
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>
                Manage this payroll approval
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {approval.status === "pending" && (
                <>
                  <Button onClick={handleApprove} disabled={approving}>
                    <Check className="mr-2 h-4 w-4" />
                    {approving ? "Approving..." : "Approve"}
                  </Button>
                  
                  <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <X className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject Payroll Approval</AlertDialogTitle>
                        <AlertDialogDescription>
                          Please provide a reason for rejecting this payroll approval.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                          <Input
                            id="rejection-reason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter reason for rejection"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="rejection-notes">Additional Notes</Label>
                          <Textarea
                            id="rejection-notes"
                            value={rejectionNotes}
                            onChange={(e) => setRejectionNotes(e.target.value)}
                            placeholder="Any additional notes (optional)"
                          />
                        </div>
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleReject} 
                          disabled={rejecting || !rejectionReason.trim()}
                        >
                          {rejecting ? "Rejecting..." : "Reject"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}

              {approval.status === "approved" && (
                <Button onClick={handleSendPayslip} disabled={sending}>
                  <Send className="mr-2 h-4 w-4" />
                  {sending ? "Sending..." : "Send Payslip"}
                </Button>
              )}

              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download Payslip
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}