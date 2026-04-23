"use client";

import React, { useState } from 'react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { SectionCard } from './components/SectionCard';
import { TextInput } from '@/shared/components/ui/forms/TextInput';
import { SelectInput } from '@/shared/components/ui/forms/SelectInput';
import { FileUploadInput } from '@/shared/components/ui/forms/FileUploadInput';
import { Trash2, ChevronDown } from 'lucide-react';

export default function EnrollmentsPage() {
  const [formData, setFormData] = useState({
    // Student Details
    firstName: '',
    lastName: '',
    gender: 'Male',
    age: '',
    email: '',
    birthday: '',
    admissionDate: '',
    studentIdNumber: '',
    
    // Parent Details
    parentName: '',
    parentId: '',
    parentContact: '',
    parentRelationship: 'Mother',
    parentEmail: '',

    // Academic Details
    academicGradeClass: '10-A',
    academicParentId: '',
    academicContact: '',
    academicRelationship: 'Mother',
    academicEmail: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex flex-col gap-6 pb-12 w-full pr-2">
      <PageHeader 
        title="Enrollments Management"
        subtitle="Manage student records, enrollment, and academic information"
      />

      <div className="flex flex-col gap-2 mt-4">
        {/* Student Details Section */}
        <SectionCard 
          title="Student Details" 
          onDelete={() => {}}
          headerAction={
            <button className="flex items-center justify-center px-6 py-2.5 bg-[#3b82f6] hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer whitespace-nowrap">
              Generate & Saved
            </button>
          }
          summaryContent={
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
              <div><span className="text-xs text-gray-500 block">Name</span><span className="font-semibold text-sm">{formData.firstName || '-'} {formData.lastName}</span></div>
              <div><span className="text-xs text-gray-500 block">Student ID</span><span className="font-semibold text-sm">{formData.studentIdNumber || '-'}</span></div>
              <div><span className="text-xs text-gray-500 block">Email</span><span className="font-semibold text-sm">{formData.email || '-'}</span></div>
              <div><span className="text-xs text-gray-500 block">Admission Date</span><span className="font-semibold text-sm">{formData.admissionDate || '-'}</span></div>
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
              placeholder="12 Years Old"
              value={formData.age}
              onChange={handleChange}
            />
            <TextInput 
              label="Email"
              name="email"
              type="email"
              placeholder="methum.edu@gmail.com"
              value={formData.email}
              onChange={handleChange}
            />
            
            <TextInput 
              label="Birthday"
              name="birthday"
              placeholder="e.g. 2003.09.23"
              value={formData.birthday}
              onChange={handleChange}
            />
            <TextInput 
              label="Admission Date"
              name="admissionDate"
              placeholder="2026.07.18"
              value={formData.admissionDate}
              onChange={handleChange}
            />
            <TextInput 
              label="Student ID Number"
              name="studentIdNumber"
              placeholder="29854"
              value={formData.studentIdNumber}
              onChange={handleChange}
            />
            <div className="lg:col-span-2">
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

        {/* Teacher Details Section */}
        <SectionCard 
          title="Teacher Details" 
          onDelete={() => {}}
          summaryContent={
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
              <div><span className="text-xs text-gray-500 block">Class</span><span className="font-semibold text-sm">{formData.academicGradeClass || '-'}</span></div>
              <div><span className="text-xs text-gray-500 block">Teacher ID</span><span className="font-semibold text-sm">{formData.academicParentId || '-'}</span></div>
              <div><span className="text-xs text-gray-500 block">Email</span><span className="font-semibold text-sm">{formData.academicEmail || '-'}</span></div>
              <div><span className="text-xs text-gray-500 block">Modules</span><span className="font-semibold text-sm">Sinhala, English, Maths, Buddhist, Science</span></div>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <SelectInput 
              label="Grade & Class"
              name="academicGradeClass"
              value={formData.academicGradeClass}
              onChange={handleChange}
              options={[
                { label: '10-A', value: '10-A' },
                { label: '10-B', value: '10-B' },
                { label: '11-A', value: '11-A' }
              ]}
            />
            <TextInput 
              label="Parent ID"
              name="academicParentId"
              placeholder="e.g. 110457"
              value={formData.academicParentId}
              onChange={handleChange}
            />
            <TextInput 
              label="Contact Number"
              name="academicContact"
              placeholder="e.g. 0771234567"
              value={formData.academicContact}
              onChange={handleChange}
            />
            <SelectInput 
              label="Relationship"
              name="academicRelationship"
              value={formData.academicRelationship}
              onChange={handleChange}
              options={[
                { label: 'Mother', value: 'Mother' },
                { label: 'Father', value: 'Father' },
                { label: 'Guardian', value: 'Guardian' }
              ]}
            />
            <TextInput 
              label="Email"
              name="academicEmail"
              type="email"
              placeholder="e.g. anjali.perera@example.com"
              value={formData.academicEmail}
              onChange={handleChange}
            />
          </div>

          <div className="mt-8 pt-6">
             <label className="text-[13px] font-bold text-[#475569] tracking-wide mb-3 block">Modules</label>
             <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4 w-full">
                <span className="text-[#334155] font-bold text-sm">Sinhala-English-Maths-Buddisht-Science</span>
                <div className="flex justify-end gap-3">
                  <button 
                    type="button"
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
             </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}