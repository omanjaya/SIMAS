// src/components/leave-request/leave-request-form.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LeaveRequest, LeaveRequestApprovalData } from '@/types/leave-requests';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { LoadingSpinner } from '../shared/loading-spinner';

const leaveRequestApprovalSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  approved_by: z.number().min(1, 'Approver is required'),
  approved_at: z.string().optional(),
  notes: z.string().optional(),
});

interface LeaveRequestFormProps {
  leaveRequest?: LeaveRequest;
  onSubmit: (data: LeaveRequestApprovalData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function LeaveRequestForm({ leaveRequest, onSubmit, onCancel, loading }: LeaveRequestFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<LeaveRequestApprovalData>({
    resolver: zodResolver(leaveRequestApprovalSchema),
    defaultValues: {
      status: leaveRequest?.status || 'pending',
      approved_by: leaveRequest?.approved_by || 0,
      approved_at: leaveRequest?.approved_at || new Date().toISOString().split('T')[0],
      notes: leaveRequest?.notes || '',
    }
  });

  // Reset the form when leaveRequest prop changes
  useEffect(() => {
    reset({
      status: leaveRequest?.status || 'pending',
      approved_by: leaveRequest?.approved_by || 0,
      approved_at: leaveRequest?.approved_at || new Date().toISOString().split('T')[0],
      notes: leaveRequest?.notes || '',
    });
  }, [leaveRequest, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{leaveRequest ? `Review Leave Request - ${leaveRequest.leave_type}` : 'Review Leave Request'}</CardTitle>
          <CardDescription>
            {leaveRequest 
              ? `Review and ${leaveRequest.status === 'pending' ? 'approve or reject' : 'update'} this leave request` 
              : 'Review the leave request details below and make a decision'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee_id">Employee</Label>
              <Input
                id="employee_id"
                value={leaveRequest?.employee?.first_name + ' ' + leaveRequest?.employee?.last_name || 'N/A'}
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="leave_type">Leave Type</Label>
              <Input
                id="leave_type"
                value={leaveRequest?.leave_type || 'N/A'}
                disabled
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                value={leaveRequest?.start_date ? new Date(leaveRequest.start_date).toLocaleDateString() : 'N/A'}
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                value={leaveRequest?.end_date ? new Date(leaveRequest.end_date).toLocaleDateString() : 'N/A'}
                disabled
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_days">Total Days</Label>
              <Input
                id="total_days"
                value={leaveRequest?.total_days || 'N/A'}
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="is_paid">Paid Leave</Label>
              <Input
                id="is_paid"
                value={leaveRequest?.is_paid ? 'Yes' : 'No'}
                disabled
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={leaveRequest?.reason || 'N/A'}
              disabled
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select 
              value={watch('status')} 
              onValueChange={(value) => setValue('status', value as 'approved' | 'rejected')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-destructive">{errors.status.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Enter any notes about this decision"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}