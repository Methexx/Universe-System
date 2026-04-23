"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { StatCard } from "@/shared/components/ui/StatCard";
import { Eye, Bookmark, Activity } from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import clsx from "clsx";

// Dummy data for charts
const areaData30 = [
  { name: "Jan 1", uv: 0 },
  { name: "Jan 3", uv: 500 },
  { name: "Jan 6", uv: 300 },
  { name: "Jan 9", uv: 350 },
  { name: "Jan 12", uv: 500 },
  { name: "Jan 15", uv: 1200 },
  { name: "Jan 18", uv: 1000 },
  { name: "Jan 21", uv: 900 },
  { name: "Jan 24", uv: 1100 },
  { name: "Jan 27", uv: 1500 },
  { name: "Jan 30", uv: 1800 },
  { name: "Feb 2", uv: 1600 },
  { name: "Feb 5", uv: 1400 },
  { name: "Feb 8", uv: 1200 },
];

const areaDataWeek = [
  { name: "Mon", uv: 1200 },
  { name: "Tue", uv: 1300 },
  { name: "Wed", uv: 900 },
  { name: "Thu", uv: 1500 },
  { name: "Fri", uv: 1600 },
  { name: "Sat", uv: 400 },
  { name: "Sun", uv: 300 },
];

const areaDataToday = [
  { name: "8 AM", uv: 800 },
  { name: "10 AM", uv: 1200 },
  { name: "12 PM", uv: 1500 },
  { name: "2 PM", uv: 1400 },
  { name: "4 PM", uv: 900 },
  { name: "6 PM", uv: 400 },
];

const chartColorMap: Record<string, { stroke: string; stop1: string; stop2: string }> = {
  red: { stroke: "#ef4444", stop1: "#fca5a5", stop2: "#fef2f2" },
  blue: { stroke: "#3b82f6", stop1: "#93c5fd", stop2: "#eff6ff" },
  green: { stroke: "#65a30d", stop1: "#bef264", stop2: "#f7fee7" },
};

const pieData = [
  { name: "Unknown", value: 400, color: "#cbd5e1" }, // slate 300
  { name: "Present", value: 1500, color: "#1e293b" }, // dark slate
  { name: "Absent", value: 200, color: "#f97316" }, // orange
];

