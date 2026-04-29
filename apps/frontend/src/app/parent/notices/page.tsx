"use client";

import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { NoticeCard, Notice } from '@/shared/components/ui/NoticeCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Search } from 'lucide-react';

const DUMMY_NOTICES: Notice[] = [
  {
    id: '1',
    title: 'Parent-Teacher Conference',
    content: 'Dear Parents, we will be hosting a general assembly followed by individual conferences this Saturday. This is a great opportunity to discuss your child\'s progress and upcoming school initiatives.',
    image_url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop',
    scope: 'school_wide',
    target: 'parents_only',
    created_at: new Date().toISOString(),
    author: {
      full_name: 'Admin Team',
      role: 'admin',
      avatar_url: null
    }
  },
  {
    id: '2',
    title: 'UniVerse Annual Sports Meet 2024',
    content: 'Get ready for the biggest event of the year! The UniVerse Sports Meet is scheduled for next month. All students are encouraged to participate in at least one event. Registration forms are available at the front desk.',
    image_url: 'https://images.unsplash.com/photo-1502904550040-7534597429ae?q=80&w=2069&auto=format&fit=crop',
    scope: 'school_wide',
    target: 'all',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    author: {
      full_name: 'Dr. Sarah Wilson',
      role: 'admin',
      avatar_url: 'https://i.pravatar.cc/150?u=sarah'
    }
  }
];

export default function ParentNoticesPage() {
  const [notices] = useState<Notice[]>(DUMMY_NOTICES);
  const [search, setSearch] = useState('');

  const filteredNotices = useMemo(() => {
    return notices.filter(n => {
      const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                           n.content.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [notices, search]);

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-5xl mx-auto w-full px-4">
      <PageHeader 
        title="Notice Board"
        subtitle="Stay updated with official school announcements and events"
      />

      {/* Filter Area */}
      <div className="flex flex-col gap-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-[15px] font-bold text-slate-800 ml-2 flex items-center gap-2">
            Recent Announcements
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[11px] rounded-md font-bold uppercase">
              {filteredNotices.length}
            </span>
          </h2>

          <div className="flex items-center gap-3 flex-1 md:flex-none md:min-w-[300px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search announcements..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredNotices.map((notice) => (
              <NoticeCard 
                key={notice.id} 
                notice={notice} 
                canDelete={false}
              />
            ))}
          </AnimatePresence>

          {filteredNotices.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                <Megaphone className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No announcements found</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-xs">
                Important notices will appear here once published by school authorities.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
