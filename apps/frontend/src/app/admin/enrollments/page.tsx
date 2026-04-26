"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { SectionCard } from './components/SectionCard';
import { TextInput } from '@/shared/components/ui/forms/TextInput';
import { SelectInput } from '@/shared/components/ui/forms/SelectInput';
import { FileUploadInput } from '@/shared/components/ui/forms/FileUploadInput';
import { Trash2, ChevronDown, CheckCircle2 } from 'lucide-react';
import QRCode from 'react-qr-code';
import {
  getGradesWithClasses,
  createStudent,
  type GradeWithClasses,
  type ClassItem,
} from '@/features/school/lib/school-api';

/** Returns today's date as YYYY-MM-DD */
function todayDate(): string {
  return new Date().toISOString().split('T')[0];
}

const DEFAULT_FORM = {
  firstName: '',
  lastName: '',
  gender: 'Male',
  age: '',
  birthday: '',
  parentName: '',
  parentId: '',
  parentContact: '',
  parentRelationship: 'Mother',
  parentEmail: '',
};

export default function EnrollmentsPage() {
  const autoAdmissionDate = useMemo(() => todayDate(), []);

  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [grades, setGrades] = useState<GradeWithClasses[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrolledStudentId, setEnrolledStudentId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const qrRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    getGradesWithClasses().then(res => {
      if (res.ok) setGrades(res.data);
    });
  }, []);

  const selectedGrade = grades.find(g => g.id === selectedGradeId);
  const classesForGrade: ClassItem[] = selectedGrade?.classes ?? [];
  const selectedClass = classesForGrade.find(c => c.id === selectedClassId);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGradeId(e.target.value);
    setSelectedClassId('');
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM);
    setSelectedGradeId('');
    setSelectedClassId('');
    setError(null);
  };

  const handleSubmit = async () => {
    if (!formData.firstName.trim() || !formData.birthday) {
      setError('First name and birthday are required.');
      return;
    }
    setIsSubmitting(true);
    setError(null);

    const result = await createStudent({
      full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
      date_of_birth: formData.birthday,
      class_id: selectedClassId || undefined,
      parent_email: formData.parentEmail || undefined,
      parent_mobile: formData.parentContact || undefined,
    });

    setIsSubmitting(false);

    if (result.ok) {
      setEnrolledStudentId(result.data.student_id_no);
      resetForm();
      setShowSuccess(true);
    } else {
      setError(result.error);
    }
  };

  const handleDownloadQR = async () => {
    if (!enrolledStudentId) return;
    const { default: QRCodeLib } = await import('qrcode');
    const canvas = document.createElement('canvas');
    await QRCodeLib.toCanvas(canvas, enrolledStudentId, { width: 300, margin: 2 });
    const link = document.createElement('a');
    link.download = `qr-${enrolledStudentId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (showSuccess && enrolledStudentId) {
    return (
      <div className="flex flex-col gap-6 pb-12 w-full pr-2">
        <PageHeader
          title="Enrollments Management"
          subtitle="Manage student records, enrollment, and academic information"
        />

        <div className="flex flex-col items-center justify-center py-16 animate-in fade-in duration-500">
          <div className="bg-white border border-gray-200 rounded-[24px] shadow-sm p-10 flex flex-col items-center gap-6 w-full max-w-md">
            {/* Green success icon */}
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in duration-500">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#0f172a] mb-1">Enrollment Successful!</h2>
              <p className="text-sm text-gray-500">Student has been registered in the system.</p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl px-6 py-3 text-center w-full">
              <span className="text-xs text-blue-500 font-semibold tracking-wide block mb-1">STUDENT ID</span>
              <span className="text-xl font-bold text-[#0f172a]">{enrolledStudentId}</span>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-3 w-full">
              <div ref={qrRef} className="p-4 bg-white border border-gray-200 rounded-xl">
                <QRCode value={enrolledStudentId} size={180} />
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <button
                onClick={handleDownloadQR}
                className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Download QR as PNG
              </button>
            </div>

            <button
              onClick={() => { setShowSuccess(false); setEnrolledStudentId(null); }}
              className="w-full flex items-center justify-center px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Enroll Another Student
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12 w-full pr-2">
      <PageHeader
        title="Enrollments Management"
        subtitle="Manage student records, enrollment, and academic information"
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2 mt-4">
        {/* Student Details Section */}
        <SectionCard
          title="Student Details"
          onDelete={() => {}}
          headerAction={
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center justify-center px-6 py-2.5 bg-[#3b82f6] hover:bg-blue-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            >
              {isSubmitting ? 'Enrolling...' : 'Enroll Student'}
            </button>
          }
          summaryContent={
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
              <div><span className="text-xs text-gray-500 block">Name</span><span className="font-semibold text-sm">{formData.firstName || '-'} {formData.lastName}</span></div>
              <div><span className="text-xs text-gray-500 block">Birthday</span><span className="font-semibold text-sm">{formData.birthday || '-'}</span></div>
              <div><span className="text-xs text-gray-500 block">Admission Date</span><span className="font-semibold text-sm">{autoAdmissionDate}</span></div>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <TextInput
              label="First Name"
              name="firstName"
              placeholder="e.g. Methum"
              value={formData.firstName}
              onChange={handleChange}
            />
            <TextInput
              label="Last Name"
              name="lastName"
              placeholder="e.g. Pathirana"
              value={formData.lastName}
              onChange={handleChange}
            />
            <SelectInput
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              options={[
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' },
                { label: 'Other', value: 'Other' }
              ]}
            />
            <TextInput
              label="Age"
              name="age"
              placeholder="12"
              value={formData.age}
              onChange={handleChange}
            />
            <TextInput
              label="Birthday"
              name="birthday"
              type="date"
              placeholder="e.g. 2003-09-23"
              value={formData.birthday}
              onChange={handleChange}
            />

            {/* Auto-generated: Admission Date */}
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-bold text-[#475569] tracking-wide">Admission Date</label>
              <div className="flex items-center gap-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3">
                <span className="text-[#334155] font-semibold text-sm flex-1">{autoAdmissionDate}</span>
                <span className="text-[10px] font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">AUTO</span>
              </div>
            </div>

            {/* Student ID — server-generated */}
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-bold text-[#475569] tracking-wide">Student ID Number</label>
              <div className="flex items-center gap-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3">
                <span className="text-[#334155] font-semibold text-sm flex-1 text-gray-400 italic">Auto-assigned on save</span>
                <span className="text-[10px] font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">AUTO</span>
              </div>
            </div>

            <div className="lg:col-span-3">
              <FileUploadInput
                label="Upload Image"
                placeholderText="Browse Files"
              />
            </div>
          </div>
        </SectionCard>

        {/* Parent Details Section */}
        <SectionCard
          title="Parent Details"
          onDelete={() => {}}
          summaryContent={
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
              <div><span className="text-xs text-gray-500 block">Name</span><span className="font-semibold text-sm">{formData.parentName || '-'}</span></div>
              <div><span className="text-xs text-gray-500 block">Contact</span><span className="font-semibold text-sm">{formData.parentContact || '-'}</span></div>
              <div><span className="text-xs text-gray-500 block">Email</span><span className="font-semibold text-sm">{formData.parentEmail || '-'}</span></div>
              <div><span className="text-xs text-gray-500 block">Relationship</span><span className="font-semibold text-sm">{formData.parentRelationship || '-'}</span></div>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <TextInput
              label="Full Name"
              name="parentName"
              placeholder="e.g. Anjali Perera"
              value={formData.parentName}
              onChange={handleChange}
            />
            <TextInput
              label="Parent ID"
              name="parentId"
              placeholder="e.g. 110457"
              value={formData.parentId}
              onChange={handleChange}
            />
            <TextInput
              label="Contact Number"
              name="parentContact"
              placeholder="e.g. 0771234567"
              value={formData.parentContact}
              onChange={handleChange}
            />
            <SelectInput
              label="Relationship"
              name="parentRelationship"
              value={formData.parentRelationship}
              onChange={handleChange}
              options={[
                { label: 'Mother', value: 'Mother' },
                { label: 'Father', value: 'Father' },
                { label: 'Guardian', value: 'Guardian' }
              ]}
            />
            <TextInput
              label="Email"
              name="parentEmail"
              type="email"
              placeholder="e.g. anjali.perera@example.com"
              value={formData.parentEmail}
              onChange={handleChange}
            />
          </div>
        </SectionCard>

        {/* Class Assignment Section */}
        <SectionCard
          title="Class Assignment"
          onDelete={() => {}}
          summaryContent={
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
              <div><span className="text-xs text-gray-500 block">Grade</span><span className="font-semibold text-sm">{selectedGrade?.name || '-'}</span></div>
              <div><span className="text-xs text-gray-500 block">Class</span><span className="font-semibold text-sm">{selectedClass?.name || '-'}</span></div>
              <div><span className="text-xs text-gray-500 block">Teacher</span><span className="font-semibold text-sm">{selectedClass?.teacher?.full_name || '-'}</span></div>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <SelectInput
              label="Grade"
              name="grade"
              value={selectedGradeId}
              onChange={handleGradeChange}
              options={[
                { label: 'Select Grade', value: '' },
                ...grades.map(g => ({ label: g.name, value: g.id }))
              ]}
            />
            <SelectInput
              label="Class"
              name="class"
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              options={[
                { label: selectedGradeId ? 'Select Class' : 'Select Grade first', value: '' },
                ...classesForGrade.map(c => ({ label: c.name, value: c.id }))
              ]}
              disabled={!selectedGradeId}
            />
            <TextInput
              label="Class Teacher"
              name="classTeacher"
              value={selectedClass?.teacher?.full_name ?? (selectedClassId ? 'No teacher assigned' : '')}
              placeholder="Auto-filled from class"
              readOnly
              className="bg-[#f8fafc] text-gray-500 cursor-default"
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
