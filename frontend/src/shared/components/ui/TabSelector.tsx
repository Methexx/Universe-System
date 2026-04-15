"use client";

import React from "react";
import clsx from "clsx";

export interface TabOption {
  id: string;
  label: string;
}

interface TabSelectorProps {
  options: TabOption[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function TabSelector({ options, activeTab, onTabChange }: TabSelectorProps) {
  return (
    <div className="inline-flex rounded-lg overflow-hidden border border-gray-200">
      {options.map((option, index) => {
        const isActive = activeTab === option.id;
        const isLast = index === options.length - 1;
        
        return (
          <button
            key={option.id}
            onClick={() => onTabChange(option.id)}
            className={clsx(
              "px-5 py-1.5 text-sm font-semibold transition-colors",
              isActive ? "bg-indigo-50 text-indigo-600" : "bg-white text-gray-500 hover:bg-gray-50",
              !isLast && "border-r border-gray-200"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}