/*
 * UI Design System Demonstration Component
 * This component showcases the standardized UI design system for SMP Saraswati Attendance App
 * It demonstrates proper usage of gradients, dark mode, consistent spacing, typography, and component patterns
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Calendar, 
  Clock, 
  FileText, 
  Settings, 
  Bell,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign
} from 'lucide-react';

// This component demonstrates the design system in practice
export default function UIDesignSystemDemo() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          UI Design System Demo
        </h1>
        <p className="text-muted-foreground">
          Demonstrating the standardized UI patterns for SMP Saraswati Attendance App
        </p>
      </div>

      <Separator />

      {/* Typography Examples */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Typography System</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Heading Examples</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Heading 1</h1>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Heading 2</h2>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Heading 3</h3>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">Heading 4</h4>
              <h5 className="text-lg font-bold text-gray-900 dark:text-white">Heading 5</h5>
              <h6 className="text-base font-bold text-gray-900 dark:text-white">Heading 6</h6>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Body Text Examples</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-lg text-gray-700 dark:text-gray-300">Large body text (18px)</p>
              <p className="text-base text-gray-600 dark:text-gray-400">Medium body text (16px) - This is the default text size</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Small body text (14px)</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Extra small text (12px)</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Button Examples */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Button Variants</h2>
        
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Button Styles</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Different button variants with proper styling</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            {/* Primary button with gradient */}
            <Button className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:shadow-xl transition-all">
              Primary Gradient
            </Button>
            
            {/* Standard button variants */}
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Card and Layout Examples */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Card Components</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats Card Example */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/50 dark:from-primary/10 dark:to-primary/20 dark:border-primary/30 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">142</div>
              <p className="text-xs text-muted-foreground">+12 from last month</p>
            </CardContent>
          </Card>

          {/* Status Card Example */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-gray-900 dark:text-white">Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">96.4%</div>
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Excellent performance</p>
            </CardContent>
          </Card>

          {/* Activity Card Example */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-gray-900 dark:text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/placeholder.jpg" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500">JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">John Doe</p>
                  <p className="text-xs text-muted-foreground">Submitted leave request</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/placeholder.jpg" />
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500">JS</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Jane Smith</p>
                  <p className="text-xs text-muted-foreground">Clock in at 08:15 AM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Form Components */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Form Components</h2>
        
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Form Elements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Full Name</Label>
              <Input 
                id="name" 
                placeholder="Enter your full name" 
                className="h-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="name@saraswati.sch.id" 
                  className="h-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position" className="text-gray-700 dark:text-gray-300">Position</Label>
                <Input 
                  id="position" 
                  placeholder="Teacher, Staff, etc." 
                  className="h-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Badge Examples */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Badge Variants</h2>
        
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Badge Styles</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500">Active</Badge>
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge className="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
              Present
            </Badge>
            <Badge className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">
              Late
            </Badge>
            <Badge className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
              Absent
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Dashboard Grid Example */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Grid</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border border-gray-200 dark:border-gray-700 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Staff</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">142</div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-700 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Attendance</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">96.4%</div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-700 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Leaves</CardTitle>
              <FileText className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">8</div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-700 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Payroll</CardTitle>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">IDR 420M</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}