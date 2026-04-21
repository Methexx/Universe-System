"use client";

import React, { useState } from "react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { TabSelector } from "@/shared/components/ui/TabSelector";
import { DirectoryTable, DirectoryUser } from "@/shared/components/ui/DirectoryTable";
import { Search, ChevronDown, GraduationCap, Phone, Mail, MessageSquare } from "lucide-react";

const MOCK_CLASS_STUDENTS: DirectoryUser[] = [
  { id: "204857", name: "Amara Nkwonta", email: "amara.nkwonta@example.com", class: "11-B", gender: "Female", avatar: "https://i.pravatar.cc/150?img=1" },
  { id: "985730", name: "Ikenna Okoro", email: "ikenna.okoro@example.com", class: "12B", gender: "Male", avatar: "https://i.pravatar.cc/150?img=11" },
  { id: "685937", name: "Ngozi Eze", email: "ngozi.eze@example.com", class: "7A", gender: "Female", avatar: "https://i.pravatar.cc/150?img=5" },
  { id: "793586", name: "Obinna Okafor", email: "obinna.okafor@example.com", class: "SS 2", gender: "Male", avatar: "https://i.pravatar.cc/150?img=8" },
  { id: "475869", name: "Adaobi Musa", email: "adaobi.musa@example.com", class: "10-F", gender: "Female", avatar: "https://i.pravatar.cc/150?img=9" },
  { id: "109576", name: "Chinedu Obi", email: "chinedu.obi@example.com", class: "JSS 2", gender: "Male", avatar: "https://i.pravatar.cc/150?img=12" },
  { id: "896745", name: "Ifeoma Adebayo", email: "ifeoma.adebayo@example.com", class: "12-A", gender: "Female", avatar: "https://i.pravatar.cc/150?img=10" },
  { id: "394657", name: "Emeka Okeke", email: "emeka.okeke@example.com", class: "JSS 3", gender: "Male", avatar: "https://i.pravatar.cc/150?img=13" },
  { id: "586970", name: "Chinwe Azikiwe", email: "chinwe.azikiwe@example.com", class: "10-A", gender: "Female", avatar: "https://i.pravatar.cc/150?img=16" },
  { id: "295867", name: "Abimbola Tinubu", email: "abimbola.tinubu@example.com", class: "JSS 1", gender: "Female", avatar: "https://i.pravatar.cc/150?img=20" },
  { id: "697850", name: "Babatunde Fashola", email: "babatunde.fashola@example.com", class: "11-C", gender: "Male", avatar: "https://i.pravatar.cc/150?img=68" },
];

