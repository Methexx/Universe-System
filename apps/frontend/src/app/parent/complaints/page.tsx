"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  ChevronDown,
  FileText,
  Clock,
  Send,
  Plus,
  X,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { SelectInput } from '@/shared/components/ui/forms/SelectInput';
import {
  getMyComplaints,
  createComplaint,
  Complaint,
} from '@/features/complaints/lib/complaints-api';

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

export default function ParentComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: 'academic',
    description: '',
  });

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyComplaints();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      setError('Please describe your complaint');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await createComplaint({
        category: formData.category,
        description: formData.description,
      });
      setFormData({ category: 'academic', description: '' });
      setIsExpanded(false);
      await fetchComplaints();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-6xl mx-auto w-full px-4">
      <PageHeader
        title="Complaints & Suggestions"
        subtitle="Submit concerns, suggestions, or complaints to school administration"
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm flex gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Submit Form */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
        <form onSubmit={handleSubmit}>
          {!isExpanded ? (
            <motion.button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="w-full p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0 border border-indigo-200">
                <Plus className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[14px] font-semibold text-slate-600">
                  Submit a complaint or suggestion
                </p>
                <p className="text-[12px] text-slate-400 mt-0.5">
                  Let us know if there&apos;s anything we can improve
                </p>
              </div>
            </motion.button>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-6 border-t border-slate-100 space-y-5"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-[16px] font-bold text-slate-900">New Complaint</h3>
                  <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Category Select */}
                <SelectInput
                  label="Category"
                  options={[
                    { label: 'Academic', value: 'academic' },
                    { label: 'Teacher Conduct', value: 'teacher_conduct' },
                    { label: 'Facility', value: 'facility' },
                    { label: 'Administrative', value: 'administrative' },
                    { label: 'Suggestion', value: 'suggestion' },
                    { label: 'Other', value: 'other' },
                  ]}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />

                {/* Description */}
                <div>
                  <label className="text-[13px] font-bold text-slate-700 block mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Please describe your complaint or suggestion in detail..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-[14px] text-slate-700 resize-none"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ category: 'academic', description: '' });
                      setIsExpanded(false);
                    }}
                    className="px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={!formData.description.trim() || submitting}
                    className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-[14px] font-bold transition-all ${
                      !formData.description.trim() || submitting
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:-translate-y-0.5 active:scale-95'
                    }`}
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Submit
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </form>
      </div>

      {/* My Complaints */}
      <div>
        <h2 className="text-[18px] font-bold text-slate-900 mb-4">My Complaints</h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-500">Loading complaints...</div>
          </div>
        ) : complaints.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No complaints yet"
            description="Submit your first complaint or suggestion above"
          />
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {complaints.map((complaint) => (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Card Header */}
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === complaint.id ? null : complaint.id)
                    }
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
                      <div className="flex items-center gap-1 text-[12px] text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(complaint.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: complaint.created_at.substring(0, 4) !== new Date().getFullYear().toString() ? 'numeric' : undefined,
                        })}
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
                        className="border-t border-slate-100 bg-slate-50 p-6 space-y-4"
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

                        {/* Assigned Teacher */}
                        {complaint.assigned_to?.full_name && (
                          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                            <p className="text-[13px] text-indigo-700">
                              <span className="font-semibold">Assigned to:</span>{' '}
                              {complaint.assigned_to.full_name}
                            </p>
                          </div>
                        )}

                        {/* Teacher Reply */}
                        {complaint.reply_note && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <h4 className="text-[11px] font-bold text-green-700 uppercase tracking-wide mb-1">
                              School Response
                            </h4>
                            <p className="text-[13px] text-green-700">{complaint.reply_note}</p>
                          </div>
                        )}

                        {/* Status Info */}
                        <div className="bg-white border border-slate-200 rounded-lg p-3">
                          <p className="text-[12px] text-slate-600">
                            <span className="font-semibold">Status:</span>{' '}
                            <span className="capitalize">{complaint.status.replace(/_/g, ' ')}</span>
                          </p>
                          {complaint.assigned_at && (
                            <p className="text-[12px] text-slate-500 mt-1">
                              Assigned on:{' '}
                              {new Date(complaint.assigned_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
