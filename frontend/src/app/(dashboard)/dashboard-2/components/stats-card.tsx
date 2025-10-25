import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: string;
  description?: string;
  icon?: ReactNode;
  accent?: 'blue' | 'green' | 'orange' | 'red';
}

const accentStyles: Record<NonNullable<StatsCardProps['accent']>, string> = {
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-300',
  green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-300',
  red: 'bg-rose-500/10 text-rose-600 dark:text-rose-300',
};

export default function StatsCard({ label, value, description, icon, accent = 'blue' }: StatsCardProps) {
  return (
    <Card className='h-full w-full border border-white/10 bg-white/5 shadow-sm backdrop-blur'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 p-4'>
        <CardTitle className='text-sm font-medium text-slate-200'>{label}</CardTitle>
        {icon ? (
          <span
            className={cn('flex h-8 w-8 items-center justify-center rounded-full', accentStyles[accent])}
          >
            {icon}
          </span>
        ) : null}
      </CardHeader>
      <CardContent className='space-y-2 px-4 pb-4 pt-0'>
        <p className='text-3xl font-bold text-slate-50'>{value}</p>
        {description ? (
          <p className='text-xs text-slate-300/80'>{description}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
