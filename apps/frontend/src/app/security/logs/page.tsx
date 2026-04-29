"use client";

import React, { useState } from "react";
import clsx from "clsx";
import {
  FileText,
  UserCheck,
  Truck,
  AlertTriangle,
  Plus,
  Search,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/shared/components/layout/PageHeader";

// ---------------------------------------------------------------------------
// Types & Mock Data
// ---------------------------------------------------------------------------

type LogType = "visitor" | "delivery" | "incident" | "general";

interface SecurityLog {
  id: string;
  type: LogType;
  title: string;
  description: string;
  author: string;
  timestamp: string;
  status?: "pending" | "resolved" | "active";
  tags?: string[];
}

const INITIAL_LOGS: SecurityLog[] = [
  {
    id: "l1",
    type: "visitor",
    title: "Visitor Check-in: Amara Nkwonta (Parent)",
    description: "Verified ID. Visiting Principal's office regarding student Amara. Issued visitor badge #042.",
    author: "John Security",
    timestamp: "Today, 10:45 AM",
    status: "active",
    tags: ["Badge #042", "ID Verified"],
  },
  {
    id: "l2",
    type: "delivery",
    title: "Stationery Delivery (Office Max)",
    description: "Received 5 boxes of whiteboard markers and printer paper at Gate 2. Directed to Admin Block.",
    author: "Mike Guard",
    timestamp: "Today, 09:15 AM",
    status: "resolved",
    tags: ["Gate 2", "Admin Block"],
  },
  {
    id: "l3",
    type: "incident",
    title: "Unauthorized Vehicle at Drop-off",
    description: "Blue Toyota Camry (XYZ-123) parked in the bus only zone. Driver was asked to relocate to visitor parking. Driver complied.",
    author: "John Security",
    timestamp: "Yesterday, 02:30 PM",
    status: "resolved",
    tags: ["Parking", "Resolved"],
  },
  {
    id: "l4",
    type: "visitor",
    title: "Maintenance Crew (AC Repair)",
    description: "Two technicians arrived for scheduled library AC maintenance. Escorted by staff.",
    author: "Sarah Watch",
    timestamp: "Yesterday, 11:00 AM",
    status: "resolved",
    tags: ["Badge #031", "Badge #032"],
  }
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getLogIcon(type: LogType) {
  switch (type) {
    case "visitor": return <UserCheck className="h-5 w-5 text-blue-600" />;
    case "delivery": return <Truck className="h-5 w-5 text-emerald-600" />;
    case "incident": return <AlertTriangle className="h-5 w-5 text-rose-600" />;
    default: return <FileText className="h-5 w-5 text-gray-600" />;
  }
}

function getLogBg(type: LogType) {
  switch (type) {
    case "visitor": return "bg-blue-50 border-blue-100";
    case "delivery": return "bg-emerald-50 border-emerald-100";
    case "incident": return "bg-rose-50 border-rose-100";
    default: return "bg-gray-50 border-gray-100";
  }
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function SecurityLogsPage() {
  const [logs, setLogs] = useState<SecurityLog[]>(INITIAL_LOGS);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<LogType | "all">("all");
  
  // Compose form state
  const [isComposing, setIsComposing] = useState(false);
  const [composeType, setComposeType] = useState<LogType>("visitor");
  const [composeTitle, setComposeTitle] = useState("");
  const [composeDesc, setComposeDesc] = useState("");

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filterType === "all" || log.type === filterType;
    const q = search.toLowerCase();
    const matchesSearch = 
      !q || 
      log.title.toLowerCase().includes(q) || 
      log.description.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const handlePostLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTitle.trim() || !composeDesc.trim()) return;

    const newLog: SecurityLog = {
      id: `l-${Date.now()}`,
      type: composeType,
      title: composeTitle.trim(),
      description: composeDesc.trim(),
      author: "John Security", // Mock author
      timestamp: "Just now",
      status: composeType === "visitor" ? "active" : "resolved",
    };

    setLogs([newLog, ...logs]);
    setIsComposing(false);
    setComposeTitle("");
    setComposeDesc("");
    setComposeType("visitor");
  };

  return (
    <div className="flex w-full flex-col gap-6 pb-12 pr-2">
      <PageHeader
        title="Security Logs"
        subtitle="Track visitors, deliveries, and gate incidents in real-time"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left/Top Column: Create New Log & Filters */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Create Log Card */}
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
            {!isComposing ? (
              <button
                onClick={() => setIsComposing(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e293b] py-3 text-[14px] font-bold text-white transition hover:bg-[#0f172a]"
              >
                <Plus className="h-4 w-4" />
                New Log Entry
              </button>
            ) : (
              <form onSubmit={handlePostLog} className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold text-[#475569]">Entry Type</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
                    {(["visitor", "delivery", "incident", "general"] as LogType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setComposeType(t)}
                        className={clsx(
                          "flex flex-col items-center justify-center gap-1 rounded-lg border p-2 capitalize transition",
                          composeType === t
                            ? "border-[#1e293b] bg-[#f8fafc] font-bold text-[#1e293b]"
                            : "border-[#e2e8f0] text-[#64748b] hover:bg-gray-50"
                        )}
                      >
                        {getLogIcon(t)}
                        <span className="text-[11px]">{t}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[12px] font-bold text-[#475569]">Log Title</label>
                  <input
                    placeholder="e.g. Visitor Check-in: John Doe"
                    value={composeTitle}
                    onChange={(e) => setComposeTitle(e.target.value)}
                    className="w-full rounded-lg border border-[#e2e8f0] px-3 py-2 text-[13px] outline-none focus:border-[#1e293b]"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[12px] font-bold text-[#475569]">Details / Notes</label>
                  <textarea
                    placeholder="Add verification details, badge numbers, or remarks..."
                    value={composeDesc}
                    onChange={(e) => setComposeDesc(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-[#e2e8f0] px-3 py-2 text-[13px] outline-none focus:border-[#1e293b]"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsComposing(false)}
                    className="flex-1 rounded-lg border border-[#e2e8f0] py-2.5 text-[13px] font-bold text-[#475569] hover:bg-[#f1f5f9]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!composeTitle.trim() || !composeDesc.trim()}
                    className="flex-1 rounded-lg bg-[#1e293b] py-2.5 text-[13px] font-bold text-white hover:bg-[#0f172a] disabled:opacity-50"
                  >
                    Post Log
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Filters & Search */}
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
              <input
                type="text"
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg bg-[#f8fafc] py-2 pl-9 pr-3 text-[13px] border border-transparent focus:border-[#e2e8f0] outline-none"
              />
            </div>
            
            <h3 className="mb-2 text-[12px] font-bold text-[#94a3b8] uppercase tracking-wider">Filter by Type</h3>
            <div className="flex flex-col gap-1.5">
              {(["all", "visitor", "delivery", "incident", "general"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={clsx(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] capitalize transition",
                    filterType === t
                      ? "bg-[#1e293b] font-bold text-white"
                      : "text-[#64748b] hover:bg-[#f1f5f9]"
                  )}
                >
                  <span>{t === "all" ? "All Entries" : t}</span>
                  {filterType === t && <CheckCircle2 className="h-4 w-4 opacity-70" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right/Bottom Column: Timeline Thread */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-[#e2e8f0] bg-white shadow-sm p-1 sm:p-2">
            <div className="px-4 py-4 border-b border-[#f1f5f9] flex justify-between items-center bg-white rounded-t-2xl">
              <h2 className="text-[16px] font-bold text-[#0f172a]">Log Thread View</h2>
            </div>
            
            <div className="p-4 sm:p-6">
              {filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-[#94a3b8]">
                  <FileText className="h-10 w-10 mb-3 opacity-20" />
                  <p className="text-[14px] font-medium">No logs matched your criteria</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-[#e2e8f0] ml-3 sm:ml-4 space-y-8 pb-4">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="relative pl-6 sm:pl-8">
                      {/* Timeline Node Icon */}
                      <div className={clsx(
                        "absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white",
                        getLogBg(log.type)
                      )}>
                        {getLogIcon(log.type)}
                      </div>

                      {/* Log Card */}
                      <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="mb-2 flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-4">
                          <h3 className="text-[14px] font-bold text-[#0f172a] leading-snug">
                            {log.title}
                          </h3>
                          <div className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-semibold text-[#94a3b8]">
                            <Clock className="h-3 w-3" />
                            {log.timestamp}
                          </div>
                        </div>

                        <p className="mb-3 text-[13px] leading-relaxed text-[#475569]">
                          {log.description}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
                          <div className="flex gap-2">
                            {log.tags?.map(tag => (
                              <span key={tag} className="rounded-md bg-[#f1f5f9] px-2 py-0.5 text-[10px] font-bold text-[#475569]">
                                {tag}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-2 text-[11px] font-medium text-[#64748b]">
                            <span>Logged by: <span className="font-bold text-[#0f172a]">{log.author}</span></span>
                            {log.status === "active" && (
                              <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
