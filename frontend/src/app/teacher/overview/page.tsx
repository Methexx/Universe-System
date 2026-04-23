import React from "react";
import { PageHeader } from "@/shared/components/layout/PageHeader";

export default function TeacherOverviewPage() {
  return (
    <div className="flex flex-col">
      <PageHeader 
        title="Overview" 
        subtitle="Welcome back Teacher!" 
      />
      
      <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100 min-h-[400px] flex items-center justify-center text-gray-400">
        Teacher dashboard content goes here...
      </div>
    </div>
  );
}
