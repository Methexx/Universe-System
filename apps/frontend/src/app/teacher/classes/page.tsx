"use client";

import React, { useState } from "react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { TabSelector } from "@/shared/components/ui/TabSelector";
import { DirectoryTable, DirectoryUser } from "@/shared/components/ui/DirectoryTable";
import { StudentProfileCard } from "@/shared/components/admin/StudentProfileCard";
import { Search, ChevronDown } from "lucide-react";

const MOCK_CLASS_STUDENTS: DirectoryUser[] = [
  { id: "204857", name: "Amara Nkwonta", email: "amara.nkwonta@example.com", class: "11-B", gender: "Female", avatar: "https://i.pravatar.cc/150?img=1" },
  { id: "985730", name: "Ikenna Okoro", email: "ikenna.okoro@example.com", class: "11-B", gender: "Male", avatar: "https://i.pravatar.cc/150?img=11" },
  { id: "685937", name: "Ngozi Eze", email: "ngozi.eze@example.com", class: "10-A", gender: "Female", avatar: "https://i.pravatar.cc/150?img=5" },
  { id: "793586", name: "Obinna Okafor", email: "obinna.okafor@example.com", class: "11-B", gender: "Male", avatar: "https://i.pravatar.cc/150?img=8" },        
  { id: "475869", name: "Adaobi Musa", email: "adaobi.musa@example.com", class: "10-A", gender: "Female", avatar: "https://i.pravatar.cc/150?img=9" },
  { id: "109576", name: "Chinedu Obi", email: "chinedu.obi@example.com", class: "10-A", gender: "Male", avatar: "https://i.pravatar.cc/150?img=12" },
  { id: "896745", name: "Ifeoma Adebayo", email: "ifeoma.adebayo@example.com", class: "11-B", gender: "Female", avatar: "https://i.pravatar.cc/150?img=10" },   
  { id: "394657", name: "Emeka Okeke", email: "emeka.okeke@example.com", class: "11-B", gender: "Male", avatar: "https://i.pravatar.cc/150?img=13" },
  { id: "586970", name: "Chinwe Azikiwe", email: "chinwe.azikiwe@example.com", class: "10-A", gender: "Female", avatar: "https://i.pravatar.cc/150?img=16" },   
  { id: "295867", name: "Abimbola Tinubu", email: "abimbola.tinubu@example.com", class: "10-A", gender: "Female", avatar: "https://i.pravatar.cc/150?img=20" },
  { id: "697850", name: "Babatunde Fashola", email: "babatunde.fashola@example.com", class: "11-B", gender: "Male", avatar: "https://i.pravatar.cc/150?img=68" },
];

export default function MyClassesPage() {
  const [activeTab, setActiveTab] = useState("10-a");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>("475869");

  // Filter logic
  const filteredStudents = MOCK_CLASS_STUDENTS.filter((s) => {
    const matchesTab = s.class.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = s.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });
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
            selectedId={selectedStudentId || ""}
            onSelect={setSelectedStudentId}
            idColumnHeader="Student ID"
          />
        </div>

        {/* Right Side: Profile Sidebar (using the shared refactored component) */}
        <StudentProfileCard student={selectedStudent} />      </div>
    </div>
  );
}