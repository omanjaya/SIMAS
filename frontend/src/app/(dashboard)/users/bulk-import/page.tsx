import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BulkUserImportForm } from "@/components/employee/bulk-user-import-form";

export default function BulkUserImportPage() {
  return (
    <>
      <Header />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Impor Data Pegawai</h1>
          <p className="text-muted-foreground">
            Impor data pegawai secara massal melalui file CSV
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Impor Data Pegawai</CardTitle>
              <CardDescription>
                Unggah file CSV yang berisi data pegawai untuk diimpor ke sistem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BulkUserImportForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Panduan Impor</CardTitle>
              <CardDescription>
                Informasi tentang format file CSV yang diperlukan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Format yang Didukung:</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>File CSV atau TXT</li>
                    <li>Ukuran maksimal 10MB</li>
                    <li>Enkoding UTF-8 disarankan</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Kolom yang Diperlukan:</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>employee_code (kode unik pegawai)</li>
                    <li>first_name (nama depan)</li>
                    <li>email (alamat email unik)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Kolom Opsional:</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>last_name</li>
                    <li>phone</li>
                    <li>address</li>
                    <li>date_of_birth</li>
                    <li>gender</li>
                    <li>position</li>
                    <li>department</li>
                    <li>hire_date</li>
                    <li>employment_type</li>
                    <li>salary</li>
                    <li>salary_type</li>
                    <li>status</li>
                    <li>role</li>
                    <li>password</li>
                  </ul>
                </div>

                <div className="pt-4">
                  <a 
                    href="/api/user-imports/template" 
                    download
                    className="inline-flex items-center text-blue-600 hover:underline text-sm"
                  >
                    Unduh Template CSV
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}