"use client";

import React from "react";
import clsx from "clsx";

export interface TabOptionV2 {
  id: string;
  label: string;
}

interface TabSelectorV2Props {
  options: TabOptionV2[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function TabSelectorV2({ options, activeTab, onTabChange }: TabSelectorV2Props) {
  return (
    <div className="inline-flex max-w-fit rounded-xl border border-gray-200 bg-white p-2 text-[14px] shadow-sm">
      {options.map((option) => {
        const isActive = activeTab === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onTabChange(option.id)}
            className={clsx(
              "rounded-lg px-6 py-2 font-bold transition-all",
              isActive
                ? "bg-[#4f46e5] text-white"
                : "text-gray-500 hover:bg-gray-50"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
