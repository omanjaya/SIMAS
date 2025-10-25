# 📊 FRONTEND - Admin Dashboard

## 📋 OVERVIEW

Dashboard untuk admin tracking profile completion status.

---

## 🎯 COMPONENT

**File**: `components/admin/profile-completion-tracker.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function ProfileCompletionTracker() {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    incomplete: 0,
    percentage: 0
  });

  const [incompleteEmployees, setIncompleteEmployees] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const response = await fetch('/api/employees/profile-completion-stats');
    const data = await response.json();
    setStats(data.stats);
    setIncompleteEmployees(data.incomplete_employees);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Kelengkapan Profil Pegawai</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span>{stats.completed} dari {stats.total} sudah lengkap</span>
              <span className="font-bold">{stats.percentage}%</span>
            </div>
            <Progress value={stats.percentage} />
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Belum Lengkap ({stats.incomplete}):</h4>
            {incompleteEmployees.map((emp: any) => (
              <div key={emp.id} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <div className="font-medium">{emp.first_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {emp.employee_code} • Imported {emp.days_ago} days ago
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Remind
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

**Next**: [09_TESTING.md](./09_TESTING.md)
