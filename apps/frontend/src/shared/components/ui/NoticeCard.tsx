"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Trash2, 
  Users, 
  Megaphone
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
}

export function NoticeCard({ notice, onDelete, canDelete }: NoticeCardProps) {
  const getScopeBadge = (scope: string, target: string) => {
    if (scope === 'school_wide') {
      return {
        label: 'School Wide',
        icon: <Megaphone className="w-3 h-3" />,
        className: 'bg-blue-50 text-blue-600 border-blue-200'
      };
    }
    return {
      label: target === 'all' ? 'Class Wide' : target,
      icon: <Users className="w-3 h-3" />,
      className: 'bg-purple-50 text-purple-600 border-purple-200'
    };
  };

  const badge = getScopeBadge(notice.scope, notice.target);
  const formattedDate = new Date(notice.created_at).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
  const formattedTime = new Date(notice.created_at).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit' 
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      {/* Header */}
      <div className="p-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 flex-shrink-0">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 overflow-hidden font-bold">
              {notice.author.avatar_url ? (
                <Image 
                  src={notice.author.avatar_url} 
                  alt={notice.author.full_name} 
                  width={44} 
                  height={44} 
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                notice.author.full_name.charAt(0)
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-white rounded-full">
              <div className="bg-green-500 w-2.5 h-2.5 rounded-full border border-white" />
            </div>
          </div>
          <div>
            <h4 className="text-[15px] font-bold text-slate-800 leading-tight">
              {notice.author.full_name}
            </h4>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wider">
                {capitalizeRole(notice.author.role)}
              </span>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="w-3 h-3" />
                {formattedTime}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold ${badge.className}`}>
            {badge.icon}
            {badge.label}
          </div>
          
          {canDelete && (
            <button 
              onClick={() => onDelete?.(notice.id)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-5">
        <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
          {notice.title}
        </h3>
        <p className="text-[14px] text-slate-600 leading-relaxed whitespace-pre-wrap">
          {notice.content}
        </p>
      </div>

      {/* Image */}
      {notice.image_url && (
        <div className="px-5 pb-5">
          <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 aspect-video">
            <Image 
              src={notice.image_url} 
              alt="Notice Attachment" 
              fill
              className="object-cover hover:scale-[1.02] transition-transform duration-500"
              unoptimized
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-3.5 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-4 text-[12px] text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-tighter italic">
          UniVerse System • Official Notice
        </div>
      </div>
    </motion.div>
  );
}
