"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import clsx from "clsx";
import {
  Plus,
  Trash2,
  Pencil,
  Save,
  Send,
  RotateCcw,
  Loader2,
  X,
  Check,
  Calendar,
  BookOpen,
  Users,
} from "lucide-react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { TabSelectorV2 } from "@/shared/components/ui/TabSelectorV2";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getClassStudents, StudentRecord } from "@/features/school/lib/school-api";
import {
  Term,
  ResultSet,
  getTerms,
  createTerm,
  renameTerm,
  deleteTerm,
  getOrCreateResultSet,
  saveResultSet,
  publishResultSet,
  unpublishResultSet,
} from "@/features/results/lib/results-api";

// ── Helpers ──────────────────────────────────────────────────────────────────

function toLetterGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 75) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 35) return "D";
  return "F";
}

function letterColor(letter: string) {
  return {
    A: "bg-green-100 text-green-700",
    B: "bg-blue-100 text-blue-700",
    C: "bg-amber-100 text-amber-700",
    D: "bg-orange-100 text-orange-700",
    F: "bg-red-100 text-red-700",
  }[letter] ?? "bg-gray-100 text-gray-600";
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TeacherResultsPage() {
  const { user } = useAuth();
  const classes = useMemo(() => user?.classes_taught ?? [], [user?.classes_taught]);

  // ── Step 1: Terms ──────────────────────────────────────────────────────────
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [showNewTermInput, setShowNewTermInput] = useState(false);
  const [newTermLabel, setNewTermLabel] = useState("");
  const [renamingTermId, setRenamingTermId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [termsLoading, setTermsLoading] = useState(true);
  const [termError, setTermError] = useState<string | null>(null);

  // ── Step 2: Class + Modules ────────────────────────────────────────────────
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [resultSet, setResultSet] = useState<ResultSet | null>(null);
  const [modules, setModules] = useState<string[]>([]);
  const [newModule, setNewModule] = useState("");
  const [editingModuleIdx, setEditingModuleIdx] = useState<number | null>(null);
  const [editingModuleVal, setEditingModuleVal] = useState("");
  const [modulesSaved, setModulesSaved] = useState(false);
  const [savingModules, setSavingModules] = useState(false);
  const [rsLoading, setRsLoading] = useState(false);

  // ── Step 3: Students + Grades ──────────────────────────────────────────────
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({});
  const [publishing, setPublishing] = useState(false);

  // ── Grade dialog ───────────────────────────────────────────────────────────
  const [dialogStudent, setDialogStudent] = useState<StudentRecord | null>(null);
  const [dialogScores, setDialogScores] = useState<Record<string, number>>({});
  const [submittingGrades, setSubmittingGrades] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  // ── General error ──────────────────────────────────────────────────────────
  const [error, setError] = useState<string | null>(null);

  // ── Load terms on mount ────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await getTerms();
        setTerms(data);
        if (data.length > 0) setSelectedTermId(data[0].id);
      } catch (e: unknown) {
        setTermError(e instanceof Error ? e.message : "Failed to load terms");
      } finally {
        setTermsLoading(false);
      }
    })();
  }, []);

  // ── Auto-select first class ────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedClassId && classes.length > 0) {
      Promise.resolve().then(() => setSelectedClassId(classes[0].id));
    }
  }, [classes, selectedClassId]);

  // ── Load result set when class or term changes ─────────────────────────────
  const loadResultSet = useCallback(async (classId: string, termId: string) => {
    setRsLoading(true);
    setResultSet(null);
    setModules([]);
    setModulesSaved(false);
    setScores({});
    setError(null);
    try {
      const rs = await getOrCreateResultSet(classId, termId);
      setResultSet(rs);
      const modNames = rs.modules.map((m) => m.name);
      setModules(modNames);
      setModulesSaved(modNames.length > 0);

      // Rebuild scores from loaded grades
      const s: Record<string, Record<string, number>> = {};
      for (const g of rs.grades) {
        const mod = rs.modules.find((m) => m.id === g.module_id);
        if (!mod) continue;
        if (!s[g.student_id]) s[g.student_id] = {};
        s[g.student_id][mod.name] = g.score;
      }
      setScores(s);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load result set");
    } finally {
      setRsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClassId && selectedTermId) {
      Promise.resolve().then(() => loadResultSet(selectedClassId, selectedTermId));
    }
  }, [selectedClassId, selectedTermId, loadResultSet]);

  // ── Load students when class changes ───────────────────────────────────────
  useEffect(() => {
    if (!selectedClassId) return;
    Promise.resolve().then(() => setStudentsLoading(true));
    getClassStudents(selectedClassId).then((res) => {
      if (res.ok) setStudents(res.data);
      setStudentsLoading(false);
    });
  }, [selectedClassId]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const selectedTerm = terms.find((t) => t.id === selectedTermId) ?? null;
  const isPublished = resultSet?.status === "published";

  const visibleStudents = useMemo(
    () =>
      students.filter(
        (s) =>
          s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
          s.student_id_no.toLowerCase().includes(studentSearch.toLowerCase())
      ),
    [students, studentSearch]
  );

  function studentHasGrades(studentId: string) {
    const m = scores[studentId];
    return m && modules.some((mod) => typeof m[mod] === "number" && m[mod] > 0);
  }

  // ── Term handlers ──────────────────────────────────────────────────────────
  async function handleCreateTerm() {
    const label = newTermLabel.trim();
    if (!label) return;
    try {
      const created = await createTerm(label);
      setTerms((prev) => [created, ...prev]);
      setSelectedTermId(created.id);
      setNewTermLabel("");
      setShowNewTermInput(false);
    } catch (e: unknown) {
      setTermError(e instanceof Error ? e.message : "Failed to create term");
    }
  }

  async function handleRenameTerm() {
    if (!renamingTermId) return;
    const label = renameValue.trim();
    if (!label) return;
    try {
      const updated = await renameTerm(renamingTermId, label);
      setTerms((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setRenamingTermId(null);
      setRenameValue("");
    } catch (e: unknown) {
      setTermError(e instanceof Error ? e.message : "Failed to rename term");
    }
  }

  async function handleDeleteTerm(termId: string) {
    try {
      await deleteTerm(termId);
      const remaining = terms.filter((t) => t.id !== termId);
      setTerms(remaining);
      if (selectedTermId === termId) {
        setSelectedTermId(remaining[0]?.id ?? null);
      }
    } catch (e: unknown) {
      setTermError(e instanceof Error ? e.message : "Failed to delete term");
    }
  }

  // ── Module handlers ────────────────────────────────────────────────────────
  function handleAddModule() {
    const trimmed = newModule.trim();
    if (!trimmed) return;
    if (modules.some((m) => m.toLowerCase() === trimmed.toLowerCase())) return;
    setModules((prev) => [...prev, trimmed]);
    setNewModule("");
    setModulesSaved(false);
  }

  function handleDeleteModule(index: number) {
    const name = modules[index];
    setModules((prev) => prev.filter((_, i) => i !== index));
    setScores((prev) => {
      const next = { ...prev };
      for (const sid of Object.keys(next)) {
        const m = { ...next[sid] };
        delete m[name];
        next[sid] = m;
      }
      return next;
    });
    setModulesSaved(false);
  }

  function handleStartEditModule(index: number) {
    setEditingModuleIdx(index);
    setEditingModuleVal(modules[index]);
  }

  function handleSaveEditModule() {
    if (editingModuleIdx === null) return;
    const trimmed = editingModuleVal.trim();
    if (!trimmed) return;
    const old = modules[editingModuleIdx];
    setModules((prev) => { const n = [...prev]; n[editingModuleIdx] = trimmed; return n; });
    setScores((prev) => {
      const next = { ...prev };
      for (const sid of Object.keys(next)) {
        const m = { ...next[sid] };
        if (Object.prototype.hasOwnProperty.call(m, old)) { m[trimmed] = m[old]; delete m[old]; }
        next[sid] = m;
      }
      return next;
    });
    setEditingModuleIdx(null);
    setEditingModuleVal("");
    setModulesSaved(false);
  }

  async function handleSaveModules() {
    if (!resultSet) return;
    setSavingModules(true);
    setError(null);
    try {
      // Build full grades payload from current scores
      const gradesList: { student_id: string; module_name: string; score: number }[] = [];
      for (const [sid, modMap] of Object.entries(scores)) {
        for (const [modName, score] of Object.entries(modMap)) {
          if (modules.includes(modName)) gradesList.push({ student_id: sid, module_name: modName, score });
        }
      }
      const updated = await saveResultSet(resultSet.id, {
        modules: modules.map((name, i) => ({ name, order_index: i })),
        grades: gradesList,
      });
      setResultSet(updated);
      setModulesSaved(updated.modules.length > 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save modules");
    } finally {
      setSavingModules(false);
    }
  }

  // ── Grade dialog handlers ──────────────────────────────────────────────────
  function openDialog(student: StudentRecord) {
    setDialogStudent(student);
    setDialogScores({ ...(scores[student.id] ?? {}) });
    setDialogError(null);
  }

  function closeDialog() {
    setDialogStudent(null);
    setDialogScores({});
    setDialogError(null);
  }

  async function handleSubmitGrades() {
    if (!resultSet || !dialogStudent) return;
    setSubmittingGrades(true);
    setDialogError(null);
    try {
      // Merge dialog scores into full scores state
      const mergedScores = { ...scores, [dialogStudent.id]: { ...(scores[dialogStudent.id] ?? {}), ...dialogScores } };

      const gradesList: { student_id: string; module_name: string; score: number }[] = [];
      for (const [sid, modMap] of Object.entries(mergedScores)) {
        for (const [modName, score] of Object.entries(modMap)) {
          if (modules.includes(modName)) gradesList.push({ student_id: sid, module_name: modName, score });
        }
      }

      const updated = await saveResultSet(resultSet.id, {
        modules: modules.map((name, i) => ({ name, order_index: i })),
        grades: gradesList,
      });

      setResultSet(updated);
      setScores(mergedScores);
      closeDialog();
    } catch (e: unknown) {
      setDialogError(e instanceof Error ? e.message : "Failed to submit grades");
    } finally {
      setSubmittingGrades(false);
    }
  }

  // ── Publish handlers ───────────────────────────────────────────────────────
  async function handlePublish() {
    if (!resultSet) return;
    setPublishing(true);
    setError(null);
    try {
      const updated = await publishResultSet(resultSet.id);
      setResultSet(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to publish");
    } finally {
      setPublishing(false);
    }
  }

  async function handleUnpublish() {
    if (!resultSet) return;
    setPublishing(true);
    setError(null);
    try {
      const updated = await unpublishResultSet(resultSet.id);
      setResultSet(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to unpublish");
    } finally {
      setPublishing(false);
    }
  }

  // ── Render: Grade dialog ───────────────────────────────────────────────────
  function renderGradeDialog() {
    if (!dialogStudent) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">{dialogStudent.full_name}</h2>
              <p className="text-[12px] text-[#64748b]">
                {selectedTerm?.label ?? "—"} · {dialogStudent.student_id_no}
              </p>
            </div>
            <button type="button" onClick={closeDialog} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {modules.length === 0 ? (
              <p className="text-[13px] text-[#64748b]">No modules defined yet.</p>
            ) : (
              modules.map((mod) => {
                const score = dialogScores[mod] ?? 0;
                const letter = toLetterGrade(score);
                return (
                  <div key={mod} className="flex items-center gap-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3">
                    <span className="flex-1 text-[13px] font-semibold text-[#0f172a]">{mod}</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={score}
                      disabled={isPublished}
                      onChange={(e) => {
                        const raw = Number(e.target.value);
                        const safe = Number.isNaN(raw) ? 0 : Math.max(0, Math.min(100, raw));
                        setDialogScores((prev) => ({ ...prev, [mod]: safe }));
                      }}
                      className="w-20 rounded-lg border border-gray-200 px-3 py-1.5 text-[13px] text-center outline-none focus:border-indigo-400 disabled:bg-gray-100"
                    />
                    <span className="text-[11px] text-[#64748b]">/ 100</span>
                    <span className={clsx("inline-flex min-w-[28px] items-center justify-center rounded-md px-2 py-1 text-[11px] font-bold", letterColor(letter))}>
                      {letter}
                    </span>
                  </div>
                );
              })
            )}
            {dialogError && (
              <p className="text-[12px] text-red-600 mt-2">{dialogError}</p>
            )}
            {isPublished && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-700">
                Results are published. Unpublish to edit grades.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
            <button type="button" onClick={closeDialog} className="px-4 py-2 text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-lg text-[13px] font-medium transition-colors">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitGrades}
              disabled={submittingGrades || isPublished}
              className="min-w-[110px] px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#4f46e5] text-white hover:bg-[#4338ca] disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {submittingGrades ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Check className="h-4 w-4" /> Submit</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Step 1 — Term ─────────────────────────────────────────────────
  function renderTermSection() {
    return (
      <div className="rounded-[24px] border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#4f46e5]" />
          <h2 className="text-[15px] font-bold text-[#0f172a]">Step 1 — Select Term</h2>
        </div>
        <p className="mb-4 text-[12px] text-[#64748b]">Terms are school-wide. Select one to start entering results, or create a new term.</p>

        {termsLoading ? (
          <div className="flex items-center gap-2 text-[13px] text-[#64748b]"><Loader2 className="h-4 w-4 animate-spin" /> Loading terms...</div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {terms.map((term) => (
              <div key={term.id} className="flex items-center gap-1">
                {renamingTermId === term.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleRenameTerm()}
                      className="rounded-lg border border-indigo-300 px-3 py-1.5 text-[13px] outline-none"
                    />
                    <button type="button" onClick={handleRenameTerm} className="rounded-lg bg-indigo-50 border border-indigo-200 px-2 py-1.5 text-[12px] font-bold text-indigo-700">Save</button>
                    <button type="button" onClick={() => setRenamingTermId(null)} className="rounded-lg bg-gray-50 border border-gray-200 px-2 py-1.5 text-[12px] text-gray-500">Cancel</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectedTermId(term.id)}
                    className={clsx(
                      "rounded-xl border px-4 py-2 text-[13px] font-semibold transition-colors",
                      term.id === selectedTermId
                        ? "border-[#4f46e5] bg-[#4f46e5] text-white"
                        : "border-gray-200 bg-white text-[#334155] hover:bg-gray-50"
                    )}
                  >
                    {term.label}
                  </button>
                )}

                {term.id === selectedTermId && renamingTermId !== term.id && (
                  <div className="flex items-center gap-1 ml-1">
                    <button
                      type="button"
                      onClick={() => { setRenamingTermId(term.id); setRenameValue(term.label); }}
                      className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 hover:text-indigo-600 hover:border-indigo-200"
                      title="Rename term"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTerm(term.id)}
                      className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 hover:text-red-600 hover:border-red-200"
                      title="Delete term"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {showNewTermInput ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={newTermLabel}
                  onChange={(e) => setNewTermLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateTerm()}
                  placeholder="e.g. Term 1 - 2026"
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-[13px] outline-none focus:border-indigo-400"
                />
                <button type="button" onClick={handleCreateTerm} className="rounded-lg bg-[#4f46e5] px-3 py-1.5 text-[12px] font-bold text-white hover:bg-[#4338ca]">Create</button>
                <button type="button" onClick={() => { setShowNewTermInput(false); setNewTermLabel(""); }} className="rounded-lg border border-gray-200 px-3 py-1.5 text-[12px] text-gray-500 hover:bg-gray-50">Cancel</button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowNewTermInput(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-4 py-2 text-[13px] font-semibold text-[#64748b] hover:border-indigo-300 hover:text-indigo-600 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                New Term
              </button>
            )}
          </div>
        )}

        {termError && <p className="mt-3 text-[12px] text-red-600">{termError}</p>}
      </div>
    );
  }

  // ── Render: Step 2 — Class + Modules ──────────────────────────────────────
  function renderModulesSection() {
    if (!selectedTermId) return null;

    return (
      <div className="rounded-[24px] border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[#4f46e5]" />
          <h2 className="text-[15px] font-bold text-[#0f172a]">Step 2 — Class &amp; Modules</h2>
        </div>

        {classes.length === 0 ? (
          <p className="text-[13px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">You are not assigned to any classes yet.</p>
        ) : (
          <>
            <TabSelectorV2
              activeTab={selectedClassId}
              onTabChange={setSelectedClassId}
              options={classes.map((c) => ({
                id: c.id,
                label: c.school_grade ? `${c.school_grade.name}-${c.name}` : c.name,
              }))}
            />

            <div className="mt-5">
              {rsLoading ? (
                <div className="flex items-center gap-2 py-6 text-[13px] text-[#64748b]"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
              ) : (
                <>
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      value={newModule}
                      onChange={(e) => setNewModule(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddModule()}
                      placeholder="Add module (e.g. Mathematics)"
                      className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-[13px] outline-none focus:border-indigo-400"
                    />
                    <button type="button" onClick={handleAddModule} className="inline-flex items-center gap-2 rounded-lg bg-[#4f46e5] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#4338ca]">
                      <Plus className="h-4 w-4" /> Add
                    </button>
                  </div>

                  {modules.length === 0 ? (
                    <p className="text-[13px] text-[#64748b]">No modules yet. Add at least one to enable grade entry.</p>
                  ) : (
                    <div className="space-y-2 mb-4">
                      {modules.map((name, index) => (
                        <div key={`${name}-${index}`} className="flex items-center justify-between rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3">
                          {editingModuleIdx === index ? (
                            <input
                              autoFocus
                              type="text"
                              value={editingModuleVal}
                              onChange={(e) => setEditingModuleVal(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleSaveEditModule()}
                              className="flex-1 rounded-md border border-gray-200 px-3 py-1.5 text-[13px] outline-none"
                            />
                          ) : (
                            <span className="text-[13px] font-semibold text-[#0f172a]">{name}</span>
                          )}
                          <div className="ml-3 flex items-center gap-2">
                            {editingModuleIdx === index ? (
                              <button type="button" onClick={handleSaveEditModule} className="rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-[12px] font-bold text-green-700">Save</button>
                            ) : (
                              <button type="button" onClick={() => handleStartEditModule(index)} className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-[12px] font-bold text-gray-700 hover:bg-gray-50">
                                <Pencil className="h-3 w-3" /> Edit
                              </button>
                            )}
                            <button type="button" onClick={() => handleDeleteModule(index)} className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-[12px] font-bold text-red-700 hover:bg-red-100">
                              <Trash2 className="h-3 w-3" /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSaveModules}
                      disabled={savingModules || modules.length === 0}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#4f46e5] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#4338ca] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {savingModules ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Modules
                    </button>
                    {modulesSaved && (
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-green-700">
                        <Check className="h-3.5 w-3.5" /> Saved
                      </span>
                    )}
                  </div>

                  {error && <p className="mt-3 text-[12px] text-red-600">{error}</p>}
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Render: Step 3 — Student grades ───────────────────────────────────────
  function renderStudentsSection() {
    if (!selectedTermId || !modulesSaved) {
      if (selectedTermId && !modulesSaved && modules.length > 0) {
        return (
          <div className="rounded-[24px] border border-dashed border-amber-300 bg-amber-50 px-6 py-5 text-[13px] text-amber-700">
            Save your modules above to unlock grade entry for students.
          </div>
        );
      }
      return null;
    }

    return (
      <div className="rounded-[24px] border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        {/* Header row */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#4f46e5]" />
            <h2 className="text-[15px] font-bold text-[#0f172a]">Step 3 — Enter Student Grades</h2>
          </div>

          <div className="flex items-center gap-2">
            {isPublished ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-[11px] font-bold text-green-700">Published</span>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-700">Draft</span>
            )}
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing || isPublished}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#4f46e5] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#4338ca] disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {publishing && !isPublished ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Publish
            </button>
            <button
              type="button"
              onClick={handleUnpublish}
              disabled={publishing || !isPublished}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-[12px] font-bold text-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Unpublish
            </button>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          value={studentSearch}
          onChange={(e) => setStudentSearch(e.target.value)}
          placeholder="Search by name or student ID"
          className="mb-4 w-full rounded-lg border border-gray-200 px-4 py-2 text-[13px] outline-none focus:border-indigo-400"
        />

        {/* Student table */}
        {studentsLoading ? (
          <div className="flex items-center gap-2 py-8 text-[13px] text-[#64748b]"><Loader2 className="h-4 w-4 animate-spin" /> Loading students...</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#e2e8f0]">
            <table className="w-full min-w-[560px] text-left text-[13px]">
              <thead className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[#475569]">
                <tr>
                  <th className="px-4 py-3 font-bold">Student</th>
                  <th className="px-4 py-3 font-bold">ID</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleStudents.map((student) => {
                  const hasGrades = studentHasGrades(student.id);
                  return (
                    <tr key={student.id} className="border-b border-gray-100 hover:bg-[#fafbff] transition-colors">
                      <td className="px-4 py-3 font-semibold text-[#0f172a]">{student.full_name}</td>
                      <td className="px-4 py-3 text-[#475569]">{student.student_id_no}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold">
                          <span className={clsx("h-2 w-2 rounded-full", hasGrades ? "bg-green-500" : "bg-gray-300")} />
                          {hasGrades ? "Grades set" : "Not entered"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => openDialog(student)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[12px] font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Enter Grades
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {visibleStudents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-[#64748b]">
                      {students.length === 0 ? "No students enrolled in this class." : "No students match your search."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="flex w-full flex-col gap-5 pb-12 pr-2">
      <PageHeader title="Results" subtitle="Enter and publish student results by term and class." />

      {renderTermSection()}
      {renderModulesSection()}
      {renderStudentsSection()}

      {renderGradeDialog()}
    </div>
  );
}
