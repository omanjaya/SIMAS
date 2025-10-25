import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImportHistoryList } from "@/components/employee/import-history-list";

export default function ImportHistoryPage() {
  return (
    <>
      <Header />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Riwayat Impor Pegawai</h1>
          <p className="text-muted-foreground">
            Lihat riwayat impor data pegawai secara massal
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Riwayat Impor</CardTitle>
          </CardHeader>
          <CardContent>
            <ImportHistoryList />
          </CardContent>
        </Card>
      </div>
    </>
  );
}