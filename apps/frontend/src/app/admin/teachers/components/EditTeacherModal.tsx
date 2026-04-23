import React, { useState } from 'react';
import { Teacher } from './TeacherProfileCard';
import { X } from 'lucide-react';

interface EditTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  onSave: (updatedTeacher: Teacher) => void;
  onDelete: (teacherId: string) => void;
}

export function EditTeacherModal({ isOpen, onClose, teacher, onSave, onDelete }: EditTeacherModalProps) {
  const [formData, setFormData] = useState<Teacher | null>(
    teacher ? { ...teacher, status: teacher.status || 'Active' } : null
  );

  if (!isOpen || !formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">Edit Teacher Details</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <form id="edit-teacher-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Avatar - Read Only */}
            <div className="flex flex-col items-center justify-center pb-4">
              <div className="relative w-24 h-24 mb-3 rounded-full border-4 border-white shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={formData.avatar} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">Profile Image cannot be edited</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[13px] font-bold text-gray-700">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name} 
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 font-medium"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[13px] font-bold text-gray-700">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email} 
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 font-medium"
                />
              </div>

              {/* Class */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-gray-700">Assigned Class</label>
                <input 
                  type="text" 
                  name="class"
                  value={formData.class} 
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 font-medium"
                />
              </div>

              {/* Age */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-gray-700">Age</label>
                <input 
                  type="number" 
                  name="age"
                  value={formData.age} 
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 font-medium"
                />
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-gray-700">Gender</label>
                <select 
                  name="gender"
                  value={formData.gender} 
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 font-medium appearance-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-gray-700">Account Status</label>
                <select 
                  name="status"
                  value={formData.status} 
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 font-medium appearance-none"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
               <button 
                  type="button"
                  onClick={() => onDelete(formData.id)}
                  className="w-full px-4 py-2.5 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 font-bold text-sm transition-colors"
                >
                  Delete Account
                </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="edit-teacher-form"
            className="px-6 py-2.5 text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-xl shadow-sm transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
