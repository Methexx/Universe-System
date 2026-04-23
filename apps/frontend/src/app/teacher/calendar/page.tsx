"use client";

import React, { useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit2,
  Megaphone,
  Plus,
  Shield,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { PageHeader } from "@/shared/components/layout/PageHeader";

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

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_EVENTS: CalEvent[] = [
  // Principal events — read-only for teacher
  { id:"p1", title:"Monthly Staff Meeting",    date:fmt(2026,4,24), time:"9:00 AM",   timeSort:540,  source:"principal", category:"meeting",  description:"All-staff sync. Agenda: Term 2 prep, attendance policy update, sports day coordination." },
  { id:"p2", title:"School Closure",           date:fmt(2026,4,25), time:"All Day",   timeSort:0,    source:"principal", category:"holiday",  description:"School closed — water supply issue. Normal schedule resumes April 26th." },
  { id:"p3", title:"Parent–Teacher Meeting",   date:fmt(2026,5,3),  time:"2:00 PM",  timeSort:840,  source:"principal", category:"meeting",  description:"Grade 10 & 11 PTM. Attendance mandatory for all class teachers. 2:00 PM – 5:00 PM, Main Hall." },
  // School events — read-only
  { id:"s1", title:"Term 2 Exams Begin",       date:fmt(2026,5,15), time:"8:00 AM",  timeSort:480,  source:"school",    category:"exam",     description:"Term 2 examinations commence. All teachers to submit question papers by May 5th." },
  { id:"s2", title:"Vesak Holiday",            date:fmt(2026,5,12), time:"All Day",  timeSort:0,    source:"school",    category:"holiday",  description:"Vesak Full Moon Poya Day — school closed." },
  { id:"s3", title:"Annual Sports Day",        date:fmt(2026,5,22), time:"8:00 AM",  timeSort:480,  source:"school",    category:"event",    description:"Annual Sports Day. Duty teachers report by 7:30 AM. Volunteer sign-up due April 30." },
  { id:"s4", title:"Term 1 Results Published", date:fmt(2026,5,8),  time:"10:00 AM", timeSort:600,  source:"school",    category:"event",    description:"Term 1 results published on the parent portal. Notify parents via messaging." },
  // Teacher's own events — editable
  { id:"m1", title:"10-A Science Lab Prep",    date:fmt(2026,4,26), time:"11:00 AM", timeSort:660,  source:"mine",      category:"reminder", description:"Prepare materials for ecosystem lab experiment. Check microscopes from equipment room." },
  { id:"m2", title:"10-A Math Revision",       date:fmt(2026,4,27), time:"3:00 PM",  timeSort:900,  source:"mine",      category:"meeting",  description:"Extra revision for Grade 10-A — Algebra & Calculus. Room 14." },
  { id:"m3", title:"11-B Progress Review",     date:fmt(2026,4,29), time:"1:00 PM",  timeSort:780,  source:"mine",      category:"meeting",  description:"Internal review of 11-B student progress before the PTM. Prepare summary report." },
  { id:"m4", title:"Grade Submission Deadline",date:fmt(2026,5,5),  time:"5:00 PM",  timeSort:1020, source:"mine",      category:"reminder", description:"Term 1 final grades must be submitted to admin by end of day." },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const CAT: Record<EventCategory, {
  label: string; barColor: string; chipBg: string; chipText: string; dotColor: string;
}> = {
  meeting:  { label:"Meeting",  barColor:"bg-[#4f46e5]", chipBg:"bg-[#eef2ff]", chipText:"text-[#4f46e5]", dotColor:"bg-[#4f46e5]" },
  exam:     { label:"Exam",     barColor:"bg-[#dc2626]", chipBg:"bg-[#fee2e2]", chipText:"text-[#b91c1c]", dotColor:"bg-[#dc2626]" },
  event:    { label:"Event",    barColor:"bg-[#f59e0b]", chipBg:"bg-[#fef3c7]", chipText:"text-[#92400e]", dotColor:"bg-[#f59e0b]" },
  reminder: { label:"Reminder", barColor:"bg-[#16a34a]", chipBg:"bg-[#dcfce7]", chipText:"text-[#15803d]", dotColor:"bg-[#16a34a]" },
  holiday:  { label:"Holiday",  barColor:"bg-[#94a3b8]", chipBg:"bg-[#f1f5f9]", chipText:"text-[#475569]", dotColor:"bg-[#94a3b8]" },
};

const SRC: Record<EventSource, { label: string; bg: string; text: string; Icon: React.ElementType }> = {
  principal: { label:"Principal", bg:"bg-amber-100",  text:"text-amber-700",  Icon:Shield    },
  school:    { label:"School",    bg:"bg-[#f1f5f9]",  text:"text-[#475569]",  Icon:Megaphone },
  mine:      { label:"My Event",  bg:"bg-[#eef2ff]",  text:"text-[#4f46e5]",  Icon:Users     },
};

// ─── EventCard ────────────────────────────────────────────────────────────────

function EventCard({
  event,
  onEdit,
  onDelete,
}: {
  event: CalEvent;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { barColor, chipBg, chipText, label: catLabel } = CAT[event.category];
  const { label: srcLabel, bg: srcBg, text: srcText, Icon: SrcIcon } = SRC[event.source];
  const canEdit  = event.source === "mine";
  const longDesc = (event.description?.length ?? 0) > 90;

  return (
    <div className="group relative overflow-hidden rounded-[12px] border border-[#e2e8f0] bg-white transition-shadow hover:shadow-sm">
      <div className={clsx("absolute bottom-0 left-0 top-0 w-[3px]", barColor)} />

      <div className="py-3 pl-4 pr-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] font-bold leading-snug text-[#0f172a]">{event.title}</p>

          {canEdit && (
            <div className="flex flex-shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={onEdit}
                className="rounded-md p-1.5 text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#4f46e5]"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="rounded-md p-1.5 text-[#94a3b8] hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] text-[#64748b]">
            <Clock className="h-3 w-3" />
            {event.time}
          </span>
          <span className={clsx("rounded-full px-2 py-0.5 text-[10px] font-semibold", chipBg, chipText)}>
            {catLabel}
          </span>
          <span className={clsx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", srcBg, srcText)}>
            <SrcIcon className="h-2.5 w-2.5" />
            {srcLabel}
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

// ─── ComposeModal ─────────────────────────────────────────────────────────────

type ComposeForm = { title: string; time: string; category: EventCategory; description: string };

const BLANK_FORM: ComposeForm = { title: "", time: "", category: "meeting", description: "" };

function ComposeModal({
  date,
  initial,
  onClose,
  onSave,
}: {
  date: string;
  initial?: ComposeForm;
  onClose: () => void;
  onSave: (form: ComposeForm) => void;
}) {
  const [form, setForm] = useState<ComposeForm>(initial ?? BLANK_FORM);
  const canSave = form.title.trim().length > 0 && form.time.trim().length > 0;

  const displayDate = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[480px] rounded-[20px] border border-[#e2e8f0] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#e2e8f0] px-6 py-4">
          <div>
            <h2 className="text-[15px] font-bold text-[#0f172a]">
              {initial ? "Edit Event" : "Add Event"}
            </h2>
            <p className="text-[12px] text-[#64748b]">{displayDate}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#94a3b8] transition-colors hover:bg-[#f1f5f9] hover:text-[#475569]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[#475569]">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. 10-A Revision Session"
              className="w-full rounded-[10px] border border-[#e2e8f0] px-4 py-2.5 text-[13px] text-[#0f172a] outline-none placeholder:text-[#cbd5e1] focus:border-[#4f46e5]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[#475569]">Time *</label>
            <input
              type="text"
              value={form.time}
              onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
              placeholder="e.g. 3:00 PM"
              className="w-full rounded-[10px] border border-[#e2e8f0] px-4 py-2.5 text-[13px] text-[#0f172a] outline-none placeholder:text-[#cbd5e1] focus:border-[#4f46e5]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[#475569]">Category *</label>
            <div className="flex flex-wrap gap-2">
              {(["meeting", "reminder", "exam", "event"] as EventCategory[]).map((cat) => {
                const { label, chipBg, chipText } = CAT[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, category: cat }))}
                    className={clsx(
                      "rounded-full border px-3 py-1 text-[12px] font-semibold transition-all",
                      form.category === cat
                        ? clsx(chipBg, chipText, "border-current")
                        : "border-[#e2e8f0] bg-white text-[#94a3b8] hover:border-[#cbd5e1]"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[#475569]">
              Description{" "}
              <span className="font-normal text-[#94a3b8]">(optional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Add details about this event…"
              rows={3}
              className="w-full resize-none rounded-[10px] border border-[#e2e8f0] px-4 py-2.5 text-[13px] leading-relaxed text-[#0f172a] outline-none placeholder:text-[#cbd5e1] focus:border-[#4f46e5]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#e2e8f0] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] border border-[#e2e8f0] px-5 py-2 text-[13px] font-semibold text-[#475569] hover:bg-[#f8fafc]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => canSave && onSave(form)}
            disabled={!canSave}
            className="rounded-[10px] bg-[#4f46e5] px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:bg-[#c7d2fe]"
          >
            {initial ? "Save Changes" : "Add Event"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TeacherCalendarPage() {
  const [events, setEvents]           = useState<CalEvent[]>(INITIAL_EVENTS);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [sourceFilter, setSourceFilter] = useState<"all" | EventSource>("all");
  const [compose, setCompose] = useState<{ open: boolean; editId: string | null }>({
    open: false, editId: null,
  });
  const idRef = useRef(200);

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

  // Day panel: filtered + sorted
  const dayEvents = useMemo(
    () =>
      events
        .filter((e) => e.date === selectedDate && (sourceFilter === "all" || e.source === sourceFilter))
        .sort((a, b) => a.timeSort - b.timeSort),
    [events, selectedDate, sourceFilter]
  );

  // Upcoming: next 5 events from today, any source
  const upcoming = useMemo(
    () =>
      events
        .filter((e) => e.date >= TODAY)
        .sort((a, b) => a.date.localeCompare(b.date) || a.timeSort - b.timeSort)
        .slice(0, 5),
    [events]
  );

  const editingEvent = compose.editId ? events.find((e) => e.id === compose.editId) : undefined;

  const handleSave = (form: ComposeForm) => {
    if (compose.editId) {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === compose.editId
            ? { ...e, title: form.title, time: form.time, timeSort: parseTimeSort(form.time), category: form.category, description: form.description }
            : e
        )
      );
    } else {
      setEvents((prev) => [
        ...prev,
        {
          id: `mine-${idRef.current++}`,
          date: selectedDate,
          source: "mine",
          timeSort: parseTimeSort(form.time),
          ...form,
        },
      ]);
    }
    setCompose({ open: false, editId: null });
  };

  const handleDelete = (id: string) => setEvents((prev) => prev.filter((e) => e.id !== id));

  const selectedDisplayDate = new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <div className="flex w-full flex-col gap-[20px] pb-12 pr-2">
      <PageHeader
        title="Calendar"
        subtitle="Track school events, principal meetings, and your own schedule."
      />

      {/* ── Upcoming strip ─────────────────────────────────────────────────── */}
      {upcoming.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#94a3b8]">
            Upcoming
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {upcoming.map((ev) => {
              const { chipBg, chipText } = CAT[ev.category];
              const label =
                ev.date === TODAY
                  ? "Today"
                  : new Date(ev.date + "T12:00:00").toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => {
                    const d = new Date(ev.date + "T12:00:00");
                    setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
                    setSelectedDate(ev.date);
                  }}
                  className="flex min-w-[152px] flex-shrink-0 flex-col gap-1.5 rounded-[14px] border border-[#e2e8f0] bg-white p-3 text-left shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-sm"
                >
                  <span
                    className={clsx(
                      "self-start rounded-full px-2 py-0.5 text-[10px] font-bold",
                      chipBg,
                      chipText
                    )}
                  >
                    {label}
                  </span>
                  <p className="text-[12px] font-bold leading-snug text-[#0f172a] line-clamp-2">
                    {ev.title}
                  </p>
                  <p className="text-[11px] text-[#94a3b8]">{ev.time}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
                          CAT[ev.category].chipBg,
                          CAT[ev.category].chipText
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
            <div className="ml-auto flex items-center gap-3">
              {(Object.entries(SRC) as [EventSource, (typeof SRC)[EventSource]][]).map(
                ([key, val]) => (
                  <div key={key} className="flex items-center gap-1">
                    <val.Icon className={clsx("h-3 w-3", val.text)} />
                    <span className="text-[11px] text-[#64748b]">{val.label}</span>
                  </div>
                )
              )}
            </div>
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
              <button
                type="button"
                onClick={() => setCompose({ open: true, editId: null })}
                className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-[10px] bg-[#4f46e5] px-3 py-2 text-[12px] font-bold text-white transition-colors hover:bg-[#4338ca]"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Event
              </button>
            </div>

            {/* Source filter */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(["all", "principal", "school", "mine"] as ("all" | EventSource)[]).map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setSourceFilter(src)}
                  className={clsx(
                    "rounded-full border px-3 py-1 text-[11px] font-bold transition-all",
                    sourceFilter === src
                      ? "border-[#0f172a] bg-[#0f172a] text-white"
                      : "border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#cbd5e1]"
                  )}
                >
                  {src === "all"       ? "All"
                   : src === "principal" ? "Principal"
                   : src === "school"    ? "School"
                                        : "My Events"}
                </button>
              ))}
            </div>
          </div>

          {/* Event list */}
          <div className="max-h-[440px] min-h-[200px] overflow-y-auto px-5 py-4">
            {dayEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
                <CheckCircle2 className="h-10 w-10 text-[#e2e8f0]" />
                <p className="text-[14px] font-semibold text-[#475569]">All clear</p>
                <p className="text-[12px] text-[#94a3b8]">
                  No events for this day. Use + Add Event to schedule one.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {dayEvents.map((ev) => (
                  <EventCard
                    key={ev.id}
                    event={ev}
                    onEdit={() => setCompose({ open: true, editId: ev.id })}
                    onDelete={() => handleDelete(ev.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Panel footer hint */}
          <div className="border-t border-[#f1f5f9] px-5 py-3">
            <p className="text-[11px] text-[#94a3b8]">
              Principal &amp; School events are read-only. Hover your own events to edit or delete.
            </p>
          </div>
        </div>
      </div>

      {/* ── Compose modal ──────────────────────────────────────────────────── */}
      {compose.open && (
        <ComposeModal
          date={selectedDate}
          initial={
            editingEvent
              ? {
                  title: editingEvent.title,
                  time: editingEvent.time,
                  category: editingEvent.category,
                  description: editingEvent.description ?? "",
                }
              : undefined
          }
          onClose={() => setCompose({ open: false, editId: null })}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
