"use client";

import React, { useState } from 'react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { TabSelector } from '@/shared/components/ui/TabSelector';
import { Search, Filter, Calendar as CalendarIcon, Plus, Phone, Mail, GraduationCap } from 'lucide-react';
import clsx from 'clsx';
import Image from 'next/image';

const MOCK_STUDENTS = [
  { id: '204857', name: 'Amara Nkwonta', email: 'amara.nkwonta@example.com', class: '11-B', gender: 'Female', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: '985730', name: 'Ikenna Okoro', email: 'ikenna.okoro@example.com', class: '12B', gender: 'Male', avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: '685937', name: 'Ngozi Eze', email: 'ngozi.eze@example.com', class: '7A', gender: 'Female', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: '793586', name: 'Obinna Okafor', email: 'obinna.okafor@example.com', class: 'SS 2', gender: 'Male', avatar: 'https://i.pravatar.cc/150?img=8' },
  { id: '475869', name: 'Adaobi Musa', email: 'adaobi.musa@example.com', class: '10-F', gender: 'Female', avatar: 'https://i.pravatar.cc/150?img=9' },
  { id: '109576', name: 'Chinedu Obi', email: 'chinedu.obi@example.com', class: 'JSS 2', gender: 'Male', avatar: 'https://i.pravatar.cc/150?img=12' },
  { id: '896745', name: 'Ifeoma Adebayo', email: 'ifeoma.adebayo@example.com', class: '12-A', gender: 'Female', avatar: 'https://i.pravatar.cc/150?img=10' },
  { id: '394657', name: 'Emeka Okeke', email: 'emeka.okeke@example.com', class: 'JSS 3', gender: 'Male', avatar: 'https://i.pravatar.cc/150?img=13' },
  { id: '586970', name: 'Chinwe Azikiwe', email: 'chinwe.azikiwe@example.com', class: '10-A', gender: 'Female', avatar: 'https://i.pravatar.cc/150?img=16' },
  { id: '295867', name: 'Abimbola Tinubu', email: 'abimbola.tinubu@example.com', class: 'JSS 1', gender: 'Female', avatar: 'https://i.pravatar.cc/150?img=20' },
  { id: '697850', name: 'Babatunde Fashola', email: 'babatunde.fashola@example.com', class: '11-C', gender: 'Male', avatar: 'https://i.pravatar.cc/150?img=68' },
];

