"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { SectionCard } from './components/SectionCard';
import { TextInput } from '@/shared/components/ui/forms/TextInput';
import { SelectInput } from '@/shared/components/ui/forms/SelectInput';
import { Trash2, CheckCircle2, ImagePlus, X, Pencil } from 'lucide-react';
import QRCode from 'react-qr-code';
import {
  getGradesWithClasses,
  createStudent,
  getNextStudentId,
  uploadStudentPhoto,
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

const DEFAULT_PARENT = {
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
  const [nextStudentId, setNextStudentId] = useState('');

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrolledStudentId, setEnrolledStudentId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    getGradesWithClasses().then(res => {
      if (res.ok) setGrades(res.data);
    });
    getNextStudentId().then(res => {
      if (res.ok) setNextStudentId(res.data.next_id);
    });
  }, []);

  const selectedGrade = grades.find(g => g.id === selectedGradeId);
  const classesForGrade: ClassItem[] = selectedGrade?.classes ?? [];
  const selectedClass = classesForGrade.find(c => c.id === selectedClassId);

  // --- input handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z\s\-']/g, '');
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
    if (fieldErrors[e.target.name]) setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleDigitsOnly = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGradeId(e.target.value);
    setSelectedClassId('');
  };

  // --- photo handlers ---
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be under 5 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setError(null);
    setPhotoFile(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- section resets ---
  const resetStudentSection = () => {
    setFormData(prev => ({ ...prev, firstName: '', lastName: '', gender: 'Male', age: '', birthday: '' }));
    clearPhoto();
    setFieldErrors({});
  };

  const resetParentSection = () => {
    setFormData(prev => ({ ...prev, ...DEFAULT_PARENT }));
  };

  const resetClassSection = () => {
    setSelectedGradeId('');
    setSelectedClassId('');
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM);
    resetClassSection();
    clearPhoto();
    setError(null);
    setFieldErrors({});
  };

  // --- validation ---
  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.birthday) errors.birthday = 'Birthday is required';
    if (!formData.gender) errors.gender = 'Gender is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setError(null);

    let photo_url: string | undefined;
    if (photoFile) {
      const uploadResult = await uploadStudentPhoto(photoFile);
      if (uploadResult.ok) {
        photo_url = uploadResult.data.photo_url;
      } else {
        setIsSubmitting(false);
        setError(`Photo upload failed: ${uploadResult.error}. Please try again or enroll without a photo.`);
        return;
      }
    }

    const [result] = await Promise.all([
      createStudent({
        full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        date_of_birth: formData.birthday,
        gender: formData.gender,
        class_id: selectedClassId || undefined,
        parent_email: formData.parentEmail || undefined,
        parent_mobile: formData.parentContact || undefined,
        photo_url,
      }),
      new Promise<void>(res => setTimeout(res, 3000)),
    ]);

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

            <div className="flex flex-col items-center gap-3 w-full">
              <div className="p-4 bg-white border border-gray-200 rounded-xl">
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
          onDelete={resetStudentSection}
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
              onChange={handleNameChange}
              error={fieldErrors.firstName}
            />
            <TextInput
              label="Last Name"
              name="lastName"
              placeholder="e.g. Pathirana"
              value={formData.lastName}
              onChange={handleNameChange}
              error={fieldErrors.lastName}
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
              error={fieldErrors.gender}
            />
            <TextInput
              label="Age"
              name="age"
              placeholder="12"
              value={formData.age}
              onChange={handleDigitsOnly}
              maxLength={2}
              inputMode="numeric"
            />
            <TextInput
              label="Birthday"
              name="birthday"
              type="date"
              value={formData.birthday}
              onChange={handleChange}
              error={fieldErrors.birthday}
            />

            {/* Auto-generated: Admission Date */}
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-bold text-[#475569] tracking-wide">Admission Date</label>
              <div className="flex items-center gap-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3">
                <span className="text-[#334155] font-semibold text-sm flex-1">{autoAdmissionDate}</span>
                <span className="text-[10px] font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">AUTO</span>
              </div>
            </div>

            {/* Student ID — next available */}
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-bold text-[#475569] tracking-wide">Student ID Number</label>
              <div className="flex items-center gap-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3">
                <span className="text-[#334155] font-semibold text-sm flex-1">{nextStudentId || 'Loading...'}</span>
                <span className="text-[10px] font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">AUTO</span>
              </div>
            </div>

            {/* Photo upload */}
            <div className="lg:col-span-3 flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-bold text-[#475569] tracking-wide">Upload Image</label>
              {photoPreviewUrl ? (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow border border-gray-200"
                  >
                    <X className="w-3 h-3 text-gray-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 bg-white rounded-full p-0.5 shadow border border-gray-200"
                  >
                    <Pencil className="w-3 h-3 text-gray-600" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-400 flex items-center justify-between cursor-pointer hover:border-blue-400 transition-colors"
                >
                  <span>Browse Files</span>
                  <ImagePlus className="w-5 h-5 text-gray-500" />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
          </div>
        </SectionCard>

        {/* Parent Details Section */}
        <SectionCard
          title="Parent Details"
          onDelete={resetParentSection}
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
              onChange={handleNameChange}
            />
            <TextInput
              label="Parent ID"
              name="parentId"
              placeholder="e.g. P-000110"
              value={formData.parentId}
              onChange={handleChange}
            />
            <TextInput
              label="Contact Number"
              name="parentContact"
              placeholder="e.g. 0771234567"
              value={formData.parentContact}
              onChange={handleDigitsOnly}
              inputMode="numeric"
              maxLength={15}
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
          onDelete={resetClassSection}
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
