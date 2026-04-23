"use client";

import React, { useState } from 'react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { FilterBar } from '@/shared/components/ui/FilterBar';
import { DirectoryTable } from '@/shared/components/ui/DirectoryTable';
import { TeacherProfileCard, Teacher } from './components/TeacherProfileCard';
import { EditTeacherModal } from './components/EditTeacherModal';
import { Plus } from 'lucide-react';

const INITIAL_TEACHERS: Teacher[] = [
  { id: '204857', name: 'Amara Nkwonta', email: 'amara.nkwonta@example.com', class: '11-B', gender: 'Female', avatar: 'https://i.pravatar.cc/150?img=1', age: '34', status: 'Active' },
  { id: '985730', name: 'Ikenna Okoro', email: 'ikenna.okoro@example.com', class: '12B', gender: 'Male', avatar: 'https://i.pravatar.cc/150?img=11', age: '45', status: 'Active' },
  { id: '685937', name: 'Ngozi Eze', email: 'ngozi.eze@example.com', class: '7A', gender: 'Female', avatar: 'https://i.pravatar.cc/150?img=5', age: '29', status: 'Active' },
  { id: '793586', name: 'Obinna Okafor', email: 'obinna.okafor@example.com', class: 'SS 2', gender: 'Male', avatar: 'https://i.pravatar.cc/150?img=8', age: '38', status: 'Active' },
  { id: '475869', name: 'Dulanjali Wijesekara', email: 'dulanjali.w@example.com', class: '10A', gender: 'Female', avatar: 'https://i.pravatar.cc/150?img=9', age: '31', status: 'Active' },
  { id: '109576', name: 'Chinedu Obi', email: 'chinedu.obi@example.com', class: 'JSS 2', gender: 'Male', avatar: 'https://i.pravatar.cc/150?img=12', age: '42', status: 'Active' },
  { id: '896745', name: 'Ifeoma Adebayo', email: 'ifeoma.adebayo@example.com', class: '12-A', gender: 'Female', avatar: 'https://i.pravatar.cc/150?img=10', age: '36', status: 'Active' },
  { id: '394657', name: 'Emeka Okeke', email: 'emeka.okeke@example.com', class: 'JSS 3', gender: 'Male', avatar: 'https://i.pravatar.cc/150?img=13', age: '50', status: 'Active' },
  { id: '586970', name: 'Chinwe Azikiwe', email: 'chinwe.azikiwe@example.com', class: '10-A', gender: 'Female', avatar: 'https://i.pravatar.cc/150?img=16', age: '33', status: 'Active' },
  { id: '295867', name: 'Abimbola Tinubu', email: 'abimbola.tinubu@example.com', class: 'JSS 1', gender: 'Female', avatar: 'https://i.pravatar.cc/150?img=20', age: '28', status: 'Active' },
  { id: '697850', name: 'Babatunde Fashola', email: 'babatunde.fashola@example.com', class: '11-C', gender: 'Male', avatar: 'https://i.pravatar.cc/150?img=68', age: '39', status: 'Active' },
];

export default function TeachersPage() {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('475869');
  
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  // const [classFilter, setClassFilter] = useState(''); // Commented out to fix lint warning until implemented 

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.includes(searchQuery);
    // const matchesClass = classFilter ? t.class === classFilter : true;
    return matchesSearch; // && matchesClass;
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
      setSelectedTeacherId('');
    }
    setIsEditModalOpen(false);
    setEditingTeacherId(null);
  };

  return (
    <div className="flex flex-col gap-[10px] pb-12 w-full pr-2">
      {/* Top Header Row / Actions */}
      <PageHeader 
        title="Teachers Management"
        subtitle="Manage Teachers records, enrollment, and academic information"
      />

      <div className="flex flex-col xl:flex-row items-start lg:items-center justify-between gap-4 mt-2">
         {/* Directory Title */}
          <div className="flex flex-wrap items-center gap-6">
            <h2 className="text-xl font-bold text-[#0f172a]">Directory</h2>
          </div>
          
          <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3b82f6] hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer ml-auto xl:ml-0">
            <Plus className="w-5 h-5" />
            Add Teachers
          </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-4 items-start w-full">
        {/* Left Column - Table area */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="flex flex-col gap-4 animate-in fade-in duration-300 w-full">
            {/* Toolbar */}
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
                      { label: "Inactive", value: "inactive" }
                    ]
                  },
                  {
                    id: "time",
                    label: "Today",
                    value: "",
                    onChange: () => {},
                    options: [
                      { label: "Today", value: "today" },
                    ]
                  }
                ]}
              />
            </div>

            {/* Table */}
            <DirectoryTable 
              users={filteredTeachers}
              selectedId={selectedTeacherId}
              onSelect={setSelectedTeacherId}
              idColumnHeader="Teacher ID"
              emptyMessage="No teachers found matching your criteria."
              showEdit={true}
              onEdit={handleEditClick}
            />
          </div>
        </div>

        {/* Right Column - Profile Card */}
        <TeacherProfileCard teacher={selectedTeacher} />
      </div>

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
