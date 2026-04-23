"use client";

import React, { useState } from 'react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { TextInput } from '@/shared/components/ui/forms/TextInput';
import { SelectInput } from '@/shared/components/ui/forms/SelectInput';
import { Trash2, ArrowUpCircle, Plus } from 'lucide-react';

interface Notice {
  id: string;
  caption: string;
  details: string;
  time: string;
  date: string;
  status: string;
}

const INITIAL_NOTICES: Notice[] = [
  { id: '1', caption: 'Lorem Lipsum doller sit amet', details: 'Lorem Lipsum dLorem Lipsum doller sit ametoller sit amet', time: 'Today', date: 'Oct 25, 2024', status: 'Admin' },
  { id: '2', caption: 'Lorem Lipsum doller sit amet', details: 'Lorem Lipsum dLorem Lipsum doller sit ametoller sit amet', time: 'Today', date: 'Oct 25, 2024', status: 'Teachers' },
  { id: '3', caption: 'Lorem Lipsum doller sit amet', details: 'Lorem Lipsum dLorem Lipsum doller sit ametoller sit amet', time: 'Today', date: 'Oct 25, 2024', status: 'Admin' },
  { id: '4', caption: 'Lorem Lipsum doller sit amet', details: 'Lorem Lipsum dLorem Lipsum doller sit ametoller sit amet', time: 'Today', date: 'Oct 25, 2024', status: 'Admin' },
  { id: '5', caption: 'Lorem Lipsum doller sit amet', details: 'Lorem Lipsum dLorem Lipsum doller sit ametoller sit amet', time: 'Today', date: 'Oct 25, 2024', status: 'Admin' },
  { id: '6', caption: 'Lorem Lipsum doller sit amet', details: 'Lorem Lipsum dLorem Lipsum doller sit ametoller sit amet', time: 'Today', date: 'Oct 25, 2024', status: 'Teachers' },
];

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);

  const [formData, setFormData] = useState({
    caption: '',
    details: '',
    audience: 'ALL'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePublish = () => {
    if (!formData.caption || !formData.details) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const dateString = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const newNotice: Notice = {
      id: Date.now().toString(),
      caption: formData.caption,
      details: formData.details,
      status: formData.audience,
      time: timeString,
      date: dateString
    };

    setNotices(prev => [newNotice, ...prev]);
    setFormData({ caption: '', details: '', audience: 'ALL' });
  };

  const getStatusColor = (status: string) => {
    switch(status.toUpperCase()) {
      case 'ADMIN': return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'TEACHERS': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'STUDENTS': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'ALL': return 'bg-blue-50 text-blue-600 border-blue-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12 w-full pr-2">
      <PageHeader 
        title="Notice Board"
        subtitle=""
      />

      {/* New Announcement Form Card */}
      <div className="bg-white border border-gray-200 rounded-[20px] p-6 w-full shadow-sm">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
          <h3 className="text-[#334155] font-bold">New Announement</h3>
          
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => setFormData({ caption: '', details: '', audience: 'ALL' })}
              className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button 
              onClick={handlePublish}
              disabled={!formData.caption || !formData.details}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-colors shadow-sm cursor-pointer whitespace-nowrap ${
                (!formData.caption || !formData.details) 
                  ? 'bg-blue-300 cursor-not-allowed text-white' 
                  : 'bg-[#3b82f6] hover:bg-blue-600 text-white'
              }`}
            >
              <ArrowUpCircle className="w-[18px] h-[18px]" />
              Publish
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4">
            <TextInput 
              label="Caption"
              name="caption"
              placeholder="Barbell Bench Press"
              value={formData.caption}
              onChange={handleChange}
            />
          </div>
          <div className="lg:col-span-5">
            <TextInput 
              label="Details"
              name="details"
              placeholder="4"
              value={formData.details}
              onChange={handleChange}
            />
          </div>
          <div className="lg:col-span-3">
            <SelectInput 
              label="Audience"
              name="audience"
              options={[
                { label: 'ALL', value: 'ALL' },
                { label: 'Teachers', value: 'Teachers' },
                { label: 'Students', value: 'Students' }
              ]}
              value={formData.audience}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Create another button */}
        <button 
          onClick={() => setFormData({ caption: '', details: '', audience: 'ALL' })}
          className="w-full mt-8 py-3 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-[#64748b] text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create another Announement
        </button>
      </div>

      {/* Notices Table */}
      <div className="bg-white border border-gray-200 rounded-[20px] overflow-hidden w-full shadow-sm mt-4">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
            <thead className="bg-white border-b border-gray-100 text-gray-400 font-semibold text-[13px] tracking-wider">
              <tr>
                <th className="py-4 px-6">Caption</th>
                <th className="py-4 px-6">Details</th>
                <th className="py-4 px-6">Time</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 w-[80px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-600 font-medium">
              {notices.map((notice) => (
                <tr key={notice.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[#334155]">{notice.caption}</td>
                  <td className="py-4 px-6">{notice.details}</td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-[#0f172a] font-semibold">{notice.time}</span>
                      <span className="text-gray-400 text-xs mt-0.5">{notice.date}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide border ${getStatusColor(notice.status)}`}>
                      {notice.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => setNotices(prev => prev.filter(n => n.id !== notice.id))}
                      className="w-8 h-8 rounded-full inline-flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
