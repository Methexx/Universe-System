import React, { useState } from 'react';
import clsx from 'clsx';
import { Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  onDelete?: () => void;
  defaultExpanded?: boolean;
  headerAction?: React.ReactNode;
  summaryContent?: React.ReactNode;
}

export function SectionCard({ title, children, onDelete, defaultExpanded = true, headerAction, summaryContent }: SectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="flex flex-col mb-10 gap-4 w-full">
      <div className="flex items-center justify-between w-full">
        <h3 className="text-xl font-bold text-[#334155]">{title}</h3>
        {headerAction && (
          <div>{headerAction}</div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-[20px] p-6 w-full shadow-sm transition-all duration-200">
        {/* Card Header Actions */}
        <div className="flex justify-end gap-3 mb-6">
          <button 
            type="button"
            onClick={onDelete}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        
        <div className={clsx("transition-all duration-300 overflow-hidden", isExpanded ? "opacity-100 max-h-[1500px]" : "opacity-0 max-h-0")}>
          {children}
        </div>

        {!isExpanded && summaryContent && (
          <div className="animate-in fade-in duration-300">
            {summaryContent}
          </div>
        )}
      </div>
    </div>
  );
}
