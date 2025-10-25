'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { profileService, MyProfileResponse } from '@/lib/api/profile';
import {
  User,
  Briefcase,
  MapPin,
  CreditCard,
  Mail,
  Phone,
  Calendar,
  Building,
  Award,
  TrendingUp
} from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState<MyProfileResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getMyProfile();
      setProfile(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      setError(err.response?.data?.message || 'Gagal memuat data profil');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Data profil tidak ditemukan</p>
      </div>
    );
  }

  const { user: userData, employee } = profile;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profil Pegawai</h1>
          <p className="text-muted-foreground">
            Informasi lengkap data kepegawaian
          </p>
        </div>
        <Badge variant={employee.employment_status === 'Active' ? 'default' : 'secondary'}>
          {employee.employment_status}
        </Badge>
      </div>

      <Separator />

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* Personal Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Informasi Pribadi</CardTitle>
            </div>
            <CardDescription>Data personal pegawai</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow
              icon={<User className="h-4 w-4" />}
              label="Nama Lengkap"
              value={employee.full_name}
            />
            <InfoRow
              icon={<Award className="h-4 w-4" />}
              label="NIP"
              value={employee.employee_code}
            />
            <InfoRow
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={userData.email}
            />
            <InfoRow
              icon={<Phone className="h-4 w-4" />}
              label="No. Telepon"
              value={employee.phone || '-'}
            />
            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Tanggal Bergabung"
              value={new Date(employee.join_date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            />
          </CardContent>
        </Card>

        {/* Employment Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <CardTitle>Informasi Kepegawaian</CardTitle>
            </div>
            <CardDescription>Data jabatan dan instansi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow
              icon={<Briefcase className="h-4 w-4" />}
              label="Jabatan Utama"
              value={employee.position}
            />
            {employee.secondary_position && (
              <InfoRow
                icon={<Briefcase className="h-4 w-4" />}
                label="Jabatan Tambahan"
                value={employee.secondary_position}
                badge
              />
            )}
            <InfoRow
              icon={<Building className="h-4 w-4" />}
              label="Instansi"
              value={employee.department}
            />
            <InfoRow
              icon={<Award className="h-4 w-4" />}
              label="Golongan"
              value={employee.rank}
              highlight
            />
            <InfoRow
              icon={<TrendingUp className="h-4 w-4" />}
              label="Kelas Jabatan"
              value={employee.job_class}
              highlight
            />
          </CardContent>
        </Card>

        {/* Salary Info Card */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <CardTitle>Informasi Tunjangan</CardTitle>
            </div>
            <CardDescription>Data tunjangan dan gaji</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-primary/10 p-4">
              <label className="text-sm font-medium text-muted-foreground">
                Besaran TPP (Tunjangan Penghasilan Pegawai)
              </label>
              <p className="mt-2 text-3xl font-bold text-primary">
                Rp {employee.tpp_amount?.toLocaleString('id-ID') || '0'}
              </p>
            </div>
            <InfoRow
              label="Jenis Kepegawaian"
              value={employee.employment_type}
            />
          </CardContent>
        </Card>

        {/* Address Info Card */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle>Alamat Tempat Tinggal</CardTitle>
            </div>
            <CardDescription>Alamat KTP dan domisili</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Alamat Sesuai KTP
              </label>
              <p className="mt-2 text-sm leading-relaxed">
                {employee.address_ktp || employee.address || 'Belum diisi'}
              </p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Alamat Domisili
              </label>
              <p className="mt-2 text-sm leading-relaxed">
                {employee.address_domisili ||
                 <span className="text-muted-foreground italic">
                   Sama dengan alamat KTP
                 </span>
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Face Recognition Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Verifikasi Wajah</CardTitle>
            </div>
            <CardDescription>Status pendaftaran face recognition</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  Status: {profile.face_registered ? 'Terdaftar' : 'Belum Terdaftar'}
                </p>
                {profile.face_template_updated_at && (
                  <p className="text-sm text-muted-foreground">
                    Terakhir update: {new Date(profile.face_template_updated_at).toLocaleDateString('id-ID')}
                  </p>
                )}
              </div>
              <Badge variant={profile.face_registered ? 'default' : 'secondary'}>
                {profile.face_registered ? '✓ Aktif' : '✗ Tidak Aktif'}
              </Badge>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

// ============ COMPONENTS ============

interface InfoRowProps {
  icon?: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  badge?: boolean;
}

function InfoRow({ icon, label, value, highlight, badge }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      {icon && <div className="mt-1 text-muted-foreground">{icon}</div>}
      <div className="flex-1">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <p className={`mt-1 ${highlight ? 'text-lg font-semibold text-primary' : ''}`}>
          {badge ? <Badge variant="outline">{value}</Badge> : value}
        </p>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>

      <Skeleton className="h-px w-full" />

      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className={i === 3 || i === 4 ? 'md:col-span-2 lg:col-span-1' : ''}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
