"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { NoticeCard, Notice } from '@/shared/components/ui/NoticeCard';
import { NoticeFilters } from '@/shared/components/ui/NoticeFilters';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { getAnnouncements } from '@/features/notices/lib/notices-api';
import { AnimatePresence } from 'framer-motion';
import { Megaphone } from 'lucide-react';

export default function ParentNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAnnouncements();
      const allNotices = Array.isArray(data) ? data : data.announcements || [];
      const parentNotices = allNotices.filter((n: Notice) =>
        n.target === 'all' || n.target === 'parents_only'
      );
      setNotices(parentNotices);
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

  const filteredNotices = notices.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
                         n.content.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-6xl mx-auto w-full px-4">
      <PageHeader
        title="Notice Board"
        subtitle="Stay updated with official school announcements and important events"
        onRefresh={fetchNotices}
      />

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <NoticeFilters
        search={search}
        onSearchChange={setSearch}
        itemCount={filteredNotices.length}
        showFilters={false}
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
                  canDelete={false}
                />
              ))}
            </AnimatePresence>

            {filteredNotices.length === 0 && (
              <EmptyState
                icon={Megaphone}
                title="No announcements found"
                description={search ? 'Try adjusting your search.' : 'Important notices will appear here when published by school authorities.'}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
