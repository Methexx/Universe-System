"use client";

import React, { useMemo, useState } from "react";
import clsx from "clsx";
import { ChevronDown, ChevronRight, Lock, Plus, Trash2, Pencil, Save, Send, RotateCcw } from "lucide-react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { TabSelector } from "@/shared/components/ui/TabSelector";
import { FilterBar } from "@/shared/components/ui/FilterBar";

type GradesTab = "manage-modules" | "enter-grades";

type Term = {
  id: string;
  name: string;
  active: boolean;
  locked: boolean;
};

type Student = {
  id: string;
  name: string;
  className: "10-A" | "11-B";
};

type GradeLifecycle = "draft" | "published";

type HistoryItem = {
  className: string;
  termId: string;
  status: GradeLifecycle;
  publishedAt?: string;
};

const ADMIN_TERMS: Term[] = [
  { id: "term-1-2026", name: "Term 1 - 2026", active: false, locked: true },
  { id: "term-2-2026", name: "Term 2 - 2026", active: true, locked: false },
  { id: "term-3-2026", name: "Term 3 - 2026", active: false, locked: false },
];

const CLASSROOMS: Array<{ label: string; value: "10-A" | "11-B" }> = [
  { label: "10-A", value: "10-A" },
  { label: "11-B", value: "11-B" },
];

const STUDENTS: Student[] = [
  { id: "29854", name: "Amara Nkwonta", className: "10-A" },
  { id: "18392", name: "Ikenna Okoro", className: "10-A" },
  { id: "29855", name: "Ngozi Eze", className: "10-A" },
  { id: "40122", name: "Obinna Okafor", className: "11-B" },
  { id: "10293", name: "Adaobi Musa", className: "11-B" },
];

function toLetterGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  // A/B/C/D/F mapping for this UI based on common Sri Lankan-school style thresholds.
  if (score >= 75) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 35) return "D";
  return "F";
}

