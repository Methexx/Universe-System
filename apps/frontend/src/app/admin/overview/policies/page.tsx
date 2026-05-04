"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit2,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  createClass,
  createGrade,
  deleteClass,
  deleteGrade,
  getGradesWithClasses,
  getTeachers,
  updateClass,
  type ClassItem,
  type GradeWithClasses,
  type TeacherInfo,
} from "@/features/school/lib/school-api";
import {
  listDocuments,
  uploadDocument,
  deleteDocument,
  type PolicyDocument,
} from "@/features/rag/lib/rag-api";

// ─── Types ───────────────────────────────────────────────────────────────────

type ModalState =
  | { type: "none" }
  | { type: "createGrade" }
  | { type: "createClass"; gradeId: string; gradeName: string }
  | { type: "assignTeacher"; classId: string; className: string; gradeName: string; currentTeacherId: string | null };

// ─── Small reusable modal shell ──────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-[15px] font-bold text-[#0f172a]">{title}</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748b] hover:bg-gray-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Create Grade Modal ───────────────────────────────────────────────────────

function CreateGradeModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (grade: GradeWithClasses) => void;
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Grade name is required"); return; }
    setLoading(true);
    setError("");
    const res = await createGrade(name.trim());
    setLoading(false);
    if (!res.ok) { setError(res.error); return; }
    onCreated({ id: res.data.id, name: res.data.name, classes: [] });
  }

  return (
    <Modal title="Add New Grade" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-[12px] font-bold text-[#64748b]">Grade Name</label>
            <input
              type="text"
              placeholder="e.g. Grade 10 or 10"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-[13px] font-semibold text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            {error && <p className="mt-1.5 text-[12px] font-semibold text-red-500">{error}</p>}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-[13px] font-semibold text-[#64748b] hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-lg bg-[#3b82f6] px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Create Grade
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Create Class Modal ───────────────────────────────────────────────────────

function CreateClassModal({
  gradeId,
  gradeName,
  onClose,
  onCreated,
}: {
  gradeId: string;
  gradeName: string;
  onClose: () => void;
  onCreated: (cls: ClassItem) => void;
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Class name is required"); return; }
    setLoading(true);
    setError("");
    const res = await createClass({ school_grade_id: gradeId, name: name.trim() });
    setLoading(false);
    if (!res.ok) { setError(res.error); return; }
    onCreated({ id: res.data.id, name: res.data.name, teacher: res.data.teacher ?? null });
  }

  return (
    <Modal title={`Add Class to ${gradeName}`} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="p-6 flex flex-col gap-4">
          <p className="text-[12px] font-semibold text-[#64748b]">
            The class will be referenced as <span className="font-bold text-[#0f172a]">{gradeName}-{name || "?"}</span>
          </p>
          <div>
            <label className="mb-1.5 block text-[12px] font-bold text-[#64748b]">Class Name</label>
            <input
              type="text"
              placeholder="e.g. A, B, C"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-[13px] font-semibold text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            {error && <p className="mt-1.5 text-[12px] font-semibold text-red-500">{error}</p>}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-[13px] font-semibold text-[#64748b] hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-lg bg-[#3b82f6] px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Create & Assign Teacher
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Assign Teacher Modal ─────────────────────────────────────────────────────

function AssignTeacherModal({
  classId,
  className,
  gradeName,
  currentTeacherId,
  teachers,
  onClose,
  onAssigned,
}: {
  classId: string;
  className: string;
  gradeName: string;
  currentTeacherId: string | null;
  teachers: TeacherInfo[];
  onClose: () => void;
  onAssigned: (classId: string, teacher: TeacherInfo | null) => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(currentTeacherId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filtered = teachers.filter((t) => {
    const q = search.toLowerCase();
    return (
      (t.full_name ?? "").toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      (t.user_id_no ?? "").toLowerCase().includes(q)
    );
  });

  async function handleSave() {
    setLoading(true);
    setError("");
    const res = await updateClass(classId, { teacher_id: selectedId });
    setLoading(false);
    if (!res.ok) { setError(res.error); return; }
    const teacher = selectedId ? teachers.find((t) => t.id === selectedId) ?? null : null;
    onAssigned(classId, teacher);
  }

  return (
    <Modal title={`Assign Teacher — ${gradeName}-${className}`} onClose={onClose}>
      <div className="p-6 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-[13px] font-semibold text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100">
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${selectedId === null ? "bg-blue-50" : ""}`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-[11px] font-bold text-gray-500">—</div>
            <div>
              <p className="text-[13px] font-bold text-[#64748b]">No Teacher</p>
              <p className="text-[11px] font-semibold text-gray-400">Leave unassigned</p>
            </div>
            {selectedId === null && <div className="ml-auto h-4 w-4 rounded-full bg-[#3b82f6]" />}
          </button>

          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-[13px] font-semibold text-gray-400">No teachers found</div>
          ) : (
            filtered.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedId(t.id)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${selectedId === t.id ? "bg-blue-50" : ""}`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-[11px] font-bold text-[#3b82f6]">
                  {(t.full_name ?? t.email).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-[#0f172a]">{t.full_name ?? "—"}</p>
                  <p className="truncate text-[11px] font-semibold text-gray-400">{t.email} {t.user_id_no ? `· ${t.user_id_no}` : ""}</p>
                </div>
                {selectedId === t.id && <div className="ml-auto h-4 w-4 shrink-0 rounded-full bg-[#3b82f6]" />}
              </button>
            ))
          )}
        </div>

        {error && <p className="text-[12px] font-semibold text-red-500">{error}</p>}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
        <button type="button" onClick={onClose} className="text-[13px] font-semibold text-[#64748b] hover:text-gray-900 transition-colors">
          Skip for now
        </button>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-[13px] font-semibold text-[#64748b] hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-[#3b82f6] px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Confirm Assignment
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Grade Card ───────────────────────────────────────────────────────────────

function GradeCard({
  grade,
  onDeleteGrade,
  onAddClass,
  onDeleteClass,
  onAssignTeacher,
  deletingGradeId,
  deletingClassId,
}: {
  grade: GradeWithClasses;
  onDeleteGrade: (id: string) => void;
  onAddClass: (gradeId: string, gradeName: string) => void;
  onDeleteClass: (gradeId: string, classId: string) => void;
  onAssignTeacher: (gradeId: string, classId: string, className: string, currentTeacherId: string | null) => void;
  deletingGradeId: string | null;
  deletingClassId: string | null;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Grade header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 text-left"
        >
          {expanded
            ? <ChevronUp className="h-4 w-4 text-[#64748b]" strokeWidth={2.5} />
            : <ChevronDown className="h-4 w-4 text-[#64748b]" strokeWidth={2.5} />}
          <span className="text-[15px] font-bold text-[#0f172a]">{grade.name}</span>
          <span className="rounded-md bg-[#eff6ff] px-2 py-0.5 text-[11px] font-bold text-[#3b82f6]">
            {grade.classes.length} {grade.classes.length === 1 ? "class" : "classes"}
          </span>
        </button>
        <button
          onClick={() => onDeleteGrade(grade.id)}
          disabled={deletingGradeId === grade.id}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fef2f2] text-[#ef4444] transition-colors hover:bg-red-100 disabled:opacity-50"
        >
          {deletingGradeId === grade.id
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <Trash2 className="h-[14px] w-[14px]" strokeWidth={2.5} />}
        </button>
      </div>

      {/* Classes table */}
      {expanded && (
        <div>
          {grade.classes.length === 0 ? (
            <div className="px-6 py-8 text-center text-[13px] font-semibold text-gray-400">
              No classes yet. Add one below.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc] border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-[12px] font-bold text-[#64748b]">Class</th>
                  <th className="px-6 py-3 text-[12px] font-bold text-[#64748b]">Full Reference</th>
                  <th className="px-6 py-3 text-[12px] font-bold text-[#64748b]">Assigned Teacher</th>
                  <th className="px-6 py-3 text-[12px] font-bold text-[#64748b]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {grade.classes.map((cls) => (
                  <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-[13px] font-bold text-[#0f172a]">{cls.name}</td>
                    <td className="px-6 py-4 text-[13px] font-semibold text-[#475569]">
                      {grade.name}-{cls.name}
                    </td>
                    <td className="px-6 py-4">
                      {cls.teacher ? (
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#dbeafe] text-[10px] font-bold text-[#3b82f6]">
                            {(cls.teacher.full_name ?? cls.teacher.email).charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[13px] font-semibold text-[#0f172a]">
                            {cls.teacher.full_name ?? cls.teacher.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[13px] font-semibold text-gray-400">— Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onAssignTeacher(grade.id, cls.id, cls.name, cls.teacher?.id ?? null)}
                          className="flex items-center gap-1.5 rounded-lg border border-[#3b82f6] px-3 py-1.5 text-[12px] font-bold text-[#3b82f6] transition-colors hover:bg-blue-50"
                        >
                          <Edit2 className="h-3 w-3" />
                          {cls.teacher ? "Change" : "Assign"}
                        </button>
                        <button
                          onClick={() => onDeleteClass(grade.id, cls.id)}
                          disabled={deletingClassId === cls.id}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-[#ef4444] transition-colors hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingClassId === cls.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Add class button */}
          <div className="border-t border-gray-100 px-6 py-3">
            <button
              onClick={() => onAddClass(grade.id, grade.name)}
              className="flex items-center gap-2 text-[13px] font-bold text-[#3b82f6] hover:text-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Add Class to {grade.name}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PoliciesPage() {
  // Document library state
  const [documents, setDocuments] = useState<PolicyDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [docsError, setDocsError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [docSearch, setDocSearch] = useState("");
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = useCallback(async () => {
    setDocsLoading(true);
    setDocsError("");
    const res = await listDocuments();
    setDocsLoading(false);
    if (!res.ok) { setDocsError(res.error); return; }
    setDocuments(res.data);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);
    const res = await uploadDocument(file);
    setUploading(false);
    if (!res.ok) { alert(res.error); return; }
    // Add optimistic row — will show as processing until page refresh
    setDocuments((prev) => [
      { id: res.data.id, file_name: file.name, display_name: res.data.display_name, is_processed: false, chunk_count: 0, created_at: new Date().toISOString() },
      ...prev,
    ]);
    // Poll once after 5s to update processed status
    setTimeout(() => loadDocuments(), 5000);
  }

  async function handleDeleteDoc(id: string, displayName: string) {
    if (!window.confirm(`Delete "${displayName}"? This will remove all associated chunks.`)) return;
    setDeletingDocId(id);
    const res = await deleteDocument(id);
    setDeletingDocId(null);
    if (!res.ok) { alert(res.error); return; }
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }

  const filteredDocs = documents.filter((d) =>
    d.display_name.toLowerCase().includes(docSearch.toLowerCase())
  );

  // Grades & classes state
  const [grades, setGrades] = useState<GradeWithClasses[]>([]);
  const [teachers, setTeachers] = useState<TeacherInfo[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState("");
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [deletingGradeId, setDeletingGradeId] = useState<string | null>(null);
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);

  // Pending class for teacher assignment after creation
  const pendingClassRef = useRef<{ gradeId: string; cls: ClassItem } | null>(null);

  const loadData = useCallback(async () => {
    setLoadingData(true);
    setDataError("");
    const [gradesRes, teachersRes] = await Promise.all([getGradesWithClasses(), getTeachers()]);
    setLoadingData(false);
    if (!gradesRes.ok) { setDataError(gradesRes.error); return; }
    if (!teachersRes.ok) { setDataError(teachersRes.error); return; }
    setGrades(gradesRes.data);
    setTeachers(teachersRes.data);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  // ── Grade handlers ──────────────────────────────────────────────────────────

  function handleGradeCreated(grade: GradeWithClasses) {
    setGrades((prev) => [...prev, grade].sort((a, b) => a.name.localeCompare(b.name)));
    setModal({ type: "none" });
  }

  async function handleDeleteGrade(id: string) {
    const grade = grades.find((g) => g.id === id);
    if (!grade) return;
    const classCount = grade.classes.length;
    const msg = classCount > 0
      ? `Delete "${grade.name}" and all ${classCount} class${classCount > 1 ? "es" : ""} inside it? This cannot be undone.`
      : `Delete grade "${grade.name}"? This cannot be undone.`;
    if (!window.confirm(msg)) return;

    setDeletingGradeId(id);
    const res = await deleteGrade(id);
    setDeletingGradeId(null);
    if (!res.ok) { alert(res.error); return; }
    setGrades((prev) => prev.filter((g) => g.id !== id));
  }

  // ── Class handlers ──────────────────────────────────────────────────────────

  function handleClassCreated(gradeId: string, cls: ClassItem) {
    setGrades((prev) =>
      prev.map((g) =>
        g.id === gradeId ? { ...g, classes: [...g.classes, cls].sort((a, b) => a.name.localeCompare(b.name)) } : g
      )
    );
    pendingClassRef.current = { gradeId, cls };
    const grade = grades.find((g) => g.id === gradeId);
    setModal({
      type: "assignTeacher",
      classId: cls.id,
      className: cls.name,
      gradeName: grade?.name ?? "",
      currentTeacherId: null,
    });
  }

  async function handleDeleteClass(gradeId: string, classId: string) {
    const grade = grades.find((g) => g.id === gradeId);
    const cls = grade?.classes.find((c) => c.id === classId);
    if (!cls) return;
    if (!window.confirm(`Delete class "${grade?.name}-${cls.name}"? This cannot be undone.`)) return;

    setDeletingClassId(classId);
    const res = await deleteClass(classId);
    setDeletingClassId(null);
    if (!res.ok) { alert(res.error); return; }
    setGrades((prev) =>
      prev.map((g) =>
        g.id === gradeId ? { ...g, classes: g.classes.filter((c) => c.id !== classId) } : g
      )
    );
  }

  function handleTeacherAssigned(classId: string, teacher: TeacherInfo | null) {
    setGrades((prev) =>
      prev.map((g) => ({
        ...g,
        classes: g.classes.map((c) =>
          c.id === classId ? { ...c, teacher: teacher ?? null } : c
        ),
      }))
    );
    setModal({ type: "none" });
    pendingClassRef.current = null;
  }

  return (
    <div className="flex flex-col gap-10 pb-12 w-full pr-4">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-2 -mt-4">
        <h1 className="text-[24px] font-bold text-[#0f172a]">Policies Management</h1>
        <p className="text-[14px] font-semibold text-[#64748b]">Manage school documents and Policies</p>
      </div>

      {/* ── Document Library ── */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-[#0f172a]">Document Library</h2>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 shadow-sm disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" strokeWidth={3} />}
            {uploading ? "Uploading…" : "Upload Documents"}
          </button>
          <input ref={fileInputRef} type="file" accept=".pdf,.txt" className="hidden" onChange={handleUpload} />
        </div>

        <div className="relative w-full max-w-[320px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Documents by name"
            value={docSearch}
            onChange={(e) => setDocSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-[13px] font-semibold text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          {docsLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-[13px] font-semibold text-[#64748b]">
              <Loader2 className="h-5 w-5 animate-spin text-[#3b82f6]" />
              Loading documents…
            </div>
          ) : docsError ? (
            <div className="px-6 py-4 text-[13px] font-semibold text-red-500">
              Failed to load: {docsError}
              <button onClick={loadDocuments} className="ml-3 underline">Retry</button>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14 text-[13px] font-semibold text-[#64748b]">
              <p className="font-bold text-[#0f172a]">{documents.length === 0 ? "No documents uploaded yet" : "No results"}</p>
              {documents.length === 0 && <p>Click &ldquo;Upload Documents&rdquo; to add a policy PDF</p>}
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-white border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-[13px] font-bold text-[#64748b]">Document</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-[#64748b]">Chunks</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-[#64748b]">Uploaded</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-[#64748b]">Status</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-[#64748b]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-[18px]">
                      <p className="text-[13px] font-bold text-[#0f172a]">{doc.display_name}</p>
                      <p className="text-[11px] font-semibold text-[#94a3b8]">{doc.file_name}</p>
                    </td>
                    <td className="px-6 py-[18px] text-[13px] font-semibold text-[#64748b]">
                      {doc.is_processed ? doc.chunk_count : "—"}
                    </td>
                    <td className="px-6 py-[18px] text-[13px] font-semibold text-[#64748b]">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-[18px]">
                      {doc.is_processed ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-[#16a34a]">
                          <CheckCircle className="h-3.5 w-3.5" /> Ready
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-[#d97706]">
                          <Clock className="h-3.5 w-3.5" /> Processing
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-[18px]">
                      <button
                        onClick={() => handleDeleteDoc(doc.id, doc.display_name)}
                        disabled={deletingDocId === doc.id}
                        className="flex h-8 w-8 items-center justify-center rounded-md bg-[#fef2f2] text-[#ef4444] hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        {deletingDocId === doc.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Term Management ── */}
      <div className="flex flex-col gap-6">
        <h2 className="text-[20px] font-bold text-[#0f172a]">Term Management</h2>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h3 className="text-[14px] font-bold text-[#0f172a]">Term 1</h3>
            <div className="flex items-center gap-2">
              <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fef2f2] text-[#ef4444] transition-colors hover:bg-red-100">
                <Trash2 className="h-[14px] w-[14px]" strokeWidth={2.5} />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f1f5f9] text-[#64748b] transition-colors hover:bg-gray-200 border border-gray-100">
                <ChevronUp className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <div>
              <p className="mb-4 text-[12px] font-bold text-[#94a3b8]">Time Period</p>
              <div className="flex items-center gap-4">
                <input type="text" placeholder="Start Date" className="rounded-lg border border-gray-200 px-4 py-2.5 text-[13px] font-semibold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 placeholder-gray-400 w-32" />
                <span className="text-[13px] font-semibold text-[#94a3b8]">To</span>
                <input type="text" placeholder="End Date" className="rounded-lg border border-gray-200 px-4 py-2.5 text-[13px] font-semibold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 placeholder-gray-400 w-32" />
              </div>
            </div>
            <div className="w-full">
              <input type="text" placeholder="Term Name" className="w-full max-w-[400px] rounded-lg border border-gray-200 px-4 py-2.5 text-[13px] font-semibold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 placeholder-gray-400 mt-2" />
            </div>
          </div>
        </div>

        <button className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3.5 text-[13px] font-bold text-[#64748b] hover:bg-gray-50 hover:text-gray-900 transition-colors bg-white">
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Add another Term
        </button>
      </div>

      {/* ── Grades & Classes ── */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-bold text-[#0f172a]">Grades &amp; Classes</h2>
            <p className="text-[13px] font-semibold text-[#64748b] mt-0.5">
              Create grades (sections) and assign classes with teachers
            </p>
          </div>
          <button
            onClick={() => setModal({ type: "createGrade" })}
            className="flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 shadow-sm"
          >
            <Plus className="h-4 w-4" strokeWidth={3} />
            Add Grade
          </button>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center gap-2 py-16 text-[13px] font-semibold text-[#64748b]">
            <Loader2 className="h-5 w-5 animate-spin text-[#3b82f6]" />
            Loading grades and classes…
          </div>
        ) : dataError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-[13px] font-semibold text-red-600">
            Failed to load: {dataError}
            <button onClick={loadData} className="ml-3 underline hover:no-underline">Retry</button>
          </div>
        ) : grades.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 py-16 bg-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eff6ff]">
              <Plus className="h-6 w-6 text-[#3b82f6]" />
            </div>
            <p className="text-[14px] font-bold text-[#0f172a]">No grades yet</p>
            <p className="text-[13px] font-semibold text-[#64748b]">Click &ldquo;Add Grade&rdquo; to create your first grade</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {grades.map((grade) => (
              <GradeCard
                key={grade.id}
                grade={grade}
                onDeleteGrade={handleDeleteGrade}
                onAddClass={(gradeId, gradeName) => setModal({ type: "createClass", gradeId, gradeName })}
                onDeleteClass={handleDeleteClass}
                onAssignTeacher={(gradeId, classId, className, currentTeacherId) => {
                  const grade = grades.find((g) => g.id === gradeId);
                  setModal({ type: "assignTeacher", classId, className, gradeName: grade?.name ?? "", currentTeacherId });
                }}
                deletingGradeId={deletingGradeId}
                deletingClassId={deletingClassId}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {modal.type === "createGrade" && (
        <CreateGradeModal onClose={() => setModal({ type: "none" })} onCreated={handleGradeCreated} />
      )}
      {modal.type === "createClass" && (
        <CreateClassModal
          gradeId={modal.gradeId}
          gradeName={modal.gradeName}
          onClose={() => setModal({ type: "none" })}
          onCreated={(cls) => handleClassCreated(modal.gradeId, cls)}
        />
      )}
      {modal.type === "assignTeacher" && (
        <AssignTeacherModal
          classId={modal.classId}
          className={modal.className}
          gradeName={modal.gradeName}
          currentTeacherId={modal.currentTeacherId}
          teachers={teachers}
          onClose={() => { setModal({ type: "none" }); pendingClassRef.current = null; }}
          onAssigned={handleTeacherAssigned}
        />
      )}
    </div>
  );
}
