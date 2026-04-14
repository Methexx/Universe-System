"use client";

import React, { useState, useEffect } from "react";
import { RefreshCcw, History } from "lucide-react";
import clsx from "clsx";

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  const [time, setTime] = useState<Date | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showColon, setShowColon] = useState(true);

  // Initialize clock and blinking colon
  useEffect(() => {
    // Avoid executing state update synchronously during the first render effect
    // which triggers the react-hooks/set-state-in-effect lint rule.
    const initialSync = setTimeout(() => {
      setTime(new Date());
      setLastUpdated(new Date());
    }, 0);

    const timer = setInterval(() => {
      setTime(new Date());
      setShowColon((prev) => !prev);
    }, 1000);

    return () => {
      clearTimeout(initialSync);
      clearInterval(timer);
    };
  }, []);

  const handleRefresh = () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    // Simulate refresh delay (1.5 seconds)
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1500);
  };

  const formattedTimeParts = time ? {
    hours: String(time.getHours() % 12 || 12).padStart(2, "0"),
    minutes: String(time.getMinutes()).padStart(2, "0"),
    ampm: time.getHours() >= 12 ? "PM" : "AM",
  } : null;

  const formattedDate = time
    ? {
        day: time.toLocaleDateString("en-US", { day: "numeric" }),
        monthYear: time.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      }
    : null;

  const formattedLastUpdated = lastUpdated
    ? lastUpdated.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "";

  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 md:items-center mb-8">
      {/* Left side: Title and Subtitle */}
      <div className="flex flex-col justify-center">
        <h1 className="text-[26px] font-bold text-[#1f2937] leading-tight">
          {title}
        </h1>
        <p className="text-[14px] font-medium text-[#64748b] mt-0.5">
          {subtitle}
        </p>
      </div>

      {/* Center: Live Clock and Date */}
      <div className="flex items-center justify-start md:justify-center gap-[10px]">
        <div className="flex items-center text-[38px] font-bold text-[#1e293b] leading-none tracking-tight">
          {formattedTimeParts ? (
            <>
              <span>{formattedTimeParts.hours}</span>
              <span
                className={clsx(
                  "mx-0.5 relative transition-opacity duration-300 transform -translate-y-[2px]",
                  showColon ? "opacity-100" : "opacity-0"
                )}
              >
                :
              </span>
              <span>{formattedTimeParts.minutes}</span>
              <span className="ml-[6px] text-[36px] font-bold mt-[2px]">
                {formattedTimeParts.ampm}
              </span>
            </>
          ) : (
            <span>--:-- --</span>
          )}
        </div>
        
        {formattedDate && (
          <div className="flex flex-col justify-center">
            <span className="text-[13px] font-bold text-[#475569] leading-tight">
              {formattedDate.day}
            </span>
            <span className="text-[12px] font-bold text-[#475569] leading-tight mt-[1px]">
              {formattedDate.monthYear}
            </span>
          </div>
        )}
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center justify-start md:justify-end gap-3">
        <div className="flex h-[38px] items-center justify-center gap-2 rounded-full border border-[#d6dffe] bg-[#f4f7fe] px-[18px] text-[13px] font-semibold text-[#4f46e5]">
          <History className="h-[14px] w-[14px]" strokeWidth={2.5} />
          <span className="whitespace-nowrap">
            Last updated: {formattedLastUpdated}
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#f1f5f9] text-[#475569] transition-all hover:bg-[#e2e8f0] active:scale-95 disabled:opacity-50"
          aria-label="Refresh Data"
        >
          <RefreshCcw
            className={clsx("h-[16px] w-[16px]", isRefreshing && "animate-spin")}
            strokeWidth={2.5}
          />
        </button>
      </div>
    </div>
  );
}
