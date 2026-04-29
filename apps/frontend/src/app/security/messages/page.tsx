"use client";

import React, { useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  Search,
  Send,
  ChevronLeft,
  MessageSquare,
  ShieldAlert,
  GraduationCap,
  Circle,
} from "lucide-react";
import { PageHeader } from "@/shared/components/layout/PageHeader";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RoleFilter = "all" | "admin" | "teacher";

type Message = {
  id: string;
  from: "security" | "other";
  text: string;
  timestamp: string;
};

type Thread = {
  id: string;
  contactName: string;
  role: "admin" | "teacher";
  roleLabel: string;
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
    contactName: "Admin Support",
    role: "admin",
    roleLabel: "System Administrator",
    unread: 1,
    lastMessage: "Please check the visitor log from 2PM.",
    lastTimestamp: "10:42 AM",
    messages: [
      {
        id: "m1",
        from: "security",
        text: "I noticed some issues with the sensor at Gate 1.",
        timestamp: "Today, 10:40 AM",
      },
      {
        id: "m2",
        from: "other",
        text: "Understood. Please check the visitor log from 2PM as well.",
        timestamp: "Today, 10:42 AM",
      },
    ],
  },
  {
    id: "t2",
    contactName: "Mrs. Nkwonta",
    role: "teacher",
    roleLabel: "Science Dept. Head",
    unread: 0,
    lastMessage: "Thank you for the update.",
    lastTimestamp: "Yesterday",
    messages: [
      {
        id: "m3",
        from: "other",
        text: "Hello Security, could you verify if a student (Amara) left early today?",
        timestamp: "Yesterday, 2:10 PM",
      },
      {
        id: "m4",
        from: "security",
        text: "Yes, her parents picked her up at 1:30 PM with admin approval.",
        timestamp: "Yesterday, 2:15 PM",
      },
      {
        id: "m5",
        from: "other",
        text: "Thank you for the update.",
        timestamp: "Yesterday, 3:45 PM",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function UnreadBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#1e293b] px-1.5 text-[11px] font-bold text-white">
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
  const Icon = thread.role === "admin" ? ShieldAlert : GraduationCap;

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex w-full items-start gap-3 border-b border-[#e2e8f0] px-4 py-3.5 text-left transition-colors",
        isActive ? "bg-[#f1f5f9]" : "hover:bg-[#f8fafc]"
      )}
    >
      {/* Avatar */}
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#e2e8f0] text-[#0f172a]">
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-1">
          <p className="truncate text-[13px] font-bold text-[#0f172a]">{thread.contactName}</p>
          <span className="flex-shrink-0 text-[11px] text-[#94a3b8]">{thread.lastTimestamp}</span>
        </div>
        <p className="text-[11px] text-[#64748b] font-medium">
          {thread.roleLabel}
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
  const isSecurity = message.from === "security";
  return (
    <div className={clsx("flex", isSecurity ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-[72%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-sm",
          isSecurity
            ? "rounded-br-sm bg-[#1e293b] text-white"
            : "rounded-bl-sm bg-white text-[#0f172a] border border-[#e2e8f0]"
        )}
      >
        <p>{message.text}</p>
        <p
          className={clsx(
            "mt-1 text-[10px]",
            isSecurity ? "text-gray-300" : "text-[#94a3b8]"
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

export default function SecurityMessagesPage() {
  const [threads, setThreads] = useState<Thread[]>(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [search, setSearch] = useState("");
  const [compose, setCompose] = useState("");
  const messageIdCounterRef = useRef(1000);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Total unread across all threads
  const totalUnread = threads.reduce((sum, t) => sum + t.unread, 0);

  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      const matchesRole = roleFilter === "all" || t.role === roleFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        t.contactName.toLowerCase().includes(q) ||
        t.roleLabel.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [threads, roleFilter, search]);

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
      from: "security",
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

  return (
    <div className="flex w-full flex-col gap-[20px] pb-12 pr-2">
      <PageHeader
        title="Security Comms"
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
                placeholder="Search admin or staff…"
                className="w-full rounded-lg border border-[#e2e8f0] py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#1e293b]"
              />
            </div>

            {/* Role filter tabs */}
            <div className="flex gap-2">
              {(["all", "admin", "teacher"] as RoleFilter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setRoleFilter(f)}
                  className={clsx(
                    "rounded-full px-3 py-1 text-[12px] font-bold transition-colors capitalize",
                    roleFilter === f
                      ? "bg-[#1e293b] text-white"
                      : "bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]"
                  )}
                >
                  {f === "all" ? "All Contacts" : f}
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
                  className="mr-1 flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-bold text-[#1e293b] hover:bg-[#f1f5f9] md:hidden"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>

                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#e2e8f0] text-[#0f172a]">
                  {activeThread.role === "admin" ? <ShieldAlert className="h-4 w-4" /> : <GraduationCap className="h-4 w-4" />}
                </div>

                <div>
                  <p className="text-[14px] font-bold text-[#0f172a]">
                    {activeThread.contactName}
                  </p>
                  <p className="text-[11px] text-[#64748b]">
                    {activeThread.roleLabel}
                  </p>
                </div>

                {/* Oversight notice */}
                <div className="ml-auto hidden items-center gap-1.5 rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1 text-[11px] text-[#94a3b8] sm:flex">
                  <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                  Online
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
                <div className="flex items-end gap-3">
                  <textarea
                    value={compose}
                    onChange={(e) => setCompose(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                    rows={2}
                    className="flex-1 resize-none rounded-xl border border-[#e2e8f0] px-4 py-2.5 text-[13px] leading-relaxed outline-none focus:border-[#1e293b]"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!compose.trim()}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#1e293b] text-white hover:bg-[#0f172a] disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-[#94a3b8]">
                  Messages are sent via internal secure channels.
                </p>
              </div>
            </>
          ) : (
            /* Empty state — no thread selected */
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-[#94a3b8]">
              <MessageSquare className="h-12 w-12 opacity-30" />
              <p className="text-[15px] font-semibold text-[#475569]">Select a conversation</p>
              <p className="text-[13px]">
                Choose a contact from the list to start messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
