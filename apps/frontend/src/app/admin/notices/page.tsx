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

export default function AdminNoticesPage() {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState<'all' | 'school_wide' | 'class'>('all');

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = scope === 'all' ? {} : { scope };
      const data = await getAnnouncements(params);
      setNotices(Array.isArray(data) ? data : data.announcements || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch announcements');
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotices();
  }, [fetchNotices]);

  const filteredNotices = notices.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

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
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        setError(null);
        await deleteAnnouncement(id);
        setNotices(prev => prev.filter(n => n.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete announcement');
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-6xl mx-auto w-full px-4">
      <PageHeader
        title="Notice Board"
        subtitle="Create and manage official announcements for the UniVerse community"
        onRefresh={fetchNotices}
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
          { key: 'all', label: 'All Announcements' },
          { key: 'school_wide', label: 'School Wide' },
          { key: 'class', label: 'Class Specific' }
        ]}
        activeTab={scope}
        onTabChange={(tab) => setScope(tab as 'all' | 'school_wide' | 'class')}
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
                  onDelete={handleDelete}
                  canDelete={user?.role === 'admin' || notice.author.full_name === user?.full_name}
                />
              ))}
            </AnimatePresence>

            {filteredNotices.length === 0 && (
              <EmptyState
                icon={Megaphone}
                title="No announcements found"
                description={search ? 'Try adjusting your search or filters.' : 'Start by publishing your first announcement to the community.'}
                action={!search ? { label: 'Create Announcement', onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) } : undefined}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
