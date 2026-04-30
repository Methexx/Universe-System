"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-200">
        <Icon className="w-12 h-12 text-slate-400" />
      </div>

      <h3 className="text-[18px] font-bold text-slate-900 mb-2">
        {title}
      </h3>

      <p className="text-[14px] text-slate-500 max-w-xs mb-6">
        {description}
      </p>

      {action && (
        <motion.button
          onClick={action.onClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold rounded-lg transition-all shadow-lg shadow-indigo-200"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
