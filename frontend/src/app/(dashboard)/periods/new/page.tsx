import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarPlus, ArrowLeft } from "lucide-react";

export default function NewPeriodPage() {
  return (
    <>
      <Header />
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tambah Periode Jam Kerja</h1>
            <p className="text-muted-foreground">
              Modul pembuatan periode baru masih dalam pengembangan.
              Anda dapat menggunakan tombol di bawah untuk kembali ke daftar periode.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/periods">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar Periode
            </Link>
          </Button>
        </div>

        <Card className="border-dashed">
          <CardHeader className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Segera Hadir</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Tim kami sedang menyiapkan formulir untuk menambahkan periode jam kerja baru.
            Untuk sementara, pengaturan periode dapat dilakukan melalui sistem lama atau dengan menghubungi administrator kurikulum.
          </CardContent>
        </Card>
      </div>
    </>
  );
}
