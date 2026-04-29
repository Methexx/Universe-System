"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';

interface Tab {
  key: string;
  label: string;
}

interface NoticeFiltersProps {
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  search?: string;
  onSearchChange?: (search: string) => void;
  itemCount?: number;
  showFilters?: boolean;
}

export function NoticeFilters({
  tabs,
  activeTab,
  onTabChange,
  search = '',
  onSearchChange,
  itemCount = 0,
  showFilters = true,
}: NoticeFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
    >
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Title + Tabs */}
        <div className="flex flex-col gap-4 flex-1">
          <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
            Announcements
            {itemCount > 0 && (
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[11px] rounded-lg font-bold">
                {itemCount}
              </span>
            )}
          </h2>

          {/* Tabs */}
          {tabs && tabs.length > 0 && (
            <div className="flex gap-1 p-1 bg-slate-50 rounded-xl w-fit">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.key}
                  onClick={() => onTabChange?.(tab.key)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                    activeTab === tab.key
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Search + Filter */}
        <div className="flex items-center gap-3 flex-1 sm:flex-none">
          <div className="relative flex-1 sm:min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={search}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
            />
          </div>

          {showFilters && (
            <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-slate-200">
              <Filter className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
