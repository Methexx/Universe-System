"use client";

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { FilterBar } from '@/shared/components/ui/FilterBar';
import { DirectoryTable } from '@/shared/components/ui/DirectoryTable';
import { TeacherProfileCard, Teacher } from './components/TeacherProfileCard';
import { EditTeacherModal } from './components/EditTeacherModal';
import { Plus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getTeachersAdmin, AdminTeacherRecord } from '@/features/school/lib/school-api';

function mapApiTeacherToTeacher(t: AdminTeacherRecord): Teacher {
  const assignedClass = t.classes_taught?.[0];
  const classDisplay = assignedClass
    ? `${assignedClass.school_grade.name}-${assignedClass.name}`
    : '';
  const status: 'Active' | 'Suspended' = t.is_suspended ? 'Suspended' : 'Active';
  return {
    id: t.user_id_no ?? t.id,
    dbId: t.id,
    name: t.full_name ?? t.email,
    email: t.email,
    class: classDisplay,
    gender: t.gender ?? '',
    avatar: t.avatar_url ?? '',
    phone: t.phone_number ?? '',
    status,
  };
}

export default function TeachersPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);

  useEffect(() => {
    getTeachersAdmin().then(res => {
      if (res.ok) {
        const mapped = res.data.map(mapApiTeacherToTeacher);
        setTeachers(mapped);
        if (mapped.length > 0) setSelectedTeacherId(mapped[0].id);
      }
      setIsLoading(false);
    });
  }, []);

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.includes(searchQuery);
    const matchesStatus = statusFilter ? t.status?.toLowerCase() === statusFilter.toLowerCase() : true;
    return matchesSearch && matchesStatus;
  });

  const selectedTeacher = filteredTeachers.find(t => t.id === selectedTeacherId);

  const handleEditClick = (id: string) => {
    setEditingTeacherId(id);
    setIsEditModalOpen(true);
  };

  const handleSaveTeacher = (updatedTeacher: Teacher) => {
    setTeachers(prev => prev.map(t => t.id === updatedTeacher.id ? updatedTeacher : t));
    setIsEditModalOpen(false);
    setEditingTeacherId(null);
  };

  const handleDeleteTeacher = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
    if (selectedTeacherId === id) {
      setSelectedTeacherId(filteredTeachers.find(t => t.id !== id)?.id ?? '');
    }
    setIsEditModalOpen(false);
    setEditingTeacherId(null);
  };

  return (
    <div className="flex flex-col gap-[10px] pb-12 w-full pr-2">
      <PageHeader
        title="Teachers Management"
        subtitle="Manage Teachers records, enrollment, and academic information"
      />

      <div className="flex flex-col xl:flex-row items-start lg:items-center justify-between gap-4 mt-2">
        <div className="flex flex-wrap items-center gap-6">
          <h2 className="text-xl font-bold text-[#0f172a]">Directory</h2>
        </div>
        <button
          onClick={() => router.push('/admin/overview/pending-requests')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3b82f6] hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer ml-auto xl:ml-0"
        >
          <Plus className="w-5 h-5" />
          Add Teachers
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 mt-4 items-start w-full">
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <div className="flex flex-col gap-4 animate-in fade-in duration-300 w-full">
              <div className="flex pl-1 pr-1 w-full">
                <FilterBar
                  searchPlaceholder="Search Teacher by ID"
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
                  ]}
                />
              </div>

              <DirectoryTable
                users={filteredTeachers}
                selectedId={selectedTeacherId}
                onSelect={setSelectedTeacherId}
                idColumnHeader="Teacher ID"
                emptyMessage="No teachers found matching your criteria."
                showEdit={true}
                hideClass={true}
                hideGender={true}
                onEdit={handleEditClick}
              />
            </div>
          </div>

          <TeacherProfileCard teacher={selectedTeacher} />
        </div>
      )}

      {isEditModalOpen && editingTeacherId && (
        <EditTeacherModal
          teacher={teachers.find(t => t.id === editingTeacherId)!}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingTeacherId(null);
          }}
          onSave={handleSaveTeacher}
          onDelete={handleDeleteTeacher}
        />
      )}
    </div>
  );
}
