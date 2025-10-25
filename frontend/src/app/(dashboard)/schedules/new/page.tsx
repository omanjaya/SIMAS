import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarPlus, ArrowLeft } from "lucide-react";

export default function NewSchedulePage() {
  return (
    <>
      <Header />
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tambah Jadwal Mengajar</h1>
            <p className="text-muted-foreground">
              Formulir pembuatan jadwal masih disiapkan. Silakan kembali ke daftar jadwal atau hubungi admin akademik.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/schedules">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Jadwal
            </Link>
          </Button>
        </div>

        <Card className="border-dashed">
          <CardHeader className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Segera Hadir</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Kami sedang mengembangkan modul untuk membuat dan mengelola jadwal guru secara langsung di dashboard.
            Bila Anda membutuhkan penjadwalan mendesak, mohon informasikan melalui koordinator kurikulum.
          </CardContent>
        </Card>
      </div>
    </>
  );
}
