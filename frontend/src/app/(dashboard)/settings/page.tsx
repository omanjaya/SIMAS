'use client';

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, CreditCard, Bell } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const section = searchParams?.get('section');

  useEffect(() => {
    if (!section) return;
    const target = document.getElementById(section);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [section]);

  const navItems = useMemo(() => ([
    { id: 'profile', icon: User, label: 'Profil Saya' },
    { id: 'notifications', icon: Bell, label: 'Notifikasi & Sistem' },
    { id: 'billing', icon: CreditCard, label: 'Pembayaran' },
  ]), []);

  return (
    <>
      <Header />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Pengaturan Sistem</h1>
          <p className="text-muted-foreground">
            Kelola pengaturan umum dan profil SMP Saraswati Denpasar
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="grid gap-2">
                  {navItems.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={`justify-start ${section === item.id ? 'bg-muted' : ''}`}
                      asChild
                    >
                      <Link href={`/settings?section=${item.id}`}>
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </Link>
                    </Button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card id="profile">
              <CardHeader>
                <CardTitle>Profil Saya</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Nama Lengkap</label>
                      <input
                        type="text"
                        defaultValue="Admin SIMAS"
                        className="w-full rounded-md border px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <input
                        type="email"
                        defaultValue="admin@smp-saraswati.sch.id"
                        className="w-full rounded-md border px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Jabatan</label>
                      <input
                        type="text"
                        defaultValue="Administrator"
                        className="w-full rounded-md border px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Nomor Telepon</label>
                      <input
                        type="tel"
                        defaultValue="+62 812-3456-7890"
                        className="w-full rounded-md border px-3 py-2 mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Alamat</label>
                    <textarea
                      defaultValue="Jl. Raya Sesetan No. 123, Denpasar, Bali"
                      className="w-full rounded-md border px-3 py-2 mt-1 min-h-20"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button>Simpan Perubahan</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card id="notifications" className="mt-6">
              <CardHeader>
                <CardTitle>Pengaturan Notifikasi & Sistem</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Notifikasi Email</p>
                        <p className="text-sm text-muted-foreground">Kirim notifikasi ke email</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Notifikasi Push</p>
                        <p className="text-sm text-muted-foreground">Tampilkan notifikasi di browser</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Mode Gelap</p>
                        <p className="text-sm text-muted-foreground">Gunakan tema gelap secara default</p>
                      </div>
                      <input type="checkbox" className="rounded" />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Backup Otomatis</p>
                        <p className="text-sm text-muted-foreground">Backup data secara otomatis</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button>Simpan Pengaturan</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card id="billing" className="mt-6">
              <CardHeader>
                <CardTitle>Pengaturan Penagihan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Integrasi pembayaran dan pengaturan penagihan akan segera tersedia.
                  Sementara ini, silakan hubungi administrator keuangan untuk pembaruan tagihan.
                </p>
                <div className="flex justify-end mt-4">
                  <Button variant="outline">Hubungi Admin Keuangan</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
