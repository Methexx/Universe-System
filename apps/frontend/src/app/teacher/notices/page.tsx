"use client";

import React, { useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Megaphone,
  Pin,
  Plus,
  Search,
  Shield,
  Users,
  X,
} from "lucide-react";
import { PageHeader } from "@/shared/components/layout/PageHeader";

// ─── Types ────────────────────────────────────────────────────────────────────

type AudienceTag = "teachers" | "staff" | "parents" | "public";
type NoticeCategory = "academic" | "event" | "urgent" | "general" | "policy";
type AuthorRole = "principal" | "teacher";
type TabView = "all" | "principal" | "mine";

type Notice = {
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole: AuthorRole;
  publishedAt: string;
  audiences: AudienceTag[];
  category: NoticeCategory;
  pinned?: boolean;
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_NOTICES: Notice[] = [
  {
    id: "n7",
    title: "URGENT: School Closure — April 25th",
    content:
      "Due to unexpected water supply issues, the school will remain closed on April 25th, 2026. All classes are cancelled. Parents have been notified via FCM push notification. Online classes will NOT be held. Normal schedule resumes April 26th.",
    author: "Mr. S. Perera",
    authorRole: "principal",
    publishedAt: "Today, 7:30 AM",
    audiences: ["teachers", "staff", "parents", "public"],
    category: "urgent",
    pinned: true,
  },
  {
    id: "n1",
    title: "Term 2 Examination Schedule",
    content:
      "The Term 2 examinations will commence on May 15th, 2026. All teachers are required to submit question papers by May 5th. Students should be informed at least one week prior. Please ensure all syllabus coverage is completed before the examination period begins.",
    author: "Mr. S. Perera",
    authorRole: "principal",
    publishedAt: "Today, 9:00 AM",
    audiences: ["teachers", "staff"],
    category: "academic",
    pinned: true,
  },
  {
    id: "n4",
    title: "Updated Attendance Policy — Effective May 2026",
    content:
      "Please note that the school attendance policy has been updated. Students with less than 80% attendance will be barred from sitting for Term 2 examinations. Teachers should flag students at risk using the Attendance module immediately.",
    author: "Mr. S. Perera",
    authorRole: "principal",
    publishedAt: "Apr 21, 10:00 AM",
    audiences: ["teachers", "staff", "parents"],
    category: "policy",
    pinned: true,
  },
  {
    id: "n2",
    title: "Annual Sports Day — Volunteer Teachers Needed",
    content:
      "Our Annual Sports Day is scheduled for May 22nd, 2026. We are looking for teacher volunteers to oversee events and assist with student coordination. Please confirm your availability with the school office by April 30th.",
    author: "Mr. S. Perera",
    authorRole: "principal",
    publishedAt: "Yesterday, 11:30 AM",
    audiences: ["teachers", "staff"],
    category: "event",
  },
  {
    id: "n3",
    title: "Parent–Teacher Meeting — Grade 10 & 11",
    content:
      "A Parent–Teacher Meeting for Grade 10 and Grade 11 parents is scheduled for May 3rd, 2026 from 2:00 PM to 5:00 PM. All class teachers are required to be present. Parents will be notified via the School Connect mobile app.",
    author: "Mr. S. Perera",
    authorRole: "principal",
    publishedAt: "Apr 22, 2:00 PM",
    audiences: ["teachers", "parents"],
    category: "event",
  },
  {
    id: "n5",
    title: "Grade 10-A Science Assignment Deadline Extended",
    content:
      "Due to the school closure on April 18th, the deadline for the Grade 10-A Science assignment on Ecosystems has been extended to April 28th, 2026. Students should upload their reports via the parent portal by midnight.",
    author: "Ms. T. Kumari",
    authorRole: "teacher",
    publishedAt: "Apr 20, 3:15 PM",
    audiences: ["parents"],
    category: "academic",
  },
  {
    id: "n6",
    title: "Class 11-B Math Revision Session",
    content:
      "A special revision session for Grade 11-B Mathematics will be held on April 27th from 3:00 PM to 5:00 PM in Room 14. Attendance is highly recommended for students who are struggling with Algebra and Calculus chapters.",
    author: "Mr. R. Fernando",
    authorRole: "teacher",
    publishedAt: "Apr 19, 1:00 PM",
    audiences: ["parents"],
    category: "academic",
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const AUDIENCE_CONFIG: Record<
  AudienceTag,
  { label: string; textColor: string; bgColor: string }
> = {
  teachers: { label: "Teachers", textColor: "text-[#4f46e5]", bgColor: "bg-[#eef2ff]" },
  staff:    { label: "Staff",    textColor: "text-[#0369a1]", bgColor: "bg-[#e0f2fe]" },
  parents:  { label: "Parents",  textColor: "text-[#15803d]", bgColor: "bg-[#dcfce7]" },
  public:   { label: "Public",   textColor: "text-[#475569]", bgColor: "bg-[#f1f5f9]" },
};

const CATEGORY_CONFIG: Record<
  NoticeCategory,
  { label: string; textColor: string; bgColor: string; icon: React.ElementType }
> = {
  academic: { label: "Academic", textColor: "text-[#1e40af]", bgColor: "bg-[#dbeafe]", icon: BookOpen  },
  event:    { label: "Event",    textColor: "text-[#92400e]", bgColor: "bg-[#fef3c7]", icon: Calendar  },
  urgent:   { label: "Urgent",   textColor: "text-[#b91c1c]", bgColor: "bg-[#fee2e2]", icon: AlertCircle },
  general:  { label: "General",  textColor: "text-[#475569]", bgColor: "bg-[#f1f5f9]", icon: FileText  },
  policy:   { label: "Policy",   textColor: "text-[#7c3aed]", bgColor: "bg-[#f3e8ff]", icon: Shield    },
};

const AUDIENCE_FILTER_OPTIONS: { value: "all" | AudienceTag; label: string }[] = [
  { value: "all",      label: "All Audiences" },
  { value: "teachers", label: "Teachers"      },
  { value: "staff",    label: "Staff"         },
  { value: "parents",  label: "Parents"       },
  { value: "public",   label: "Public"        },
];

// ─── Chips & Badges ───────────────────────────────────────────────────────────

function AudienceChip({ tag }: { tag: AudienceTag }) {
  const { label, textColor, bgColor } = AUDIENCE_CONFIG[tag];
  return (
    <span
      className={clsx(
        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        bgColor,
        textColor
      )}
    >
      {label}
    </span>
  );
}

function CategoryBadge({ category }: { category: NoticeCategory }) {
  const { label, textColor, bgColor, icon: Icon } = CATEGORY_CONFIG[category];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        bgColor,
        textColor
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function AuthorRoleBadge({ role }: { role: AuthorRole }) {
  if (role === "principal") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
        <Shield className="h-3 w-3" />
        Principal
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#eef2ff] px-2.5 py-0.5 text-[11px] font-bold text-[#4f46e5]">
      <Users className="h-3 w-3" />
      Teacher
    </span>
  );
}

// ─── Notice Card ──────────────────────────────────────────────────────────────

function NoticeCard({
  notice,
  isExpanded,
  onToggle,
}: {
  notice: Notice;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const isUrgent = notice.category === "urgent";
  const isPinned = notice.pinned;

  return (
    <div
      className={clsx(
        "rounded-[16px] border bg-white transition-shadow",
        isUrgent
          ? "border-red-200 shadow-[0_0_0_1.5px_#fca5a5]"
          : isPinned
          ? "border-amber-200 shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
          : "border-[#e2e8f0] shadow-[0_2px_6px_rgba(0,0,0,0.02)]"
      )}
    >
      {/* Card top */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <CategoryBadge category={notice.category} />
              {isPinned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                  <Pin className="h-3 w-3" />
                  Pinned
                </span>
              )}
            </div>
            <h3 className="text-[15px] font-bold leading-snug text-[#0f172a]">
              {notice.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="mt-1 flex-shrink-0 rounded-lg p-1 text-[#94a3b8] transition-colors hover:bg-[#f1f5f9] hover:text-[#475569]"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        <p
          className={clsx(
            "mt-1.5 text-[13px] leading-relaxed text-[#475569]",
            !isExpanded && "line-clamp-2"
          )}
        >
          {notice.content}
        </p>
      </div>

      {/* Card footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#f1f5f9] px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#f1f5f9] text-[11px] font-bold text-[#475569]">
            {notice.author.split(" ").pop()?.charAt(0)}
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[#334155]">{notice.author}</p>
            <p className="text-[11px] text-[#94a3b8]">{notice.publishedAt}</p>
          </div>
          <AuthorRoleBadge role={notice.authorRole} />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {notice.audiences.map((aud) => (
            <AudienceChip key={aud} tag={aud} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Compose Modal ────────────────────────────────────────────────────────────

type ComposeForm = {
  title: string;
  content: string;
  audiences: AudienceTag[];
  category: NoticeCategory;
};

const BLANK_FORM: ComposeForm = {
  title: "",
  content: "",
  audiences: ["parents"],
  category: "general",
};

function ComposeModal({
  onClose,
  onPublish,
}: {
  onClose: () => void;
  onPublish: (data: Omit<Notice, "id" | "author" | "authorRole" | "publishedAt">) => void;
}) {
  const [form, setForm] = useState<ComposeForm>(BLANK_FORM);

  const toggleAudience = (tag: AudienceTag) =>
    setForm((prev) => ({
      ...prev,
      audiences: prev.audiences.includes(tag)
        ? prev.audiences.filter((a) => a !== tag)
        : [...prev.audiences, tag],
    }));

  const canPublish =
    form.title.trim().length > 0 &&
    form.content.trim().length > 0 &&
    form.audiences.length > 0;

  const handlePublish = () => {
    if (!canPublish) return;
    onPublish({
      title: form.title.trim(),
      content: form.content.trim(),
      audiences: form.audiences,
      category: form.category,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[560px] rounded-[20px] border border-[#e2e8f0] bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e2e8f0] px-6 py-4">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-[#4f46e5]" />
            <h2 className="text-[16px] font-bold text-[#0f172a]">Post a Notice</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#94a3b8] transition-colors hover:bg-[#f1f5f9] hover:text-[#475569]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[#475569]">
              Notice Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Grade 10-A Assignment Reminder"
              className="w-full rounded-[10px] border border-[#e2e8f0] px-4 py-2.5 text-[13px] text-[#0f172a] outline-none placeholder:text-[#cbd5e1] focus:border-[#4f46e5]"
            />
          </div>

          {/* Content */}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[#475569]">
              Content *
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              placeholder="Write the full notice here…"
              rows={4}
              className="w-full resize-none rounded-[10px] border border-[#e2e8f0] px-4 py-2.5 text-[13px] leading-relaxed text-[#0f172a] outline-none placeholder:text-[#cbd5e1] focus:border-[#4f46e5]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[#475569]">
              Category *
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CATEGORY_CONFIG) as NoticeCategory[]).map((cat) => {
                const { label, textColor, bgColor, icon: Icon } = CATEGORY_CONFIG[cat];
                const isSelected = form.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, category: cat }))}
                    className={clsx(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold transition-all",
                      isSelected
                        ? clsx(bgColor, textColor, "border-current")
                        : "border-[#e2e8f0] bg-white text-[#94a3b8] hover:border-[#cbd5e1]"
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audience */}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[#475569]">
              Target Audience *{" "}
              <span className="font-normal text-[#94a3b8]">(select all that apply)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(AUDIENCE_CONFIG) as AudienceTag[]).map((tag) => {
                const { label, textColor, bgColor } = AUDIENCE_CONFIG[tag];
                const isSelected = form.audiences.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleAudience(tag)}
                    className={clsx(
                      "rounded-full border px-3 py-1 text-[12px] font-semibold transition-all",
                      isSelected
                        ? clsx(bgColor, textColor, "border-current")
                        : "border-[#e2e8f0] bg-white text-[#94a3b8] hover:border-[#cbd5e1]"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {form.audiences.length === 0 && (
              <p className="mt-1.5 text-[11px] text-red-500">
                Select at least one audience.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#e2e8f0] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] border border-[#e2e8f0] px-5 py-2 text-[13px] font-semibold text-[#475569] hover:bg-[#f8fafc]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={!canPublish}
            className="rounded-[10px] bg-[#4f46e5] px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:bg-[#c7d2fe]"
          >
            Publish Notice
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TeacherNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [activeTab, setActiveTab] = useState<TabView>("all");
  const [audienceFilter, setAudienceFilter] = useState<"all" | AudienceTag>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const idCounter = useRef(100);

  const filteredNotices = useMemo(() => {
    return notices.filter((n) => {
      if (activeTab === "principal" && n.authorRole !== "principal") return false;
      if (activeTab === "mine" && n.authorRole !== "teacher") return false;
      if (audienceFilter !== "all" && !n.audiences.includes(audienceFilter)) return false;
      const q = search.toLowerCase();
      if (
        q &&
        !n.title.toLowerCase().includes(q) &&
        !n.content.toLowerCase().includes(q) &&
        !n.author.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [notices, activeTab, audienceFilter, search]);

  const pinnedNotices  = filteredNotices.filter((n) => n.pinned);
  const regularNotices = filteredNotices.filter((n) => !n.pinned);

  const handlePublish = (
    data: Omit<Notice, "id" | "author" | "authorRole" | "publishedAt">
  ) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newNotice: Notice = {
      id: `n-new-${idCounter.current++}`,
      author: "Ms. T. Kumari",
      authorRole: "teacher",
      publishedAt: `Today, ${timeStr}`,
      ...data,
    };
    setNotices((prev) => [newNotice, ...prev]);
    setActiveTab("mine");
  };

  const principalCount = notices.filter((n) => n.authorRole === "principal").length;
  const myCount        = notices.filter((n) => n.authorRole === "teacher").length;

  return (
    <div className="flex w-full flex-col gap-[20px] pb-12 pr-2">
      <PageHeader
        title="Notices"
        subtitle="Stay up to date with school announcements and share your own."
      />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Notices",  value: notices.length, textColor: "text-[#0f172a]",  bg: "bg-[#f8fafc]"  },
          { label: "From Principal", value: principalCount,  textColor: "text-amber-700", bg: "bg-amber-50"    },
          { label: "My Notices",     value: myCount,         textColor: "text-[#4f46e5]", bg: "bg-[#eef2ff]"  },
        ].map(({ label, value, textColor, bg }) => (
          <div
            key={label}
            className={clsx("rounded-[16px] border border-[#e2e8f0] p-4", bg)}
          >
            <p className="text-[12px] text-[#64748b]">{label}</p>
            <p className={clsx("text-[26px] font-bold", textColor)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="rounded-[16px] border border-[#e2e8f0] bg-white p-4 shadow-[0_2px_6px_rgba(0,0,0,0.02)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex gap-1 rounded-[10px] bg-[#f1f5f9] p-1">
            {(
              [
                { value: "all",       label: "All Notices"    },
                { value: "principal", label: "From Principal" },
                { value: "mine",      label: "My Notices"     },
              ] as { value: TabView; label: string }[]
            ).map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={clsx(
                  "rounded-[8px] px-4 py-1.5 text-[12px] font-bold transition-all",
                  activeTab === tab.value
                    ? "bg-white text-[#0f172a] shadow-sm"
                    : "text-[#94a3b8] hover:text-[#475569]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search + Post button */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notices…"
                className="w-[200px] rounded-[10px] border border-[#e2e8f0] py-2 pl-9 pr-3 text-[12px] outline-none focus:border-[#4f46e5]"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowCompose(true)}
              className="inline-flex items-center gap-2 rounded-[10px] bg-[#4f46e5] px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-[#4338ca]"
            >
              <Plus className="h-4 w-4" />
              Post Notice
            </button>
          </div>
        </div>

        {/* Audience filter chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          {AUDIENCE_FILTER_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setAudienceFilter(value)}
              className={clsx(
                "rounded-full border px-3 py-1 text-[12px] font-semibold transition-all",
                audienceFilter === value
                  ? "border-[#0f172a] bg-[#0f172a] text-white"
                  : "border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#cbd5e1] hover:text-[#475569]"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Notice list */}
      {filteredNotices.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[20px] border border-[#e2e8f0] bg-white py-20 text-center">
          <Megaphone className="h-10 w-10 text-[#cbd5e1]" />
          <p className="text-[15px] font-semibold text-[#475569]">No notices found</p>
          <p className="text-[13px] text-[#94a3b8]">
            Try adjusting your filters or search query.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {pinnedNotices.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#94a3b8]">
                Pinned
              </p>
              {pinnedNotices.map((notice) => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  isExpanded={expandedId === notice.id}
                  onToggle={() =>
                    setExpandedId((prev) => (prev === notice.id ? null : notice.id))
                  }
                />
              ))}
            </div>
          )}

          {regularNotices.length > 0 && (
            <div className="flex flex-col gap-3">
              {pinnedNotices.length > 0 && (
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#94a3b8]">
                  Recent
                </p>
              )}
              {regularNotices.map((notice) => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  isExpanded={expandedId === notice.id}
                  onToggle={() =>
                    setExpandedId((prev) => (prev === notice.id ? null : notice.id))
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Compose modal */}
      {showCompose && (
        <ComposeModal
          onClose={() => setShowCompose(false)}
          onPublish={handlePublish}
        />
      )}
    </div>
  );
}
