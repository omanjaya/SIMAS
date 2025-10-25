// src/app/(dashboard)/payroll/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Calendar, Download, Eye, Check, X } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { usePayrollApprovals, useApprovePayroll, useRejectPayroll } from "@/hooks/use-payroll";
import { PayrollFilter } from "@/types/payroll";

export default function PayrollDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [monthFilter, setMonthFilter] = useState((new Date().getMonth() + 1).toString());

  const filters: PayrollFilter = {
    year: parseInt(yearFilter),
    month: parseInt(monthFilter),
  };

  if (statusFilter !== "all") {
    filters.status = statusFilter as "pending" | "approved" | "rejected";
  }

  const { approvals, loading, error, refetch } = usePayrollApprovals(filters);
  const { approvePayroll, loading: approving } = useApprovePayroll();
  const { rejectPayroll, loading: rejecting } = useRejectPayroll();

  // Generate year options for the last 5 years
  const yearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 2; i <= currentYear + 1; i++) {
    yearOptions.push(i.toString());
  }

  // Generate month options
  const monthOptions = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const filteredApprovals = approvals.filter(approval => {
    const matchesSearch = 
      approval.employee?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.employee?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.employee?.employee_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleApprove = async (id: number) => {
    try {
      await approvePayroll(id);
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

  const handleReject = async (id: number) => {
    try {
      await rejectPayroll(id, "Manually rejected");
      toast({
        title: "Success",
        description: "Payroll rejected successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject payroll",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "approved":
        return <Badge variant="default">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-muted-foreground">
            Manage employee payroll approvals and generate payslips
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Generate Payroll
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {approvals.filter(p => p.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Payrolls awaiting approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {approvals.filter(p => p.status === "approved").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Approved this period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvals.length}</div>
            <p className="text-xs text-muted-foreground">
              Payrolls this period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search employees..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger id="year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger id="month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={refetch} className="w-full">
                <Search className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Approvals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Approvals</CardTitle>
          <CardDescription>
            Review and manage payroll approvals for {monthOptions.find(m => m.value === monthFilter)?.label} {yearFilter}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApprovals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No payroll approvals found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApprovals.map((approval) => (
                    <TableRow key={approval.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {approval.employee?.first_name} {approval.employee?.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {approval.employee?.employee_code} • {approval.employee?.position}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(approval.period_year, approval.period_month - 1), 'MMMM yyyy', { locale: id })}
                      </TableCell>
                      <TableCell>{getStatusBadge(approval.status)}</TableCell>
                      <TableCell>
                        {formatCurrency(approval.payroll_data?.net_salary || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {approval.status === "pending" && (
                            <>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleApprove(approval.id)}
                                disabled={approving}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleReject(approval.id)}
                                disabled={rejecting}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}