import React, { useState, useRef, useEffect } from 'react';
import { GraduationCap, Phone, Mail, Search } from 'lucide-react';

export interface Teacher {
  id: string;
  dbId?: string;
  name: string;
  avatar: string;
  gender: string;
  class: string;
  email: string;
  phone?: string;
  status?: 'Active' | 'Suspended';
}

interface TeacherProfileCardProps {
  teacher: Teacher | undefined;
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

export function TeacherProfileCard({ teacher }: TeacherProfileCardProps) {
  const [activePopup, setActivePopup] = useState<'phone' | 'email' | null>(null);

  const togglePopup = (type: 'phone' | 'email') => {
    setActivePopup(prev => (prev === type ? null : type));
  };

  return (
    <div className="w-full lg:w-[340px] shrink-0 bg-white rounded-[24px] border border-[#e2e8f0] shadow-[0_2px_20px_rgba(0,0,0,0.02)] flex flex-col items-center pt-10 pb-8 px-6 overflow-hidden">
      {teacher ? (
        <>
          {/* Avatar */}
          <div className="relative w-40 h-40 rounded-full mb-6">
            {teacher.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={teacher.avatar}
                alt={teacher.name}
                className="w-full h-full rounded-full object-cover shadow-sm bg-gray-100"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-indigo-500 flex items-center justify-center text-white text-5xl font-bold">
                {(teacher.name?.[0] ?? '?').toUpperCase()}
              </div>
            )}
          </div>

          <h3 className="text-xl font-bold text-[#0f172a]">{teacher.name}</h3>
          {teacher.id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(teacher.id) && (
            <p className="text-[15px] font-semibold text-[#475569] mt-1">{teacher.id}</p>
          )}

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
                  label="Phone Number"
                  value={teacher.phone ?? ''}
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
                  label="Email Address"
                  value={teacher.email ?? ''}
                  onClose={() => setActivePopup(null)}
                />
              )}
            </div>
          </div>

          <div className="w-full space-y-4 px-2">
            <div className="flex justify-between items-center text-[13px]">
              <span className="font-bold text-[#0f172a]">Gender</span>
              <span className="text-[#64748b] font-medium">{teacher.gender || '—'}</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="font-bold text-[#0f172a]">Assigned Class</span>
              <span className="text-[#64748b] font-medium">{teacher.class || '—'}</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="font-bold text-[#0f172a]">Account Status</span>
              <span className={`text-[12px] px-2 py-1 rounded-full font-bold ${
                teacher.status === 'Suspended'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}>{teacher.status ?? 'Active'}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-[300px] text-center w-full my-auto text-gray-400">
          <Search className="w-12 h-12 mb-4 text-[#e2e8f0]" />
          <p className="text-[14px] font-medium">Select a teacher from the directory<br/>to view their complete profile.</p>
        </div>
      )}
    </div>
  );
}
