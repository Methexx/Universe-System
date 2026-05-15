import { request } from '../../../shared/lib/api-client';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  type: 'event' | 'holiday' | 'exam' | 'meeting';
  created_by: string;
  creator?: {
    full_name: string | null;
  };
}

export function getCalendarEvents() {
  return request<CalendarEvent[]>('/api/calendar');
}

export function createCalendarEvent(data: {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  type?: string;
}) {
  return request<CalendarEvent>('/api/calendar', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateCalendarEvent(id: string, data: Partial<{
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  type?: string;
}>) {
  return request<CalendarEvent>(`/api/calendar/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteCalendarEvent(id: string) {
  return request<{ success: true }>(`/api/calendar/${id}`, {
    method: 'DELETE',
  });
}
