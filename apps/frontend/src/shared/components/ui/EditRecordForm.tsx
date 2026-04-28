"use client";

import React, { useRef } from 'react';
import { Camera, Trash2, Loader2 } from 'lucide-react';
import { GradeWithClasses } from '@/features/school/lib/school-api';

// ── Shared field shape used by both modes ──────────────────────────────────
export interface EditRecordData {
  id: string;
  name: string;
  email: string;
  gender: string;
  avatar: string;
  status: 'Active' | 'Suspended';
  // student-only
  class?: string;
  classId?: string;
  parentId?: string;
  parentName?: string;
  parentMobile?: string;
  // teacher-only
  assignedClass?: string;
  phone?: string;
}

interface EditRecordFormProps {
  mode: 'student' | 'teacher';
  formId: string;
  data: EditRecordData;
  onChange: (data: EditRecordData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isUploading: boolean;
  onPhotoUpload: (file: File) => void;
  // student-only props
  grades?: GradeWithClasses[];
  selectedGradeId?: string;
  selectedClassId?: string;
  onGradeChange?: (gradeId: string) => void;
  onClassChange?: (classId: string) => void;
}

export function EditRecordForm({
  mode,
  formId,
  data,
  onChange,
  onSubmit,
  isUploading,
  onPhotoUpload,
  grades = [],
  selectedGradeId = '',
  selectedClassId = '',
  onGradeChange,
  onClassChange,
}: EditRecordFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (field: keyof EditRecordData, value: string) =>
    onChange({ ...data, [field]: value });

  const classesForGrade = grades.find(g => g.id === selectedGradeId)?.classes ?? [];

  const inputCls =
    'w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 font-medium';
  const labelCls = 'text-[13px] font-bold text-gray-700';

  return (
    <form id={formId} onSubmit={onSubmit} className="space-y-5">
      {/* ── Avatar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100 flex items-center justify-center">
            {data.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.avatar} alt={data.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 font-bold text-2xl">
                {(data.name?.[0] ?? '?').toUpperCase()}
              </span>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>

          {mode === 'student' && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute -bottom-1 -right-1 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              <Camera className="w-4 h-4" />
            </button>
          )}
        </div>

        {mode === 'student' ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Change Photo
            </button>
            {data.avatar && (
              <>
                <span className="text-gray-300">•</span>
                <button
                  type="button"
                  onClick={() => onChange({ ...data, avatar: '' })}
                  className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              </>
            )}
          </div>
        ) : (
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
            Profile image cannot be edited
          </span>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) onPhotoUpload(f); }}
        />
      </div>

      {/* ── Name + ID row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <div className={mode === 'student' ? '' : 'col-span-2'}>
          <label className={labelCls}>Full Name</label>
          <input
            type="text"
            value={data.name}
            onChange={e => set('name', e.target.value)}
            required
            className={`mt-1 ${inputCls}`}
          />
        </div>
        {mode === 'student' && (
          <div>
            <label className={labelCls}>Student ID</label>
            <input
              type="text"
              value={data.id}
              disabled
              className={`mt-1 ${inputCls} cursor-not-allowed opacity-60`}
            />
          </div>
        )}
      </div>

      {/* ── Email ─────────────────────────────────────────────────────── */}
      <div>
        <label className={labelCls}>Email Address</label>
        <input
          type="email"
          value={data.email}
          onChange={e => set('email', e.target.value)}
          required={mode === 'student'}
          readOnly={mode === 'teacher'}
          className={`mt-1 ${inputCls} ${mode === 'teacher' ? 'opacity-60 cursor-not-allowed' : ''}`}
        />
      </div>

      {/* ── Class (student: grade+class cascade | teacher: read-only) ──── */}
      {mode === 'student' ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Grade</label>
            <select
              value={selectedGradeId}
              onChange={e => onGradeChange?.(e.target.value)}
              className={`mt-1 ${inputCls} appearance-none`}
            >
              <option value="">Select grade</option>
              {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Class</label>
            <select
              value={selectedClassId}
              onChange={e => onClassChange?.(e.target.value)}
              disabled={!selectedGradeId || classesForGrade.length === 0}
              className={`mt-1 ${inputCls} appearance-none disabled:opacity-50`}
            >
              <option value="">Select class</option>
              {classesForGrade.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      ) : (
        <div>
          <label className={labelCls}>Assigned Class</label>
          <input
            type="text"
            value={data.assignedClass || '—'}
            readOnly
            className={`mt-1 ${inputCls} opacity-60 cursor-not-allowed`}
          />
          <p className="mt-1 text-[11px] text-gray-400">Class assignment is managed in the Classes section.</p>
        </div>
      )}

      {/* ── Gender + Status ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Gender</label>
          <select
            value={data.gender}
            onChange={e => set('gender', e.target.value)}
            className={`mt-1 ${inputCls} appearance-none`}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>{mode === 'teacher' ? 'Account Status' : 'Status'}</label>
          <select
            value={data.status}
            onChange={e => set('status', e.target.value as 'Active' | 'Suspended')}
            className={`mt-1 ${inputCls} appearance-none`}
          >
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* ── Student-only: parent info ──────────────────────────────────── */}
      {mode === 'student' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Parent Name</label>
            <input
              type="text"
              value={data.parentName ?? ''}
              onChange={e => set('parentName', e.target.value)}
              className={`mt-1 ${inputCls}`}
            />
          </div>
          <div>
            <label className={labelCls}>Parent ID</label>
            <input
              type="text"
              value={data.parentId ?? ''}
              onChange={e => set('parentId', e.target.value)}
              placeholder="Enter Parent ID to relink"
              className={`mt-1 ${inputCls}`}
            />
          </div>
        </div>
      )}

      {/* ── Teacher-only: phone ────────────────────────────────────────── */}
      {mode === 'teacher' && (
        <div>
          <label className={labelCls}>Phone Number</label>
          <input
            type="tel"
            value={data.phone ?? ''}
            onChange={e => set('phone', e.target.value)}
            className={`mt-1 ${inputCls}`}
          />
        </div>
      )}
    </form>
  );
}
