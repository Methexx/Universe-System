"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { TabSelector } from '@/shared/components/ui/TabSelector';
import { FilterBar } from '@/shared/components/ui/FilterBar';
import { DirectoryTable } from '@/shared/components/ui/DirectoryTable';
import { StudentProfileCard } from './components/StudentProfileCard';
import { AddStudentButton } from './components/AddStudentButton';
import { EditStudentModal, Student } from './components/EditStudentModal';
import { getStudents, type StudentRecord, updateStudent, deleteStudent as deleteStudentApi } from '@/features/school/lib/school-api';
import { cacheGet, cacheSet } from '@/shared/lib/local-cache';

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
    teacherName: s.class?.teacher?.full_name ?? undefined,
    classId: s.class?.id ?? undefined,
  };
}

export default function StudentsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'general'>('general');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') ?? '');
  const [classFilter, setClassFilter] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Show cached data instantly
    const cached = cacheGet<Student[]>('students');
    if (cached && cached.length > 0) {
      setStudents(cached);
      setSelectedStudentId(cached[0].id);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    // Fetch fresh in background
    const res = await getStudents();
    if (res.ok) {
      const mapped = res.data.map(mapApiStudentToStudent);
      setStudents(mapped);
      cacheSet('students', mapped, 300);
      if (mapped.length > 0 && !selectedStudentId) setSelectedStudentId(mapped[0].id);
    }
    setIsLoading(false);
  }, [selectedStudentId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void fetchData(); }, [fetchData]);

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
      is_active: updatedStudent.status === 'Active',
      class_id: updatedStudent.classId ?? undefined,
    });

    if (res.ok) {
      setStudents(prev => {
        const next = prev.map(s => s.id === updatedStudent.id ? mapApiStudentToStudent(res.data) : s);
        cacheSet('students', next, 300);
        return next;
      });
      setIsEditModalOpen(false);
      setEditingStudentId(null);
    } else {
      alert('Failed to update student: ' + res.error);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    const res = await deleteStudentApi(id);
    if (res.ok) {
      setStudents(prev => {
        const next = prev.filter(s => s.id !== id);
        cacheSet('students', next, 300);
        return next;
      });
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
        onRefresh={fetchData}
      />

      <div className="flex flex-col xl:flex-row items-start lg:items-center justify-between gap-4 mt-2">
         {/* Directory Title and Tabs row */}
          <div className="flex flex-wrap items-center gap-6">
            <h2 className="text-xl font-bold text-[#0f172a]">Directory</h2>
            <TabSelector
              options={[
                { id: 'general', label: 'General' }
              ]}
              activeTab={activeTab}
              onTabChange={(id) => setActiveTab(id as 'general')}
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


</div>

        {/* Right Column - Profile Card */}
        <StudentProfileCard
          student={selectedStudent}
          allStudents={students}
          onSelectStudent={setSelectedStudentId}
        />
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
