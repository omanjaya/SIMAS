import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Filter, Search, User, Settings, FileText, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AuditLogsPage() {
  return (
    <>
      <Header />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Log Aktivitas</h1>
          <p className="text-muted-foreground">
            Log audit aktivitas sistem dan pengguna SMP Saraswati Denpasar
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Ekspor
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari aktivitas..."
                  className="pl-8 w-full rounded-md border px-3 py-2"
                />
              </div>
            </div>
            
            <div className="border rounded-md">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-3">Pengguna</th>
                    <th className="text-left p-3">Aktivitas</th>
                    <th className="text-left p-3">Modul</th>
                    <th className="text-left p-3">Waktu</th>
                    <th className="text-left p-3">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        Admin SIMAS
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <Settings className="h-4 w-4 mr-2 text-blue-500" />
                        <span>Ubah pengaturan umum</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">Pengaturan</Badge>
                    </td>
                    <td className="p-3">19 Okt 2025, 14:32</td>
                    <td className="p-3">192.168.1.10</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        Keuangan Staff
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-green-500" />
                        <span>Buat laporan penggajian</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">Laporan</Badge>
                    </td>
                    <td className="p-3">19 Okt 2025, 10:15</td>
                    <td className="p-3">192.168.1.15</td>
                  </tr>
                  <tr>
                    <td className="p-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        HRD Manager
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <Database className="h-4 w-4 mr-2 text-purple-500" />
                        <span>Tambah data pegawai baru</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">Pegawai</Badge>
                    </td>
                    <td className="p-3">18 Okt 2025, 09:45</td>
                    <td className="p-3">192.168.1.12</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Menampilkan 1-10 dari 142 aktivitas
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Sebelumnya
                </Button>
                <Button variant="outline" size="sm">
                  1
                </Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
                <Button variant="outline" size="sm">
                  Berikutnya
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}