'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="max-w-md w-full mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto bg-red-100 dark:bg-red-900/20 p-3 rounded-full w-12 h-12 flex items-center justify-center">
            <Lock className="h-6 w-6 text-red-500 dark:text-red-400" />
          </div>
          <CardTitle className="mt-4 text-xl">Akses Ditolak</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
          <Button asChild>
            <Link href="/dashboard">
              Kembali ke Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}