export default function TeacherGradesPage() {
  const activeDefaultTerm = ADMIN_TERMS.find((t) => t.active)?.id ?? ADMIN_TERMS[0].id;

  const [activeTab, setActiveTab] = useState<GradesTab>("manage-modules");

  const [selectedClass, setSelectedClass] = useState<"10-A" | "11-B">("10-A");
  const [selectedTermId, setSelectedTermId] = useState<string>(activeDefaultTerm);
  const [studentSearch, setStudentSearch] = useState("");

  const [modules, setModules] = useState<string[]>(["Science", "Maths", "English"]);
  const [newModule, setNewModule] = useState("");
  const [editingModuleIndex, setEditingModuleIndex] = useState<number | null>(null);
  const [editingModuleValue, setEditingModuleValue] = useState("");

  const [expandedStudentIds, setExpandedStudentIds] = useState<Record<string, boolean>>({});
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({});

  const [history, setHistory] = useState<HistoryItem[]>([
    {
      className: "10-A",
      termId: "term-1-2026",
      status: "published",
      publishedAt: "2026-01-22 10:30 AM",
    },
  ]);

  const selectedTerm = ADMIN_TERMS.find((t) => t.id === selectedTermId) ?? ADMIN_TERMS[0];
  const isLocked = selectedTerm.locked;

  const visibleStudents = useMemo(() => {
    return STUDENTS.filter((s) => {
      const matchesClass = s.className === selectedClass;
      const matchesSearch =
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.id.toLowerCase().includes(studentSearch.toLowerCase());
      return matchesClass && matchesSearch;
    });
  }, [selectedClass, studentSearch]);

  const currentHistoryItem = history.find(
    (h) => h.className === selectedClass && h.termId === selectedTermId
  );

  const draftOrPublished = currentHistoryItem?.status ?? null;

  const setStudentModuleScore = (studentId: string, moduleName: string, value: number) => {
    setScores((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] ?? {}),
        [moduleName]: value,
      },
    }));
  };

  const toggleStudentExpand = (studentId: string) => {
    setExpandedStudentIds((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const handleAddModule = () => {
    const trimmed = newModule.trim();
    if (!trimmed) return;
    if (modules.some((m) => m.toLowerCase() === trimmed.toLowerCase())) return;

    setModules((prev) => [...prev, trimmed]);
    setNewModule("");
  };

  const handleDeleteModule = (index: number) => {
    if (isLocked) return;

    const moduleToRemove = modules[index];
    setModules((prev) => prev.filter((_, i) => i !== index));

    setScores((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((studentId) => {
        const studentMap = { ...(next[studentId] ?? {}) };
        delete studentMap[moduleToRemove];
        next[studentId] = studentMap;
      });
      return next;
    });
  };

  const handleStartEditModule = (index: number) => {
    setEditingModuleIndex(index);
    setEditingModuleValue(modules[index]);
  };

  const handleSaveEditModule = () => {
    if (editingModuleIndex === null) return;

    const trimmed = editingModuleValue.trim();
    if (!trimmed) return;

    const oldName = modules[editingModuleIndex];

    setModules((prev) => {
      const next = [...prev];
      next[editingModuleIndex] = trimmed;
      return next;
    });

    setScores((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((studentId) => {
        const studentMap = { ...(next[studentId] ?? {}) };
        if (Object.prototype.hasOwnProperty.call(studentMap, oldName)) {
          studentMap[trimmed] = studentMap[oldName];
          delete studentMap[oldName];
        }
        next[studentId] = studentMap;
      });
      return next;
    });

    setEditingModuleIndex(null);
    setEditingModuleValue("");
  };

  const handleSaveDraft = () => {
    if (isLocked) return;

    setHistory((prev) => {
      const withoutCurrent = prev.filter(
        (h) => !(h.className === selectedClass && h.termId === selectedTermId)
      );
      return [...withoutCurrent, { className: selectedClass, termId: selectedTermId, status: "draft" }];
    });
  };

  const handlePublish = () => {
    if (isLocked) return;

    setHistory((prev) => {
      const withoutCurrent = prev.filter(
        (h) => !(h.className === selectedClass && h.termId === selectedTermId)
      );
      return [
        ...withoutCurrent,
        {
          className: selectedClass,
          termId: selectedTermId,
          status: "published",
          publishedAt: new Date().toLocaleString(),
        },
      ];
    });

    window.alert("Results published. Mock: FCM notification sent to all class parents.");
  };

  const handleUnpublish = () => {
    if (isLocked) return;

    setHistory((prev) => {
      const withoutCurrent = prev.filter(
        (h) => !(h.className === selectedClass && h.termId === selectedTermId)
      );
      return [...withoutCurrent, { className: selectedClass, termId: selectedTermId, status: "draft" }];
    });
  };

  const renderLockBadge = () => {
    if (!isLocked) return null;

    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-[#fecaca] bg-[#fef2f2] px-3 py-1 text-[12px] font-bold text-[#b91c1c]">
        <Lock className="h-3.5 w-3.5" />
        Term locked by Admin — no edits allowed
      </div>
    );
  };

  const renderManageModules = () => {
    return (
      <div className="rounded-[24px] border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[18px] font-bold text-[#0f172a]">Manage Modules</h3>
          {renderLockBadge()}
        </div>

        <p className="mb-4 text-[13px] text-[#64748b]">
          Create, edit, and remove your own subject modules for grade entry.
        </p>

        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            type="text"
            value={newModule}
            onChange={(e) => setNewModule(e.target.value)}
            placeholder="Add module name (e.g. History)"
            disabled={isLocked}
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-[14px] outline-none focus:border-indigo-400"
          />
          <button
            type="button"
            onClick={handleAddModule}
            disabled={isLocked}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <Plus className="h-4 w-4" />
            Add Module
          </button>
        </div>

        <div className="space-y-3">
          {modules.map((moduleName, index) => (
            <div
              key={`${moduleName}-${index}`}
              className="flex items-center justify-between rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3"
            >
              {editingModuleIndex === index ? (
                <input
                  type="text"
                  value={editingModuleValue}
                  onChange={(e) => setEditingModuleValue(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-[14px] outline-none"
                />
              ) : (
                <span className="text-[14px] font-bold text-[#0f172a]">{moduleName}</span>
              )}

              <div className="ml-3 flex items-center gap-2">
                {editingModuleIndex === index ? (
                  <button
                    type="button"
                    onClick={handleSaveEditModule}
                    disabled={isLocked}
                    className="rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-[12px] font-bold text-green-700"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartEditModule(index)}
                    disabled={isLocked}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-[12px] font-bold text-gray-700 disabled:cursor-not-allowed"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteModule(index)}
                  disabled={isLocked}
                  className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-[12px] font-bold text-red-700 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderGradeHistory = () => {
    const publishedItems = history.filter((h) => h.status === "published");

    return (
      <div className="mt-6 rounded-[24px] border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <h4 className="mb-4 text-[16px] font-bold text-[#0f172a]">
          Published Grade History (Read-only)
        </h4>

        {publishedItems.length === 0 ? (
          <p className="text-[13px] text-[#64748b]">No published records yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-[13px]">
              <thead className="border-b border-[#e2e8f0] text-[#64748b]">
                <tr>
                  <th className="px-3 py-3 font-bold">Class</th>
                  <th className="px-3 py-3 font-bold">Term</th>
                  <th className="px-3 py-3 font-bold">Status</th>
                  <th className="px-3 py-3 font-bold">Published At</th>
                  <th className="px-3 py-3 font-bold">Lock State</th>
                </tr>
              </thead>
              <tbody>
                {publishedItems.map((item, index) => {
                  const term = ADMIN_TERMS.find((t) => t.id === item.termId);
                  return (
                    <tr key={`${item.className}-${item.termId}-${index}`} className="border-b border-gray-100">
                      <td className="px-3 py-3 font-semibold text-[#0f172a]">{item.className}</td>
                      <td className="px-3 py-3 text-[#334155]">{term?.name ?? item.termId}</td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-green-100 px-2 py-1 text-[11px] font-bold text-green-700">
                          Published
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[#334155]">{item.publishedAt ?? "-"}</td>
                      <td className="px-3 py-3">
                        {term?.locked ? (
                          <span className="rounded-full bg-red-100 px-2 py-1 text-[11px] font-bold text-red-700">
                            Locked
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-bold text-amber-700">
                            Unlocked
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderEnterGrades = () => {
    return (
      <>
        <div className="rounded-[24px] border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[18px] font-bold text-[#0f172a]">Enter Grades</h3>
            {renderLockBadge()}
          </div>

          <FilterBar
            searchPlaceholder="Search student by name or ID"
            searchValue={studentSearch}
            onSearchChange={setStudentSearch}
            filters={[
              {
                id: "class",
                label: "Class",
                options: CLASSROOMS.map((c) => ({ label: c.label, value: c.value })),
                value: selectedClass,
                onChange: (value) => setSelectedClass(value as "10-A" | "11-B"),
              },
              {
                id: "term",
                label: "Term",
                options: ADMIN_TERMS.map((t) => ({
                  label: `${t.name}${t.active ? " (Active)" : ""}${t.locked ? " - Locked" : ""}`,
                  value: t.id,
                })),
                value: selectedTermId,
                onChange: setSelectedTermId,
              },
            ]}
          />

          <p className="mt-3 text-[12px] text-[#64748b]">
            Active term from Admin list is auto-selected. Score range is 0-100 and letter grade updates live.
          </p>

          <div className="mt-5 overflow-x-auto rounded-xl border border-[#e2e8f0]">
            <table className="w-full min-w-[860px] text-left text-[13px]">
              <thead className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[#475569]">
                <tr>
                  <th className="px-4 py-3 font-bold">Student</th>
                  <th className="px-4 py-3 font-bold">ID</th>
                  <th className="px-4 py-3 font-bold">Modules</th>
                </tr>
              </thead>
              <tbody>
                {visibleStudents.map((student) => {
                  const isExpanded = !!expandedStudentIds[student.id];
                  return (
                    <React.Fragment key={student.id}>
                      <tr className="border-b border-gray-100">
                        <td className="px-4 py-3 font-semibold text-[#0f172a]">{student.name}</td>
                        <td className="px-4 py-3 text-[#475569]">{student.id}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => toggleStudentExpand(student.id)}
                            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-[12px] font-bold text-[#334155]"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5" />
                            )}
                            {isExpanded ? "Collapse" : "Expand"}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="border-b border-gray-100 bg-[#fcfdff]">
                          <td colSpan={3} className="px-4 py-4">
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                              {modules.map((moduleName) => {
                                const score = scores[student.id]?.[moduleName] ?? 0;
                                const letter = toLetterGrade(score);
                                return (
                                  <div
                                    key={`${student.id}-${moduleName}`}
                                    className="rounded-lg border border-[#e2e8f0] bg-white p-3"
                                  >
                                    <p className="mb-2 text-[12px] font-bold text-[#334155]">{moduleName}</p>

                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={score}
                                        disabled={isLocked}
                                        onChange={(e) => {
                                          const raw = Number(e.target.value);
                                          const safe = Number.isNaN(raw) ? 0 : Math.max(0, Math.min(100, raw));
                                          setStudentModuleScore(student.id, moduleName, safe);
                                        }}
                                        className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-[12px] outline-none focus:border-indigo-400 disabled:bg-gray-100"
                                      />
                                      <span
                                        className={clsx(
                                          "inline-flex min-w-[30px] items-center justify-center rounded-md px-2 py-1 text-[11px] font-bold",
                                          letter === "A" && "bg-green-100 text-green-700",
                                          letter === "B" && "bg-blue-100 text-blue-700",
                                          letter === "C" && "bg-amber-100 text-amber-700",
                                          letter === "D" && "bg-orange-100 text-orange-700",
                                          letter === "F" && "bg-red-100 text-red-700"
                                        )}
                                      >
                                        {letter}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

                {visibleStudents.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-[#64748b]">
                      No students found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isLocked}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-[13px] font-bold text-[#334155] hover:bg-gray-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </button>

            <button
              type="button"
              onClick={handlePublish}
              disabled={isLocked}
              className="inline-flex items-center gap-2 rounded-lg bg-[#4f46e5] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <Send className="h-4 w-4" />
              Publish Results
            </button>

            <button
              type="button"
              onClick={handleUnpublish}
              disabled={isLocked || draftOrPublished !== "published"}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-[13px] font-bold text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              Unpublish
            </button>

            <div className="ml-auto text-[12px] text-[#64748b]">
              Current status:{" "}
              {draftOrPublished === "published" ? (
                <span className="font-bold text-green-700">Published</span>
              ) : draftOrPublished === "draft" ? (
                <span className="font-bold text-amber-700">Draft</span>
              ) : (
                <span className="font-bold text-[#334155]">Not saved</span>
              )}
            </div>
          </div>
        </div>

        {renderGradeHistory()}
      </>
    );
  };

  return (
    <div className="flex w-full flex-col gap-[20px] pb-12 pr-2">
      <PageHeader title="Grades" subtitle="Manage modules and class grade publishing workflow." />

      <TabSelector
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as GradesTab)}
        options={[
          { id: "manage-modules", label: "Manage Modules" },
          { id: "enter-grades", label: "Enter Grades" },
        ]}
      />

      {activeTab === "manage-modules" ? renderManageModules() : renderEnterGrades()}
    </div>
  );
}
