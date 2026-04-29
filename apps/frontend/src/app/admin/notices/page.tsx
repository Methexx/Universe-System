"use client";

import React, { useState } from 'react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { NoticeCard, Notice } from '@/shared/components/ui/NoticeCard';
import { NoticeForm } from '@/shared/components/ui/NoticeForm';
import { useAuth } from '@/features/auth/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const DUMMY_NOTICES: Notice[] = [
  {
    id: '1',
    title: 'UniVerse Annual Sports Meet 2024',
    content: 'Get ready for the biggest event of the year! The UniVerse Sports Meet is scheduled for next month. All students are encouraged to participate in at least one event. Registration forms are available at the front desk.',
    image_url: 'https://images.unsplash.com/photo-1502904550040-7534597429ae?q=80&w=2069&auto=format&fit=crop',
    scope: 'school_wide',
    target: 'all',
    created_at: new Date().toISOString(),
    author: {
      full_name: 'Dr. Sarah Wilson',
      role: 'admin',
      avatar_url: 'https://i.pravatar.cc/150?u=sarah'
    }
  },
  {
    id: '2',
    title: 'Mid-term Assessment Schedule',
    content: 'The mid-term assessments for the second semester will commence on November 15th. Detailed timetables have been sent to individual student portals. Please ensure all project submissions are completed by the end of this week.',
    scope: 'school_wide',
    target: 'all',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    author: {
      full_name: 'Prof. Michael Chen',
      role: 'teacher',
      avatar_url: 'https://i.pravatar.cc/150?u=michael'
    }
  },
  {
    id: '3',
    title: 'Parent-Teacher Conference',
    content: 'Dear Parents, we will be hosting a general assembly followed by individual conferences this Saturday. This is a great opportunity to discuss your child\'s progress and upcoming school initiatives.',
    image_url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop',
    scope: 'school_wide',
    target: 'parents_only',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    author: {
      full_name: 'Admin Team',
      role: 'admin',
      avatar_url: null
    }
  }
];

export default function NoticesPage() {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>(DUMMY_NOTICES);

  const handlePublish = (data: {
    title: string;
    content: string;
    scope: string;
    target: string;
    imageFile: File | null;
  }) => {
    const newNotice: Notice = {
      id: Date.now().toString(),
      title: data.title,
      content: data.content,
      scope: data.scope,
      target: data.target,
      image_url: data.imageFile ? URL.createObjectURL(data.imageFile) : null,
      created_at: new Date().toISOString(),
      author: {
        full_name: user?.full_name || 'Admin User',
        role: user?.role || 'admin',
        avatar_url: user?.avatar_url
      }
    };

    setNotices(prev => [newNotice, ...prev]);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      setNotices(prev => prev.filter(n => n.id !== id));
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-5xl mx-auto w-full px-4">
      <PageHeader 
        title="Notice Board"
        subtitle="Manage and view official announcements for the UniVerse community"
      />

      {/* Creation Area */}
      <div className="w-full">
        <NoticeForm onPublish={handlePublish} />
      </div>

      {/* Feed Area */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            Recent Announcements
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[11px] rounded-md font-bold uppercase">
              {notices.length}
            </span>
          </h2>
          
          <div className="flex items-center gap-2">
            <select className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[12px] font-bold text-slate-600 outline-none focus:border-indigo-300 transition-colors">
              <option>All Announcements</option>
              <option>School Wide</option>
              <option>Class Specific</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {notices.map((notice) => (
              <NoticeCard 
                key={notice.id} 
                notice={notice} 
                onDelete={handleDelete}
                canDelete={user?.role === 'admin' || notice.author.full_name === user?.full_name}
              />
            ))}
          </AnimatePresence>

          {notices.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                <Megaphone className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No announcements yet</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-xs">
                Important notices will appear here. Start by publishing your first announcement.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper to avoid build error if icon used in empty state is not imported
import { Megaphone } from 'lucide-react';
