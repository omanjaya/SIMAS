import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ClipboardCheck, FileDown } from 'lucide-react';

export default function Dashboard2Actions() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button asChild variant='outline'>
        <Link href='/school-calendar'>
          <ClipboardCheck className='mr-2 h-4 w-4' /> Agenda Harian
        </Link>
      </Button>
      <Button asChild variant='default'>
        <Link href='/reports'>
          <FileDown className='mr-2 h-4 w-4' /> Laporan Bulanan
        </Link>
      </Button>
    </div>
  );
}
