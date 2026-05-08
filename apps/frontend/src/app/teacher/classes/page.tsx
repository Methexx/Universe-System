"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { TabSelectorV2 } from "@/shared/components/ui/TabSelectorV2";
import { DirectoryTable } from "@/shared/components/ui/DirectoryTable";
import { StudentProfileCard } from "@/app/admin/students/components/StudentProfileCard";
import { Search, ChevronDown, Loader2 } from "lucide-react";
import { getClassStudents } from "@/features/school/lib/school-api";
import { useAuth } from "@/features/auth/context/AuthContext";

interface ClassStudent {
  id: string;
  name: string;
  email: string;
  class: string;
  gender: string;
  avatar: string;
  status?: string;
  parentId?: string;
  parentName?: string;
  parentMobile?: string;
  teacherName?: string;
  classId?: string;
}

function dedupeFullName(name: string): string {
  const parts = name.trim().split(/\s+/);
  const half = Math.floor(parts.length / 2);
  if (parts.length >= 2 && parts.length % 2 === 0 &&
      parts.slice(0, half).join(' ') === parts.slice(half).join(' ')) {
    return parts.slice(0, half).join(' ');
  }
  return name;
}

export default function MyClassesPage() {
  const { user } = useAuth();
  const classes = useMemo(() => user?.classes_taught ?? [], [user?.classes_taught]);
  const isPending = user?.role === "pending";

  const [activeTab, setActiveTab] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize active tab
  useEffect(() => {
    if (!activeTab && classes.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(classes[0].id);
    }
  }, [classes, activeTab]);

  const fetchStudents = useCallback(async (classId: string) => {
    setLoading(true);
    const res = await getClassStudents(classId);
    if (res.ok) {
      const mapped = res.data.map(s => {
        const gradeName = s.class?.school_grade?.name ?? '';
        const className = s.class?.name ?? '';
        const classDisplay = gradeName && className ? `${gradeName}-${className}` : gradeName || className || '';
        
        return {
          id: s.student_id_no,
          name: dedupeFullName(s.full_name),
          email: s.parent_email ?? '',
          class: classDisplay,
          gender: s.gender ?? '',
          avatar: s.photo_url ?? '',
          status: s.is_active ? 'Active' : 'Suspended',
          parentId: s.parent_id_no ?? '',
          parentName: s.parent_name ?? '',
          parentMobile: s.parent_mobile ?? '',
          teacherName: s.class?.teacher?.full_name ?? undefined,
          classId: s.class?.id ?? undefined,
        };
      });
      setStudents(mapped);
      if (mapped.length > 0) {
        setSelectedStudentId(mapped[0].id);
      } else {
        setSelectedStudentId(null);
      }
    }
    setLoading(false);
  }, []);

  // Fetch when tab changes
  useEffect(() => {
    if (activeTab) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchStudents(activeTab);
    }
  }, [activeTab, fetchStudents]);

  // Filter logic
  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  return (
    <div className="flex flex-col gap-[20px] pb-12 w-full pr-2">
      <PageHeader
        title="My Classes"
        subtitle={`Welcome back ${user?.full_name ?? ""}!`}
        onRefresh={() => { if (activeTab) return fetchStudents(activeTab); }}
      />

      <div className="relative mt-2">
        {isPending && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-sm bg-white/30 rounded-xl">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-[22px] font-bold text-gray-900 mb-2 shadow-sm bg-white/80 px-6 py-2 rounded-full border border-gray-200">Waiting for approval</h3>
            <p className="text-gray-700 font-medium bg-white/80 px-4 py-1 rounded-full border border-gray-200 shadow-sm">Your account is currently under review</p>
          </div>
        )}

        <div className={isPending ? "pointer-events-none blur-[6px] opacity-60 transition-all duration-500 select-none" : ""}>
          {classes.length > 0 ? (
            <>
              {/* Class Selector */}
              <div className="mb-6">
                <TabSelectorV2
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  options={classes.map(c => ({ id: c.id, label: c.school_grade ? `${c.school_grade.name}-${c.name}` : c.name }))}
                />
              </div>

              <div key={activeTab} className="flex flex-col xl:flex-row items-start gap-8 animate-in fade-in duration-500">
                
                {/* Left Side: Directory Table */}
                <div className="flex-1 w-full bg-white rounded-[24px] border border-[#e2e8f0] p-[22px] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <h2 className="text-[18px] font-bold text-[#0f172a] tracking-tight mb-6">Directory</h2>
                  
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                    <div className="relative w-full md:w-[320px]">
                      <Search className="absolute left-[14px] top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
                      <input
                        type="text"
                        placeholder="Search Student by ID or Name"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-[#e2e8f0] rounded-[10px] text-[13px] font-bold text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#c7d2fe] focus:ring-1 focus:ring-[#c7d2fe] transition-all bg-white"
                      />
                    </div>

                    <button className="flex items-center justify-between w-full md:w-auto min-w-[140px] px-4 py-2.5 bg-white border border-[#e2e8f0] rounded-[10px] text-[13px] font-bold text-[#64748b] hover:bg-gray-50 transition-colors">
                      All Statuses
                      <ChevronDown className="h-4 w-4 text-[#94a3b8] ml-2" />
                    </button>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-16 text-gray-400 text-sm font-medium">
                      Loading directory...
                    </div>
                  ) : (
                    <DirectoryTable
                      users={filteredStudents}
                      selectedId={selectedStudentId || ""}
                      onSelect={setSelectedStudentId}
                      idColumnHeader="Student ID"
                    />
                  )}
                </div>

                {/* Right Side: Profile Sidebar */}
                <StudentProfileCard 
                  student={selectedStudent} 
                  allStudents={students}
                  onSelectStudent={(id) => setSelectedStudentId(id)}
                  hideClassmates={true}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-[#e2e8f0] shadow-sm py-20 mt-2">
              <h3 className="text-[20px] font-bold text-gray-800 mb-2">No Classes Assigned</h3>
              <p className="text-gray-500 text-[14px]">You do not have any classes assigned to you currently.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}