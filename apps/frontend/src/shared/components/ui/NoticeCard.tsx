"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Trash2,
  Users,
  Megaphone,
  ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import { capitalizeRole } from '@/features/messages/lib/messages-api';

export interface NoticeAuthor {
  full_name: string;
  role: string;
  avatar_url?: string | null;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  image_url?: string | null;
  scope: string;
  target: string;
  created_at: string;
  author: NoticeAuthor;
}

interface NoticeCardProps {
  notice: Notice;
  onDelete?: (id: string) => void;
  canDelete?: boolean;
  onClick?: () => void;
  variant?: 'full' | 'compact';
}

export function NoticeCard({ notice, onDelete, canDelete, onClick, variant = 'full' }: NoticeCardProps) {
  const author = notice.author ?? { full_name: 'Unknown', role: 'unknown', avatar_url: null };
  const getScopeBadge = (scope: string) => {
    if (scope === 'school_wide') {
      return {
        label: 'School Wide',
        icon: <Megaphone className="w-3.5 h-3.5" />,
        className: 'bg-blue-50 text-blue-700 border border-blue-200'
      };
    }
    return {
      label: 'Class Specific',
      icon: <Users className="w-3.5 h-3.5" />,
      className: 'bg-purple-50 text-purple-700 border border-purple-200'
    };
  };

  const badge = getScopeBadge(notice.scope);
  const formattedDate = new Date(notice.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  const timeAgo = getTimeAgo(notice.created_at);

  if (variant === 'compact') {
    return (
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={onClick}
        className="w-full text-left bg-white border border-slate-100 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md hover:bg-indigo-50/30 transition-all duration-200"
      >
        <div className="flex items-start gap-4">
          {notice.image_url && (
            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
              <Image
                src={notice.image_url}
                alt="Notice"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-[14px] font-bold text-slate-900 line-clamp-2">
                {notice.title}
              </h3>
              <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            </div>
            <p className="text-[12px] text-slate-500 line-clamp-1 mb-2">
              {notice.content}
            </p>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${badge.className}`}>
                {badge.icon}
                {badge.label}
              </div>
              <span className="text-[11px] text-slate-400">{formattedDate}</span>
            </div>
          </div>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col"
    >
      {/* Image (if present) */}
      {notice.image_url && (
        <div className="relative w-full h-36 bg-slate-100 border-b border-slate-100 overflow-hidden">
          <Image
            src={notice.image_url}
            alt="Notice"
            fill
            className="object-cover hover:scale-105 transition-transform duration-500"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        </div>
      )}

      {/* Header */}
      <div className="p-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative h-12 w-12 flex-shrink-0">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600 border border-indigo-200 overflow-hidden font-bold text-sm">
              {author.avatar_url ? (
                <Image
                  src={author.avatar_url}
                  alt={author.full_name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                author.full_name.charAt(0)
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[14px] font-bold text-slate-900">
              {author.full_name}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">
                {capitalizeRole(author.role)}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-500">{timeAgo}</span>
            </div>
          </div>
        </div>

        {/* Badge + Delete */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap ${badge.className}`}>
            {badge.icon}
            {badge.label}
          </div>

          {canDelete && (
            <button
              onClick={() => onDelete?.(notice.id)}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6 flex-1">
        <h3 className="text-lg font-bold text-slate-900 mb-3 leading-snug">
          {notice.title}
        </h3>
        <p className="text-[14px] text-slate-600 leading-relaxed line-clamp-3">
          {notice.content}
        </p>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-25 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium">
          <Calendar className="w-3.5 h-3.5" />
          {formattedDate}
        </div>

        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">
          Official Notice
        </div>
      </div>
    </motion.div>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
