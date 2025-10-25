'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Clock,
  Eye,
  Database
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  model: string;
  payload: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    model: '',
    dateFrom: '',
    dateTo: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const { toast } = useToast();

  // Get audit logs
  useEffect(() => {
    fetchAuditLogs();
  }, [currentPage, filters, searchTerm]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: '10',
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (filters.userId) params.append('user_id', filters.userId);
      if (filters.action) params.append('action', filters.action);
      if (filters.model) params.append('model', filters.model);
      if (filters.dateFrom) params.append('date_from', filters.dateFrom);
      if (filters.dateTo) params.append('date_to', filters.dateTo);
      
      const response = await fetch(`/api/audit-logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setLogs(data.data);
        setTotalLogs(data.pagination?.total || 0);
        setTotalPages(data.pagination?.last_page || 1);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch audit logs',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch audit logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">
          Track all important system activities and user actions
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter audit logs by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search actions..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">User ID</label>
              <Input
                placeholder="User ID"
                value={filters.userId}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Action</label>
              <Input
                placeholder="Action"
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Model</label>
              <Input
                placeholder="Model"
                value={filters.model}
                onChange={(e) => handleFilterChange('model', e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Date From</label>
              <div className="relative">
                <Calendar className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Date To</label>
              <div className="relative">
                <Calendar className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Log Entries</CardTitle>
          <CardDescription>
            {totalLogs} log{totalLogs !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
              Loading audit logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No audit logs found
            </div>
          ) : (
            <>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="font-medium">{log.user?.name || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">{log.user?.email || 'N/A'}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {log.model || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.ip_address || 'N/A'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                            {formatDate(log.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalLogs)} of {totalLogs} entries
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}