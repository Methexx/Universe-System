"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Eye, Loader2 } from "lucide-react";
import { StatCard } from "@/shared/components/ui/StatCard";
import { TabSelector } from "@/shared/components/ui/TabSelector";
import { DonutChart } from "@/shared/components/ui/DonutChart";
import clsx from "clsx";

const pieData = [
  { name: "Absent", value: 14, color: "#f97316" }, // orange
  { name: "Present", value: 50, color: "#1e293b" }, // dark slate
  { name: "Late", value: 10, color: "#cbd5e1" }, // slate 300
];

function OverviewContent() {
  const [activeTab, setActiveTab] = useState("10-a");
  const searchParams = useSearchParams();
  const isPending = searchParams.get("status") === "pending";

  return (
    <div className="flex flex-col gap-[20px] pb-12 w-full pr-2">
      {/* Header Section */}
      <PageHeader
        title="Overview"
        subtitle="Welcome back Sarah Joseph!"
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
          {/* Class Selector */}
          <div>
            <TabSelector
              activeTab={activeTab}
              onTabChange={setActiveTab}
              options={[
                {id: "10-a", label: "10 - A"},
                {id: "11-b", label: "11 - B"}
              ]}
            />
          </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-[18px] md:grid-cols-4 mt-2">
        {/* Donut Chart Card */}
        <DonutChart data={pieData} centerLabel="Attendance" />

        {/* Stat Cards */}
        <StatCard 
          title="Today's Gate Attendance" 
          value="41" 
          icon={Eye} 
          trendValue="+12.5%" 
          trendDirection="up" 
        />

        <StatCard 
          title="Late Attendance" 
          value="10" 
          icon={Eye} 
          variant="danger" 
        />

        <StatCard 
          title="Today Absentees" 
          value="4" 
          icon={Eye} 
          variant="danger" 
        />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden mt-2">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-[14px] whitespace-nowrap min-w-[700px]">
            <thead className="bg-[#fafafa] border-b border-[#e2e8f0] text-[#64748b] font-bold text-[13px] tracking-wider">
              <tr>
                <th className="py-4 px-6 font-bold">Student ID</th>
                <th className="py-4 px-6 font-bold">Date</th>
                <th className="py-4 px-6 font-bold">Check In</th>
                <th className="py-4 px-6 font-bold">Check Out</th>
                <th className="py-4 px-6 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="font-medium">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <tr key={i} className="cursor-pointer transition-colors border-b border-gray-50/50 bg-[#f8fafc] text-gray-700 hover:bg-gray-50">
                  <td className="py-3 px-6 text-[13px] text-[#475569]">29854</td>
                  <td className="py-3 px-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-[14px] text-[#0f172a]">Today</span>
                      <span className="text-[12px] text-[#64748b]">Oct 25, 2024</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-[13px] text-[#475569]">09:12 AM</td>
                  <td className="py-3 px-6 text-[13px] text-[#94a3b8]">-- : --</td>
                  <td className="py-3 px-6">
                    <span className={clsx(
                      "inline-flex items-center justify-center px-3 py-1 rounded-full text-[12px] font-bold min-w-[70px]",
                      i <= 3 
                        ? "bg-[#dcfce7] text-[#16a34a]"
                        : "bg-[#bbf7d0] text-[#16a34a] bg-opacity-40"
                    )}>
                      {i <= 3 ? 'QR' : 'Manual'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}

export default function TeacherOverviewPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>}>
      <OverviewContent />
    </Suspense>
  );
}
