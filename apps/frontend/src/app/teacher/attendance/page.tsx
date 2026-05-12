"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { TabSelector } from "@/shared/components/ui/TabSelector";
import { TabSelectorV2 } from "@/shared/components/ui/TabSelectorV2";
import { FilterBar } from "@/shared/components/ui/FilterBar";
import { AttendanceCalendar } from "@/shared/components/AttendanceCalendar";
import {
  Check,
  Clock3,
  Loader2,
  MessageSquare,
  ShieldAlert,
  X,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getClassStudents, StudentRecord } from "@/features/school/lib/school-api";
import { getGateEvents, GateLogRow } from "@/features/gate/lib/gate-api";
import {
  createAttendanceSession,
  getAttendanceSession,
  getSessionDates,
  getAttendanceSummary,
  submitAttendanceSession,
  SessionWithRecords,
  AttendanceMarkRecord,
  StudentAttendanceSummary,
} from "@/features/attendance/lib/attendance-api";
import { cacheGet, cacheSet, cacheDel } from "@/shared/lib/local-cache";

type AttendanceTab = "today" | "history" | "by-student";
type MarkStatus = "present" | "absent" | "late";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function isSessionEditable(sessionDate: string): boolean {
  const sd = new Date(sessionDate);
  sd.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return sd.getTime() === today.getTime();
}

