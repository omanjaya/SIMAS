import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CalendarCheck, FileText } from 'lucide-react';

export default function Dashboard2Actions() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button asChild variant='outline'>
        <Link href='/attendance'>
          <CalendarCheck className='mr-2 h-4 w-4' /> Rekap Absensi
        </Link>
      </Button>
      <Button asChild variant='default'>
        <Link href='/leave-requests'>
          <FileText className='mr-2 h-4 w-4' /> Pengajuan Izin
        </Link>
      </Button>
    </div>
  );
}
