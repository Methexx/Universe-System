"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import clsx from "clsx";

export interface FilterOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: FilterOption[];
}

export function FilterBar({
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  filters = [],
}: FilterBarProps) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex w-full flex-col xl:flex-row items-start xl:items-center justify-between gap-4" ref={containerRef}>
      {/* Search */}
      {onSearchChange !== undefined && (
        <div className="relative w-full max-w-[320px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
      )}

      {/* Filters */}
      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          {filters.map((filter) => {
            const isOpen = openDropdownId === filter.id;
            const currentLabel = filter.options.find((o) => o.value === filter.value)?.label || filter.label;

            return (
              <div key={filter.id} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdownId(isOpen ? null : filter.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] font-bold text-gray-600 hover:bg-gray-50 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                >
                  {filter.icon}
                  {currentLabel}
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400 ml-1" />
                </button>

                {isOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg z-50">
                    <div className="flex flex-col">
                      <button
                        onClick={() => {
                          filter.onChange("");
                          setOpenDropdownId(null);
                        }}
                        className={clsx(
                          "flex items-center justify-between rounded-md px-3 py-2 text-[13px] font-semibold transition-colors",
                          filter.value === "" ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        {filter.label}
                        {filter.value === "" && <Check className="h-4 w-4" />}
                      </button>
                      {filter.options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            filter.onChange(opt.value);
                            setOpenDropdownId(null);
                          }}
                          className={clsx(
                            "flex items-center justify-between rounded-md px-3 py-2 text-[13px] font-semibold transition-colors",
                            filter.value === opt.value ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"
                          )}
                        >
                          {opt.label}
                          {filter.value === opt.value && <Check className="h-4 w-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}