export default function TeacherAttendancePage() {
  const { user } = useAuth();
  const classes = useMemo(() => user?.classes_taught ?? [], [user?.classes_taught]);

  const [activeTab, setActiveTab] = useState<AttendanceTab>("today");
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  useEffect(() => {
    if (!selectedClassId && classes.length > 0) {
      Promise.resolve().then(() => setSelectedClassId(classes[0].id));
    }
  }, [classes, selectedClassId]);

  // ── Today's Session state ──────────────────────────────────────────────────
  const [sessionData, setSessionData] = useState<SessionWithRecords | null>(null);
  const [studentsData, setStudentsData] = useState<StudentRecord[]>([]);
  const [gateLogs, setGateLogs] = useState<GateLogRow[]>([]);
  const [studentMarks, setStudentMarks] = useState<Record<string, MarkStatus>>({});
  const [loadingData, setLoadingData] = useState(true);
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // ── History tab state ──────────────────────────────────────────────────────
  const [historyAvailableDates, setHistoryAvailableDates] = useState<string[]>([]);
  const [historySelectedDate, setHistorySelectedDate] = useState<string | null>(null);
  const [historyRecords, setHistoryRecords] = useState<AttendanceMarkRecord[]>([]);
  const [loadingHistoryDates, setLoadingHistoryDates] = useState(false);
  const [loadingHistoryRecords, setLoadingHistoryRecords] = useState(false);

  // ── Summary tab state ──────────────────────────────────────────────────────
  const [summaryData, setSummaryData] = useState<StudentAttendanceSummary[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryRange, setSummaryRange] = useState<"month" | "term">("month");

  // ── Helpers ────────────────────────────────────────────────────────────────

  function applySessionData(data: SessionWithRecords) {
    setSessionData(data);
    const marks: Record<string, MarkStatus> = {};
    for (const record of data.records) {
      if (record.status === "present" || record.status === "absent" || record.status === "late") {
        marks[record.student_id] = record.status;
      }
    }
    setStudentMarks(marks);
  }

  // ── Initial load / class change ────────────────────────────────────────────

  const fetchTodayData = useCallback(async (classId: string) => {
    const today = todayISO();
    const cacheKey = `att-session:${classId}:${today}`;

    const [sessionResult, studentsResult, gateResult] = await Promise.all([
      getAttendanceSession(classId, today),
      getClassStudents(classId),
      getGateEvents({ date: today, class_id: classId }),
    ]);

    cacheSet(cacheKey, sessionResult, 60);
    applySessionData(sessionResult);
    if (studentsResult.ok) setStudentsData(studentsResult.data);
    else setStudentsData([]);
    if (gateResult.ok) setGateLogs(gateResult.data);
    else setGateLogs([]);
    setLoadingData(false);
  }, []);

  useEffect(() => {
    if (!selectedClassId) return;
    const today = todayISO();
    const cacheKey = `att-session:${selectedClassId}:${today}`;
    const cached = cacheGet<SessionWithRecords>(cacheKey);
    if (cached) {
      Promise.resolve().then(() => {
        applySessionData(cached);
        setLoadingData(false);
      });
    } else {
      Promise.resolve().then(() => setLoadingData(true));
    }

    Promise.resolve().then(() => {
      setSubmitSuccess(false);
      setSubmitError(null);
      // Reset history state so previous class data never bleeds through
      setHistoryAvailableDates([]);
      setHistorySelectedDate(null);
      setHistoryRecords([]);
      // Reset summary state
      setSummaryData([]);
      void fetchTodayData(selectedClassId);
    });
  }, [selectedClassId, fetchTodayData]);

  // Refresh handler for PageHeader
  const handleRefresh = useCallback(async () => {
    if (!selectedClassId) return;
    await fetchTodayData(selectedClassId);
  }, [selectedClassId, fetchTodayData]);

  // ── History tab ────────────────────────────────────────────────────────────

  async function loadHistoryDates(year: number, month: number) {
    if (!selectedClassId) return;
    setLoadingHistoryDates(true);
    try {
      const dates = await getSessionDates(selectedClassId, year, month);
      setHistoryAvailableDates(dates);
    } finally {
      setLoadingHistoryDates(false);
    }
  }

  async function handleHistoryDateSelect(date: string) {
    setHistorySelectedDate(date);
    setLoadingHistoryRecords(true);
    try {
      const data = await getAttendanceSession(selectedClassId, date);
      setHistoryRecords(data.records);
    } finally {
      setLoadingHistoryRecords(false);
    }
  }

  // Load dates when History tab becomes active
  useEffect(() => {
    if (activeTab !== "history" || !selectedClassId) return;
    const now = new Date();
    Promise.resolve().then(() => void loadHistoryDates(now.getFullYear(), now.getMonth() + 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedClassId]);

  // ── Summary tab ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (activeTab !== "by-student" || !selectedClassId) return;
    Promise.resolve().then(() => {
      setLoadingSummary(true);
      void getAttendanceSummary(selectedClassId, summaryRange)
        .then((data) => setSummaryData(data))
        .finally(() => setLoadingSummary(false));
    });
  }, [activeTab, selectedClassId, summaryRange]);

  // ── Session actions ────────────────────────────────────────────────────────

  async function handleCreateSession() {
    if (!selectedClassId) return;
    setCreating(true);
    try {
      await createAttendanceSession(selectedClassId);
      cacheDel(`att-session:${selectedClassId}:${todayISO()}`);
      await fetchTodayData(selectedClassId);
    } finally {
      setCreating(false);
    }
  }

  async function handleSubmitSession() {
    if (!sessionData?.session) return;
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      const marks = Object.entries(studentMarks).map(([student_id, status]) => ({
        student_id,
        status,
      }));
      await submitAttendanceSession(sessionData.session.id, marks);
      cacheDel(`att-session:${selectedClassId}:${todayISO()}`);
      cacheDel(`att-summary:${selectedClassId}`);
      setSubmitSuccess(true);
    } catch {
      setSubmitError("Failed to save session. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Derived data ───────────────────────────────────────────────────────────

  const visibleStudents = useMemo(() => {
    return studentsData
      .map((s) => {
        const gateLog = gateLogs.find((l) => l.student_id_no === s.student_id_no);
        return {
          id: s.id,
          id_no: s.student_id_no,
          name: s.full_name,
          gateScanned: !!gateLog?.checkIn,
        };
      })
      .filter((s) => {
        const q = search.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.id_no.toLowerCase().includes(q);
      });
  }, [studentsData, gateLogs, search]);

  const canEdit = sessionData?.session
    ? isSessionEditable(sessionData.session.date)
    : false;

  const unmarkedCount = sessionData?.session
    ? visibleStudents.filter((s) => !studentMarks[s.id]).length
    : 0;

  // ── Renderers ──────────────────────────────────────────────────────────────

  const renderGateBadge = (gateScanned: boolean) => (
    <span
      className={clsx(
        "inline-flex items-center justify-center rounded-full px-3 py-1 text-[12px] font-bold",
        gateScanned ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600",
      )}
    >
      {gateScanned ? "In School" : "Not Scanned"}
    </span>
  );

  const renderStatusPicker = (studentId: string) => {
    const current = studentMarks[studentId] ?? null;
    if (!canEdit) {
      const label = current ?? "—";
      const color =
        current === "present"
          ? "border-green-200 bg-green-50 text-green-700"
          : current === "absent"
            ? "border-red-200 bg-red-50 text-red-700"
            : current === "late"
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : "border-gray-200 bg-gray-50 text-gray-400";
      return (
        <span className={clsx("inline-flex rounded-lg border px-3 py-1 text-[12px] font-bold capitalize", color)}>
          {label}
        </span>
      );
    }
    return (
      <div className="flex items-center justify-center gap-2">
        {(["present", "absent", "late"] as MarkStatus[]).map((status) => {
          const active = current === status;
          const colorMap: Record<MarkStatus, string> = {
            present: active ? "border-green-500 bg-green-500 text-white" : "border-gray-200 bg-white text-gray-600 hover:border-green-300",
            absent: active ? "border-red-500 bg-red-500 text-white" : "border-gray-200 bg-white text-gray-600 hover:border-red-300",
            late: active ? "border-amber-500 bg-amber-500 text-white" : "border-gray-200 bg-white text-gray-600 hover:border-amber-300",
          };
          const iconMap: Record<MarkStatus, React.ReactNode> = {
            present: <Check className="h-3 w-3" />,
            absent: <X className="h-3 w-3" />,
            late: <Clock3 className="h-3 w-3" />,
          };
          return (
            <button
              key={status}
              type="button"
              onClick={() => setStudentMarks((prev) => ({ ...prev, [studentId]: status }))}
              className={clsx(
                "rounded-lg border px-3 py-1 text-[12px] font-bold transition-colors",
                colorMap[status],
              )}
            >
              <span className="inline-flex items-center gap-1">
                {iconMap[status]}
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderTodaySession = () => {
    if (loadingData) {
      return (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#4f46e5]" />
        </div>
      );
    }

    if (!sessionData?.session) {
      return (
        <div className="mt-2 rounded-[24px] border border-[#e2e8f0] bg-white p-12 text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <ShieldAlert className="mx-auto mb-4 h-14 w-14 text-[#94a3b8]" />
          <h3 className="mb-2 text-[18px] font-bold text-[#0f172a]">No Session Created Yet</h3>
          <p className="mx-auto mb-6 max-w-md text-[14px] text-[#64748b]">
            Start today&apos;s attendance session. If already created, this action opens the existing session.
          </p>
          <button
            type="button"
            onClick={handleCreateSession}
            disabled={creating}
            className="inline-flex items-center gap-2 rounded-xl bg-[#4f46e5] px-6 py-3 text-[14px] font-bold text-white hover:bg-[#4338ca] disabled:opacity-60"
          >
            {creating && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Session for Today
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        {/* Midnight lock banner */}
        {!canEdit && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-[13px] font-bold text-amber-700">
            Session locked — editing is not available after midnight.
          </div>
        )}

        {/* Submit feedback */}
        {submitSuccess && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-[13px] font-bold text-green-700">
            Session saved successfully.
          </div>
        )}
        {submitError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-[13px] font-bold text-red-700">
            {submitError}
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <FilterBar
              searchPlaceholder="Search Student by ID or Name"
              searchValue={search}
              onSearchChange={setSearch}
              filters={[]}
            />
          </div>
          {canEdit && (
            <button
              type="button"
              onClick={handleSubmitSession}
              disabled={submitting}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#4f46e5] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#4338ca] disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Submit Session
            </button>
          )}
        </div>

        {/* Unmarked warning */}
        {canEdit && unmarkedCount > 0 && (
          <p className="text-[12px] text-amber-600">
            {unmarkedCount} student{unmarkedCount !== 1 ? "s" : ""} not yet marked.
          </p>
        )}

        <div className="overflow-hidden rounded-[24px] border border-[#e2e8f0] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-[14px]">
              <thead className="border-b border-[#e2e8f0] bg-[#fafafa] text-[#64748b]">
                <tr>
                  <th className="px-6 py-5 font-bold">Student</th>
                  <th className="px-6 py-5 text-center font-bold">Gate Status</th>
                  <th className="px-6 py-5 text-center font-bold">Mark</th>
                  <th className="px-6 py-5 font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                {visibleStudents.length > 0 ? (
                  visibleStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <p className="font-bold text-[#0f172a]">{student.name}</p>
                        <p className="text-[12px] text-[#64748b]">{student.id_no}</p>
                      </td>
                      <td className="px-6 py-4 text-center">{renderGateBadge(student.gateScanned)}</td>
                      <td className="px-6 py-4 text-center">{renderStatusPicker(student.id)}</td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => window.alert(`Opening chat with parent of ${student.name}...`)}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[12px] font-bold text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          <MessageSquare className="h-4 w-4 text-[#64748b]" />
                          Message Parent
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-gray-500">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderHistory = () => (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        {/* Calendar */}
        <AttendanceCalendar
          availableDates={historyAvailableDates}
          selectedDate={historySelectedDate}
          onDateSelect={handleHistoryDateSelect}
          onMonthChange={(year, month) => void loadHistoryDates(year, month)}
          loading={loadingHistoryDates}
        />

        {/* Records panel */}
        <div className="overflow-hidden rounded-[24px] border border-[#e2e8f0] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          {!historySelectedDate ? (
            <div className="flex h-full min-h-[200px] items-center justify-center text-[14px] text-gray-400">
              Select a date to view records.
            </div>
          ) : loadingHistoryRecords ? (
            <div className="flex h-full min-h-[200px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#4f46e5]" />
            </div>
          ) : (
            <>
              <div className="border-b border-[#e2e8f0] px-6 py-4">
                <p className="text-[13px] font-bold text-[#0f172a]">{historySelectedDate}</p>
                <p className="text-[12px] text-[#64748b]">Past session — read only</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[14px]">
                  <thead className="border-b border-[#e2e8f0] bg-[#fafafa] text-[#64748b]">
                    <tr>
                      <th className="px-6 py-4 font-bold">Student</th>
                      <th className="px-6 py-4 font-bold">Logged Mark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {historyRecords.length > 0 ? (
                      historyRecords.map((r) => {
                        const color =
                          r.status === "present"
                            ? "bg-green-100 text-green-700"
                            : r.status === "absent"
                              ? "bg-red-100 text-red-700"
                              : r.status === "late"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-gray-100 text-gray-600";
                        return (
                          <tr key={r.id}>
                            <td className="px-6 py-4">
                              <p className="font-bold text-[#0f172a]">{r.student.full_name}</p>
                              <p className="text-[12px] text-[#64748b]">{r.student.student_id_no}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={clsx(
                                  "inline-flex rounded-full px-3 py-1 text-[12px] font-bold capitalize",
                                  color,
                                )}
                              >
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={2} className="py-8 text-center text-gray-400">
                          No records for this date.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderByStudent = () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-[13px] font-bold text-[#64748b]">Range:</span>
        {(["month", "term"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setSummaryRange(r)}
            className={clsx(
              "rounded-lg px-4 py-1.5 text-[13px] font-bold transition-colors",
              summaryRange === r
                ? "bg-[#4f46e5] text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
            )}
          >
            {r === "month" ? "This Month" : "This Term"}
          </button>
        ))}
      </div>

      <div className="rounded-[24px] border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <h3 className="mb-4 text-[15px] font-bold text-[#0f172a]">Student Attendance Summary</h3>
        {loadingSummary ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#4f46e5]" />
          </div>
        ) : summaryData.length === 0 ? (
          <p className="py-8 text-center text-[14px] text-gray-400">No session data available.</p>
        ) : (
          summaryData.map((student) => {
            const rateColor =
              student.rate >= 80
                ? "text-green-600"
                : student.rate >= 60
                  ? "text-amber-600"
                  : "text-red-600";
            const barColor =
              student.rate >= 80
                ? "bg-green-500"
                : student.rate >= 60
                  ? "bg-amber-500"
                  : "bg-red-500";
            return (
              <div
                key={student.student_id}
                className="mb-3 rounded-xl border border-gray-100 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-bold text-gray-800">
                      {student.full_name}{" "}
                      <span className="font-normal text-gray-400">({student.student_id_no})</span>
                    </p>
                    <p className="mt-0.5 text-[12px] text-gray-500">
                      Present:{" "}
                      <span className="font-bold text-green-600">{student.present}</span> &nbsp;
                      Absent:{" "}
                      <span className="font-bold text-red-600">{student.absent}</span> &nbsp;
                      Late:{" "}
                      <span className="font-bold text-amber-600">{student.late}</span> &nbsp;/&nbsp;
                      {student.total_sessions} sessions
                    </p>
                  </div>
                  <p className={clsx("text-[15px] font-bold", rateColor)}>{student.rate}%</p>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={clsx("h-full rounded-full transition-all", barColor)}
                    style={{ width: `${student.rate}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="flex w-full flex-col gap-[20px] pb-12 pr-2">
      <PageHeader
        title="Attendance"
        subtitle="Gate-aware attendance marking for teacher classes."
        onRefresh={handleRefresh}
      />

      <TabSelectorV2
        activeTab={selectedClassId}
        onTabChange={(id) => setSelectedClassId(id)}
        options={classes.map((c) => {
          const label = c.school_grade ? `${c.school_grade.name}-${c.name}` : c.name;
          return { id: c.id, label };
        })}
      />

      <div className="mt-4 flex min-h-[500px] flex-col">
        <div className="mb-6 border-b border-[#e2e8f0] pb-4">
          <TabSelector
            options={[
              { id: "today", label: "Today's Session" },
              { id: "history", label: "History" },
              { id: "by-student", label: "By Student" },
            ]}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as AttendanceTab)}
          />
        </div>

        {activeTab === "today" && renderTodaySession()}
        {activeTab === "history" && renderHistory()}
        {activeTab === "by-student" && renderByStudent()}
      </div>
    </div>
  );
}
