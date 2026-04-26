"use client";

import React, { useState, useEffect } from 'react';
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
import { getStudents, type StudentRecord, updateStudent, deleteStudent as deleteStudentApi } from '@/features/school/lib/school-api';

function dedupeFullName(name: string): string {
  const parts = name.trim().split(/\s+/);
  const half = Math.floor(parts.length / 2);
  if (parts.length >= 2 && parts.length % 2 === 0 &&
      parts.slice(0, half).join(' ') === parts.slice(half).join(' ')) {
    return parts.slice(0, half).join(' ');
  }
  return name;
}

function mapApiStudentToStudent(s: StudentRecord): Student {
  const gradeName = s.class?.school_grade?.name ?? '';
  const className = s.class?.name ?? '';
  const classDisplay = gradeName && className ? `${gradeName}-${className}` : gradeName || className || '';

  return {
    id: s.student_id_no,
    name: dedupeFullName(s.full_name),
    email: s.parent_email ?? '',
    class: classDisplay,
    gender: s.gender ?? '',
    avatar: s.photo_url ?? '',
    status: s.is_active ? 'Active' : 'Suspended',
    parentId: s.parent_id_no ?? '',
    parentName: s.parent_name ?? '',
    parentMobile: s.parent_mobile ?? '',
  };
}

export default function StudentsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'attendance' | 'grades'>('general');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    getStudents().then(res => {
      if (res.ok) {
        const mapped = res.data.map(mapApiStudentToStudent);
        setStudents(mapped);
        if (mapped.length > 0) setSelectedStudentId(mapped[0].id);
      }
      setIsLoading(false);
    });
  }, []);

  const uniqueClasses = Array.from(new Set(students.map(s => s.class).filter(Boolean)));

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = classFilter ? s.class === classFilter : true;
    const matchesStatus = statusFilter ? s.status?.toLowerCase() === statusFilter.toLowerCase() : true;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const selectedStudent = filteredStudents.find(s => s.id === selectedStudentId)
    ?? students.find(s => s.id === selectedStudentId);

  const handleEditClick = (id: string) => {
    setEditingStudentId(id);
    setIsEditModalOpen(true);
  };

  const handleSaveStudent = async (updatedStudent: Student) => {
    const res = await updateStudent(updatedStudent.id, {
      full_name: updatedStudent.name,
      parent_email: updatedStudent.email,
      gender: updatedStudent.gender,
      photo_url: updatedStudent.avatar,
      parent_name: updatedStudent.parentName,
      is_active: updatedStudent.status === 'Active'
    });

    if (res.ok) {
      setStudents(prev => prev.map(s => s.id === updatedStudent.id ? mapApiStudentToStudent(res.data) : s));
      setIsEditModalOpen(false);
      setEditingStudentId(null);
    } else {
      alert('Failed to update student: ' + res.error);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    const res = await deleteStudentApi(id);
    if (res.ok) {
      setStudents(prev => prev.filter(s => s.id !== id));
      if (selectedStudentId === id) {
        setSelectedStudentId('');
      }
      setIsEditModalOpen(false);
      setEditingStudentId(null);
    } else {
      alert('Failed to delete student: ' + res.error);
    }
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
                        { label: "Suspended", value: "suspended" }
                      ]

                    },

                    {

                      id: "class",

                      label: "All Classes",

                      value: classFilter,

                      onChange: setClassFilter,

                      options: uniqueClasses.map(c => ({ label: c, value: c }))

                    }

                  ]}

                />

              </div>



                            {/* Table */}
              {isLoading ? (
                <div className="flex items-center justify-center py-16 text-gray-400 text-sm font-medium">
                  Loading students...
                </div>
              ) : (
                <DirectoryTable
                  users={filteredStudents}
                  selectedId={selectedStudentId}
                  onSelect={setSelectedStudentId}
                  idColumnHeader="Student ID"
                  emptyMessage="No students found matching your criteria."
                  showEdit={true}
                  onEdit={handleEditClick}
                />
              )}
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
