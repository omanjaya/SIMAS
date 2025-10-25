import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarPlus, ArrowLeft } from "lucide-react";

export default function NewSchoolCalendarEventPage() {
  return (
    <>
      <Header />
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tambah Kegiatan Kalender</h1>
            <p className="text-muted-foreground">
              Fitur penambahan kegiatan akan segera tersedia. Sementara ini, silakan catat kegiatan baru secara manual.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/school-calendar">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Kalender
            </Link>
          </Button>
        </div>

        <Card className="border-dashed">
          <CardHeader className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Segera Hadir</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Kami sedang menyiapkan formulir untuk menambahkan kegiatan sekolah secara langsung dari dashboard.
            Jika Anda memiliki kebutuhan mendesak, mohon hubungi administrator akademik untuk bantuan.
          </CardContent>
        </Card>
      </div>
    </>
  );
}
