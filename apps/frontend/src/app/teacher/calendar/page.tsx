"use client";

import React, { useMemo, useState } from "react";
import clsx from "clsx";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Shield,
} from "lucide-react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { 
  getCalendarEvents, 
  CalendarEvent as ApiEvent 
} from '@/features/calendar/lib/calendar-api';

// ─── Types ────────────────────────────────────────────────────────────────────

type EventSource   = "principal" | "school" | "mine";
type EventCategory = "meeting" | "exam" | "event" | "reminder" | "holiday";

type CalEvent = {
  id: string;
  title: string;
  date: string;      // YYYY-MM-DD
  time: string;      // display label e.g. "9:00 AM"
  timeSort: number;  // minutes from midnight, for sorting
  source: EventSource;
  category: EventCategory;
  description?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const TODAY = new Date().toISOString().split("T")[0];

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const WEEK_DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function parseTimeSort(time: string): number {
  const m = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return 0;
  let h = parseInt(m[1]);
  const min = parseInt(m[2]);
  if (m[3].toUpperCase() === "PM" && h !== 12) h += 12;
  if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
  return h * 60 + min;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const CAT: Record<string, {
  label: string; barColor: string; chipBg: string; chipText: string; dotColor: string;
}> = {
  meeting:  { label:"Meeting",  barColor:"bg-[#4f46e5]", chipBg:"bg-[#eef2ff]", chipText:"text-[#4f46e5]", dotColor:"bg-[#4f46e5]" },
  exam:     { label:"Exam",     barColor:"bg-[#dc2626]", chipBg:"bg-[#fee2e2]", chipText:"text-[#b91c1c]", dotColor:"bg-[#dc2626]" },
  event:    { label:"Event",    barColor:"bg-[#f59e0b]", chipBg:"bg-[#fef3c7]", chipText:"text-[#92400e]", dotColor:"bg-[#f59e0b]" },
  reminder: { label:"Reminder", barColor:"bg-[#16a34a]", chipBg:"bg-[#dcfce7]", chipText:"text-[#15803d]", dotColor:"bg-[#16a34a]" },
  holiday:  { label:"Holiday",  barColor:"bg-[#94a3b8]", chipBg:"bg-[#f1f5f9]", chipText:"text-[#475569]", dotColor:"bg-[#94a3b8]" },
};

function EventCard({
  event,
}: {
  event: CalEvent;
}) {
  const [expanded, setExpanded] = useState(false);
  const { barColor, chipBg, chipText, label: catLabel } = CAT[event.category] || CAT.event;
  const longDesc = (event.description?.length ?? 0) > 90;

  return (
    <div className="group relative overflow-hidden rounded-[12px] border border-[#e2e8f0] bg-white transition-shadow hover:shadow-sm">
      <div className={clsx("absolute bottom-0 left-0 top-0 w-[3px]", barColor)} />

      <div className="py-3 pl-4 pr-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] font-bold leading-snug text-[#0f172a]">{event.title}</p>
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] text-[#64748b]">
            <Clock className="h-3 w-3" />
            {event.time}
          </span>
          <span className={clsx("rounded-full px-2 py-0.5 text-[10px] font-semibold", chipBg, chipText)}>
            {catLabel}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-[#f1f5f9] text-[#475569]">
            <Shield className="h-2.5 w-2.5" />
            Admin
          </span>
        </div>

        {event.description && (
          <div className="mt-2">
            <p className={clsx("text-[12px] leading-relaxed text-[#475569]", !expanded && "line-clamp-2")}>
              {event.description}
            </p>
            {longDesc && (
              <button
                type="button"
                onClick={() => setExpanded((p) => !p)}
                className="mt-0.5 text-[11px] font-semibold text-[#4f46e5] hover:underline"
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TeacherCalendarPage() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(TODAY);

  const fetchEvents = React.useCallback(async () => {
    const res = await getCalendarEvents();
    if (res.ok) {
      const mapped = res.data.map((ev: ApiEvent) => ({
        id: ev.id,
        title: ev.title,
        date: ev.start_time.split('T')[0],
        time: new Date(ev.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        timeSort: parseTimeSort(new Date(ev.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })),
        source: 'school' as const,
        category: ev.type as EventCategory,
        description: ev.description || '',
      }));
      setEvents(mapped);
    }
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchEvents();
  }, [fetchEvents]);

  const year           = currentDate.getFullYear();
  const month          = currentDate.getMonth();
  const daysInMonth    = new Date(year, month + 1, 0).getDate();
  const firstDayOffset = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday   = () => { setCurrentDate(new Date()); setSelectedDate(TODAY); };

  const handleDayClick = (day: number) => setSelectedDate(fmt(year, month + 1, day));

  const getCellEvents = (day: number) =>
    events.filter((e) => e.date === fmt(year, month + 1, day));

  // Day panel: sorted
  const dayEvents = useMemo(
    () =>
      events
        .filter((e) => e.date === selectedDate)
        .sort((a, b) => a.timeSort - b.timeSort),
    [events, selectedDate]
  );

  const selectedDisplayDate = new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <div className="flex w-full flex-col gap-[20px] pb-12 pr-2">
      <PageHeader
        title="Calendar"
        subtitle="Track school events, principal meetings, and your own schedule."
        onRefresh={fetchEvents}
      />

      {/* ── Main two-panel area ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">

        {/* ── Calendar grid (left) ─────────────────────────────────────────── */}
        <div className="rounded-[20px] border border-[#e2e8f0] bg-white p-5 shadow-[0_2px_6px_rgba(0,0,0,0.02)] lg:col-span-7">
          {/* Navigation */}
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-[#0f172a]">
              {MONTH_NAMES[month]} {year}
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToday}
                className="rounded-[8px] border border-[#e2e8f0] px-3 py-1.5 text-[12px] font-bold text-[#475569] transition-colors hover:bg-[#f8fafc]"
              >
                Today
              </button>
              <div className="flex items-center rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] p-0.5">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="rounded-md p-1.5 text-[#475569] transition-colors hover:bg-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="rounded-md p-1.5 text-[#475569] transition-colors hover:bg-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="mb-1 grid grid-cols-7">
            {WEEK_DAYS.map((d) => (
              <div
                key={d}
                className="py-2 text-center text-[11px] font-bold uppercase tracking-wide text-[#94a3b8]"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {[...Array(firstDayOffset)].map((_, i) => (
              <div key={`blank-${i}`} />
            ))}

            {[...Array(daysInMonth)].map((_, i) => {
              const day       = i + 1;
              const ds        = fmt(year, month + 1, day);
              const cellEvs   = getCellEvents(day);
              const isSelected = selectedDate === ds;
              const isToday    = TODAY === ds;
              const isWeekend  = (firstDayOffset + i) % 7 === 0 || (firstDayOffset + i) % 7 === 6;

              return (
                <div
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={clsx(
                    "flex h-[74px] cursor-pointer flex-col overflow-hidden rounded-[10px] border p-1.5 transition-all",
                    isSelected
                      ? "border-[#4f46e5] bg-[#eef2ff] shadow-[0_0_0_1.5px_#4f46e5]"
                      : isToday
                      ? "border-[#c7d2fe] bg-[#f5f3ff]"
                      : isWeekend
                      ? "border-transparent bg-[#fafafa] hover:border-[#e2e8f0]"
                      : "border-transparent bg-white hover:border-[#e2e8f0]"
                  )}
                >
                  {/* Day number */}
                  <span
                    className={clsx(
                      "mb-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full text-[12px] font-bold",
                      isToday && !isSelected
                        ? "bg-[#4f46e5] text-white"
                        : isSelected
                        ? "text-[#4f46e5]"
                        : isWeekend
                        ? "text-[#94a3b8]"
                        : "text-[#334155]"
                    )}
                  >
                    {day}
                  </span>

                  {/* Event mini-chips */}
                  <div className="flex flex-col gap-px">
                    {cellEvs.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={clsx(
                          "truncate rounded-[3px] px-1 py-px text-[9px] font-semibold leading-tight",
                          CAT[ev.category]?.chipBg || "bg-gray-100",
                          CAT[ev.category]?.chipText || "text-gray-600"
                        )}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {cellEvs.length > 2 && (
                      <span className="pl-0.5 text-[9px] font-bold text-[#94a3b8]">
                        +{cellEvs.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Category legend */}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-[#f1f5f9] pt-4">
            {(Object.entries(CAT) as [EventCategory, (typeof CAT)[EventCategory]][]).map(
              ([key, val]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className={clsx("h-2 w-2 rounded-full", val.dotColor)} />
                  <span className="text-[11px] text-[#64748b]">{val.label}</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* ── Day detail panel (right) ─────────────────────────────────────── */}
        <div className="flex flex-col rounded-[20px] border border-[#e2e8f0] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.02)] lg:col-span-5">
          {/* Panel header */}
          <div className="border-b border-[#e2e8f0] px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[15px] font-bold text-[#0f172a]">{selectedDisplayDate}</h3>
                <p className="mt-0.5 text-[12px] text-[#64748b]">
                  {dayEvents.length === 0
                    ? "No events"
                    : `${dayEvents.length} event${dayEvents.length > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
          </div>

          {/* Event list */}
          <div className="max-h-[440px] min-h-[200px] overflow-y-auto px-5 py-4">
            {dayEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
                <CheckCircle2 className="h-10 w-10 text-[#e2e8f0]" />
                <p className="text-[14px] font-semibold text-[#475569]">All clear</p>
                <p className="text-[12px] text-[#94a3b8]">
                  No events for this day.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {dayEvents.map((ev) => (
                  <EventCard
                    key={ev.id}
                    event={ev}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
