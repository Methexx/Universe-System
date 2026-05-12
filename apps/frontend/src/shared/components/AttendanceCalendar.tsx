"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

interface AttendanceCalendarProps {
  /** YYYY-MM-DD strings that are selectable (have sessions) */
  availableDates: string[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  /** Called when user navigates months — parent should fetch new dates */
  onMonthChange: (year: number, month: number) => void;
  /** Shows skeleton overlay while fetching available dates */
  loading?: boolean;
}

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toLocalISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function AttendanceCalendar({
  availableDates,
  selectedDate,
  onDateSelect,
  onMonthChange,
  loading = false,
}: AttendanceCalendarProps) {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1); // 1-indexed

  const todayISO = toLocalISO(now);
  const availableSet = useMemo(() => new Set(availableDates), [availableDates]);

  const isAtCurrentMonth =
    currentYear === now.getFullYear() && currentMonth === now.getMonth() + 1;

  // Build calendar grid
  const calendarDays = useMemo(() => {
    // First day of this month (0 = Sun, 1 = Mon … 6 = Sat)
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    // Map to Mon-start: Mon=0 … Sun=6
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells: (string | null)[] = [
      ...Array(startOffset).fill(null), // leading empty cells
    ];

    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push(iso);
    }

    // Pad to full rows of 7
    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }, [currentYear, currentMonth]);

  function navigate(direction: "prev" | "next") {
    let newYear = currentYear;
    let newMonth = currentMonth + (direction === "next" ? 1 : -1);
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    setCurrentYear(newYear);
    setCurrentMonth(newMonth);
    onMonthChange(newYear, newMonth);
  }

  const monthLabel = new Date(currentYear, currentMonth - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-[2px]">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 animate-bounce rounded-full bg-[#4f46e5]"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("prev")}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#64748b] transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a]"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
        </button>

        <span className="text-[14px] font-bold text-[#0f172a]">{monthLabel}</span>

        <button
          type="button"
          onClick={() => navigate("next")}
          disabled={isAtCurrentMonth}
          className={clsx(
            "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
            isAtCurrentMonth
              ? "cursor-not-allowed text-[#cbd5e1]"
              : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]",
          )}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>

      {/* Day headers */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {DAY_HEADERS.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[11px] font-bold uppercase tracking-wide text-[#94a3b8]"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((iso, idx) => {
          if (!iso) {
            return <div key={`empty-${idx}`} />;
          }

          const isAvailable = availableSet.has(iso);
          const isSelected = selectedDate === iso;
          const isToday = iso === todayISO;
          const isFuture = iso > todayISO;

          return (
            <button
              key={iso}
              type="button"
              disabled={!isAvailable || isFuture}
              onClick={() => isAvailable && !isFuture && onDateSelect(iso)}
              className={clsx(
                "relative flex flex-col items-center justify-center rounded-xl py-2 text-[13px] font-semibold transition-all duration-150",
                // Base states
                isSelected
                  ? "bg-[#4f46e5] text-white shadow-md"
                  : isAvailable && !isFuture
                    ? isToday
                      ? "bg-indigo-50 text-[#4f46e5] hover:bg-indigo-100"
                      : "bg-[#f8fafc] text-[#0f172a] hover:bg-indigo-50 hover:text-[#4f46e5]"
                    : "cursor-not-allowed text-[#cbd5e1]",
              )}
              aria-label={iso}
              aria-pressed={isSelected}
            >
              {/* Day number */}
              <span>{parseInt(iso.split("-")[2], 10)}</span>

              {/* Session dot indicator */}
              {isAvailable && !isFuture && (
                <span
                  className={clsx(
                    "mt-0.5 h-1 w-1 rounded-full",
                    isSelected ? "bg-white" : "bg-[#4f46e5]",
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 border-t border-[#f1f5f9] pt-3 text-[11px] text-[#94a3b8]">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4f46e5]" />
          Session recorded
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-[#f1f5f9]" />
          No session
        </span>
      </div>
    </div>
  );
}
