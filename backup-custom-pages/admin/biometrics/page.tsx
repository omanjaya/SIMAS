'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Database,
  Table
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BiometricImport {
  id: number;
  filename: string;
  user_id: number;
  total_records: number;
  successful_records: number;
  failed_records: number;
  summary: {
    total: number;
    successful: number;
    failed: number;
    success_rate: number;
  };
  errors: Array<{
    line: number;
    error: string;
    data: Record<string, any>;
  }>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  completed_at: string;
  created_at: string;
  user: {
    id: number;
    name: string;
  };
}

export default function BiometricsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [imports, setImports] = useState<BiometricImport[]>([]);
  const [loadingImports, setLoadingImports] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Get import history
  useEffect(() => {
    fetchImportHistory();
  }, []);

  const fetchImportHistory = async () => {
    try {
      setLoadingImports(true);
      const response = await fetch('/api/biometrics/imports', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setImports(data.data || []);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch import history',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch import history',
        variant: 'destructive',
      });
    } finally {
      setLoadingImports(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
      } else {
        toast({
          title: 'Invalid file type',
          description: 'Please select a CSV file',
          variant: 'destructive',
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a CSV file to upload',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus('uploading');

    try {
      const formData = new FormData();
      formData.append('csv_file', file);

      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 200);

      const response = await fetch('/api/biometrics/bulk-enrollment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      clearInterval(interval);
      setUploadProgress(100);

      const result = await response.json();

      if (response.ok) {
        setUploadStatus('success');
        setUploadResult(result);
        toast({
          title: 'Upload successful',
          description: 'Biometric enrollment file uploaded successfully',
        });
        
        // Refresh import history
        fetchImportHistory();
      } else {
        setUploadStatus('error');
        toast({
          title: 'Upload failed',
          description: result.message || 'Failed to upload file',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setUploadStatus('error');
      toast({
        title: 'Upload failed',
        description: 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const downloadSampleCSV = () => {
    // Create sample CSV content
    const csvContent = "employee_code,image_path\nEMP001,/images/employee1.jpg\nEMP002,/images/employee2.jpg\nEMP003,/images/employee3.jpg";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_biometric_import.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Biometric Management</h1>
        <p className="text-muted-foreground">
          Bulk enroll biometric templates for employees using CSV files
        </p>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upload">Bulk Enrollment</TabsTrigger>
          <TabsTrigger value="history">Import History</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Biometric CSV</CardTitle>
              <CardDescription>
                Upload a CSV file containing employee codes and image paths for face template enrollment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <Button 
                  variant="outline" 
                  onClick={downloadSampleCSV}
                  className="w-full sm:w-auto"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Sample CSV
                </Button>
                
                <div className="text-sm text-muted-foreground flex-1">
                  <p><strong>Required columns:</strong> employee_code, image_path</p>
                  <p><strong>Format:</strong> CSV with headers, maximum 10MB file size</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="csv-upload">Select CSV File</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={triggerFileSelect}
                    className="w-full sm:w-auto"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {file ? file.name : 'Choose CSV file'}
                  </Button>
                  {file && (
                    <Button 
                      type="button" 
                      variant="secondary"
                      onClick={() => setFile(null)}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {file && (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>File: {file.name}</span>
                    <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>

                  <Button 
                    onClick={handleUpload} 
                    disabled={uploading}
                    className="w-full"
                  >
                    {uploading ? (
                      <>
                        <Database className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload & Process
                      </>
                    )}
                  </Button>

                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  )}

                  {uploadStatus === 'success' && uploadResult && (
                    <Alert className="mt-4">
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Upload Successful</AlertTitle>
                      <AlertDescription>
                        Import ID: {uploadResult.import_id} - Status: {uploadResult.status}
                      </AlertDescription>
                    </Alert>
                  )}

                  {uploadStatus === 'error' && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Upload Failed</AlertTitle>
                      <AlertDescription>
                        There was an error uploading your file. Please try again.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Import History</CardTitle>
              <CardDescription>
                View and track previous biometric enrollment imports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingImports ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                  Loading import history...
                </div>
              ) : imports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No import history found
                </div>
              ) : (
                <div className="space-y-4">
                  {imports.map((importItem) => (
                    <div 
                      key={importItem.id} 
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="font-medium">{importItem.filename}</div>
                          <div className="text-sm text-muted-foreground">
                            Uploaded by {importItem.user.name} on {new Date(importItem.created_at).toLocaleString()}
                          </div>
                        </div>
                        <Badge 
                          variant={
                            importItem.status === 'completed' ? 'default' : 
                            importItem.status === 'processing' ? 'secondary' : 
                            importItem.status === 'pending' ? 'secondary' : 
                            'destructive'
                          }
                        >
                          {importItem.status}
                        </Badge>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{importItem.total_records}</div>
                          <div className="text-xs text-muted-foreground">Total Records</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{importItem.successful_records}</div>
                          <div className="text-xs text-muted-foreground">Successful</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{importItem.failed_records}</div>
                          <div className="text-xs text-muted-foreground">Failed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {importItem.summary?.success_rate ? `${importItem.summary.success_rate}%` : '-'}
                          </div>
                          <div className="text-xs text-muted-foreground">Success Rate</div>
                        </div>
                      </div>
                      
                      {importItem.status === 'completed' && importItem.completed_at && (
                        <div className="mt-2 text-xs text-muted-foreground flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          Completed: {new Date(importItem.completed_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}