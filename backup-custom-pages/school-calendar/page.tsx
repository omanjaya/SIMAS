// src/app/(dashboard)/school-calendar/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Plus, Search, Filter, CalendarDays, PartyPopper, BookOpen, Coffee, Plane } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { useSchoolCalendarEvents } from '@/hooks/use-school-calendar';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useProtectedRoute } from '@/hooks/use-protected-route';

export default function SchoolCalendarPage() {
  useProtectedRoute('admin');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [filters, setFilters] = useState({
    search: '',
    event_type: '',
    is_active: '',
  });
  
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const { events, loading, error, refetch } = useSchoolCalendarEvents();
  const { toast } = useToast();

  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);

  useEffect(() => {
    let filtered = events;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchLower) ||
        (event.description && event.description.toLowerCase().includes(searchLower))
      );
    }

    if (filters.event_type) {
      filtered = filtered.filter(event => event.event_type === filters.event_type);
    }

    if (filters.is_active) {
      filtered = filtered.filter(event => 
        event.is_active === (filters.is_active === 'active')
      );
    }

    setFilteredEvents(filtered);
  }, [events, filters]);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleEventTypeFilter = (value: string) => {
    setFilters(prev => ({ ...prev, event_type: value }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters(prev => ({ ...prev, is_active: value }));
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'holiday':
        return <PartyPopper className="h-4 w-4" />;
      case 'event':
        return <CalendarDays className="h-4 w-4" />;
      case 'exam':
        return <BookOpen className="h-4 w-4" />;
      case 'break':
        return <Coffee className="h-4 w-4" />;
      default:
        return <CalendarDays className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'holiday':
        return 'bg-red-100 text-red-800';
      case 'event':
        return 'bg-blue-100 text-blue-800';
      case 'exam':
        return 'bg-yellow-100 text-yellow-800';
      case 'break':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (startDate.toDateString() === endDate.toDateString()) {
      return startDate.toLocaleDateString();
    }
    
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  };

  const getEventsForDate = (dateObj: Date) => {
    return filteredEvents.filter(event => {
      const eventStart = new Date(event.start_date);
      const eventEnd = new Date(event.end_date);
      return dateObj >= eventStart && dateObj <= eventEnd;
    });
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'secondary'}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">School Calendar</h1>
          <p className="text-muted-foreground">
            Manage academic calendar and important events
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/school-calendar/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>
                Browse and manage school events by month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border w-full"
              />
            </CardContent>
          </Card>

          {/* Selected Date Events */}
          {date && (
            <Card>
              <CardHeader>
                <CardTitle>Events for {date.toLocaleDateString()}</CardTitle>
                <CardDescription>
                  All events scheduled for the selected date
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getEventsForDate(date).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No events scheduled for this date
                    </div>
                  ) : (
                    getEventsForDate(date).map((event: any) => (
                      <div key={event.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className={`p-2 rounded-full ${getEventTypeColor(event.event_type)}`}>
                          {getEventTypeIcon(event.event_type)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {event.description}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getEventTypeColor(event.event_type)}>
                              {getEventTypeLabel(event.event_type)}
                            </Badge>
                            {getStatusBadge(event.is_active)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar with List View and Filters */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>
                Filter events by type, status, or search term
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    className="pl-8"
                    value={filters.search}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Select value={filters.event_type} onValueChange={handleEventTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="holiday">Holidays</SelectItem>
                    <SelectItem value="event">Events</SelectItem>
                    <SelectItem value="exam">Exams</SelectItem>
                    <SelectItem value="break">Breaks</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Select value={filters.is_active} onValueChange={handleStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={viewMode === 'calendar' ? 'default' : 'outline'} 
                  className="flex-1"
                  onClick={() => setViewMode('calendar')}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Calendar
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'outline'} 
                  className="flex-1"
                  onClick={() => setViewMode('list')}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  List
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* List View */}
          {viewMode === 'list' && (
            <Card>
              <CardHeader>
                <CardTitle>All Events</CardTitle>
                <CardDescription>
                  Complete list of all calendar events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-sm text-muted-foreground">Loading events...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8 text-destructive">
                      Error loading events: {error.message}
                    </div>
                  ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No events found
                    </div>
                  ) : (
                    filteredEvents.map((event: any) => (
                      <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className={`p-1.5 rounded-full ${getEventTypeColor(event.event_type)}`}>
                          {getEventTypeIcon(event.event_type)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDateRange(event.start_date, event.end_date)}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge className={getEventTypeColor(event.event_type)} variant="secondary" size="sm">
                              {getEventTypeLabel(event.event_type)}
                            </Badge>
                            {getStatusBadge(event.is_active)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>
                Next 5 events in chronological order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredEvents
                  .filter(event => new Date(event.start_date) >= new Date())
                  .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                  .slice(0, 5)
                  .map((event: any) => (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-full ${getEventTypeColor(event.event_type)}`}>
                        {getEventTypeIcon(event.event_type)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{event.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(event.start_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                {filteredEvents.filter(event => new Date(event.start_date) >= new Date()).length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No upcoming events
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}