// src/hooks/use-school-calendar.ts
import { useApi } from './use-api';
import { schoolCalendarService } from '@/lib/api/school-calendar';
import { useCallback, useState } from 'react';

export function useSchoolCalendarEvents(startDate?: string, endDate?: string) {
  const { data, loading, error, refetch } = useApi(
    () => schoolCalendarService.getEventsByDateRange(startDate || '', endDate || ''),
    [startDate, endDate]
  );

  return {
    events: data || [],
    loading,
    error,
    refetch,
  };
}

export function useUpcomingEvents(limit: number = 10) {
  const { data, loading, error, refetch } = useApi(
    () => schoolCalendarService.getUpcomingEvents(limit),
    [limit]
  );

  return {
    upcomingEvents: data || [],
    loading,
    error,
    refetch,
  };
}

export function useCalendarEvent(id: number) {
  const { data, loading, error, refetch } = useApi(
    () => schoolCalendarService.getById(id),
    [id]
  );

  return {
    event: data,
    loading,
    error,
    refetch,
  };
}

export function useCreateCalendarEvent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createEvent = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await schoolCalendarService.create(data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create calendar event'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createEvent,
    loading,
    error,
  };
}

export function useUpdateCalendarEvent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateEvent = useCallback(async (id: number, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await schoolCalendarService.update(id, data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update calendar event'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateEvent,
    loading,
    error,
  };
}

export function useEventsByType(eventType: string) {
  const { data, loading, error, refetch } = useApi(
    () => schoolCalendarService.getEventsByType(eventType),
    [eventType]
  );

  return {
    events: data || [],
    loading,
    error,
    refetch,
  };
}