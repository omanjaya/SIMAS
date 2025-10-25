'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, GraduationCap, Briefcase, Calendar, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { employeeService } from '@/lib/api/employees';

interface Stat {
  id: string;
  label: string;
  value: number;
  trend: number;
  trendLabel: string;
  icon: React.ElementType;
  filterKey: string;
  filterValue: string;
}

interface StatsCardsProps {
  onFilterApply: (filterKey: string, filterValue: string) => void;
  activeFilter?: { key: string; value: string } | null;
}

export function StatsCards({ onFilterApply, activeFilter }: StatsCardsProps) {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getStats();

      setStats([
        {
          id: 'total-active',
          label: 'Total Aktif',
          value: data.total_active,
          trend: data.total_active_trend,
          trendLabel: 'vs bulan lalu',
          icon: Users,
          filterKey: 'status',
          filterValue: 'active',
        },
        {
          id: 'total-teachers',
          label: 'Guru',
          value: data.total_teachers,
          trend: data.total_teachers_trend,
          trendLabel: 'vs bulan lalu',
          icon: GraduationCap,
          filterKey: 'role',
          filterValue: 'teacher',
        },
        {
          id: 'total-staff',
          label: 'Staff',
          value: data.total_staff,
          trend: data.total_staff_trend,
          trendLabel: 'vs bulan lalu',
          icon: Briefcase,
          filterKey: 'role',
          filterValue: 'employee',
        },
        {
          id: 'on-leave',
          label: 'Cuti Hari Ini',
          value: data.on_leave_today,
          trend: data.on_leave_today_trend,
          trendLabel: 'vs kemarin',
          icon: Calendar,
          filterKey: 'status',
          filterValue: 'on_leave',
        },
      ]);
    } catch (err) {
      setError('Failed to load statistics');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-8 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-destructive rounded-lg bg-destructive/10 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isActive = activeFilter?.key === stat.filterKey && activeFilter?.value === stat.filterValue;
        const isPositiveTrend = stat.trend >= 0;

        return (
          <Card
            key={stat.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              isActive && 'ring-2 ring-primary'
            )}
            onClick={() => onFilterApply(stat.filterKey, stat.filterValue)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="space-y-1">
                <h3 className="text-3xl font-bold tracking-tight">
                  {stat.value.toLocaleString()}
                </h3>

                <div className="flex items-center gap-1 text-xs">
                  {isPositiveTrend ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={cn(
                      'font-medium',
                      isPositiveTrend ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {isPositiveTrend ? '+' : ''}{stat.trend}%
                  </span>
                  <span className="text-muted-foreground">{stat.trendLabel}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}