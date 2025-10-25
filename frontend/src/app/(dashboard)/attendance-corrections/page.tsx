'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  attendanceCorrectionService,
  AttendanceCorrection,
  CreateCorrectionData,
} from '@/lib/api/attendance-corrections';
import { attendanceService } from '@/lib/api/attendance';
import {
  Plus,
  Filter,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AttendanceCorrectionsPage() {
  const [corrections, setCorrections] = useState<AttendanceCorrection[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCorrectionId, setSelectedCorrectionId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Form state
  const [formData, setFormData] = useState<CreateCorrectionData>({
    attendance_id: 0,
    correction_type: 'clock_in',
    new_clock_in_time: '',
    new_clock_out_time: '',
    reason: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { toast } = useToast();

  useEffect(() => {
    fetchCorrections();
  }, [statusFilter, currentPage]);

  const fetchCorrections = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        per_page: 10,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const data = await attendanceCorrectionService.list(params);
      setCorrections(data.data);
      setTotalPages(data.last_page);
      setTotal(data.total);
    } catch (err: any) {
      console.error('Failed to fetch corrections:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Gagal memuat data koreksi absen',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.attendance_id || formData.attendance_id === 0) {
      errors.attendance_id = 'ID Absensi harus diisi';
    }

    if (!formData.correction_type) {
      errors.correction_type = 'Tipe koreksi harus dipilih';
    }

    if (formData.correction_type === 'clock_in' || formData.correction_type === 'both') {
      if (!formData.new_clock_in_time) {
        errors.new_clock_in_time = 'Waktu masuk baru harus diisi';
      }
    }

    if (formData.correction_type === 'clock_out' || formData.correction_type === 'both') {
      if (!formData.new_clock_out_time) {
        errors.new_clock_out_time = 'Waktu keluar baru harus diisi';
      }
    }

    if (!formData.reason || formData.reason.trim().length < 10) {
      errors.reason = 'Alasan harus diisi minimal 10 karakter';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateCorrection = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      await attendanceCorrectionService.create(formData);

      toast({
        title: 'Sukses',
        description: 'Permintaan koreksi absen berhasil dibuat',
      });

      setCreateDialogOpen(false);
      resetForm();
      fetchCorrections();
    } catch (err: any) {
      console.error('Failed to create correction:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Gagal membuat permintaan koreksi',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCorrection = async () => {
    if (!selectedCorrectionId) return;

    try {
      setSubmitting(true);
      await attendanceCorrectionService.delete(selectedCorrectionId);

      toast({
        title: 'Sukses',
        description: 'Permintaan koreksi berhasil dihapus',
      });

      setDeleteDialogOpen(false);
      setSelectedCorrectionId(null);
      fetchCorrections();
    } catch (err: any) {
      console.error('Failed to delete correction:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Gagal menghapus permintaan koreksi',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      attendance_id: 0,
      correction_type: 'clock_in',
      new_clock_in_time: '',
      new_clock_out_time: '',
      reason: '',
    });
    setFormErrors({});
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Menunggu</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Disetujui</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Ditolak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCorrectionTypeLabel = (type: string) => {
    switch (type) {
      case 'clock_in':
        return 'Waktu Masuk';
      case 'clock_out':
        return 'Waktu Keluar';
      case 'both':
        return 'Keduanya';
      default:
        return type;
    }
  };

  const formatDateTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return '-';
    return new Date(dateTimeString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';
    return timeString.substring(0, 5);
  };

  if (loading && corrections.length === 0) {
    return <CorrectionsSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Koreksi Absensi</h1>
          <p className="text-muted-foreground">
            Kelola permintaan perubahan data kehadiran
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Buat Permintaan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Buat Permintaan Koreksi</DialogTitle>
              <DialogDescription>
                Ajukan permintaan koreksi data absensi Anda
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="attendance_id">ID Absensi *</Label>
                <Input
                  id="attendance_id"
                  type="number"
                  value={formData.attendance_id || ''}
                  onChange={(e) => setFormData({ ...formData, attendance_id: parseInt(e.target.value) || 0 })}
                  placeholder="Contoh: 123"
                />
                {formErrors.attendance_id && (
                  <p className="text-sm text-destructive">{formErrors.attendance_id}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="correction_type">Tipe Koreksi *</Label>
                <Select
                  value={formData.correction_type}
                  onValueChange={(value: any) => setFormData({ ...formData, correction_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clock_in">Waktu Masuk</SelectItem>
                    <SelectItem value="clock_out">Waktu Keluar</SelectItem>
                    <SelectItem value="both">Keduanya</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.correction_type && (
                  <p className="text-sm text-destructive">{formErrors.correction_type}</p>
                )}
              </div>

              {(formData.correction_type === 'clock_in' || formData.correction_type === 'both') && (
                <div className="space-y-2">
                  <Label htmlFor="new_clock_in_time">Waktu Masuk Baru *</Label>
                  <Input
                    id="new_clock_in_time"
                    type="time"
                    value={formData.new_clock_in_time}
                    onChange={(e) => setFormData({ ...formData, new_clock_in_time: e.target.value })}
                  />
                  {formErrors.new_clock_in_time && (
                    <p className="text-sm text-destructive">{formErrors.new_clock_in_time}</p>
                  )}
                </div>
              )}

              {(formData.correction_type === 'clock_out' || formData.correction_type === 'both') && (
                <div className="space-y-2">
                  <Label htmlFor="new_clock_out_time">Waktu Keluar Baru *</Label>
                  <Input
                    id="new_clock_out_time"
                    type="time"
                    value={formData.new_clock_out_time}
                    onChange={(e) => setFormData({ ...formData, new_clock_out_time: e.target.value })}
                  />
                  {formErrors.new_clock_out_time && (
                    <p className="text-sm text-destructive">{formErrors.new_clock_out_time}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">Alasan Koreksi *</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Jelaskan alasan pengajuan koreksi (minimal 10 karakter)"
                  rows={4}
                />
                {formErrors.reason && (
                  <p className="text-sm text-destructive">{formErrors.reason}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.reason.length}/10 karakter minimum
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleCreateCorrection} disabled={submitting}>
                {submitting ? 'Menyimpan...' : 'Ajukan Permintaan'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Label className="text-sm text-muted-foreground">Filter Status:</Label>
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="pending">Menunggu</SelectItem>
            <SelectItem value="approved">Disetujui</SelectItem>
            <SelectItem value="rejected">Ditolak</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto text-sm text-muted-foreground">
          Total: {total} permintaan
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Permintaan Koreksi</CardTitle>
          <CardDescription>
            Riwayat pengajuan koreksi data absensi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Memuat data...</p>
            </div>
          ) : corrections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Belum ada permintaan koreksi</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Waktu Lama</TableHead>
                    <TableHead>Waktu Baru</TableHead>
                    <TableHead>Alasan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Diajukan</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {corrections.map((correction) => (
                    <TableRow key={correction.id}>
                      <TableCell className="font-mono text-sm">#{correction.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getCorrectionTypeLabel(correction.correction_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {(correction.correction_type === 'clock_in' || correction.correction_type === 'both') && (
                            <div>
                              <span className="text-muted-foreground">Masuk: </span>
                              {formatTime(correction.original_clock_in_time)}
                            </div>
                          )}
                          {(correction.correction_type === 'clock_out' || correction.correction_type === 'both') && (
                            <div>
                              <span className="text-muted-foreground">Keluar: </span>
                              {formatTime(correction.original_clock_out_time)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1 font-semibold text-primary">
                          {(correction.correction_type === 'clock_in' || correction.correction_type === 'both') && (
                            <div>
                              <span className="text-muted-foreground font-normal">Masuk: </span>
                              {formatTime(correction.new_clock_in_time)}
                            </div>
                          )}
                          {(correction.correction_type === 'clock_out' || correction.correction_type === 'both') && (
                            <div>
                              <span className="text-muted-foreground font-normal">Keluar: </span>
                              {formatTime(correction.new_clock_out_time)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm line-clamp-2">{correction.reason}</p>
                      </TableCell>
                      <TableCell>{getStatusBadge(correction.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(correction.requested_at)}
                      </TableCell>
                      <TableCell className="text-center">
                        {correction.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCorrectionId(correction.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Berikutnya
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Permintaan Koreksi?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Permintaan koreksi akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCorrection} disabled={submitting}>
              {submitting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============ COMPONENTS ============

function CorrectionsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <Skeleton className="h-px w-full" />

      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-[200px]" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
