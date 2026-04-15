"use client";

import React, { useState } from 'react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { TabSelector } from '@/shared/components/ui/TabSelector';
import { FilterBar } from '@/shared/components/ui/FilterBar';
import { Calendar as CalendarIcon, CheckCircle2, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { StudentProfileCard } from './components/StudentProfileCard';
import { AddStudentButton } from './components/AddStudentButton';
import { GradesHistory } from './components/GradesHistory';

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
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const filteredStudents = MOCK_STUDENTS.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.includes(searchQuery);
    const matchesClass = classFilter ? s.class === classFilter : true;
    return matchesSearch && matchesClass;
  });

  const selectedStudent = filteredStudents.find(s => s.id === selectedStudentId);

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
          
          <AddStudentButton />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-4 items-start w-full">
        {/* Left Column - Table area */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {activeTab === "general" && (
  <div className="flex flex-col gap-4 animate-in fade-in duration-300 w-full">
    {/* Toolbar */}
    
              <div className="flex pl-1 pr-1 w-full">
    
                <FilterBar 
    
                  searchPlaceholder="Search Student by ID or Name"
    
                  searchValue={searchQuery}
    
                  onSearchChange={setSearchQuery}
    
                  filters={[
    
                    {
    
                      id: "status",
    
                      label: "All Statuses",
    
                      value: statusFilter,
    
                      onChange: setStatusFilter,
    
                      options: [
    
                        { label: "Active", value: "active" },
    
                        { label: "Inactive", value: "inactive" }
    
                      ]
    
                    },
    
                    {
    
                      id: "class",
    
                      label: "All Classes",
    
                      value: classFilter,
    
                      onChange: setClassFilter,
    
                      options: [
    
                        { label: "10-A", value: "10-A" },
    
                        { label: "10-F", value: "10-F" },
    
                        { label: "11-B", value: "11-B" },
    
                        { label: "11-C", value: "11-C" }
    
                      ]
    
                    }
    
                  ]}
    
                />
    
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
    
                    {filteredStudents.length > 0 ? filteredStudents.map((student) => {
    
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
    
                              {/* eslint-disable-next-line @next/next/no-img-element */}
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
    
                    }) : (
    
                      <tr>
    
                        <td colSpan={5} className="py-8 text-center text-gray-500">
    
                          No students found matching your criteria.
    
                        </td>
    
                      </tr>
    
                    )}
    
                  </tbody>
    
                </table>
    
              </div>
  </div>
)}

{activeTab === 'attendance' && (
   <div className="flex flex-col gap-4 animate-in fade-in duration-300 w-full">
     <div className="flex pl-1 pr-1 w-full">
        <FilterBar
            searchPlaceholder="Search Student by ID or Name"
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            filters={[
              { id: 'month', label: 'Month', icon: <CalendarIcon className="h-4 w-4 text-gray-400" />, options: [{label: 'April 2024', value: 'apr'}], value: '', onChange: () => {} },
              { id: 'week', label: 'Week', options: [{label: 'Week 1', value: 'w1'}], value: '', onChange: () => {} },
              { id: 'class', label: 'Class', options: [{label: '10-A', value: '10a'}], value: '', onChange: () => {} }
            ]}
        />
     </div>
     
     <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto w-full">
        <table className="w-full text-left text-sm whitespace-nowrap min-w-[1000px]">
              <thead className="bg-[#fafafa] border-b border-gray-100 text-gray-700 font-bold text-[13px] tracking-wider">
                <tr>
                  <th className="py-4 px-6 font-bold">Student ID</th>
                  {[8,9,10,11,12,13,14,15,16,17,18,19,20,21].map(day => (
                    <th key={day} className="py-4 px-2 text-center text-[13px] font-bold">
                      {String(day).padStart(2, '0')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium bg-white">
                {filteredStudents.length > 0 ? filteredStudents.map((student, rowIndex) => {
                  const isSelected = student.id === selectedStudentId;
                  return (
                  <tr key={student.id} onClick={() => setSelectedStudentId(student.id)} className={clsx("cursor-pointer transition-colors hover:bg-gray-50/50", isSelected && "bg-blue-50/50")}>
                    <td className="py-4 px-6 text-[13px] text-[#475569]">
                      {student.name} {student.id}
                    </td>
                    {[8,9,10,11,12,13,14,15,16,17,18,19,20,21].map((day) => (
                      <td key={day} className="py-4 px-2">
                         <div className="flex justify-center">
                            {(day + rowIndex) % 5 === 0 || (day === 10 && rowIndex % 2 !== 0) ? 
                              <XCircle className="w-[18px] h-[18px] text-red-500 fill-red-100" /> : 
                              <CheckCircle2 className="w-[18px] h-[18px] text-green-500 fill-green-100" />
                            }
                         </div>
                      </td>
                    ))}
                  </tr>
                )}) : (
                  <tr>
                    <td colSpan={15} className="py-8 text-center text-gray-500">
                      No logs found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
        </table>
     </div>
   </div>
)}

{activeTab === 'grades' && (
   <div className="flex flex-col gap-4 animate-in fade-in duration-300 w-full">
      <GradesHistory />
   </div>
)}

</div>

        {/* Right Column - Profile Card */}
        <StudentProfileCard student={selectedStudent} />
      </div>
    </div>
  );
}

