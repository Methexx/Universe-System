"use client";

import React, { useState, useEffect } from 'react';
import { EditModal } from '@/shared/components/ui/EditModal';
import { EditRecordForm, EditRecordData } from '@/shared/components/ui/EditRecordForm';
import { uploadStudentPhoto, getGradesWithClasses, GradeWithClasses } from '@/features/school/lib/school-api';

export interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  gender: string;
  avatar: string;
  status?: 'Active' | 'Suspended';
  parentId?: string;
  parentName?: string;
  parentMobile?: string;
  teacherName?: string;
  classId?: string;
}

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSave: (updatedStudent: Student) => void;
  onDelete: (studentId: string) => void;
}

function studentToRecord(s: Student): EditRecordData {
  return {
    id: s.id,
    name: s.name,
    email: s.email,
    gender: s.gender,
    avatar: s.avatar,
    status: s.status ?? 'Active',
    class: s.class,
    classId: s.classId,
    parentId: s.parentId ?? '',
    parentName: s.parentName ?? '',
    parentMobile: s.parentMobile ?? '',
  };
}

function recordToStudent(base: Student, r: EditRecordData): Student {
  return {
    ...base,
    name: r.name,
    email: r.email,
    gender: r.gender,
    avatar: r.avatar,
    status: r.status,
    class: r.class ?? base.class,
    classId: r.classId,
    parentId: r.parentId,
    parentName: r.parentName,
    parentMobile: r.parentMobile ?? base.parentMobile,
  };
}

export function EditStudentModal({ isOpen, onClose, student, onSave, onDelete }: EditStudentModalProps) {
  const [formData, setFormData] = useState<EditRecordData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [grades, setGrades] = useState<GradeWithClasses[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');

  useEffect(() => {
    if (!isOpen || !student) return;
    
    // Defer state updates to avoid React's synchronous setState-in-effect warning
    const timeoutId = setTimeout(() => {
      setFormData(studentToRecord(student));
      setIsSaved(false);
    }, 0);

    getGradesWithClasses().then(res => {
      if (!res.ok) return;
      setGrades(res.data);
      if (student.classId) {
        for (const grade of res.data) {
          const match = grade.classes.find(c => c.id === student.classId);
          if (match) { setSelectedGradeId(grade.id); setSelectedClassId(match.id); break; }
        }
      }
    });

    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen || !formData || !student) return null;

  const handleGradeChange = (gradeId: string) => {
    setSelectedGradeId(gradeId);
    setSelectedClassId('');
    setFormData(prev => prev ? { ...prev, class: '', classId: undefined } : null);
  };

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    const grade = grades.find(g => g.id === selectedGradeId);
    const cls = grade?.classes.find(c => c.id === classId);
    if (cls && grade) {
      setFormData(prev => prev ? { ...prev, class: `${grade.name}-${cls.name}`, classId } : null);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    setIsUploading(true);
    const res = await uploadStudentPhoto(file);
    if (res.ok) setFormData(prev => prev ? { ...prev, avatar: res.data.photo_url } : null);
    else alert('Failed to upload photo: ' + res.error);
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 3000));
    setIsSaving(false);
    setIsSaved(true);
    onSave(recordToStudent(student, formData));
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Student Details"
      formId="edit-record-form"
      isSaving={isSaving}
      isSaved={isSaved}
      isUploading={isUploading}
      onDelete={() => {
        if (window.confirm('Delete this student? This cannot be undone.')) {
          onDelete(student.id);
        }
      }}
    >
      <EditRecordForm
        mode="student"
        formId="edit-record-form"
        data={formData}
        onChange={setFormData}
        onSubmit={handleSubmit}
        isUploading={isUploading}
        onPhotoUpload={handlePhotoUpload}
        grades={grades}
        selectedGradeId={selectedGradeId}
        selectedClassId={selectedClassId}
        onGradeChange={handleGradeChange}
        onClassChange={handleClassChange}
      />
    </EditModal>
  );
}
