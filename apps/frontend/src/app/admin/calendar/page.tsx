"use client";

import React, { useState } from 'react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { TextInput } from '@/shared/components/ui/forms/TextInput';
import { SelectInput } from '@/shared/components/ui/forms/SelectInput';
import { ChevronLeft, ChevronRight, Clock, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { 
  getCalendarEvents, 
  createCalendarEvent, 
  updateCalendarEvent, 
  deleteCalendarEvent,
  CalendarEvent as ApiEvent 
} from '@/features/calendar/lib/calendar-api';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // Format: YYYY-MM-DD
  time: string;
  color: string;
  description: string;
}

const EVENT_COLORS = [
  { label: 'Blue', value: 'bg-blue-500' },
  { label: 'Purple', value: 'bg-purple-500' },
  { label: 'Green', value: 'bg-emerald-500' },
  { label: 'Orange', value: 'bg-orange-500' },
  { label: 'Red', value: 'bg-red-500' },
  { label: 'Pink', value: 'bg-pink-500' },
];

const TYPE_TO_COLOR: Record<string, string> = {
  meeting: 'bg-purple-500',
  event: 'bg-blue-500',
  holiday: 'bg-emerald-500',
  exam: 'bg-red-500',
};

const COLOR_TO_TYPE: Record<string, string> = {
  'bg-purple-500': 'meeting',
  'bg-blue-500': 'event',
  'bg-emerald-500': 'holiday',
  'bg-red-500': 'exam',
  'bg-orange-500': 'event',
  'bg-pink-500': 'event',
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const fetchEvents = React.useCallback(async () => {
    const res = await getCalendarEvents();
    if (res.ok) {
      const mapped = res.data.map((ev: ApiEvent) => ({
        id: ev.id,
        title: ev.title,
        date: ev.start_time.split('T')[0],
        time: new Date(ev.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        color: TYPE_TO_COLOR[ev.type] || 'bg-blue-500',
        description: ev.description || '',
      }));
      setEvents(mapped);
    }
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchEvents();
  }, [fetchEvents]);

  const [formData, setFormData] = useState({
    title: '',
    time: '',
    color: 'bg-blue-500',
    description: ''
  });

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  const handleDateClick = (day: number) => {
    const newSelectedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(newSelectedDate);
    setIsFormOpen(false);
    setEditingEventId(null);
  };

  const selectedDateEvents = events.filter(e => e.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time));

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEvent = async () => {
    if (!formData.title || !formData.time) return;

    // Parse time to ISO
    const [timeStr, modifier] = formData.time.split(' ');
    const [hoursStr, minutesStr] = timeStr.split(':');
    let hours = Number(hoursStr);
    const minutes = Number(minutesStr);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    
    const start = new Date(selectedDate);
    start.setHours(hours, minutes, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 1);

    const payload = {
      title: formData.title,
      description: formData.description,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      type: COLOR_TO_TYPE[formData.color] || 'event',
    };

    if (editingEventId) {
      const res = await updateCalendarEvent(editingEventId, payload);
      if (res.ok) await fetchEvents();
    } else {
      const res = await createCalendarEvent(payload);
      if (res.ok) await fetchEvents();
    }
    
    setIsFormOpen(false);
    setEditingEventId(null);
    setFormData({ title: '', time: '', color: 'bg-blue-500', description: '' });
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setFormData({
      title: event.title,
      time: event.time,
      color: event.color,
      description: event.description || ''
    });
    setEditingEventId(event.id);
    setIsFormOpen(true);
  };

  const handleDeleteEvent = async (id: string) => {
    const res = await deleteCalendarEvent(id);
    if (res.ok) {
      await fetchEvents();
    }
  };

  const openNewEventForm = () => {
    setFormData({ title: '', time: '', color: 'bg-blue-500', description: '' });
    setEditingEventId(null);
    setIsFormOpen(true);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex flex-col gap-6 pb-12 w-full pr-2">
      <PageHeader 
        title="Calendar"
        subtitle="Manage your schedules and events"
        onRefresh={fetchEvents}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        
        {/* Calendar Main Grid */}
        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-[20px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
            <h2 className="text-[22px] font-bold text-[#0f172a]">
              {monthNames[month]} {year}
            </h2>
            <div className="flex items-center gap-3">
              <button onClick={goToToday} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-[13px] font-bold hover:bg-gray-200 transition-colors">
                Today
              </button>
              <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
                <button onClick={prevMonth} className="p-1.5 hover:bg-white rounded-md text-gray-500 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={nextMonth} className="p-1.5 hover:bg-white rounded-md text-gray-500 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-4">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-bold text-gray-400 pb-2">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {[...Array(firstDayOfMonth)].map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square p-2 border border-transparent rounded-[14px]"></div>
            ))}
            
            {[...Array(daysInMonth)].map((_, i) => {
              const dayStr = String(i + 1).padStart(2, '0');
              const monthStr = String(month + 1).padStart(2, '0');
              const dateKey = `${year}-${monthStr}-${dayStr}`;
              const dayEvents = events.filter(e => e.date === dateKey);
              const isSelected = selectedDate === dateKey;
              const isToday = new Date().toISOString().split('T')[0] === dateKey;

              return (
                <div 
                  key={i} 
                  onClick={() => handleDateClick(i + 1)}
                  className={clsx(
                    "aspect-square p-2 border rounded-[14px] flex flex-col items-center justify-start cursor-pointer transition-all gap-1 hover:border-blue-200 group relative",
                    isSelected ? "border-blue-500 bg-blue-50 shadow-[inset_0_0_0_1px_#3b82f6]" : "border-gray-100 bg-white hover:shadow-sm"
                  )}
                >
                  <span className={clsx(
                    "text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full mt-1 transition-colors",
                    isToday ? (isSelected ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600") : 
                             (isSelected ? "text-blue-700" : "text-[#334155]")
                  )}>
                    {i + 1}
                  </span>
                  
                  {/* Event Dots indicator max 3 */}
                  <div className="flex gap-1 mt-auto pb-2 flex-wrap items-center justify-center px-1">
                    {dayEvents.slice(0, 3).map((ev, idx) => (
                      <div key={idx} className={clsx("w-1.5 h-1.5 rounded-full", ev.color)}></div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[10px] font-bold text-gray-400">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar - Events List / Form */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-gray-200 rounded-[20px] p-6 shadow-sm min-h-[500px]">
            
            {!isFormOpen ? (
              <>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-[#334155] font-bold text-lg">
                      {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </h3>
                    <p className="text-sm font-medium text-gray-400 mt-1">
                      {selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'Event' : 'Events'}
                    </p>
                  </div>
                  <button 
                    onClick={openNewEventForm}
                    className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {selectedDateEvents.length > 0 ? (
                    selectedDateEvents.map(event => (
                      <div key={event.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col group relative overflow-hidden transition-colors hover:border-gray-200 hover:bg-gray-50">
                        <div className={clsx("absolute top-0 left-0 w-1 flex-shrink-0 h-full", event.color)}></div>
                        
                        <div className="flex justify-between items-start mb-2 pl-3">
                          <h4 className="font-bold text-[#0f172a] text-base pr-8">{event.title}</h4>
                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                            <button onClick={() => handleEditEvent(event)} className="p-1.5 text-gray-400 hover:text-blue-600 bg-white rounded-md border border-gray-100 shadow-sm">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteEvent(event.id)} className="p-1.5 text-gray-400 hover:text-red-600 bg-white rounded-md border border-gray-100 shadow-sm">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium pl-3 mb-2">
                          <Clock className="w-4 h-4" />
                          {event.time}
                        </div>

                        {event.description && (
                          <div className="text-sm text-gray-500 pl-3 leading-relaxed mt-1">
                            {event.description}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                      <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="font-semibold text-[#334155] mb-1">No events planned</p>
                      <p className="text-sm">Enjoy your free time!</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-[#334155] font-bold text-lg">
                      {editingEventId ? "Edit Event" : "Create Event"}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-[13px] font-bold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>

                <div className="flex flex-col gap-5">
                  <TextInput 
                    label="Event Title"
                    name="title"
                    placeholder="e.g. Science Project"
                    value={formData.title}
                    onChange={handleFormChange}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <TextInput 
                      label="Time"
                      name="time"
                      placeholder="10:00 AM"
                      value={formData.time}
                      onChange={handleFormChange}
                    />

                    <SelectInput 
                      label="Color Label"
                      name="color"
                      options={EVENT_COLORS}
                      value={formData.color}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="flex flex-col gap-[6px]">
                    <label className="text-[13px] font-bold text-[#64748b]">Description (Optional)</label>
                    <input 
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      placeholder="Add details about the event..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] text-[#0f172a] font-medium outline-none transition-all placeholder:text-gray-400 focus:border-[#3b82f6] focus:ring-[3px] focus:ring-blue-100/50 bg-gray-50/30"
                    />
                  </div>

                  <button 
                    onClick={handleSaveEvent}
                    disabled={!formData.title || !formData.time}
                    className={clsx(
                      "w-full mt-4 py-3 rounded-xl text-[14px] font-bold transition-colors flex items-center justify-center",
                      (!formData.title || !formData.time) 
                        ? "bg-blue-300 text-white cursor-not-allowed" 
                        : "bg-[#3b82f6] hover:bg-blue-600 text-white cursor-pointer shadow-sm"
                    )}
                  >
                    {editingEventId ? "Save Changes" : "Create Event"}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}