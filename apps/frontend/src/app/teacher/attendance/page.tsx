"use client";

import React, { useMemo, useState, useEffect } from "react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { TabSelector } from "@/shared/components/ui/TabSelector";
import { TabSelectorV2 } from "@/shared/components/ui/TabSelectorV2";
import { FilterBar } from "@/shared/components/ui/FilterBar";
import {
  Calendar as CalendarIcon,
  Check,
  Clock3,
  FileText,
  ShieldAlert,
  X,
  MessageSquare,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getClassStudents, StudentRecord } from "@/features/school/lib/school-api";
import { getGateEvents, GateLogRow } from "@/features/gate/lib/gate-api";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

type AttendanceTab = "today" | "history" | "by-student";
type MarkStatus = "present" | "absent" | "late";



export default function TeacherAttendancePage() {
  const { user } = useAuth();
  const classes = useMemo(() => user?.classes_taught ?? [], [user?.classes_taught]);

  const [activeTab, setActiveTab] = useState<AttendanceTab>("today");
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  useEffect(() => {
    if (!selectedClassId && classes.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  const [studentsData, setStudentsData] = useState<StudentRecord[]>([]);
  const [gateLogs, setGateLogs] = useState<GateLogRow[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!selectedClassId) return;
      
      const [studentsRes, gateRes] = await Promise.all([
        getClassStudents(selectedClassId),
        getGateEvents({ date: todayISO(), class_id: selectedClassId })
      ]);

      if (studentsRes.ok) {
        setStudentsData(studentsRes.data);
      } else {
        setStudentsData([]);
      }
      
      if (gateRes.ok) {
        setGateLogs(gateRes.data);
      } else {
        setGateLogs([]);
      }
    }
    void fetchData();
  }, [selectedClassId]);

  const [sessionCreated, setSessionCreated] = useState<Record<string, boolean>>({});

  const [studentMarks, setStudentMarks] = useState<Record<string, MarkStatus>>({});

  const [search, setSearch] = useState("");
  const [historyDate, setHistoryDate] = useState("2026-04-21");
  const [dateRange, setDateRange] = useState("Last 7 Days");

  const visibleStudents = useMemo(() => {
    return studentsData.map((s) => {
      const gateLog = gateLogs.find(l => l.student_id_no === s.student_id_no);
      return {
        id: s.student_id_no,
        name: s.full_name,
        gateScanned: !!gateLog?.checkIn,
        excuseNote: undefined // Can pull from actual data if available
      };
    }).filter((s) => {
      const inSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase());
      return inSearch;
    });
  }, [studentsData, gateLogs, search]);

  const getMark = (studentId: string): MarkStatus => {
    return studentMarks[studentId] || "present";
  };

  const setMark = (studentId: string, status: MarkStatus) => {
    setStudentMarks((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleCreateSession = () => {
    setSessionCreated((prev) => ({ ...prev, [selectedClassId]: true }));
  };

  const handleSubmitSession = () => {
    window.alert(
      `Session submitted.\n\nMock: FCM sent to parents of marked absent students.`
    );
  };

  const renderGateBadge = (gateScanned: boolean) => (
    <span
      className={clsx(
        "inline-flex items-center justify-center rounded-full px-3 py-1 text-[12px] font-bold",
        gateScanned ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
      )}
    >
      {gateScanned ? "In School" : "Not Scanned"}
    </span>
  );

  const renderStatusPicker = (studentId: string) => {
    const current = getMark(studentId);
    return (
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setMark(studentId, "present")}
          className={clsx(
            "rounded-lg border px-3 py-1 text-[12px] font-bold transition-colors",
            current === "present"
              ? "border-green-500 bg-green-500 text-white"
              : "border-gray-200 bg-white text-gray-600"
          )}
        >
          <span className="inline-flex items-center gap-1">
            <Check className="h-3 w-3" /> Present
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMark(studentId, "absent")}
          className={clsx(
            "rounded-lg border px-3 py-1 text-[12px] font-bold transition-colors",
            current === "absent"
              ? "border-red-500 bg-red-500 text-white"
              : "border-gray-200 bg-white text-gray-600"
          )}
        >
          <span className="inline-flex items-center gap-1">
            <X className="h-3 w-3" /> Absent
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMark(studentId, "late")}
          className={clsx(
            "rounded-lg border px-3 py-1 text-[12px] font-bold transition-colors",
            current === "late"
              ? "border-amber-500 bg-amber-500 text-white"
              : "border-gray-200 bg-white text-gray-600"
          )}
        >
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3 w-3" /> Late
          </span>
        </button>
      </div>
    );
  };

  const renderTodaySession = () => {
    if (!sessionCreated[selectedClassId]) {
      return (
        <div className="mt-2 rounded-[24px] border border-[#e2e8f0] bg-white p-12 text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <ShieldAlert className="mx-auto mb-4 h-14 w-14 text-[#94a3b8]" />
          <h3 className="mb-2 text-[18px] font-bold text-[#0f172a]">No Session Created Yet</h3>
          <p className="mx-auto mb-6 max-w-md text-[14px] text-[#64748b]">
            Start today&apos;s attendance session. If already
            created, this action opens the existing session.
          </p>
          <button
            type="button"
            onClick={handleCreateSession}
            className="rounded-xl bg-[#4f46e5] px-6 py-3 text-[14px] font-bold text-white hover:bg-[#4338ca]"
          >
            Create Session for Today
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <FilterBar
            searchPlaceholder="Search Student by ID or Name"
            searchValue={search}
            onSearchChange={setSearch}
            filters={[]}
          />
          <button
            type="button"
            onClick={handleSubmitSession}
            className="ml-4 whitespace-nowrap rounded-lg bg-[#4f46e5] px-6 py-2.5 text-[13px] font-bold text-white hover:bg-[#4338ca]"
          >
            Submit Session
          </button>
        </div>

        <div className="mt-2 overflow-hidden rounded-[24px] border border-[#e2e8f0] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
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
                      <p className="text-[12px] text-[#64748b]">{student.id}</p>
                    </td>
                    <td className="px-6 py-4 text-center">{renderGateBadge(student.gateScanned)}</td>
                    <td className="px-6 py-4">{renderStatusPicker(student.id)}</td>
                    <td className="px-6 py-4">
                      <button 
                        type="button"
                        onClick={() => window.alert(`Opening chat with parent of ${student.name}...`)}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[12px] font-bold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
    );
  };

  const renderHistory = () => {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-end gap-4 rounded-xl border border-[#e2e8f0] bg-white p-4">
          <div>
            <label className="mb-1 block text-[12px] font-bold text-[#64748b]">Date</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={historyDate}
                onChange={(e) => setHistoryDate(e.target.value)}
                className="rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-[13px] font-bold text-gray-700 outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <p className="ml-auto text-[13px] text-gray-500">Past sessions are read-only.</p>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-[#e2e8f0] bg-white/70">
          <table className="w-full text-left text-[14px]">
            <thead className="border-b border-[#e2e8f0] bg-[#fafafa] text-[#64748b]">
              <tr>
                <th className="px-6 py-4 font-bold">Student</th>
                <th className="px-6 py-4 font-bold">Gate Status</th>
                <th className="px-6 py-4 font-bold">Logged Mark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {visibleStudents.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 font-bold">{student.name}</td>
                  <td className="px-6 py-4">{renderGateBadge(student.gateScanned)}</td>
                  <td className="px-6 py-4 font-bold text-green-700">Present</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderByStudent = () => {
    return (
      <div className="flex flex-col gap-4">
        <FilterBar
          searchPlaceholder="Search by Name or ID"
          searchValue={search}
          onSearchChange={setSearch}
          filters={[
            {
              id: "dateRange",
              label: dateRange,
              options: [
                { label: "Last 7 Days", value: "Last 7 Days" },
                { label: "Last 30 Days", value: "Last 30 Days" },
                { label: "This Term", value: "This Term" },
              ],
              value: dateRange,
              onChange: setDateRange,
            },
          ]}
        />

        <div className="rounded-[24px] border border-[#e2e8f0] bg-white p-6">
          <h3 className="mb-4 text-[15px] font-bold text-[#0f172a]">Student Attendance Summary</h3>
          {visibleStudents.map((student) => (
            <div
              key={student.id}
              className="mb-3 flex flex-col justify-between gap-3 rounded-xl border border-gray-100 p-4 md:flex-row md:items-center"
            >
              <div>
                <p className="text-[14px] font-bold text-gray-800">
                  {student.name} <span className="font-normal text-gray-400">({student.id})</span>
                </p>
                <p className="mt-1 text-[12px] text-gray-500">
                  Attendance Rate: <span className="font-bold text-green-600">92%</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex w-full flex-col gap-[20px] pb-12 pr-2">
      <PageHeader
        title="Attendance"
        subtitle="Gate-aware attendance marking for teacher classes."
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
