"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  X, 
  Plus, 
  Trash2, 
  Image as ImageIcon,
  Globe
} from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { TextInput } from './forms/TextInput';
import { SelectInput } from './forms/SelectInput';

interface NoticeFormProps {
  onPublish: (data: {
    title: string;
    content: string;
    scope: string;
    target: string;
    imageFile: File | null;
  }) => void;
  isSubmitting?: boolean;
}

export function NoticeForm({ onPublish, isSubmitting }: NoticeFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    scope: 'school_wide',
    target: 'all'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageSelect = (file: File | null) => {
    setImageFile(file);
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    
    onPublish({
      ...formData,
      imageFile
    });

    // Reset form
    setFormData({
      title: '',
      content: '',
      scope: 'school_wide',
      target: 'all'
    });
    setImageFile(null);
    setPreviewUrl(null);
    setIsExpanded(false);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
      <form onSubmit={handleSubmit}>
        {!isExpanded ? (
          <div 
            onClick={() => setIsExpanded(true)}
            className="p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 flex-shrink-0">
              <Plus className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-medium text-slate-400">Share something with the UniVerse...</p>
            </div>
            <div className="flex items-center gap-2 pr-2">
              <button type="button" className="p-2 text-slate-400 hover:text-indigo-500 rounded-full">
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-slate-800">New Announcement</h3>
                  <p className="text-[11px] text-slate-400">Reach your audience across the platform</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <TextInput 
                label="Headline / Title"
                placeholder="e.g., Annual Sports Meet 2024"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="font-bold text-lg"
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Message Details
                </label>
                <textarea
                  rows={4}
                  placeholder="Write your announcement details here..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-[14px] text-slate-700 resize-none"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                />
              </div>

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

              <div className="pt-2">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider ml-1 mb-2 block">
                  Media Attachment
                </label>
                <ImageUpload 
                  onImageSelect={handleImageSelect}
                  previewUrl={previewUrl}
                  onClear={handleClearImage}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setFormData({ title: '', content: '', scope: 'school_wide', target: 'all' });
                  handleClearImage();
                }}
                className="flex items-center gap-2 px-4 py-2 text-[13px] font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Clear Draft
              </button>

              <button
                type="submit"
                disabled={!formData.title || !formData.content || isSubmitting}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[14px] font-bold transition-all shadow-lg shadow-indigo-200 active:scale-95 ${
                  !formData.title || !formData.content || isSubmitting
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:-translate-y-0.5'
                }`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Publish Announcement
              </button>
            </div>
          </motion.div>
        )}
      </form>
    </div>
  );
}