export default function MyClassesPage() {
  const [activeTab, setActiveTab] = useState("10-a");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("475869");

  // Filter logic
  const filteredStudents = MOCK_CLASS_STUDENTS.filter((s) =>
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedStudent = MOCK_CLASS_STUDENTS.find(s => s.id === selectedStudentId);

  return (
    <div className="flex flex-col gap-[20px] pb-12 w-full pr-2">
      <PageHeader
        title="My Classes"
        subtitle="Welcome back Sarah Joseph!"
      />

      {/* Class Selector */}
      <div className="mt-2">
        <TabSelector
          activeTab={activeTab}
          onTabChange={setActiveTab}
          options={[
            {id: "10-a", label: "10 - A"},
            {id: "11-b", label: "11 - B"}
          ]}
        />
      </div>

      <div className="mt-6 flex flex-col xl:flex-row items-start gap-8">
        
        {/* Left Side: Directory Table */}
        <div className="flex-1 w-full bg-white rounded-[24px] border border-[#e2e8f0] p-[22px] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <h2 className="text-[18px] font-bold text-[#0f172a] tracking-tight mb-6">Directory</h2>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            {/* Search Input Custom using lucide icons as requested */}
            <div className="relative w-full md:w-[320px]">
              <Search className="absolute left-[14px] top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
              <input
                type="text"
                placeholder="Search Student by ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-[#e2e8f0] rounded-[10px] text-[13px] font-bold text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#c7d2fe] focus:ring-1 focus:ring-[#c7d2fe] transition-all bg-white"
              />
            </div>

            {/* Mock dropdown, or could use FilterBar but sticking to the visual identical matching */}
            <button className="flex items-center justify-between w-full md:w-auto min-w-[140px] px-4 py-2.5 bg-white border border-[#e2e8f0] rounded-[10px] text-[13px] font-bold text-[#64748b] hover:bg-gray-50 transition-colors">
              All Statuses
              <ChevronDown className="h-4 w-4 text-[#94a3b8] ml-2" />
            </button>
          </div>

          <DirectoryTable 
            users={filteredStudents}
            selectedId={selectedStudentId}
            onSelect={setSelectedStudentId}
            idColumnHeader="Student ID"
          />
        </div>

        {/* Right Side: Profile Sidebar (Identical to image) */}
        <div className="w-full xl:w-[340px] shrink-0 bg-white rounded-[24px] border border-[#e2e8f0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col items-center pt-[50px] pb-8 px-6">
          {selectedStudent ? (
            <>
              {/* Very large avatar in the center matching visual scale */}
              <div className="relative w-48 h-48 rounded-full mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedStudent.avatar}
                  alt={selectedStudent.name}
                  className="w-full h-full rounded-full object-cover shadow-sm bg-gray-100"
                />
              </div>

              <h3 className="text-[20px] font-bold text-[#0f172a]">{selectedStudent.name}</h3>
              <p className="text-[15px] font-bold text-[#475569] mt-1">{selectedStudent.id}</p>

              <div className="flex items-center gap-3 mt-6 mb-10">
                <button className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f8fafc] text-[#64748b] hover:bg-[#e2e8f0] transition-colors border-2 border-[#f1f5f9]">
                  <GraduationCap className="h-5 w-5" strokeWidth={2.5} />
                </button>
                <button className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f8fafc] text-[#64748b] hover:bg-[#e2e8f0] transition-colors border-2 border-[#f1f5f9]">
                  <Phone className="h-5 w-5" strokeWidth={2.5} />
                </button>
                <button className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f8fafc] text-[#64748b] hover:bg-[#e2e8f0] transition-colors border-2 border-[#f1f5f9]">
                  <Mail className="h-5 w-5" strokeWidth={2.5} />
                </button>
              </div>

              <div className="w-full space-y-[14px] px-2 mb-10">
                <div className="flex items-center text-[13px]">
                  <span className="font-bold text-[#0f172a] w-[110px]">Age</span>
                  <span className="text-[#64748b] font-medium">17</span>
                </div>
                <div className="flex items-center text-[13px]">
                  <span className="font-bold text-[#0f172a] w-[110px]">Gender</span>
                  <span className="text-[#64748b] font-medium">{selectedStudent.gender}</span>
                </div>
                <div className="flex items-center text-[13px]">
                  <span className="font-bold text-[#0f172a] w-[110px]">Class Teacher</span>
                  <span className="text-[#64748b] font-medium">Dulanjali Wijesekara</span>
                </div>
                <div className="flex items-center text-[13px]">
                  <span className="font-bold text-[#0f172a] w-[110px]">Parent ID</span>
                  <span className="text-[#64748b] font-medium">114568</span>
                </div>
              </div>

              <button className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#f8fafc] border border-[#f1f5f9] rounded-xl hover:bg-gray-100 transition-colors">
                <div className="p-1.5 bg-[#e0e7ff] text-[#4f46e5] rounded-lg">
                  <MessageSquare className="w-[14px] h-[14px]" strokeWidth={3} />
                </div>
                <span className="text-[13px] font-bold text-[#64748b]">Chat with parent</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-center w-full my-auto text-gray-400">
              <Search className="w-12 h-12 mb-4 text-[#e2e8f0]" />
              <p className="text-[14px] font-medium">Select a student from the directory<br/>to view their complete profile.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
