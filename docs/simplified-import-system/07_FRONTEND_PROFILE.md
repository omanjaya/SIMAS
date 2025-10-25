# 📝 FRONTEND - Complete Profile Page

## 📋 OVERVIEW

Page untuk user melengkapi profil saat first login.

---

## 🎨 PAGE COMPONENT

**File**: `app/(auth)/complete-profile/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function CompleteProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    date_of_birth: '',
    gender: '',
    position: '',
    department: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Profile completed successfully!');
        router.push('/dashboard');
      } else {
        toast.error(result.message || 'Failed to complete profile');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Lengkapi Profil Anda</CardTitle>
          <CardDescription>
            Sebelum mengakses sistem, mohon lengkapi data diri Anda terlebih dahulu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name */}
            <div>
              <Label htmlFor="first_name">Nama Depan *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <Label htmlFor="last_name">Nama Belakang</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">No. Telepon *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+6281234567890"
                required
              />
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address">Alamat Lengkap</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                rows={3}
              />
            </div>

            {/* Date of Birth */}
            <div>
              <Label htmlFor="date_of_birth">Tanggal Lahir *</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                required
              />
            </div>

            {/* Gender */}
            <div>
              <Label>Jenis Kelamin *</Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) => setFormData({...formData, gender: value})}
                required
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">Laki-laki</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">Perempuan</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Position */}
            <div>
              <Label htmlFor="position">Jabatan *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                placeholder="Guru Matematika"
                required
              />
            </div>

            {/* Department */}
            <div>
              <Label htmlFor="department">Departemen</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                placeholder="Matematika & IPA"
              />
            </div>

            {/* Emergency Contact */}
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-4">Kontak Darurat</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="emergency_contact_name">Nama *</Label>
                  <Input
                    id="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="emergency_contact_phone">No. Telepon *</Label>
                  <Input
                    id="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="emergency_contact_relation">Hubungan</Label>
                  <Input
                    id="emergency_contact_relation"
                    value={formData.emergency_contact_relation}
                    onChange={(e) => setFormData({...formData, emergency_contact_relation: e.target.value})}
                    placeholder="Istri / Suami / Orang Tua"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan & Lanjutkan'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

**Next**: [08_FRONTEND_ADMIN.md](./08_FRONTEND_ADMIN.md)
