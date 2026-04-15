import React from 'react';
import { GraduationCap, Phone, Mail, Search } from 'lucide-react';

export interface Teacher {
  id: string;
  name: string;
  avatar: string;
  gender: string;
  class: string;
  email: string;
  age: string;
  status?: 'Active' | 'Suspended';
}

interface TeacherProfileCardProps {
  teacher: Teacher | undefined;
}

export function TeacherProfileCard({ teacher }: TeacherProfileCardProps) {
  return (
    <div className="w-full lg:w-[340px] shrink-0 bg-white rounded-[24px] border border-[#e2e8f0] shadow-[0_2px_20px_rgba(0,0,0,0.02)] flex flex-col items-center pt-10 pb-8 px-6 overflow-hidden">
      {teacher ? (
        <>
          {/* Very large avatar in the center */}
          <div className="relative w-40 h-40 rounded-full mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                  src={teacher.avatar} 
                  alt={teacher.name} 
                  className="w-full h-full rounded-full object-cover shadow-sm bg-gray-100" 
              />
          </div>
          
          <h3 className="text-xl font-bold text-[#0f172a]">{teacher.name}</h3>
          <p className="text-[15px] font-semibold text-[#475569] mt-1">{teacher.id}</p>

          <div className="flex items-center gap-3 mt-6 mb-8">
              <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0] transition-colors border border-[#e2e8f0]">
                  <GraduationCap className="h-5 w-5" strokeWidth={2} />
              </button>
              <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0] transition-colors border border-[#e2e8f0]">
                  <Phone className="h-5 w-5" strokeWidth={2} />
              </button>
              <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0] transition-colors border border-[#e2e8f0]">
                  <Mail className="h-5 w-5" strokeWidth={2} />
              </button>
          </div>

          <div className="w-full space-y-4 px-2">
              <div className="flex justify-between items-center text-[13px]">
                  <span className="font-bold text-[#0f172a]">Age</span>
                  <span className="text-[#64748b] font-medium">{teacher.age || '32'}</span>
              </div>
              <div className="flex justify-between items-center text-[13px]">
                  <span className="font-bold text-[#0f172a]">Gender</span>
                  <span className="text-[#64748b] font-medium">{teacher.gender}</span>
              </div>
              <div className="flex justify-between items-center text-[13px]">
                  <span className="font-bold text-[#0f172a]">Assigned Class</span>
                  <span className="text-[#64748b] font-medium">Grade {teacher.class}</span>
              </div>
          </div>

          <div className="w-full mt-10 px-2">
              <h4 className="text-[13px] font-bold text-[#0f172a] mb-4">Students from the class</h4>
              <div className="flex items-center gap-3">
                  {/* eslint-disable @next/next/no-img-element */}
                  <div className="flex -space-x-3">
                      <img src="https://i.pravatar.cc/150?img=1" className="w-9 h-9 rounded-full border-2 border-white object-cover" alt="Student" />
                      <img src="https://i.pravatar.cc/150?img=2" className="w-9 h-9 rounded-full border-2 border-white object-cover" alt="Student" />
                      <img src="https://i.pravatar.cc/150?img=3" className="w-9 h-9 rounded-full border-2 border-white object-cover" alt="Student" />
                      <img src="https://i.pravatar.cc/150?img=4" className="w-9 h-9 rounded-full border-2 border-white object-cover" alt="Student" />
                  </div>
                  {/* eslint-enable @next/next/no-img-element */}
                  <span className="text-[12px] font-bold text-[#3b82f6]">+12 more</span>
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
