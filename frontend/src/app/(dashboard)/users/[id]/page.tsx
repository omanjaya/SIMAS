'use client';

import { useState, useEffect } from 'react';
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  CalendarCheck,
  Edit,
  Activity
} from "lucide-react";
import Link from "next/link";
import { employeeService } from '@/lib/api/employees';
import { Employee } from '@/types/employees';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch employee data from API
  const fetchEmployee = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert id to number if needed
      const employeeId = typeof id === 'string' ? parseInt(id, 10) : Array.isArray(id) ? parseInt(id[0], 10) : id;
      
      if (isNaN(employeeId)) {
        throw new Error('Invalid employee ID');
      }
      
      const data = await employeeService.getById(employeeId);
      setEmployee(data);
    } catch (err) {
      console.error('Failed to fetch employee:', err);
      setError('Gagal memuat data pegawai. Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEmployee();
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="p-6 flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (error || !employee) {
    return (
      <>
        <Header />
        <div className="p-6">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-500 mb-4">{error || 'Pegawai tidak ditemukan'}</p>
              <Button asChild>
                <Link href="/users">Kembali ke Daftar Pegawai</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Detail Pegawai</h1>
            <Button asChild>
              <Link href={`/users/${employee.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Pegawai
              </Link>
            </Button>
          </div>
          <p className="text-muted-foreground">
            Informasi lengkap tentang pegawai {employee.first_name} {employee.last_name}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employee Info Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Informasi Pegawai</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-muted-foreground mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Nama</p>
                  <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-muted-foreground mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{employee.email}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-muted-foreground mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Telepon</p>
                  <p className="font-medium">{employee.phone || '-'}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-muted-foreground mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Alamat</p>
                  <p className="font-medium">{employee.address || '-'}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-muted-foreground mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Bergabung</p>
                  <p className="font-medium">
                    {employee.created_at ? new Date(employee.created_at).toLocaleDateString('id-ID') : '-'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 text-muted-foreground mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Jabatan</p>
                  <p className="font-medium">{employee.position || '-'}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-muted-foreground mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Gaji</p>
                  <p className="font-medium">
                    {employee.salary ? `Rp ${Number(employee.salary).toLocaleString('id-ID')}` : '-'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-muted-foreground mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge 
                    variant={employee.status === 'active' ? 'default' : 'secondary'}
                    className={employee.status === 'on_leave' ? 'bg-yellow-100 text-yellow-800' : ''}
                  >
                    {employee.status === 'active' ? 'Aktif' : 
                     employee.status === 'on_leave' ? 'Cuti' : 
                     employee.status === 'suspended' ? 'Nonaktif' : 'Tidak Diketahui'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employee Attendance and Leave Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Absensi Terbaru</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarCheck className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p>Data absensi akan segera ditampilkan</p>
                  <p className="text-sm mt-2">Fitur absensi sedang dalam pengembangan</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pengajuan Izin Terbaru</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarCheck className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p>Data pengajuan izin akan segera ditampilkan</p>
                  <p className="text-sm mt-2">Fitur pengajuan izin sedang dalam pengembangan</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
