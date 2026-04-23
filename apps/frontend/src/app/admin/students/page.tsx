"use client";

import React, { useState } from 'react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { TabSelector } from '@/shared/components/ui/TabSelector';
import { FilterBar } from '@/shared/components/ui/FilterBar';
import { DirectoryTable } from '@/shared/components/ui/DirectoryTable';
import { Calendar as CalendarIcon, CheckCircle2, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { StudentProfileCard } from './components/StudentProfileCard';
import { AddStudentButton } from './components/AddStudentButton';
import { GradesHistory } from './components/GradesHistory';
import { EditStudentModal, Student } from './components/EditStudentModal';

const INITIAL_STUDENTS: Student[] = [
  { id: '204857', name: 'Amara Nkwonta', email: 'amara.nkwonta@example.com', class: '11-B', gender: 'Female', avatar: 'https://i.pravatar.cc/150?img=1', status: 'Active', parentId: 'P-93821' },
  { id: '985730', name: 'Ikenna Okoro', email: 'ikenna.okoro@example.com', class: '12B', gender: 'Male', avatar: 'https://i.pravatar.cc/150?img=11', status: 'Active', parentId: 'P-12839' },
  { id: '685937', name: 'Ngozi Eze', email: 'ngozi.eze@example.com', class: '7A', gender: 'Female', avatar: 'https://i.pravatar.cc/150?img=5', status: 'Active', parentId: 'P-48291' },
  { id: '793586', name: 'Obinna Okafor', email: 'obinna.okafor@example.com', class: 'SS 2', gender: 'Male', avatar: 'https://i.pravatar.cc/150?img=8', status: 'Suspended', parentId: 'P-83726' },
  { id: '475869', name: 'Adaobi Musa', email: 'adaobi.musa@example.com', class: '10-F', gender: 'Female', avatar: 'https://i.pravatar.cc/150?img=9', status: 'Active', parentId: 'P-94821' },
  { id: '109576', name: 'Chinedu Obi', email: 'chinedu.obi@example.com', class: 'JSS 2', gender: 'Male', avatar: 'https://i.pravatar.cc/150?img=12', status: 'Active', parentId: 'P-23847' },
  { id: '896745', name: 'Ifeoma Adebayo', email: 'ifeoma.adebayo@example.com', class: '12-A', gender: 'Female', avatar: 'https://i.pravatar.cc/150?img=10', status: 'Active', parentId: 'P-57382' },
  { id: '394657', name: 'Emeka Okeke', email: 'emeka.okeke@example.com', class: 'JSS 3', gender: 'Male', avatar: 'https://i.pravatar.cc/150?img=13', status: 'Active', parentId: 'P-10485' },
  { id: '586970', name: 'Chinwe Azikiwe', email: 'chinwe.azikiwe@example.com', class: '10-A', gender: 'Female', avatar: 'https://i.pravatar.cc/150?img=16', status: 'Active', parentId: 'P-92837' },
  { id: '295867', name: 'Abimbola Tinubu', email: 'abimbola.tinubu@example.com', class: 'JSS 1', gender: 'Female', avatar: 'https://i.pravatar.cc/150?img=20', status: 'Active', parentId: 'P-48201' },
  { id: '697850', name: 'Babatunde Fashola', email: 'babatunde.fashola@example.com', class: '11-C', gender: 'Male', avatar: 'https://i.pravatar.cc/150?img=68', status: 'Active', parentId: 'P-91827' },
];

export default function StudentsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'attendance' | 'grades'>('general');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('475869');
  
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.includes(searchQuery);
    const matchesClass = classFilter ? s.class === classFilter : true;
    return matchesSearch && matchesClass;
  });

  const selectedStudent = filteredStudents.find(s => s.id === selectedStudentId);

  const handleEditClick = (id: string) => {
    setEditingStudentId(id);
    setIsEditModalOpen(true);
  };

  const handleSaveStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    setIsEditModalOpen(false);
    setEditingStudentId(null);
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    if (selectedStudentId === id) {
      setSelectedStudentId('');
    }
    setIsEditModalOpen(false);
    setEditingStudentId(null);
  };

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
              <DirectoryTable 
                users={filteredStudents}
                selectedId={selectedStudentId}
                onSelect={setSelectedStudentId}
                idColumnHeader="Student ID"
                emptyMessage="No students found matching your criteria."
                showEdit={true}
                onEdit={handleEditClick}
              />
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

      {isEditModalOpen && editingStudentId && (
        <EditStudentModal
          student={students.find(s => s.id === editingStudentId)!}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingStudentId(null);
          }}
          onSave={handleSaveStudent}
          onDelete={handleDeleteStudent}
        />
      )}
    </div>
  );
}

