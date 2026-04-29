"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { NoticeCard, Notice } from '@/shared/components/ui/NoticeCard';
import { NoticeForm } from '@/shared/components/ui/NoticeForm';
import { NoticeFilters } from '@/shared/components/ui/NoticeFilters';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '@/features/notices/lib/notices-api';
import { AnimatePresence } from 'framer-motion';
import { Megaphone } from 'lucide-react';

export default function TeacherNoticesPage() {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'school'>('all');
  const [search, setSearch] = useState('');

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAnnouncements();
      setNotices(Array.isArray(data) ? data : data.announcements || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch announcements');
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotices();
  }, [fetchNotices]);

  const handlePublish = async (data: {
    title: string;
    content: string;
    scope: string;
    target: string;
    image_url: string | null;
    class_id?: string | null;
  }) => {
    try {
      setError(null);
      const newNotice = await createAnnouncement(data);
      setNotices(prev => [newNotice.data || newNotice, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish announcement');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this announcement?')) {
      try {
        setError(null);
        await deleteAnnouncement(id);
        setNotices(prev => prev.filter(n => n.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete announcement');
      }
    }
  };

  const filteredNotices = notices.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
                         n.content.toLowerCase().includes(search.toLowerCase());

    if (activeTab === 'mine') return matchesSearch && n.author.full_name === user?.full_name;
    if (activeTab === 'school') return matchesSearch && n.scope === 'school_wide';
    return matchesSearch;
  });

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-6xl mx-auto w-full px-4">
      <PageHeader
        title="Notices"
        subtitle="Post class updates and stay informed about school-wide announcements"
      />

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <NoticeForm onPublish={handlePublish} />

      {/* Filters */}
      <NoticeFilters
        tabs={[
          { key: 'all', label: 'All Notices' },
          { key: 'mine', label: 'My Notices' },
          { key: 'school', label: 'School Wide' }
        ]}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as 'all' | 'mine' | 'school')}
        search={search}
        onSearchChange={setSearch}
        itemCount={filteredNotices.length}
      />

      {/* Feed */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-500">Loading announcements...</div>
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {filteredNotices.map((notice) => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  canDelete={notice.author.full_name === user?.full_name}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>

            {filteredNotices.length === 0 && (
              <EmptyState
                icon={Megaphone}
                title="No notices found"
                description={search ? 'Try adjusting your search or filters.' : 'Start by posting your first class announcement.'}
                action={!search ? { label: 'Post Announcement', onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) } : undefined}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