export default function StudentsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'attendance' | 'grades'>('general');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('475869');

  const selectedStudent = MOCK_STUDENTS.find(s => s.id === selectedStudentId) || MOCK_STUDENTS[4];

  return (
    <div className="flex flex-col gap-[10px] pb-12 w-full pr-2">
      {/* Top Header Row / Actions */}
      <PageHeader 
        title="Students Management"
        subtitle="Manage student records, enrollment, and academic information"
      />

      <div className="flex flex-col xl:flex-row items-start lg:items-center justify-between gap-4 mt-2">
         {/* Directory Title and Tabs row */}
          <div className="flex flex-wrap items-center gap-6">
            <h2 className="text-xl font-bold text-[#0f172a]">Directory</h2>
            <TabSelector 
              options={[
                { id: 'general', label: 'General' },
                { id: 'attendance', label: 'Attendance' },
                { id: 'grades', label: 'Grades' }
              ]}
              activeTab={activeTab}
              onTabChange={(id) => setActiveTab(id as 'general' | 'attendance' | 'grades')}
            />
          </div>
          
          <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3b82f6] hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer ml-auto xl:ml-0">
            <Plus className="w-5 h-5" />
            Add Students
          </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-4 items-start w-full">
        {/* Left Column - Table area */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Toolbar */}
          <div className="flex pl-1 pr-1 flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
            <div className="relative w-full max-w-[320px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input 
                type="text" 
                placeholder="Search Student by ID" 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
               <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] font-bold text-gray-600 hover:bg-gray-50 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  All Statuses
                  <Filter className="h-3.5 w-3.5 text-gray-400 ml-1" />
               </button>
               <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] font-bold text-gray-600 hover:bg-gray-50 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  All
                  <Filter className="h-3.5 w-3.5 text-gray-400 ml-1" />
               </button>
               <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] font-bold text-gray-600 hover:bg-gray-50 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  Today
                  <Filter className="h-3.5 w-3.5 text-gray-400 ml-1" />
               </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[700px]">
              <thead className="bg-[#fafafa] border-b border-gray-100 text-gray-700 font-bold text-[13px] tracking-wider">
                <tr>
                  <th className="py-4 px-6 font-bold">Name</th>
                  <th className="py-4 px-6 font-bold">Student ID</th>
                  <th className="py-4 px-6 font-bold">Email address</th>
                  <th className="py-4 px-6 font-bold">Class</th>
                  <th className="py-4 px-6 font-bold">Gender</th>
                </tr>
              </thead>
              <tbody className="font-medium">
                {MOCK_STUDENTS.map((student) => {
                  const isSelected = student.id === selectedStudentId;
                  return (
                    <tr 
                      key={student.id} 
                      onClick={() => setSelectedStudentId(student.id)}
                      className={clsx(
                        "cursor-pointer transition-colors border-b border-gray-50/50",
                        isSelected ? "bg-[#4f8bf9] text-white" : "bg-[#f8fafc] text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-4">
                          <img src={student.avatar} alt={student.name} className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm" />
                          <span className={clsx("font-bold text-[14px]", isSelected ? "text-white" : "text-[#0f172a]")}>{student.name}</span>
                        </div>
                      </td>
                      <td className={clsx("py-3 px-6 text-[13px]", isSelected ? "text-blue-50/90" : "text-[#475569]")}>{student.id}</td>
                      <td className={clsx("py-3 px-6 text-[13px]", isSelected ? "text-blue-50/90" : "text-[#475569]")}>{student.email}</td>
                      <td className={clsx("py-3 px-6 text-[13px]", isSelected ? "text-blue-50/90" : "text-[#475569]")}>{student.class}</td>
                      <td className={clsx("py-3 px-6 text-[13px]", isSelected ? "text-blue-50/90" : "text-[#475569]")}>{student.gender}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column - Profile Card */}
        <div className="w-full lg:w-[340px] shrink-0 bg-white rounded-[24px] border border-[#e2e8f0] shadow-[0_2px_20px_rgba(0,0,0,0.02)] flex flex-col items-center pt-10 pb-8 px-6 overflow-hidden">
            {/* Very large avatar in the center */}
            <div className="relative w-40 h-40 rounded-full mb-6">
                <img 
                    src={selectedStudent.avatar} 
                    alt={selectedStudent.name} 
                    className="w-full h-full rounded-full object-cover shadow-sm bg-gray-100" 
                />
            </div>
            
            <h3 className="text-xl font-bold text-[#0f172a]">{selectedStudent.name}</h3>
            <p className="text-[15px] font-semibold text-[#475569] mt-1">{selectedStudent.id}</p>

            <div className="flex items-center gap-3 mt-6 mb-8">
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0] transition-colors border border-[#e2e8f0]">
                    <GraduationCap className="h-5 w-5" strokeWidth={2} />
                </button>
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0] transition-colors border border-[#e2e8f0]">
                    <Phone className="h-5 w-5" strokeWidth={2} />
                </button>
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0] transition-colors border border-[#e2e8f0]">
                    <Mail className="h-5 w-5" strokeWidth={2} />
                </button>
            </div>

            <div className="w-full space-y-4 px-2">
                <div className="flex justify-between items-center text-[13px]">
                    <span className="font-bold text-[#0f172a]">Age</span>
                    <span className="text-[#64748b] font-medium">17</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                    <span className="font-bold text-[#0f172a]">Gender</span>
                    <span className="text-[#64748b] font-medium">{selectedStudent.gender}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                    <span className="font-bold text-[#0f172a]">Class Teacher</span>
                    <span className="text-[#64748b] font-medium">Dulanjali Wijesekara</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                    <span className="font-bold text-[#0f172a]">Parent ID</span>
                    <span className="text-[#64748b] font-medium">114568</span>
                </div>
            </div>

            <div className="w-full mt-10 px-2">
                <h4 className="text-[13px] font-bold text-[#0f172a] mb-4">People from the same class</h4>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                        <img src="https://i.pravatar.cc/150?img=1" className="w-9 h-9 rounded-full border-2 border-white object-cover" alt="Student" />
                        <img src="https://i.pravatar.cc/150?img=2" className="w-9 h-9 rounded-full border-2 border-white object-cover" alt="Student" />
                        <img src="https://i.pravatar.cc/150?img=3" className="w-9 h-9 rounded-full border-2 border-white object-cover" alt="Student" />
                        <img src="https://i.pravatar.cc/150?img=4" className="w-9 h-9 rounded-full border-2 border-white object-cover" alt="Student" />
                    </div>
                    <span className="text-[12px] font-bold text-[#3b82f6]">+12 more</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}