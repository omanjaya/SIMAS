'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  DatabaseBackup, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  Calendar, 
  Clock,
  FileArchive
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Backup {
  filename: string;
  size: number;
  size_formatted: string;
  created_at: string;
  download_url: string;
}

export default function BackupPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [creationProgress, setCreationProgress] = useState(0);
  const [creationStatus, setCreationStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  // Get backups
  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/backups', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setBackups(data.data || []);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch backups',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch backups',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    setCreating(true);
    setCreationProgress(0);
    setCreationStatus('creating');

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setCreationProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 300);

      const response = await fetch('/api/backups/run', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: `attendance_backup_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.zip`
        }),
      });

      clearInterval(interval);
      setCreationProgress(100);

      const result = await response.json();

      if (response.ok) {
        setCreationStatus('success');
        toast({
          title: 'Backup Created',
          description: 'Backup created successfully',
        });
        // Refresh the backup list
        fetchBackups();
      } else {
        setCreationStatus('error');
        toast({
          title: 'Backup Failed',
          description: result.message || 'Failed to create backup',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setCreationStatus('error');
      toast({
        title: 'Backup Failed',
        description: 'Failed to create backup',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const downloadBackup = (filename: string) => {
    // In a real implementation, you would download the backup file
    // For now, we'll just show a toast
    toast({
      title: 'Download Started',
      description: `Downloading ${filename}...`,
    });
    
    // For actual download implementation:
    // const downloadUrl = `/api/backups/${encodeURIComponent(filename)}/download`;
    // window.open(downloadUrl, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Backup & Restore</h1>
        <p className="text-muted-foreground">
          Create, manage, and download system backups
        </p>
      </div>

      {/* Create Backup Card */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Backup</CardTitle>
          <CardDescription>
            Create a backup of the attendance system database and storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <Button 
              onClick={createBackup} 
              disabled={creating}
              className="w-full sm:w-auto"
            >
              {creating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Creating Backup...
                </>
              ) : (
                <>
                  <DatabaseBackup className="mr-2 h-4 w-4" />
                  Create Backup
                </>
              )}
            </Button>
            
            <div className="text-sm text-muted-foreground flex-1">
              <p>
                This will create a backup of the entire attendance system including database and storage files.
                The backup will be stored securely on the server.
              </p>
            </div>
          </div>

          {creationStatus === 'creating' && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Creating backup...</span>
                <span>{creationProgress}%</span>
              </div>
              <Progress value={creationProgress} className="w-full" />
            </div>
          )}

          {creationStatus === 'success' && (
            <Alert className="mt-4">
              <DatabaseBackup className="h-4 w-4" />
              <AlertTitle>Backup Created Successfully</AlertTitle>
              <AlertDescription>
                Your backup has been created and is available in the backup list.
              </AlertDescription>
            </Alert>
          )}

          {creationStatus === 'error' && (
            <Alert variant="destructive" className="mt-4">
              <DatabaseBackup className="h-4 w-4" />
              <AlertTitle>Backup Failed</AlertTitle>
              <AlertDescription>
                There was an error creating the backup. Please try again.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Backup List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Backups</CardTitle>
          <CardDescription>
            List of all available system backups
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
              Loading backups...
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No backups found. Create your first backup to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {backups.map((backup, index) => (
                <div 
                  key={index} 
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileArchive className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{backup.filename}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {formatDate(backup.created_at)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        Size: {backup.size_formatted}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadBackup(backup.filename)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled // Restore feature is not implemented yet (as per requirements)
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Restore
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Card>
        <CardHeader>
          <CardTitle>Important Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <DatabaseBackup className="h-4 w-4" />
              <AlertTitle>Backup Security</AlertTitle>
              <AlertDescription>
                All backups are stored securely on the server with restricted access. Only administrators 
                can download backup files. Ensure backups are stored securely if downloaded locally.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <h3 className="font-medium">Restore Process</h3>
              <p className="text-sm text-muted-foreground">
                The restore process is currently designed as a manual procedure for security reasons. 
                To restore from a backup, please contact your system administrator who can run the 
                restore command directly on the server. The web interface for restore will be 
                implemented in a future release after proper approval workflows are established.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Best Practices</h3>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Regularly create backups, especially before making major system changes</li>
                <li>Store downloaded backups in secure locations with restricted access</li>
                <li>Test restore procedures periodically to ensure backup integrity</li>
                <li>Keep multiple backup copies for redundancy</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}