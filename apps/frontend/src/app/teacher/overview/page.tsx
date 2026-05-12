"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Eye, Loader2 } from "lucide-react";
import { StatCard } from "@/shared/components/ui/StatCard";
import { TabSelectorV2 } from "@/shared/components/ui/TabSelectorV2";
import { AttendanceDonutChart } from "@/app/admin/overview/components/AttendanceDonutChart";
import clsx from "clsx";
import { getOverviewStats, OverviewStats } from "@/features/school/lib/school-api";
import { getGateEvents, GateLogRow } from "@/features/gate/lib/gate-api";
import { cacheGet, cacheSet } from "@/shared/lib/local-cache";

export default function TeacherOverviewPage() {
  const [activeTab, setActiveTab] = useState<string>("");
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [logs, setLogs] = useState<GateLogRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const { user } = useAuth();
  const isPending = user?.role === "pending";

  const classes = useMemo(() => user?.classes_taught ?? [], [user?.classes_taught]);

  const fetchData = useCallback(async () => {
    if (classes.length > 0) {
      const tabId = classes[0].id;
      setActiveTab(tabId);
      // Show cached stats instantly
      const cachedStats = cacheGet<OverviewStats>(`overview-stats:${tabId}`);
      if (cachedStats) { setStats(cachedStats); setLoadingData(false); }
      else setLoadingData(true);

      const [statsRes, logsRes] = await Promise.all([
        getOverviewStats(tabId),
        getGateEvents({ class_id: tabId, date: 'today' }),
      ]);
      if (statsRes.ok) { setStats(statsRes.data); cacheSet(`overview-stats:${tabId}`, statsRes.data, 60); }
      if (logsRes.ok) setLogs(logsRes.data);
    }
    setLoadingData(false);
  }, [classes]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!activeTab) return;
    const cachedStats = cacheGet<OverviewStats>(`overview-stats:${activeTab}`);
    if (cachedStats) { setTimeout(() => { setStats(cachedStats); setLoadingData(false); }, 0); }
    void Promise.all([
      getOverviewStats(activeTab),
      getGateEvents({ class_id: activeTab, date: 'today' })
    ]).then(([statsRes, logsRes]) => {
      if (statsRes.ok) { setStats(statsRes.data); cacheSet(`overview-stats:${activeTab}`, statsRes.data, 60); }
      if (logsRes.ok) setLogs(logsRes.data);
      setLoadingData(false);
    });
  }, [activeTab]);

  return (
    <div className="flex flex-col gap-[20px] pb-12 w-full pr-2">
      <PageHeader
        title="Overview"
        subtitle={`Welcome back ${user?.full_name ?? ""}!`}
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

        <div className={isPending ? "pointer-events-none blur-[6px] opacity-60 transition-all duration-500 select-none" : ""}>
          {classes.length > 0 ? (
            <>
              <div className="mb-6">
                <TabSelectorV2
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  options={classes.map(c => ({ id: c.id, label: c.school_grade ? `${c.school_grade.name}-${c.name}` : c.name }))}
                />
              </div>

              <div key={activeTab} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 gap-[18px] md:grid-cols-4">
                  <AttendanceDonutChart
                    todayAttendance={stats?.todayAttendance ?? 0}
                    activeStudents={stats?.activeStudents ?? 0}
                    suspendedAccounts={stats?.suspendedStudents ?? 0}
                  />
                  <StatCard title="Today's Gate Attendance" value={stats?.todayAttendance?.toString() ?? "0"} icon={Eye} />
                  <StatCard title="Late Attendance" value="0" icon={Eye} variant="danger" />
                  <StatCard title="Today Absentees" value={Math.max(0, (stats?.activeStudents ?? 0) - (stats?.todayAttendance ?? 0)).toString()} icon={Eye} variant="danger" />
                </div>

                <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-[14px] whitespace-nowrap min-w-[700px]">
                    <thead className="bg-[#fafafa] border-b border-[#e2e8f0] text-[#64748b] font-bold text-[13px] tracking-wider">
                      <tr>
                        <th className="py-4 px-6 font-bold text-center">Student ID</th>
                        <th className="py-4 px-6 font-bold text-center">Date</th>
                        <th className="py-4 px-6 font-bold text-center">Check In</th>
                        <th className="py-4 px-6 font-bold text-center">Check Out</th>
                        <th className="py-4 px-6 font-bold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="font-medium text-[#334155]">
                      {loadingData ? (
                        <tr><td colSpan={5} className="py-10 text-center text-gray-400">Loading...</td></tr>
                      ) : logs.length > 0 ? (
                        logs.map((log) => (
                          <tr key={log.id} className="cursor-pointer transition-colors border-b border-gray-50/50 bg-[#f8fafc] text-gray-700 hover:bg-gray-50">
                            <td className="py-4 px-6 text-center text-[#475569]">{log.student_id_no}</td>
                            <td className="py-4 px-6 text-center">
                              <span className="block font-bold text-[#0f172a]">{log.timeLabel}</span>
                              <span className="block text-[12px] text-[#64748b] mt-0.5">{log.date}</span>
                            </td>
                            <td className="py-4 px-6 text-center text-[#475569]">{log.checkIn ?? '— : —'}</td>
                            <td className="py-4 px-6 text-center text-[#94a3b8]">{log.checkOut ?? '— : —'}</td>
                            <td className="py-4 px-6 text-center">
                              <span
                                className={clsx(
                                  'inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[11px] font-bold min-w-[70px]',
                                  log.method === 'qr'
                                    ? 'bg-[#dcfce7] text-[#16a34a] border border-green-200'
                                    : log.method === 'auto'
                                    ? 'bg-[#f3e8ff] text-[#7c3aed] border border-purple-200'
                                    : 'bg-[#dbeafe] text-[#1d4ed8] border border-blue-200'
                                )}
                              >
                                {log.method === 'qr' ? 'QR' : log.method === 'auto' ? 'Auto' : 'Manual'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={5} className="py-10 text-center text-gray-400">No students in this classroom have arrived yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                </div>
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
