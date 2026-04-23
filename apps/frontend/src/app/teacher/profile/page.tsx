"use client";

import React from "react";
import { UserCircle2 } from "lucide-react";
import { PageHeader } from "@/shared/components/layout/PageHeader";

export default function TeacherProfilePage() {
  return (
    <div className="flex w-full flex-col gap-[20px] pb-12 pr-2">
      <PageHeader
        title="Profile"
        subtitle="View and manage teacher account details and preferences."
      />

      <div className="rounded-[24px] border border-[#e2e8f0] bg-white p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
          <UserCircle2 className="h-10 w-10 text-[#94a3b8]" />
          <h2 className="text-[18px] font-bold text-[#0f172a]">Profile Screen Scaffold</h2>
          <p className="max-w-xl text-[14px] text-[#64748b]">
            This screen is ready for profile editing, password updates, and account settings.
          </p>
        </div>
      </div>
    </div>
  );
}
