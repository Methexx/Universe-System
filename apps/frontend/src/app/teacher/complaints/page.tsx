"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Search, AlertTriangle, Clock, CheckCircle2, ChevronDown, ChevronUp, RotateCcw, AlertCircle } from "lucide-react";
import clsx from "clsx";

type ComplaintStatus = "open" | "in_progress" | "resolved";
type ComplaintPriority = "low" | "medium" | "high";
type TabFilter = "all" | ComplaintStatus;

interface Complaint {
  id: string;
  title: string;
  description: string;
  studentName: string;
  parentName: string;
  className: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  assignedAt: string;
  resolvedAt?: string;
  notes?: string;
}

const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: "1", title: "Bullying incident in classroom", description: "Parent reports that their child is being repeatedly teased and excluded by classmates during group work. Behaviour observed over the past two weeks.", studentName: "Kamal Jayawardena", parentName: "Mrs. Jayawardena", className: "Grade 10-A", status: "open", priority: "high", assignedAt: "2026-04-23",
  },
  {
    id: "2", title: "Missing homework marks", description: "Parent claims three homework assignments were submitted on time but not marked by the teacher. Student is concerned about final grades.", studentName: "Dilani Fernando", parentName: "Mr. Fernando", className: "Grade 10-A", status: "open", priority: "medium", assignedAt: "2026-04-22",
  },
  {
    id: "3", title: "Unequal treatment during sports selection", description: "Parent believes their child was unfairly excluded from the school cricket team despite qualifying scores in the trials.", studentName: "Ravindu Perera", parentName: "Mr. Perera", className: "Grade 10-B", status: "in_progress", priority: "medium", assignedAt: "2026-04-20", notes: "Spoke with PE teacher — reviewing trial records and selection criteria.",
  },
  {
    id: "4", title: "Classroom noise affecting studies", description: "Parent says the classroom is too noisy during lessons and their child is struggling to concentrate. Requests seating arrangement review.", studentName: "Nimesha Silva", parentName: "Mrs. Silva", className: "Grade 10-A", status: "in_progress", priority: "low", assignedAt: "2026-04-18", notes: "Adjusted seating plan on 22 Apr. Monitoring for the next week.",
  },
  {
    id: "5", title: "Incorrect grade on mid-term exam", description: "Parent contests a grade given on question 4 of the mid-term maths paper, claiming the marking was inconsistent.", studentName: "Hasitha Bandara", parentName: "Mr. Bandara", className: "Grade 10-A", status: "resolved", priority: "medium", assignedAt: "2026-04-14", resolvedAt: "2026-04-17", notes: "Re-marked the paper. Grade corrected from 12 to 14. Parent notified.",
  },
  {
    id: "6", title: "Late return of test papers", description: "Parent concerned that graded test papers are returned too late to be useful for revision before the next assessment.", studentName: "Sanduni Rathnayake", parentName: "Mrs. Rathnayake", className: "Grade 10-A", status: "resolved", priority: "low", assignedAt: "2026-04-10", resolvedAt: "2026-04-13", notes: "Acknowledged delay. Committed to returning graded work within 5 school days going forward.",
  },
];

const PRIORITY_CONFIG: Record<ComplaintPriority, { label: string; bg: string; text: string }> = {
  high: { label: "High", bg: "bg-red-100", text: "text-red-600" },
  medium: { label: "Medium", bg: "bg-amber-100", text: "text-amber-600" },
  low: { label: "Low", bg: "bg-gray-100", text: "text-gray-500" },
};

const STATUS_CONFIG: Record<ComplaintStatus, { label: string; bg: string; text: string; Icon: React.ElementType }> = {
  open: { label: "Open", bg: "bg-blue-50", text: "text-blue-600", Icon: AlertCircle },
  in_progress: { label: "In Progress", bg: "bg-amber-50", text: "text-amber-600", Icon: Clock },
  resolved: { label: "Resolved", bg: "bg-emerald-50", text: "text-emerald-600", Icon: CheckCircle2 },
};

