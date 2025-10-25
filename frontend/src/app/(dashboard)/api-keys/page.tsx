import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Key, Plus, Copy, Eye, EyeOff, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ApiKeysPage() {
  const apiKeys = [
    {
      id: 1,
      name: "Integrasi Presensi",
      key: "simas_prsnc_************************************xyz",
      created: "2025-01-15",
      lastUsed: "2025-10-18",
      status: "aktif"
    },
    {
      id: 2,
      name: "Laporan Bulanan",
      key: "simas_lpr_*************************************abc",
      created: "2025-03-22",
      lastUsed: "2025-10-15",
      status: "aktif"
    },
    {
      id: 3,
      name: "Sinkronisasi Data",
      key: "simas_sync_************************************789",
      created: "2024-12-10",
      lastUsed: "2025-09-30",
      status: "nonaktif"
    }
  ];

  return (
    <>
      <Header />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Kunci API</h1>
          <p className="text-muted-foreground">
            Kelola kunci API untuk integrasi eksternal SIMAS SMP Saraswati
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Kelola Kunci API</CardTitle>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kunci API
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Petunjuk Penggunaan</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Kunci API digunakan untuk mengintegrasikan sistem eksternal dengan SIMAS. 
                Simpan kunci API dengan aman dan jangan bagikan kepada pihak yang tidak berkepentingan.
              </p>
              <div className="bg-muted p-4 rounded-md text-sm">
                <p className="font-mono">Authorization: Bearer YOUR_API_KEY</p>
              </div>
            </div>

            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="border rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{apiKey.name}</span>
                        <Badge variant={apiKey.status === 'aktif' ? 'default' : 'secondary'}>
                          {apiKey.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-sm bg-muted p-2 rounded mt-2">
                        <span className="truncate">{apiKey.key}</span>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Dibuat: {apiKey.created}</span>
                        <span>Terakhir digunakan: {apiKey.lastUsed}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Endpoint API Tersedia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded">
                <div className="font-mono text-sm">GET /api/attendances</div>
                <p className="text-sm text-muted-foreground mt-1">Ambil data kehadiran</p>
              </div>
              <div className="p-3 border rounded">
                <div className="font-mono text-sm">POST /api/attendances/clock-in</div>
                <p className="text-sm text-muted-foreground mt-1">Absen masuk</p>
              </div>
              <div className="p-3 border rounded">
                <div className="font-mono text-sm">POST /api/attendances/clock-out</div>
                <p className="text-sm text-muted-foreground mt-1">Absen keluar</p>
              </div>
              <div className="p-3 border rounded">
                <div className="font-mono text-sm">GET /api/employees</div>
                <p className="text-sm text-muted-foreground mt-1">Ambil data pegawai</p>
              </div>
              <div className="p-3 border rounded">
                <div className="font-mono text-sm">GET /api/leave-requests</div>
                <p className="text-sm text-muted-foreground mt-1">Ambil data pengajuan izin</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}