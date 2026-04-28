"use client";

import React, { useState, useEffect } from 'react';
import { EditModal } from '@/shared/components/ui/EditModal';
import { EditRecordForm, EditRecordData } from '@/shared/components/ui/EditRecordForm';
import { Teacher } from './TeacherProfileCard';

interface EditTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  onSave: (updatedTeacher: Teacher) => void;
  onDelete: (teacherId: string) => void;
}

function teacherToRecord(t: Teacher): EditRecordData {
  return {
    id: t.id,
    name: t.name,
    email: t.email,
    gender: t.gender,
    avatar: t.avatar,
    status: t.status ?? 'Active',
    assignedClass: t.class,
    phone: t.phone ?? '',
  };
}

function recordToTeacher(base: Teacher, r: EditRecordData): Teacher {
  return {
    ...base,
    name: r.name,
    email: r.email,
    gender: r.gender,
    status: r.status,
    phone: r.phone,
  };
}

export function EditTeacherModal({ isOpen, onClose, teacher, onSave, onDelete }: EditTeacherModalProps) {
  const [formData, setFormData] = useState<EditRecordData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!isOpen || !teacher) return;
    
    // Defer state updates to avoid React's synchronous setState-in-effect warning
    const timeoutId = setTimeout(() => {
      setFormData(teacherToRecord(teacher));
      setIsSaved(false);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isOpen, teacher]);

  if (!isOpen || !formData || !teacher) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 3000));
    setIsSaving(false);
    setIsSaved(true);
    onSave(recordToTeacher(teacher, formData));
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Teacher Details"
      formId="edit-record-form"
      isSaving={isSaving}
      isSaved={isSaved}
      onDelete={() => onDelete(teacher.id)}
      deleteLabel="Delete Account"
    >
      <EditRecordForm
        mode="teacher"
        formId="edit-record-form"
        data={formData}
        onChange={setFormData}
        onSubmit={handleSubmit}
        isUploading={false}
        onPhotoUpload={() => {}}
      />
    </EditModal>
  );
}
