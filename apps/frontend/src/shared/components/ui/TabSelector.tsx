"use client";

import React from "react";
import clsx from "clsx";

export interface TabOption {
  id: string;
  label: string;
  badge?: number;
}

interface TabSelectorProps {
  options: TabOption[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function TabSelector({ options, activeTab, onTabChange }: TabSelectorProps) {
  return (
    <div className="flex items-center gap-4">
      {options.map((option) => {
        const isActive = activeTab === option.id;
        
        return (
          <button
            key={option.id}
            onClick={() => onTabChange(option.id)}
            className={clsx(
              "px-8 py-2.5 rounded-[12px] text-[15px] font-medium transition-all relative flex items-center justify-center",
              isActive
                ? "bg-white text-[#0f172a] border-[2px] border-[#5a67d8] shadow-sm" 
                : "bg-white text-[#0f172a] border-[1px] border-[#c7d2fe] hover:bg-[#f8fafc]"
            )}
          >
            {option.label}
            {option.badge !== undefined && option.badge > 0 && (
              <span className="absolute -top-2.5 -right-2.5 bg-[#ef4444] text-white text-[12px] font-bold min-w-[22px] h-[22px] rounded-full flex items-center justify-center px-1 shadow-sm">
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}