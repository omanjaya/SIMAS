// src/app/(dashboard)/payroll/generate/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { useGenerateBulkPayroll } from "@/hooks/use-payroll";
import { employeeService } from "@/lib/api/employees";
import { Employee } from "@/types/employees";
import { Calendar, Play, AlertCircle } from "lucide-react";

export default function GeneratePayroll() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectAll, setSelectAll] = useState(true);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  
  const { generateBulkPayroll, loading, error } = useGenerateBulkPayroll();

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

  // Load employees
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await employeeService.getEmployees({ per_page: 1000 });
      setEmployees(response.data || []);
      setFilteredEmployees(response.data || []);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive",
      });
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Filter employees based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = employees.filter(employee =>
        employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employee_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
    }
  }, [searchTerm, employees]);

  // Initialize selected employees when employees are loaded
  useEffect(() => {
    if (employees.length > 0 && selectedEmployees.length === 0) {
      setSelectedEmployees(employees.map(emp => emp.id));
    }
  }, [employees, selectedEmployees.length]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedEmployees(employees.map(emp => emp.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleSelectEmployee = (employeeId: number, checked: boolean) => {
    if (checked) {
      setSelectedEmployees(prev => [...prev, employeeId]);
    } else {
      setSelectedEmployees(prev => prev.filter(id => id !== employeeId));
      setSelectAll(false);
    }
  };

  const handleGenerate = async () => {
    if (selectedEmployees.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one employee",
        variant: "destructive",
      });
      return;
    }

    setShowConfirmation(true);
  };

  const confirmGenerate = async () => {
    try {
      const result = await generateBulkPayroll({
        year: parseInt(year),
        month: parseInt(month),
        employee_ids: selectedEmployees
      });

      toast({
        title: "Success",
        description: `Generated payroll for ${result.data?.processed || 0} employees`,
      });

      setShowConfirmation(false);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate payroll",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generate Payroll</h1>
        <p className="text-muted-foreground">
          Create payroll for employees for a specific period
        </p>
      </div>

      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Period</CardTitle>
          <CardDescription>
            Select the month and year for which to generate payroll
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
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
          </div>
        </CardContent>
      </Card>

      {/* Employee Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Employees</CardTitle>
          <CardDescription>
            Choose which employees to include in this payroll generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="w-full sm:w-auto">
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Select All ({selectedEmployees.length} selected)
                </label>
              </div>
            </div>

            {loadingEmployees ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <span className="sr-only">Select</span>
                      </TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No employees found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedEmployees.includes(employee.id)}
                              onCheckedChange={(checked) => 
                                handleSelectEmployee(employee.id, checked as boolean)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {employee.first_name} {employee.last_name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {employee.employee_code}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {employee.position || "-"}
                          </TableCell>
                          <TableCell>
                            {employee.department || "-"}
                          </TableCell>
                          <TableCell>
                            <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              employee.status === "active" 
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                            }`}>
                              {employee.status}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleGenerate} 
          disabled={loading || selectedEmployees.length === 0}
          size="lg"
        >
          <Play className="mr-2 h-4 w-4" />
          {loading ? "Generating..." : "Generate Payroll"}
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate Payroll?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  You are about to generate payroll for {selectedEmployees.length} employees 
                  for {monthOptions.find(m => m.value === month)?.label} {year}.
                  This action cannot be undone.
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="font-medium mb-2">Selected Employees:</div>
                <div className="max-h-40 overflow-y-auto">
                  {employees
                    .filter(emp => selectedEmployees.includes(emp.id))
                    .slice(0, 10)
                    .map(emp => (
                      <div key={emp.id} className="text-sm py-1">
                        • {emp.first_name} {emp.last_name} ({emp.employee_code})
                      </div>
                    ))}
                  {selectedEmployees.length > 10 && (
                    <div className="text-sm py-1">
                      ...and {selectedEmployees.length - 10} more
                    </div>
                  )}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmGenerate} 
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? "Generating..." : "Confirm Generate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}