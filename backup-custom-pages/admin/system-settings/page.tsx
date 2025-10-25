'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  MapPin, 
  DollarSign, 
  Bell, 
  Clock, 
  Database, 
  RefreshCw 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Setting {
  id: number;
  key: string;
  value: string;
  type: 'string' | 'integer' | 'boolean' | 'json';
  category: string;
  description: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Get settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data.data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch settings',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => 
      prev.map(setting => 
        setting.key === key ? { ...setting, value: value.toString() } : setting
      )
    );
  };

  const saveSettings = async () => {
    setSaving(true);
    
    try {
      const response = await fetch('/api/settings/bulk-update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings: settings.map(setting => ({
            key: setting.key,
            value: setting.value,
            type: setting.type,
            category: setting.category,
            description: setting.description,
          }))
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Success',
          description: 'Settings saved successfully',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.message || 'Failed to save settings',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Group settings by category
  const settingsByCategory: Record<string, Setting[]> = {};
  settings.forEach(setting => {
    if (!settingsByCategory[setting.category]) {
      settingsByCategory[setting.category] = [];
    }
    settingsByCategory[setting.category].push(setting);
  });

  const geofenceSettings = settingsByCategory['geofence'] || [];
  const payrollSettings = settingsByCategory['payroll'] || [];
  const notificationSettings = settingsByCategory['notification'] || [];
  const otherSettings = settings.filter(s => 
    !['geofence', 'payroll', 'notification'].includes(s.category || '')
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">
          Configure system parameters and operational settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
          <CardDescription>
            Manage all system settings and parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
              Loading settings...
            </div>
          ) : (
            <>
              <Tabs defaultValue="geofence" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="geofence">
                  <MapPin className="mr-2 h-4 w-4" />
                  Geofence
                </TabsTrigger>
                <TabsTrigger value="payroll">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Payroll
                </TabsTrigger>
                <TabsTrigger value="notification">
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="other">
                  <Settings className="mr-2 h-4 w-4" />
                  Other
                </TabsTrigger>
              </TabsList>

              <TabsContent value="geofence" className="space-y-4">
                <div className="space-y-4">
                  {geofenceSettings.map(setting => (
                    <div key={setting.key} className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={setting.key} className="text-right">
                        {setting.description || setting.key}
                      </Label>
                      <div className="col-span-3">
                        {setting.type === 'boolean' ? (
                          <Switch
                            id={setting.key}
                            checked={setting.value === 'true'}
                            onCheckedChange={(checked) => updateSetting(setting.key, checked)}
                          />
                        ) : (
                          <div className="flex items-center gap-4">
                            <Input
                              id={setting.key}
                              type={setting.type === 'integer' ? 'number' : 'text'}
                              value={setting.value}
                              onChange={(e) => updateSetting(setting.key, e.target.value)}
                            />
                            <Badge variant="secondary" className="text-xs">
                              {setting.type}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {geofenceSettings.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No geofence settings configured
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="payroll" className="space-y-4">
                <div className="space-y-4">
                  {payrollSettings.map(setting => (
                    <div key={setting.key} className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={setting.key} className="text-right">
                        {setting.description || setting.key}
                      </Label>
                      <div className="col-span-3">
                        {setting.type === 'boolean' ? (
                          <Switch
                            id={setting.key}
                            checked={setting.value === 'true'}
                            onCheckedChange={(checked) => updateSetting(setting.key, checked)}
                          />
                        ) : (
                          <div className="flex items-center gap-4">
                            <Input
                              id={setting.key}
                              type={setting.type === 'integer' ? 'number' : 'text'}
                              value={setting.value}
                              onChange={(e) => updateSetting(setting.key, e.target.value)}
                            />
                            <Badge variant="secondary" className="text-xs">
                              {setting.type}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {payrollSettings.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No payroll settings configured
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="notification" className="space-y-4">
                <div className="space-y-4">
                  {notificationSettings.map(setting => (
                    <div key={setting.key} className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={setting.key} className="text-right">
                        {setting.description || setting.key}
                      </Label>
                      <div className="col-span-3">
                        {setting.type === 'boolean' ? (
                          <Switch
                            id={setting.key}
                            checked={setting.value === 'true'}
                            onCheckedChange={(checked) => updateSetting(setting.key, checked)}
                          />
                        ) : (
                          <div className="flex items-center gap-4">
                            <Input
                              id={setting.key}
                              type={setting.type === 'integer' ? 'number' : 'text'}
                              value={setting.value}
                              onChange={(e) => updateSetting(setting.key, e.target.value)}
                            />
                            <Badge variant="secondary" className="text-xs">
                              {setting.type}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {notificationSettings.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No notification settings configured
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="other" className="space-y-4">
                <div className="space-y-4">
                  {otherSettings.map(setting => (
                    <div key={setting.key} className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={setting.key} className="text-right">
                        {setting.description || setting.key}
                      </Label>
                      <div className="col-span-3">
                        {setting.type === 'boolean' ? (
                          <Switch
                            id={setting.key}
                            checked={setting.value === 'true'}
                            onCheckedChange={(checked) => updateSetting(setting.key, checked)}
                          />
                        ) : (
                          <div className="flex items-center gap-4">
                            <Input
                              id={setting.key}
                              type={setting.type === 'integer' ? 'number' : 'text'}
                              value={setting.value}
                              onChange={(e) => updateSetting(setting.key, e.target.value)}
                            />
                            <Badge variant="secondary" className="text-xs">
                              {setting.type}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {otherSettings.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No other settings configured
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end">
              <Button onClick={saveSettings} disabled={saving}>
                {saving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Settings className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Important Notice</CardTitle>
          <CardDescription>
            Changes to system settings may require a refresh to take effect
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            After saving settings, some changes may require a page refresh or 
            application restart to take effect. Please test critical settings 
            in a development environment before applying to production.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}