export default function TeacherComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [tab, setTab] = useState<TabFilter>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      const matchTab = tab === "all" || c.status === tab;
      const matchSearch = search === "" || c.title.toLowerCase().includes(search.toLowerCase()) || c.studentName.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [complaints, tab, search]);

  const stats = {
    assigned: complaints.length,
    inProgress: complaints.filter((c) => c.status === "in_progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  };

  const updateStatus = (id: string, status: ComplaintStatus) => {
    setComplaints((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      return {
        ...c,
        status,
        notes: notesDraft[id] ?? c.notes,
        resolvedAt: status === "resolved" ? new Date().toISOString().split("T")[0] : c.resolvedAt,
      };
    }));
  };

  const TABS: { key: TabFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "open", label: "Open" },
    { key: "in_progress", label: "In Progress" },
    { key: "resolved", label: "Resolved" },
  ];

  return (
    <div className="flex flex-col gap-6 pb-12 w-full pr-2">
      <PageHeader title="Complaints" subtitle="Manage parent complaints assigned to you and track resolutions." />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Assigned", value: stats.assigned, Icon: AlertTriangle, color: "text-[#4f46e5]", bg: "bg-indigo-50" },
          { label: "In Progress", value: stats.inProgress, Icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Resolved", value: stats.resolved, Icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-[16px] p-5 shadow-sm flex items-center gap-4">
            <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center", bg)}>
              <Icon className={clsx("w-5 h-5", color)} />
            </div>
            <div>
              <p className="text-[22px] font-bold text-[#0f172a]">{value}</p>
              <p className="text-[12px] font-medium text-[#64748b]">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-[20px] p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={clsx(
                "px-4 py-2 rounded-lg text-[13px] font-bold transition-all",
                tab === key ? "bg-white text-[#0f172a] shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search complaints..."
            className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-[13px] font-medium text-[#0f172a] outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100 w-[220px]"
          />
        </div>
      </div>

      {/* Complaint List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-gray-200 rounded-[20px]">
          <CheckCircle2 className="w-10 h-10 mb-3 text-gray-300" />
          <p className="font-semibold text-[#334155]">No complaints here</p>
          <p className="text-sm text-gray-400 mt-1">All clear in this category.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((c) => {
            const isExpanded = expandedId === c.id;
            const statusCfg = STATUS_CONFIG[c.status];
            const priorityCfg = PRIORITY_CONFIG[c.priority];
            const StatusIcon = statusCfg.Icon;

            return (
              <div
                key={c.id}
                className={clsx(
                  "bg-white border rounded-[20px] shadow-sm overflow-hidden transition-all",
                  c.priority === "high" && c.status !== "resolved" ? "border-red-200" : "border-gray-200"
                )}
              >
                {/* Card Header — always visible */}
                <div
                  className="p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : c.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={clsx("px-2.5 py-0.5 rounded-full text-[11px] font-bold", priorityCfg.bg, priorityCfg.text)}>
                          {priorityCfg.label}
                        </span>
                        <span className={clsx("flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold", statusCfg.bg, statusCfg.text)}>
                          <StatusIcon className="w-3 h-3" />{statusCfg.label}
                        </span>
                      </div>
                      <h3 className="text-[15px] font-bold text-[#0f172a] leading-snug">{c.title}</h3>
                      <div className="flex items-center gap-4 text-[12px] text-[#64748b] font-medium flex-wrap">
                        <span>Student: <span className="text-[#334155] font-bold">{c.studentName}</span></span>
                        <span>Class: <span className="text-[#334155] font-bold">{c.className}</span></span>
                        <span>Parent: {c.parentName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-[12px] text-gray-400 font-medium hidden sm:block">
                        {new Date(c.assignedAt + "T12:00:00").toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                      </span>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="px-5 pb-6 border-t border-gray-100 pt-5 flex flex-col gap-5">
                    <div>
                      <p className="text-[12px] font-bold text-[#64748b] mb-1">Description</p>
                      <p className="text-[14px] text-[#334155] leading-relaxed">{c.description}</p>
                    </div>

                    {/* Notes */}
                    <div className="flex flex-col gap-[6px]">
                      <label className="text-[12px] font-bold text-[#64748b]">Resolution Notes</label>
                      {c.status === "resolved" ? (
                        <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-[13px] text-emerald-800 font-medium">
                          {c.notes || "No notes added."}
                        </div>
                      ) : (
                        <textarea
                          rows={3}
                          value={notesDraft[c.id] ?? c.notes ?? ""}
                          onChange={(e) => setNotesDraft((p) => ({ ...p, [c.id]: e.target.value }))}
                          placeholder="Add your resolution notes here..."
                          className="px-4 py-3 rounded-xl border border-gray-200 text-[13px] font-medium text-[#0f172a] outline-none focus:border-[#4f46e5] focus:ring-[3px] focus:ring-indigo-100/50 bg-gray-50/30 resize-none"
                        />
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {c.status === "open" && (
                        <button
                          onClick={() => updateStatus(c.id, "in_progress")}
                          className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-[13px] font-bold transition-colors"
                        >
                          <Clock className="w-4 h-4" /> Mark In Progress
                        </button>
                      )}
                      {(c.status === "open" || c.status === "in_progress") && (
                        <button
                          onClick={() => updateStatus(c.id, "resolved")}
                          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-[13px] font-bold transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Mark Resolved
                        </button>
                      )}
                      {c.status === "resolved" && (
                        <button
                          onClick={() => updateStatus(c.id, "open")}
                          className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200 rounded-xl text-[13px] font-bold transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" /> Reopen
                        </button>
                      )}

                      {c.resolvedAt && (
                        <span className="text-[12px] text-gray-400 font-medium ml-auto">
                          Resolved {new Date(c.resolvedAt + "T12:00:00").toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
