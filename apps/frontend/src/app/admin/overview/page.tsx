"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { StatCard } from "@/shared/components/ui/StatCard";
import { Eye, Bookmark, Activity, Loader2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getPendingUsers } from "@/features/auth/lib/auth-api";
import { getOverviewStats, getRecentActivity, type OverviewStats, type RecentActivity } from "@/features/school/lib/school-api";
import { getGateTimeseries, type TimeseriesPoint } from "@/features/gate/lib/gate-api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import clsx from "clsx";
import { AttendanceDonutChart } from "./components/AttendanceDonutChart";

const chartColorMap: Record<string, { stroke: string; stop1: string; stop2: string }> = {
  red:   { stroke: "#ef4444", stop1: "#fca5a5", stop2: "#fef2f2" },
  blue:  { stroke: "#3b82f6", stop1: "#93c5fd", stop2: "#eff6ff" },
  green: { stroke: "#65a30d", stop1: "#bef264", stop2: "#f7fee7" },
};

function PendingRequestsCard() {
  const router = useRouter();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    getPendingUsers().then((result) => {
      if (result.ok) setCount(result.data.length);
    });
  }, []);

  return (
    <div
      onClick={() => router.push("/admin/overview/pending-requests")}
      className="cursor-pointer rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between hover:border-blue-200 hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 border border-amber-100">
          <Users className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-[#0f172a]">Pending Requests</h3>
          <p className="text-[12px] text-[#64748b] mt-0.5">
            {count === null ? "Loading…" : count === 0 ? "No pending approvals" : `${count} account${count !== 1 ? "s" : ""} awaiting approval`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {count !== null && count > 0 && (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500 text-white text-[12px] font-bold">
            {count}
          </span>
        )}
        <span className="text-[12px] font-bold text-blue-600 hover:text-blue-700">Review →</span>
      </div>
    </div>
  );
}

function OverviewContent() {
  const [timeRange, setTimeRange] = useState<"Last 30 days" | "Last Week" | "Today">("Last 30 days");
  const [chartColor, setChartColor] = useState("blue");
  const [systemStatus, setSystemStatus] = useState<"checking" | "online" | "offline">("online");
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [chartData, setChartData] = useState<TimeseriesPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const isPending = user?.role === "pending";
  const displayName = user?.full_name ?? user?.email ?? "";

  const checkSystemStatus = async () => {
    setSystemStatus("checking");
    try {
      const res = await fetch("http://localhost:5000/health");
      setSystemStatus(res.ok ? "online" : "offline");
    } catch {
      setSystemStatus("offline");
    }
  };

  const fetchData = useCallback(async () => {
    checkSystemStatus();
    const [statsRes, activityRes] = await Promise.all([getOverviewStats(), getRecentActivity()]);
    if (statsRes.ok) setStats(statsRes.data);
    if (activityRes.ok) setRecentActivities(activityRes.data);
  }, []);

  useEffect(() => {
    const initialCheck = setTimeout(() => { fetchData(); }, 0);
    return () => clearTimeout(initialCheck);
  }, [fetchData]);

  // Fetch real timeseries data when timeRange changes
  useEffect(() => {
    const fetchChartData = async () => {
      setChartLoading(true);
      const range = timeRange === "Today" ? "today" : timeRange === "Last Week" ? "week" : "30days";
      const res = await getGateTimeseries(range);
      if (res.ok) setChartData(res.data);
      setChartLoading(false);
    };
    fetchChartData();
  }, [timeRange]);

  const trendPercent = useMemo(() => {
    if (!stats || stats.yesterdayAttendance === 0) return null;
    const pct = ((stats.todayAttendance - stats.yesterdayAttendance) / stats.yesterdayAttendance) * 100;
    return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
  }, [stats]);

  const trendDirection: "up" | "down" = useMemo(() => {
    if (!stats) return "up";
    return stats.todayAttendance >= stats.yesterdayAttendance ? "up" : "down";
  }, [stats]);

  const currentColors = chartColorMap[chartColor];

  return (
    <div className="flex flex-col gap-[20px] pb-12 w-full pr-2">
      <PageHeader
        title="Overview"
        subtitle={`Welcome back ${displayName}!`}
        onRefresh={fetchData}
      />

      <div className="relative mt-2">
        {isPending && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-sm bg-white/30 rounded-xl">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-[22px] font-bold text-gray-900 mb-2 shadow-sm bg-white/80 px-6 py-2 rounded-full border border-gray-200">Waiting for approval</h3>
            <p className="text-gray-700 font-medium bg-white/80 px-4 py-1 rounded-full border border-gray-200 shadow-sm">Your account is currently under review</p>
          </div>
        )}

        <div className={clsx(isPending && "pointer-events-none blur-[6px] opacity-60 transition-all duration-500 select-none")}>
          {/* Top Stat Row */}
          <div className="grid grid-cols-1 gap-[18px] md:grid-cols-4">
            <AttendanceDonutChart
              todayAttendance={stats?.todayAttendance ?? 0}
              activeStudents={stats?.activeStudents ?? 0}
              suspendedAccounts={stats?.suspendedStudents ?? 0}
            />

            <div className="cursor-pointer" onClick={() => router.push("/admin/attendance")}>
              <StatCard
                title="Today's Attendance"
                value={stats !== null ? stats.todayAttendance.toString() : "..."}
                icon={Eye}
                trendValue={trendPercent ?? undefined}
                trendDirection={trendDirection}
                variant="default"
              />
            </div>

            <div className="cursor-pointer" onClick={() => router.push("/admin/students")}>
              <StatCard
                title="Active Students Accounts"
                value={stats !== null ? stats.activeStudents.toString() : "..."}
                icon={Eye}
                variant="active"
              />
            </div>

            <div className="cursor-pointer" onClick={() => router.push("/admin/students?status=suspended")}>
              <StatCard
                title="Suspended Accounts"
                value={stats !== null ? stats.lockedAccounts.toString() : "..."}
                icon={Eye}
                variant="suspended"
              />
            </div>
          </div>

          {/* Attendance Overview Chart — real data */}
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] mt-6">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex flex-col">
                <h2 className="text-[18px] font-bold text-[#0f172a]">Attendance Overview</h2>
                <p className="text-[13px] font-bold text-[#64748b] mt-1">Gate check-ins by time range</p>
              </div>
              <div className="flex items-center gap-[24px]">
                <div className="flex items-center gap-2">
                  {(["Last 30 days", "Last Week", "Today"] as const).map((tab) => (
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
              {chartLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={currentColors.stop1} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={currentColors.stop2} stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: "#0f172a" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: "#0f172a" }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                      itemStyle={{ color: "#0f172a", fontWeight: "bold" }}
                      formatter={(value) => [value, "Check-ins"]}
                    />
                    <Area type="monotone" dataKey="uv" stroke={currentColors.stroke} strokeWidth={2} fillOpacity={1} fill="url(#colorUv)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Pending Requests Row */}
          <div className="mt-6">
            <PendingRequestsCard />
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 gap-[18px] md:grid-cols-4 mt-6">
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

            <div className="col-span-1 md:col-span-2 rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col h-[160px]">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[17px] font-bold text-[#0f172a] tracking-tight">Recent System Activities</h3>
                <button className="text-[12px] font-bold text-[#3b82f6] hover:text-[#2563eb]">
                  View More
                </button>
              </div>
              <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                {recentActivities.length > 0 ? recentActivities.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f8fafc] text-[#94a3b8] border border-[#f1f5f9] shrink-0">
                      <Eye className="h-4 w-4" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center text-sm">
                      <span className="font-bold text-[#0f172a] text-[13px] w-[180px] shrink-0">{item.title}</span>
                      <span className="font-bold text-[#64748b] text-[11px] truncate sm:ml-2">
                        {item.details}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="text-sm font-medium text-gray-500 h-full flex items-center justify-center">No recent activities</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  return <OverviewContent />;
}
