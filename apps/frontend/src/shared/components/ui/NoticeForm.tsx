"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Globe,
  AlertCircle
} from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { TextInput } from './forms/TextInput';
import { SelectInput } from './forms/SelectInput';
import { uploadNoticeImage } from '@/shared/lib/supabase-storage';

interface NoticeFormProps {
  onPublish: (data: {
    title: string;
    content: string;
    scope: string;
    target: string;
    image_url: string | null;
    class_id?: string | null;
  }) => void;
  isSubmitting?: boolean;
  userRole?: string;
  userClassId?: string;
}

export function NoticeForm({ onPublish, isSubmitting, userClassId }: NoticeFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    scope: 'school_wide',
    target: 'all',
    classId: userClassId || ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageSelect = (file: File | null) => {
    setImageFile(file);
    setUploadError(null);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleClearImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setUploadError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    let imageUrl: string | null = null;

    if (imageFile) {
      try {
        imageUrl = await uploadNoticeImage(imageFile);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
        setUploadError(errorMessage);
        return;
      }
    }

    onPublish({
      title: formData.title,
      content: formData.content,
      scope: formData.scope,
      target: formData.target,
      image_url: imageUrl,
      class_id: formData.scope === 'class' ? formData.classId : undefined
    });

    setFormData({
      title: '',
      content: '',
      scope: 'school_wide',
      target: 'all',
      classId: ''
    });
    setImageFile(null);
    setPreviewUrl(null);
    setUploadError(null);
    setIsExpanded(false);
  };

  return (
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
              <p className="text-[14px] font-semibold text-slate-600">Share an announcement</p>
              <p className="text-[12px] text-slate-400 mt-0.5">Post updates to reach your audience</p>
            </div>
            <div className="flex items-center gap-2 pr-2">
              <div className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                <ImageIcon className="w-5 h-5" />
              </div>
            </div>
          </motion.button>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-6 border-t border-slate-100"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-lg text-indigo-600 border border-indigo-200">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-slate-900">New Announcement</h3>
                    <p className="text-[12px] text-slate-500">Reach your audience across the platform</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Inputs */}
              <div className="space-y-5 mb-6">
                <TextInput
                  label="Headline / Title"
                  placeholder="e.g., Annual Sports Meet 2024"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-slate-700 block">
                    Message Details
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Write your announcement details here..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-[14px] text-slate-700 resize-none"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  />
                </div>

                {/* Scope & Target */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectInput
                    label="Broadcast Level"
                    options={[
                      { label: 'School Wide (Public)', value: 'school_wide' },
                      { label: 'Specific Class (Private)', value: 'class' }
                    ]}
                    value={formData.scope}
                    onChange={(e) => setFormData(prev => ({ ...prev, scope: e.target.value }))}
                  />

                  <SelectInput
                    label="Target Audience"
                    options={[
                      { label: 'Everyone', value: 'all' },
                      { label: 'Parents Only', value: 'parents_only' },
                      { label: 'Staff Only', value: 'staff_only' }
                    ]}
                    value={formData.target}
                    onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value }))}
                  />
                </div>

                {/* Image Upload */}
                <div className="pt-2">
                  <label className="text-[13px] font-bold text-slate-700 block mb-2">
                    Media Attachment (Optional)
                  </label>
                  <ImageUpload
                    onImageSelect={handleImageSelect}
                    previewUrl={previewUrl}
                    onClear={handleClearImage}
                  />
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {uploadError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-gap-2 gap-3"
                    >
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[12px] font-semibold text-red-800">Upload failed</p>
                        <p className="text-[11px] text-red-700">{uploadError}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ title: '', content: '', scope: 'school_wide', target: 'all', classId: userClassId || '' });
                    handleClearImage();
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Draft
                </button>

                <button
                  type="submit"
                  disabled={!formData.title || !formData.content || isSubmitting}
                  className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-[14px] font-bold transition-all ${
                    !formData.title || !formData.content || isSubmitting
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:-translate-y-0.5 active:scale-95'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Publish
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </form>
    </div>
  );
}
