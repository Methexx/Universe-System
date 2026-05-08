"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search, Loader2, CheckCircle, AlertCircle,
  GraduationCap, Phone, Mail, User, BookOpen,
  ArrowRight, ChevronDown, Check,
} from "lucide-react";
import { getStudentByIdNo, searchStudents, submitManualEntry, GateStudentResult } from "@/features/gate/lib/gate-api";
import clsx from "clsx";
import { FilterBar } from "@/shared/components/ui/FilterBar";

const AVATAR_COLORS = [
  "bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500",
  "bg-pink-500", "bg-teal-500", "bg-indigo-500", "bg-rose-500",
];

function LetterAvatar({ name, id }: { name: string; id: string }) {
  const color = AVATAR_COLORS[id.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold text-3xl ${color}`}>
      {(name[0] ?? "?").toUpperCase()}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-[12px] font-semibold text-[#64748b] uppercase tracking-wide">{label}</span>
      <span className="text-[13px] font-bold text-[#0f172a]">{value || "—"}</span>
    </div>
  );
}

const REASONS = [
  { label: "Lost ID",    value: "Lost ID"    },
  { label: "Forgot ID",  value: "Forgot ID"  },
  { label: "Blocked ID", value: "Blocked ID" },
  { label: "Damaged ID", value: "Damaged ID" },
  { label: "Other",      value: "Other"      },
];

type SubmitState = "idle" | "loading" | "success" | "error";

export function ManualEntry() {
  const [searchInput, setSearchInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [student, setStudent] = useState<GateStudentResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [searchResults, setSearchResults] = useState<GateStudentResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [reason, setReason] = useState("");
  const [reasonOpen, setReasonOpen] = useState(false);
  const reasonRef = useRef<HTMLDivElement>(null);

  const [direction, setDirection] = useState<"IN" | "OUT">("IN");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (reasonRef.current && !reasonRef.current.contains(e.target as Node)) {
        setReasonOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const query = searchInput.trim();
    if (query.length < 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchResults([]);
       
      setIsSearchOpen(false);
      return;
    }
    const delay = setTimeout(async () => {
      const res = await searchStudents(query);
      if (res.ok) {
        setSearchResults(res.data);
        setIsSearchOpen(true);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [searchInput]);

  const handleSelectStudent = (selected: GateStudentResult) => {
    setStudent(selected);
    setSearchInput(selected.student_id_no);
    setIsSearchOpen(false);
    setSubmitState("idle");
    setReason("");
    setSearchError(null);
  };

  const handleSearch = useCallback(async () => {
    const raw = searchInput.trim();
    if (!raw) return;
    const id = raw;
    setSearching(true);
    setSearchError(null);
    setStudent(null);
    setSubmitState("idle");
    setReason("");
    setIsSearchOpen(false);

    const result = await getStudentByIdNo(id);
    setSearching(false);

    if (result.ok) {
      setStudent(result.data);
    } else {
      // fallback: take the first one from search results if possible
      if (searchResults.length > 0) {
        setStudent(searchResults[0]);
        setSearchInput(searchResults[0].student_id_no);
      } else {
        setSearchError(result.status === 404 ? "No student found with that ID." : "Search failed. Please try again.");
      }
    }
  }, [searchInput, searchResults]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSubmit = async () => {
    if (!student || !reason) return;
    setSubmitState("loading");
    setSubmitError(null);

    const result = await submitManualEntry({
      qr_code: student.qr_code,
      direction,
      method: "manual",
      manual_reason: reason,
    });

    if (result.ok) {
      setSubmitState("success");
      setTimeout(() => {
        setStudent(null);
        setSearchInput("");
        setReason("");
        setDirection("IN");
        setSubmitState("idle");
      }, 3000);
    } else {
      setSubmitState("error");
      setSubmitError("Failed to mark attendance. Please try again.");
    }
  };

  const gradeName   = student?.class?.school_grade?.name ?? null;
  const className   = student?.class?.name ?? null;
  const gradeClass  = gradeName && className ? `${gradeName} — Class ${className}` : gradeName || className;
  const teacherName = student?.class?.teacher?.full_name ?? null;
  const reasonLabel = REASONS.find(r => r.value === reason)?.label ?? "Select reason";

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* ── Compact search row ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
        <div ref={searchRef} className="relative w-full max-w-[320px]">
          <div onKeyDown={handleKeyDown}>
            <FilterBar
              searchPlaceholder="Type ID or Name..."
              searchValue={searchInput}
              onSearchChange={setSearchInput}
            />
          </div>
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute left-0 top-full mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-30 max-h-60 overflow-y-auto">
              {searchResults.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSelectStudent(s)}
                  className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 text-left"
                >
                  <div>
                    <div className="text-[13px] font-bold text-gray-900">{s.full_name}</div>
                    <div className="text-[11px] font-medium text-gray-500">{s.student_id_no} • {s.class?.name || "No Class"}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleSearch}
          disabled={searching || !searchInput.trim()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3b82f6] hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer ml-auto xl:ml-0"
        >
          {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          Search
        </button>
        {searchError && (
          <div className="flex items-center gap-1.5 text-red-500 text-[12px] font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {searchError}
          </div>
        )}
      </div>

      {/* ── Student result ── */}
      {student && (
        <div className="flex gap-5 flex-col lg:flex-row">

          {/* Left: avatar + name + contact icons */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col items-center lg:w-[240px] shrink-0">
            <div className="w-[80px] h-[80px] rounded-full overflow-hidden mb-3 shadow-sm">
              {student.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={student.photo_url} alt={student.full_name} className="w-full h-full object-cover" />
              ) : (
                <LetterAvatar name={student.full_name} id={student.id} />
              )}
            </div>

            <h2 className="text-[15px] font-bold text-[#0f172a] text-center leading-tight">{student.full_name}</h2>
            <p className="text-[12px] font-semibold text-[#64748b] mt-0.5">{student.student_id_no}</p>

            <div
              className={clsx(
                "mt-2 px-3 py-1 rounded-full text-[11px] font-bold",
                student.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}
            >
              {student.is_active ? "Active" : "Inactive"}
            </div>

            <div className="flex items-center gap-2.5 mt-4">
              {[
                { icon: GraduationCap, tip: gradeClass ?? "No class assigned" },
                { icon: Phone,         tip: student.parent_mobile ?? "No phone on file" },
                { icon: Mail,          tip: student.parent_email  ?? "No email on file"  },
              ].map(({ icon: Icon, tip }) => (
                <div key={tip} className="group relative">
                  <button className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#f1f5f9] text-[#64748b] hover:text-[#3b82f6] hover:bg-[#e0e7ff] transition-colors">
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 bg-[#0f172a] text-white text-[11px] font-medium rounded-lg px-3 py-1.5 whitespace-nowrap shadow-lg">
                    {tip}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: info + action */}
          <div className="flex-1 flex flex-col gap-3">

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-[#64748b]" />
                <span className="text-[13px] font-bold text-[#0f172a]">Student Information</span>
              </div>
              <InfoRow label="Full Name"     value={student.full_name} />
              <InfoRow label="Student ID"    value={student.student_id_no} />
              <InfoRow label="Gender"        value={student.gender} />
              <InfoRow label="Date of Birth" value={student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null} />
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-[#64748b]" />
                <span className="text-[13px] font-bold text-[#0f172a]">Academic Information</span>
              </div>
              <InfoRow label="Grade"         value={gradeName} />
              <InfoRow label="Class"         value={className ? `Class ${className}` : null} />
              <InfoRow label="Class Teacher" value={teacherName} />
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Phone className="w-4 h-4 text-[#64748b]" />
                <span className="text-[13px] font-bold text-[#0f172a]">Parent / Guardian</span>
              </div>
              <InfoRow label="Parent Name"  value={student.parent_name} />
              <InfoRow label="Parent Phone" value={student.parent_mobile} />
              <InfoRow label="Parent Email" value={student.parent_email} />
            </div>

            {/* Reason + Direction + Enroll button row */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="text-[13px] font-bold text-[#0f172a] mb-4">Manual Entry Details</p>

              <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                {/* Reason dropdown */}
                <div ref={reasonRef} className="relative flex-1">
                  <button
                    type="button"
                    onClick={() => setReasonOpen(p => !p)}
                    className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span className={clsx(!reason && "text-gray-400")}>{reasonLabel}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  </button>
                  {reasonOpen && (
                    <div className="absolute left-0 top-full mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-30 p-1.5">
                      {REASONS.map(r => (
                        <button
                          key={r.value}
                          onClick={() => { setReason(r.value); setReasonOpen(false); }}
                          className={clsx(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors",
                            reason === r.value ? "bg-indigo-50 text-indigo-600" : "text-gray-700 hover:bg-gray-50"
                          )}
                        >
                          {r.label}
                          {reason === r.value && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Direction toggle */}
                <div className="flex rounded-xl border border-gray-200 overflow-hidden shrink-0">
                  {(["IN", "OUT"] as const).map(d => (
                    <button
                      key={d}
                      onClick={() => setDirection(d)}
                      className={clsx(
                        "px-5 py-2.5 text-[13px] font-bold transition-colors",
                        direction === d
                          ? d === "IN" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                          : "bg-white text-gray-500 hover:bg-gray-50"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                {/* Enroll button */}
                {submitState === "success" ? (
                  <button
                    disabled
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-500 text-white rounded-xl text-[13px] font-bold shrink-0 cursor-default"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Enrolled
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!reason || submitState === "loading" || !student.is_active}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0f172a] hover:bg-[#1e293b] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-[13px] font-bold transition-colors shrink-0"
                  >
                    {submitState === "loading" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                    {submitState === "loading" ? "Enrolling…" : `Enroll ${direction}`}
                  </button>
                )}
              </div>

              {submitState === "error" && submitError && (
                <div className="flex items-center gap-2 mt-3 text-red-500 text-[12px] font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {submitError}
                </div>
              )}
              {submitState === "success" && (
                <p className="text-[12px] text-green-600 font-medium mt-2">
                  Attendance marked successfully — resetting in 3 seconds…
                </p>
              )}
              {!student.is_active && submitState !== "success" && (
                <p className="text-[12px] text-red-500 font-medium mt-2">
                  This student account is inactive — attendance cannot be recorded.
                </p>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
