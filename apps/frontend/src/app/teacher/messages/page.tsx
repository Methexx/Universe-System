"use client";

import React, { useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  Search,
  Send,
  Sparkles,
  ChevronLeft,
  MessageSquare,
  Circle,
} from "lucide-react";
import { PageHeader } from "@/shared/components/layout/PageHeader";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ClassFilter = "all" | "10-A" | "11-B";

type Message = {
  id: string;
  from: "teacher" | "parent";
  text: string;
  timestamp: string;
};

type Thread = {
  id: string;
  parentName: string;
  studentName: string;
  studentId: string;
  className: "10-A" | "11-B";
  unread: number;
  lastMessage: string;
  lastTimestamp: string;
  messages: Message[];
};

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const INITIAL_THREADS: Thread[] = [
  {
    id: "t1",
    parentName: "Mrs. Nkwonta",
    studentName: "Amara Nkwonta",
    studentId: "29854",
    className: "10-A",
    unread: 2,
    lastMessage: "Thank you for letting me know about the exam.",
    lastTimestamp: "9:42 AM",
    messages: [
      {
        id: "m1",
        from: "teacher",
        text: "Hello Mrs. Nkwonta, Amara has been absent for 3 consecutive days. Please let us know if everything is alright.",
        timestamp: "Yesterday, 2:10 PM",
      },
      {
        id: "m2",
        from: "parent",
        text: "Thank you for reaching out. She has been unwell but will return tomorrow.",
        timestamp: "Yesterday, 3:45 PM",
      },
      {
        id: "m3",
        from: "teacher",
        text: "Understood. Please bring a doctor's note when she returns. The upcoming Science exam is on Friday.",
        timestamp: "Today, 8:55 AM",
      },
      {
        id: "m4",
        from: "parent",
        text: "Thank you for letting me know about the exam.",
        timestamp: "Today, 9:42 AM",
      },
    ],
  },
  {
    id: "t2",
    parentName: "Mr. Okoro",
    studentName: "Ikenna Okoro",
    studentId: "18392",
    className: "10-A",
    unread: 0,
    lastMessage: "We will make sure he completes it over the weekend.",
    lastTimestamp: "Yesterday",
    messages: [
      {
        id: "m5",
        from: "teacher",
        text: "Hi Mr. Okoro, Ikenna has not submitted the Maths assignment that was due last week.",
        timestamp: "2 days ago, 11:00 AM",
      },
      {
        id: "m6",
        from: "parent",
        text: "We will make sure he completes it over the weekend.",
        timestamp: "Yesterday, 10:20 AM",
      },
    ],
  },
  {
    id: "t3",
    parentName: "Mrs. Eze",
    studentName: "Ngozi Eze",
    studentId: "29855",
    className: "10-A",
    unread: 1,
    lastMessage: "Is there anything specific Ngozi should focus on?",
    lastTimestamp: "10:15 AM",
    messages: [
      {
        id: "m7",
        from: "parent",
        text: "Good morning, I wanted to check on Ngozi's progress in Science.",
        timestamp: "Today, 9:50 AM",
      },
      {
        id: "m8",
        from: "parent",
        text: "Is there anything specific Ngozi should focus on?",
        timestamp: "Today, 10:15 AM",
      },
    ],
  },
  {
    id: "t4",
    parentName: "Mr. Okafor",
    studentName: "Obinna Okafor",
    studentId: "40122",
    className: "11-B",
    unread: 0,
    lastMessage: "Thank you, teacher.",
    lastTimestamp: "Mon",
    messages: [
      {
        id: "m9",
        from: "teacher",
        text: "Obinna showed great improvement in this term's English results. Well done!",
        timestamp: "Mon, 1:00 PM",
      },
      {
        id: "m10",
        from: "parent",
        text: "Thank you, teacher.",
        timestamp: "Mon, 4:30 PM",
      },
    ],
  },
  {
    id: "t5",
    parentName: "Mrs. Musa",
    studentName: "Adaobi Musa",
    studentId: "10293",
    className: "11-B",
    unread: 0,
    lastMessage: "We will speak with her at home.",
    lastTimestamp: "Tue",
    messages: [
      {
        id: "m11",
        from: "teacher",
        text: "Adaobi has been arriving late to class this week. Please help remind her about punctuality.",
        timestamp: "Tue, 9:00 AM",
      },
      {
        id: "m12",
        from: "parent",
        text: "We will speak with her at home.",
        timestamp: "Tue, 11:45 AM",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// AI draft helper (mock — replace with real API call)
// ---------------------------------------------------------------------------

function generateAiDraft(studentName: string, recentAbsences: number): string {
  return `Dear Parent, I am reaching out regarding ${studentName}, who has been marked absent ${recentAbsences} time(s) recently. We are concerned about the impact on their learning progress and would appreciate an update on their wellbeing. Please feel free to reply here or contact the school directly. Thank you.`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function UnreadBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#4f46e5] px-1.5 text-[11px] font-bold text-white">
      {count}
    </span>
  );
}

function ThreadListItem({
  thread,
  isActive,
  onClick,
}: {
  thread: Thread;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex w-full items-start gap-3 border-b border-[#e2e8f0] px-4 py-3.5 text-left transition-colors",
        isActive ? "bg-[#eef2ff]" : "hover:bg-[#f8fafc]"
      )}
    >
      {/* Avatar */}
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#e0e7ff] text-[13px] font-bold text-[#4f46e5]">
        {thread.parentName.charAt(thread.parentName.lastIndexOf(" ") + 1)}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-1">
          <p className="truncate text-[13px] font-bold text-[#0f172a]">{thread.parentName}</p>
          <span className="flex-shrink-0 text-[11px] text-[#94a3b8]">{thread.lastTimestamp}</span>
        </div>
        <p className="text-[11px] text-[#64748b]">
          {thread.studentName} · {thread.className}
        </p>
        <div className="mt-0.5 flex items-center gap-1">
          <p
            className={clsx(
              "truncate text-[12px]",
              thread.unread > 0 ? "font-semibold text-[#334155]" : "text-[#94a3b8]"
            )}
          >
            {thread.lastMessage}
          </p>
          <UnreadBadge count={thread.unread} />
        </div>
      </div>
    </button>
  );
}

function ChatBubble({ message }: { message: Message }) {
  const isTeacher = message.from === "teacher";
  return (
    <div className={clsx("flex", isTeacher ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-[72%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-sm",
          isTeacher
            ? "rounded-br-sm bg-[#4f46e5] text-white"
            : "rounded-bl-sm bg-white text-[#0f172a] border border-[#e2e8f0]"
        )}
      >
        <p>{message.text}</p>
        <p
          className={clsx(
            "mt-1 text-[10px]",
            isTeacher ? "text-indigo-200" : "text-[#94a3b8]"
          )}
        >
          {message.timestamp}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function TeacherMessagesPage() {
  const [threads, setThreads] = useState<Thread[]>(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [classFilter, setClassFilter] = useState<ClassFilter>("all");
  const [search, setSearch] = useState("");
  const [compose, setCompose] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const messageIdCounterRef = useRef(1000);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Total unread across all threads
  const totalUnread = threads.reduce((sum, t) => sum + t.unread, 0);

  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      const matchesClass = classFilter === "all" || t.className === classFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        t.parentName.toLowerCase().includes(q) ||
        t.studentName.toLowerCase().includes(q) ||
        t.studentId.includes(q);
      return matchesClass && matchesSearch;
    });
  }, [threads, classFilter, search]);

  const activeThread = threads.find((t) => t.id === activeThreadId) ?? null;

  // Mark thread as read when opened
  const openThread = (threadId: string) => {
    setActiveThreadId(threadId);
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, unread: 0 } : t))
    );
    setCompose("");
    // Scroll to bottom after render
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleSend = () => {
    if (!compose.trim() || !activeThreadId) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMsg: Message = {
      id: `m-${messageIdCounterRef.current++}`,
      from: "teacher",
      text: compose.trim(),
      timestamp: `Today, ${timeStr}`,
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== activeThreadId) return t;
        return {
          ...t,
          messages: [...t.messages, newMsg],
          lastMessage: newMsg.text,
          lastTimestamp: timeStr,
        };
      })
    );
    setCompose("");
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAiDraft = () => {
    if (!activeThread) return;
    setIsAiLoading(true);
    // Mock: simulate a brief delay then fill the compose box
    setTimeout(() => {
      const draft = generateAiDraft(activeThread.studentName, 3);
      setCompose(draft);
      setIsAiLoading(false);
    }, 900);
  };

  return (
    <div className="flex w-full flex-col gap-[20px] pb-12 pr-2">
      <PageHeader
        title="Messages"
        subtitle={
          totalUnread > 0
            ? `${totalUnread} unread message${totalUnread > 1 ? "s" : ""}`
            : "All caught up"
        }
      />

      {/* Main panel */}
      <div className="flex h-[calc(100vh-220px)] min-h-[560px] overflow-hidden rounded-[24px] border border-[#e2e8f0] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">

        {/* ── LEFT: Thread list ── */}
        <div
          className={clsx(
            "flex w-full flex-col border-r border-[#e2e8f0] md:w-[320px] md:flex-shrink-0",
            // On mobile, hide list when a thread is open
            activeThread ? "hidden md:flex" : "flex"
          )}
        >
          {/* Search + filter */}
          <div className="border-b border-[#e2e8f0] p-4">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search parent or student…"
                className="w-full rounded-lg border border-[#e2e8f0] py-2 pl-9 pr-3 text-[13px] outline-none focus:border-indigo-400"
              />
            </div>

            {/* Class filter tabs */}
            <div className="flex gap-2">
              {(["all", "10-A", "11-B"] as ClassFilter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setClassFilter(f)}
                  className={clsx(
                    "rounded-full px-3 py-1 text-[12px] font-bold transition-colors",
                    classFilter === f
                      ? "bg-[#4f46e5] text-white"
                      : "bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]"
                  )}
                >
                  {f === "all" ? "All Classes" : f}
                </button>
              ))}
            </div>
          </div>

          {/* Thread list */}
          <div className="flex-1 overflow-y-auto">
            {filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-[#94a3b8]">
                <MessageSquare className="h-8 w-8 opacity-40" />
                <p className="text-[13px]">No conversations found.</p>
              </div>
            ) : (
              filteredThreads.map((thread) => (
                <ThreadListItem
                  key={thread.id}
                  thread={thread}
                  isActive={thread.id === activeThreadId}
                  onClick={() => openThread(thread.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── RIGHT: Thread view ── */}
        <div
          className={clsx(
            "flex flex-1 flex-col",
            // On mobile, hide pane when no thread selected
            !activeThread ? "hidden md:flex" : "flex"
          )}
        >
          {activeThread ? (
            <>
              {/* Thread header */}
              <div className="flex items-center gap-3 border-b border-[#e2e8f0] px-5 py-3.5">
                {/* Back button — mobile only */}
                <button
                  type="button"
                  onClick={() => setActiveThreadId(null)}
                  className="mr-1 flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-bold text-[#4f46e5] hover:bg-[#eef2ff] md:hidden"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>

                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#e0e7ff] text-[13px] font-bold text-[#4f46e5]">
                  {activeThread.parentName.charAt(
                    activeThread.parentName.lastIndexOf(" ") + 1
                  )}
                </div>

                <div>
                  <p className="text-[14px] font-bold text-[#0f172a]">
                    {activeThread.parentName}
                  </p>
                  <p className="text-[11px] text-[#64748b]">
                    Parent of {activeThread.studentName} · {activeThread.className} ·{" "}
                    <span className="font-medium">ID {activeThread.studentId}</span>
                  </p>
                </div>

                {/* Oversight notice */}
                <div className="ml-auto hidden items-center gap-1.5 rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1 text-[11px] text-[#94a3b8] sm:flex">
                  <Circle className="h-2 w-2 fill-amber-400 text-amber-400" />
                  Visible to Principal
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto bg-[#f8fafc] px-5 py-4">
                <div className="flex flex-col gap-3">
                  {activeThread.messages.map((msg) => (
                    <ChatBubble key={msg.id} message={msg} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Compose bar */}
              <div className="border-t border-[#e2e8f0] bg-white px-5 py-4">
                {/* AI Draft button */}
                <div className="mb-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleAiDraft}
                    disabled={isAiLoading}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#e0e7ff] bg-[#eef2ff] px-3 py-1.5 text-[12px] font-bold text-[#4f46e5] hover:bg-[#e0e7ff] disabled:opacity-60"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {isAiLoading ? "Generating…" : "Draft with AI"}
                  </button>
                </div>

                <div className="flex items-end gap-3">
                  <textarea
                    value={compose}
                    onChange={(e) => setCompose(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                    rows={2}
                    className="flex-1 resize-none rounded-xl border border-[#e2e8f0] px-4 py-2.5 text-[13px] leading-relaxed outline-none focus:border-indigo-400"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!compose.trim()}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#4f46e5] text-white hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>

                <p className="mt-1.5 text-[11px] text-[#94a3b8]">
                  Parent receives an FCM push notification when you send a message.
                </p>
              </div>
            </>
          ) : (
            /* Empty state — no thread selected */
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-[#94a3b8]">
              <MessageSquare className="h-12 w-12 opacity-30" />
              <p className="text-[15px] font-semibold text-[#475569]">Select a conversation</p>
              <p className="text-[13px]">
                Choose a parent thread from the list to view and reply.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}