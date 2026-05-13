"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  ChevronDown,
  FileText,
  Clock,
  User,
  Send,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { SelectInput } from '@/shared/components/ui/forms/SelectInput';
import {
  getAllComplaints,
  assignComplaint,
  updateComplaintStatus,
  Complaint,
} from '@/features/complaints/lib/complaints-api';
import { getTeachers, TeacherInfo } from '@/features/school/lib/school-api';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  assigned: 'bg-blue-50 text-blue-700 border border-blue-200',
  in_progress: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  resolved: 'bg-green-50 text-green-700 border border-green-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
};

const CATEGORY_COLORS: Record<string, string> = {
  academic: 'bg-blue-50 text-blue-700 border border-blue-200',
  teacher_conduct: 'bg-orange-50 text-orange-700 border border-orange-200',
  facility: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  administrative: 'bg-purple-50 text-purple-700 border border-purple-200',
  suggestion: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  other: 'bg-slate-50 text-slate-700 border border-slate-200',
};

function getCategoryLabel(category: string): string {
  return category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [teachers, setTeachers] = useState<TeacherInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [assignForm, setAssignForm] = useState({ assigned_to_id: '', reply_note: '' });
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllComplaints();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch complaints');
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchComplaints();
    })();
  }, [fetchComplaints]);

  useEffect(() => {
    (async () => {
      try {
        const result = await getTeachers();
        if (result.ok) {
          setTeachers(result.data);
        } else {
          console.error('Failed to fetch teachers:', result.error);
        }
      } catch (err) {
        console.error('Failed to fetch teachers:', err);
      }
    })();
  }, []);

  const filteredComplaints = complaints.filter((c) => {
    if (activeTab === 'all') return true;
    return c.status === activeTab;
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'pending').length,
    assigned: complaints.filter((c) => c.status === 'assigned').length,
    in_progress: complaints.filter((c) => c.status === 'in_progress').length,
    resolved: complaints.filter((c) => c.status === 'resolved').length,
    rejected: complaints.filter((c) => c.status === 'rejected').length,
  };

  const handleAssign = async (complaintId: string) => {
    if (!assignForm.assigned_to_id) {
      setError('Please select a teacher');
      return;
    }
    try {
      setError(null);
      await assignComplaint(complaintId, {
        assigned_to_id: assignForm.assigned_to_id,
        reply_note: assignForm.reply_note,
      });
      setExpandedId(null);
      setAssigningId(null);
      setAssignForm({ assigned_to_id: '', reply_note: '' });
      await fetchComplaints();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign complaint');
    }
  };

  const handleStatusChange = async (complaintId: string, newStatus: string) => {
    const notes = editingNotes[complaintId] || '';
    try {
      setError(null);
      await updateComplaintStatus(complaintId, { status: newStatus, reply_note: notes });
      setEditingNotes({ ...editingNotes, [complaintId]: '' });
      await fetchComplaints();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-6xl mx-auto w-full px-4">
      <PageHeader
        title="Complaint Management"
        subtitle="Review, assign, and resolve parent complaints and suggestions"
        onRefresh={fetchComplaints}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm flex gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'slate' },
          { label: 'Pending', value: stats.pending, color: 'amber' },
          { label: 'Assigned', value: stats.assigned, color: 'blue' },
          { label: 'In Progress', value: stats.in_progress, color: 'indigo' },
          { label: 'Resolved', value: stats.resolved, color: 'green' },
          { label: 'Rejected', value: stats.rejected, color: 'red' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-${stat.color}-50 border border-${stat.color}-200 rounded-xl p-4 text-center`}
          >
            <div className={`text-2xl font-bold text-${stat.color}-700`}>{stat.value}</div>
            <div className={`text-xs font-semibold text-${stat.color}-600 mt-1`}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'pending', 'assigned', 'in_progress', 'resolved', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {tab === 'all' ? 'All' : getCategoryLabel(tab)}
          </button>
        ))}
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-500">Loading complaints...</div>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No complaints found"
          description="All complaints have been resolved or there are no complaints yet."
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredComplaints.map((complaint) => (
              <motion.div
                key={complaint.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <button
                  onClick={() => setExpandedId(expandedId === complaint.id ? null : complaint.id)}
                  className="w-full p-4 text-left hover:bg-slate-50 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                          CATEGORY_COLORS[complaint.category] || CATEGORY_COLORS.other
                        }`}
                      >
                        {getCategoryLabel(complaint.category)}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                          STATUS_COLORS[complaint.status] || STATUS_COLORS.pending
                        }`}
                      >
                        {complaint.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-[14px] font-semibold text-slate-900 line-clamp-2 mb-1">
                      {complaint.description}
                    </p>
                    <div className="flex items-center gap-4 text-[12px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {complaint.parent?.full_name || 'Unknown'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(complaint.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      {complaint.assigned_to?.full_name && (
                        <div className="text-indigo-600 font-semibold">
                          → {complaint.assigned_to.full_name}
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${
                      expandedId === complaint.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {expandedId === complaint.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-slate-100 bg-slate-50 p-6 space-y-6"
                    >
                      {/* Description */}
                      <div>
                        <h4 className="text-[12px] font-bold text-slate-700 uppercase tracking-wide mb-2">
                          Description
                        </h4>
                        <p className="text-[14px] text-slate-700 leading-relaxed">
                          {complaint.description}
                        </p>
                      </div>

                      {/* Current Reply Note (if exists) */}
                      {complaint.reply_note && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                          <h4 className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide mb-1">
                            Reply Note
                          </h4>
                          <p className="text-[13px] text-indigo-700">{complaint.reply_note}</p>
                        </div>
                      )}

                      {/* Assign Form */}
                      {assigningId === complaint.id ? (
                        <div className="bg-white border border-indigo-200 rounded-lg p-4 space-y-3">
                          <SelectInput
                            label="Assign to Teacher"
                            options={[
                              { label: 'Select a teacher...', value: '' },
                              ...teachers.map((t) => ({
                                label: t.full_name || t.email || 'Unknown',
                                value: t.id,
                              }))
                            ]}
                            value={assignForm.assigned_to_id}
                            onChange={(e) =>
                              setAssignForm({ ...assignForm, assigned_to_id: e.target.value })
                            }
                          />
                          <div>
                            <label className="text-[13px] font-bold text-slate-700 block mb-2">
                              Reply Note (Optional)
                            </label>
                            <textarea
                              placeholder="Add any notes for the teacher..."
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-[13px] resize-none"
                              rows={2}
                              value={assignForm.reply_note}
                              onChange={(e) =>
                                setAssignForm({ ...assignForm, reply_note: e.target.value })
                              }
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAssign(complaint.id)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-[13px] hover:bg-indigo-700 transition-colors"
                            >
                              <Send className="w-4 h-4" />
                              Assign
                            </button>
                            <button
                              onClick={() => {
                                setAssigningId(null);
                                setAssignForm({ assigned_to_id: '', reply_note: '' });
                              }}
                              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold text-[13px] hover:bg-slate-300 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssigningId(complaint.id)}
                          className="w-full px-4 py-2 border border-dashed border-indigo-300 text-indigo-600 rounded-lg font-semibold text-[13px] hover:bg-indigo-50 transition-colors"
                        >
                          + Assign to Teacher
                        </button>
                      )}

                      {/* Resolution Notes for Direct Admin Action */}
                      {complaint.status !== 'resolved' && complaint.status !== 'rejected' && assigningId !== complaint.id && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide block mb-2">
                              Resolution/Update Notes
                            </label>
                            <textarea
                              placeholder="Add a note for the parent..."
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-[13px] resize-none bg-white"
                              rows={2}
                              value={editingNotes[complaint.id] || complaint.reply_note || ''}
                              onChange={(e) =>
                                setEditingNotes({ ...editingNotes, [complaint.id]: e.target.value })
                              }
                            />
                          </div>
                        </div>
                      )}

                      {/* Status Actions */}
                      {complaint.status !== 'resolved' && complaint.status !== 'rejected' && (
                        <div className="flex gap-2">
                          {complaint.status !== 'in_progress' && (
                            <button
                              onClick={() => handleStatusChange(complaint.id, 'in_progress')}
                              className="flex-1 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-[12px] hover:bg-indigo-200 transition-colors"
                            >
                              Mark In Progress
                            </button>
                          )}
                          <button
                            onClick={() => handleStatusChange(complaint.id, 'resolved')}
                            className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg font-semibold text-[12px] hover:bg-green-200 transition-colors"
                          >
                            Mark Resolved
                          </button>
                          <button
                            onClick={() => handleStatusChange(complaint.id, 'rejected')}
                            className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg font-semibold text-[12px] hover:bg-red-200 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