export default function AdminOverviewPage() {
  const [timeRange, setTimeRange] = useState("Last 30 days");
  const [chartColor, setChartColor] = useState("blue");
  const [systemStatus, setSystemStatus] = useState<"checking" | "online" | "offline">("online");

  const checkSystemStatus = async () => {
    setSystemStatus("checking");
    try {
      const res = await fetch("http://localhost:5000/health");
      // Depending on your API, adjust this condition as needed
      if (res.ok) {
        setSystemStatus("online");
      } else {
        setSystemStatus("offline");
      }
    } catch {
      setSystemStatus("offline");
    }
  };

  useEffect(() => {
    // Avoid executing state update synchronously during the first render effect
    // which triggers the react-hooks/set-state-in-effect lint rule.
    const initialCheck = setTimeout(() => {
      checkSystemStatus();
    }, 0);
    return () => clearTimeout(initialCheck);
  }, []);

  const currentChartData =
    timeRange === "Today"
      ? areaDataToday
      : timeRange === "Last Week"
      ? areaDataWeek
      : areaData30;

  const currentColors = chartColorMap[chartColor];

  return (
    <div className="flex flex-col gap-[20px] pb-12 w-full pr-2">
      <PageHeader
        title="Overview"
        subtitle="Welcome back Sarah Joseph!"
      />

      {/* Top Stat Row */}
      <div className="grid grid-cols-1 gap-[18px] md:grid-cols-4">
        {/* Donut Chart Card */}
        <div className="col-span-1 flex flex-col items-center justify-center relative h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={65}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                startAngle={90}
                endAngle={450}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[14px] font-bold text-[#1e293b]">Attendance</span>
          </div>
        </div>

        {/* Stat Card 1 */}
        <StatCard 
          title="Today's Attendance"
          value="13245"
          icon={Eye}
          trendValue="+12.5%"
          variant="default"
        />

        {/* Stat Card 2 */}
        <StatCard 
          title="Active Students Accounts"
          value="15000"
          icon={Eye}
          variant="default"
        />

        {/* Stat Card 3 (Red) */}
        <StatCard 
          title="Locked Accounts"
          value="10"
          icon={Eye}
          variant="danger"
        />
      </div>

      {/* Main Chart Area */}
      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] mt-2">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col">
            <h2 className="text-[18px] font-bold text-[#0f172a]">Attendance Overview</h2>
            <p className="text-[13px] font-bold text-[#64748b] mt-1">Attendance can view by specific time range</p>
          </div>
          <div className="flex items-center gap-[24px]">
            <div className="flex items-center gap-2">
              {["Last 30 days", "Last Week", "Today"].map((tab) => (
                <button
                  key={tab}
                  className={clsx(
                    "rounded-full px-[20px] py-[6px] text-[13px] font-bold transition-all border",
                    timeRange === tab
                      ? "bg-white text-[#4f46e5] border-[#c7d2fe]"
                      : "text-[#64748b] border-transparent hover:text-[#0f172a] bg-transparent"
                  )}
                  onClick={() => setTimeRange(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-[6px] items-center pr-2">
              <button 
                onClick={() => setChartColor("red")}
                className={clsx("h-[14px] w-[14px] rounded-full bg-[#ef4444] transition-transform", chartColor === "red" && "scale-125 ring-2 ring-red-200")} 
                aria-label="Red Chart Color"
              />
              <button 
                onClick={() => setChartColor("blue")}
                className={clsx("h-[14px] w-[14px] rounded-full bg-[#3b82f6] transition-transform", chartColor === "blue" && "scale-125 ring-2 ring-blue-200")} 
                aria-label="Blue Chart Color"
              />
              <button 
                onClick={() => setChartColor("green")}
                className={clsx("h-[14px] w-[14px] rounded-full bg-[#65a30d] transition-transform", chartColor === "green" && "scale-125 ring-2 ring-green-200")} 
                aria-label="Green Chart Color"
              />
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full relative -left-[14px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentColors.stop1} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={currentColors.stop2} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: "#0f172a" }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: "#0f172a" }} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                itemStyle={{ color: "#0f172a", fontWeight: "bold" }}
              />
              <Area type="monotone" dataKey="uv" stroke={currentColors.stroke} strokeWidth={2} fillOpacity={1} fill="url(#colorUv)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-[18px] md:grid-cols-4 mt-2">
        {/* Policies Management (1 span) */}
        <div className="col-span-1 rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between relative overflow-hidden h-[160px]">
          <div className="absolute right-5 top-5 h-[10px] w-[10px] rounded-full bg-[#f97316] animate-pulse" />
          <div>
            <h3 className="text-[17px] font-bold text-[#0f172a] tracking-tight">Policies Management</h3>
            <p className="text-[12px] font-bold text-[#64748b] mt-2">3 Documents saved</p>
          </div>
          <div className="flex items-center justify-between">
            <Link href="/admin/overview/policies" className="inline-flex items-center justify-center rounded-full bg-[#3b82f6] px-[18px] py-[8px] text-[12px] font-bold text-white transition-opacity hover:bg-[#2563eb]">
              View More
            </Link>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#f1f5f9] text-[#64748b] bg-white bg-opacity-50">
              <Bookmark className="h-[22px] w-[22px]" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* System Health (1 span) */}
        <div className="col-span-1 rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between relative overflow-hidden h-[160px]">
          <div 
            className={clsx(
              "absolute right-5 top-5 h-[10px] w-[10px] rounded-full animate-pulse transition-colors duration-500",
              systemStatus === "online" ? "bg-[#22c55e]" : systemStatus === "offline" ? "bg-[#ef4444]" : "bg-[#94a3b8]"
            )} 
          />
          <div>
            <h3 className="text-[17px] font-bold text-[#0f172a] tracking-tight">System Health</h3>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-[#f1f5f9] bg-[#f8fafc] px-3 py-[6px]">
              <span className="text-[12px] font-bold text-[#1e293b]">Database Status</span>
              <span 
                className={clsx(
                  "rounded-full px-[10px] py-[2px] text-[10px] font-bold text-white transition-colors duration-500",
                  systemStatus === "online" ? "bg-[#22c55e]" : systemStatus === "offline" ? "bg-[#ef4444]" : "bg-[#94a3b8]"
                )}
              >
                {systemStatus === "online" ? "Online" : systemStatus === "offline" ? "Offline" : "Checking"}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
             <button 
                onClick={checkSystemStatus}
                disabled={systemStatus === "checking"}
                className="rounded-full bg-[#3b82f6] px-[18px] py-[8px] text-[12px] font-bold text-white transition-opacity hover:bg-[#2563eb] disabled:opacity-50"
             >
              {systemStatus === "checking" ? "Checking..." : "Check Again"}
            </button>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#f1f5f9] text-[#64748b] bg-white bg-opacity-50">
              <Activity className="h-[22px] w-[22px]" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Recent System Activities (2 spans) */}
        <div className="col-span-1 md:col-span-2 rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col h-[160px]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[17px] font-bold text-[#0f172a] tracking-tight">Recent System Activities</h3>
            <button className="text-[12px] font-bold text-[#3b82f6] hover:text-[#2563eb]">
              View More
            </button>
          </div>
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f8fafc] text-[#94a3b8] border border-[#f1f5f9] shrink-0">
                  <Eye className="h-4 w-4" strokeWidth={2.5} />
                </div>
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center text-sm">
                  <span className="font-bold text-[#0f172a] text-[13px] w-[180px] shrink-0">New Student Registration</span>
                  <span className="font-bold text-[#64748b] text-[11px] truncate sm:ml-2">
                    Name - Methum Pathirana   SID - 29854   class - 10A
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
