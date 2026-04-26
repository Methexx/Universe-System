'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GraduationCap, Phone, Mail, Search } from 'lucide-react';

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500',
  'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-rose-500',
];

function LetterAvatar({ name, id }: { name: string; id: string }) {
  const colorIndex = id.charCodeAt(0) % AVATAR_COLORS.length;
  const letter = (name?.[0] ?? '?').toUpperCase();
  return (
    <div className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold text-5xl ${AVATAR_COLORS[colorIndex]}`}>
      {letter}
    </div>
  );
}

interface Student {
  id: string;
  name: string;
  avatar: string;
  gender: string;
  class: string;
  email: string;
  status?: string;
  parentId?: string;
  parentName?: string;
  parentMobile?: string;
}

interface StudentProfileCardProps {
  student: Student | undefined;
}

function ContactPopup({ label, value, onClose }: { label: string; value: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 min-w-[180px] text-center"
    >
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-[13px] font-bold text-[#0f172a] break-all">{value || 'Not on file'}</p>
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-gray-200 rotate-45" />
    </div>
  );
}

export function StudentProfileCard({ student }: StudentProfileCardProps) {
  const [activePopup, setActivePopup] = useState<'phone' | 'email' | null>(null);

  const togglePopup = (type: 'phone' | 'email') => {
    setActivePopup(prev => (prev === type ? null : type));
  };

  return (
    <div className="w-full lg:w-[340px] shrink-0 bg-white rounded-[24px] border border-[#e2e8f0] shadow-[0_2px_20px_rgba(0,0,0,0.02)] flex flex-col items-center pt-10 pb-8 px-6 overflow-hidden">
      {student ? (
        <>
          {/* Avatar */}
          <div className="relative w-40 h-40 rounded-full mb-6 shadow-sm overflow-hidden">
            {student.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={student.avatar}
                alt={student.name}
                className="w-full h-full rounded-full object-cover bg-gray-100"
              />
            ) : (
              <LetterAvatar name={student.name} id={student.id} />
            )}
          </div>

          <h3 className="text-xl font-bold text-[#0f172a]">{student.name}</h3>
          <p className="text-[15px] font-semibold text-[#475569] mt-1">{student.id}</p>

          <div className="flex items-center gap-3 mt-6 mb-8">
            <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0] transition-colors border border-[#e2e8f0]">
              <GraduationCap className="h-5 w-5" strokeWidth={2} />
            </button>

            <div className="relative">
              <button
                onClick={() => togglePopup('phone')}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0] transition-colors border border-[#e2e8f0]"
              >
                <Phone className="h-5 w-5" strokeWidth={2} />
              </button>
              {activePopup === 'phone' && (
                <ContactPopup
                  label="Parent Mobile"
                  value={student.parentMobile ?? ''}
                  onClose={() => setActivePopup(null)}
                />
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => togglePopup('email')}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0] transition-colors border border-[#e2e8f0]"
              >
                <Mail className="h-5 w-5" strokeWidth={2} />
              </button>
              {activePopup === 'email' && (
                <ContactPopup
                  label="Parent Email"
                  value={student.email ?? ''}
                  onClose={() => setActivePopup(null)}
                />
              )}
            </div>
          </div>

          <div className="w-full space-y-4 px-2">
            <div className="flex justify-between items-center text-[13px]">
              <span className="font-bold text-[#0f172a]">Gender</span>
              <span className="text-[#64748b] font-medium">{student.gender || '—'}</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="font-bold text-[#0f172a]">Class Teacher</span>
              <span className="text-[#64748b] font-medium">—</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="font-bold text-[#0f172a]">Parent Name</span>
              <span className="text-[#64748b] font-medium">{student.parentName || '—'}</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="font-bold text-[#0f172a]">Account Status</span>
              <span className={`text-[12px] px-2 py-1 rounded-full font-bold ${
                student.status === 'Active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>{student.status || 'Active'}</span>
            </div>
          </div>

          <div className="w-full mt-10 px-2">
            <h4 className="text-[13px] font-bold text-[#0f172a] mb-4">People from the same class</h4>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {/* eslint-disable @next/next/no-img-element */}
                <img src="https://i.pravatar.cc/150?img=1" className="w-9 h-9 rounded-full border-2 border-white object-cover" alt="Student" />
                <img src="https://i.pravatar.cc/150?img=2" className="w-9 h-9 rounded-full border-2 border-white object-cover" alt="Student" />
                <img src="https://i.pravatar.cc/150?img=3" className="w-9 h-9 rounded-full border-2 border-white object-cover" alt="Student" />
                <img src="https://i.pravatar.cc/150?img=4" className="w-9 h-9 rounded-full border-2 border-white object-cover" alt="Student" />
                {/* eslint-enable @next/next/no-img-element */}
              </div>
              <span className="text-[12px] font-bold text-[#3b82f6]">+12 more</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-[300px] text-center w-full my-auto text-gray-400">
          <Search className="w-12 h-12 mb-4 text-[#e2e8f0]" />
          <p className="text-[14px] font-medium">Select a student from the directory<br/>to view their complete profile.</p>
        </div>
      )}
    </div>
  );
}
