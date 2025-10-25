// src/app/(dashboard)/payroll/summary/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { usePayrollSummary, useExportPayroll } from "@/hooks/use-payroll";
import { Download, Calendar } from "lucide-react";

export default function PayrollSummary() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [searchTerm, setSearchTerm] = useState("");
  
  const { getSummary, summary, loading, error } = usePayrollSummary();
  const { exportPayroll, loading: exporting } = useExportPayroll();

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

  // Sample data for charts
  const payrollDistributionData = [
    { name: "Approved", count: summary?.approved_payrolls || 0 },
    { name: "Pending", count: summary?.pending_payrolls || 0 },
    { name: "Rejected", count: summary?.rejected_payrolls || 0 },
  ];

  const COLORS = ["#10B981", "#F59E0B", "#EF4444"];

  const salaryRangeData = [
    { range: "< Rp1M", employees: 12 },
    { range: "Rp1M - Rp3M", employees: 28 },
    { range: "Rp3M - Rp5M", employees: 15 },
    { range: "> Rp5M", employees: 5 },
  ];

  useEffect(() => {
    loadSummary();
  }, [year, month]);

  const loadSummary = async () => {
    try {
      await getSummary(parseInt(year), parseInt(month));
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load payroll summary",
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    try {
      await exportPayroll(parseInt(year), parseInt(month));
      toast({
        title: "Success",
        description: "Payroll data exported successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to export payroll data",
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Summary</h1>
          <p className="text-muted-foreground">
            View payroll analytics and generate reports
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleExport} disabled={exporting}>
            <Download className="mr-2 h-4 w-4" />
            {exporting ? "Exporting..." : "Export Data"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Select period to view payroll summary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select value={year} onValueChange={setYear}>
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
              <Select value={month} onValueChange={setMonth}>
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
            
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total_employees || 0}</div>
            <p className="text-xs text-muted-foreground">
              Processed this period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gross Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary?.total_gross_payroll || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Before deductions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary?.total_deductions || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Taxes and benefits
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary?.total_net_payroll || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total disbursed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payroll Distribution</CardTitle>
            <CardDescription>
              Approval status distribution
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={payrollDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {payrollDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Count"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Salary Range Distribution</CardTitle>
            <CardDescription>
              Employee salary ranges
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={salaryRangeData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="employees" fill="#8884d8" name="Number of Employees" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Summary</CardTitle>
          <CardDescription>
            Detailed breakdown of payroll data for {monthOptions.find(m => m.value === month)?.label} {year}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Average Salary</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(summary?.average_salary || 0)}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Payroll Status</div>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500" 
                      style={{ width: `${((summary?.approved_payrolls || 0) / (summary?.total_employees || 1)) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm">
                    {Math.round(((summary?.approved_payrolls || 0) / (summary?.total_employees || 1)) * 100)}% Approved
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Processing Time</div>
                <div className="text-2xl font-bold">3-5 Days</div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Department Summary</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Employees</TableHead>
                    <TableHead className="text-right">Gross Payroll</TableHead>
                    <TableHead className="text-right">Deductions</TableHead>
                    <TableHead className="text-right">Net Payroll</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Sample data - in real implementation, this would come from API */}
                  <TableRow>
                    <TableCell>Teachers</TableCell>
                    <TableCell className="text-right">45</TableCell>
                    <TableCell className="text-right">{formatCurrency(1350000000)}</TableCell>
                    <TableCell className="text-right text-red-600">-{formatCurrency(135000000)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(1215000000)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Administrative</TableCell>
                    <TableCell className="text-right">20</TableCell>
                    <TableCell className="text-right">{formatCurrency(600000000)}</TableCell>
                    <TableCell className="text-right text-red-600">-{formatCurrency(60000000)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(540000000)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Maintenance</TableCell>
                    <TableCell className="text-right">12</TableCell>
                    <TableCell className="text-right">{formatCurrency(360000000)}</TableCell>
                    <TableCell className="text-right text-red-600">-{formatCurrency(36000000)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(324000000)}</TableCell>
                  </TableRow>
                  <TableRow className="font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">{summary?.total_employees || 0}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(summary?.total_gross_payroll || 0)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      -{formatCurrency(summary?.total_deductions || 0)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(summary?.total_net_payroll || 0)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}