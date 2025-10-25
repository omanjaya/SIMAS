import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Filter, Search, Zap, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function EventsLogsPage() {
  const events = [
    {
      id: 1,
      event: "attendance.processed",
      description: "Proses absensi harian selesai",
      timestamp: "2025-10-19 17:00:05",
      status: "success",
      details: "248 pegawai diproses, 4 tidak hadir"
    },
    {
      id: 2,
      event: "backup.completed",
      description: "Backup database harian selesai",
      timestamp: "2025-10-19 02:15:22",
      status: "success",
      details: "245MB data berhasil dicadangkan"
    },
    {
      id: 3,
      event: "api.rate_limited",
      description: "Pembatasan panggilan API terpicu",
      timestamp: "2025-10-18 14:30:12",
      status: "warning",
      details: "Client ID 12345 melebihi batas 1000/hari"
    },
    {
      id: 4,
      event: "system.error",
      description: "Kesalahan sistem kritis",
      timestamp: "2025-10-18 09:15:45",
      status: "error",
      details: "Gagal menyimpan data ke database"
    }
  ];

  return (
    <>
      <Header />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Kejadian & Log Sistem</h1>
          <p className="text-muted-foreground">
            Log kejadian sistem dan kesalahan untuk SIMAS SMP Saraswati
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Kejadian Terbaru</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Zap className="h-4 w-4 mr-2" />
                Real-time
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari kejadian..."
                  className="pl-8 w-full rounded-md border px-3 py-2"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {event.status === 'success' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {event.status === 'warning' && (
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      )}
                      {event.status === 'error' && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <h3 className="font-mono text-sm">{event.event}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={
                              event.status === 'success' 
                                ? 'default' 
                                : event.status === 'warning' 
                                  ? 'secondary' 
                                  : 'destructive'
                            }
                          >
                            {event.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {event.timestamp}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 font-mono">
                        {event.details}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Menampilkan 1-10 dari 142 kejadian
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

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Statistik Kejadian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border rounded p-4 text-center">
                <div className="text-2xl font-bold text-green-600">1,248</div>
                <div className="text-sm text-muted-foreground">Sukses</div>
              </div>
              <div className="border rounded p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">86</div>
                <div className="text-sm text-muted-foreground">Peringatan</div>
              </div>
              <div className="border rounded p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">24</div>
                <div className="text-sm text-muted-foreground">Error</div>
              </div>
              <div className="border rounded p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">1,358</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}