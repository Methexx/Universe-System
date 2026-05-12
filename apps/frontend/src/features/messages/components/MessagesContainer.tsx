"use client";

import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
import clsx from "clsx";
import {
  Search,
  Send,
  Sparkles,
  ChevronLeft,
  MessageSquare,
  Trash2,
  Loader2,
  Shield,
  ShieldAlert,
  GraduationCap,
} from "lucide-react";
import Image from "next/image";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { 
  getInbox, 
  getContacts, 
  getThread, 
  sendMessage, 
  markAsRead, 
  generateAiDraft, 
  MessageContact, 
  MessageThread, 
  Message as ApiMessage, 
  deleteMessage, 
  capitalizeRole 
} from "@/features/messages/lib/messages-api";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useUnreadMessages } from "@/features/messages/context/UnreadMessagesContext";
import { cacheGet, cacheSet } from "@/shared/lib/local-cache";
import { UserStatus } from "@/shared/components/ui/UserStatus";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimestamp(isoString: string) {
  const date = new Date(isoString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function RoleIcon({ role, className, fallback }: { role: string; className?: string; fallback: React.ReactNode }) {
  if (role === 'admin') return <ShieldAlert className={className} />;
  if (role === 'security') return <Shield className={className} />;
  if (role === 'teacher') return <GraduationCap className={className} />;
  return <>{fallback}</>;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function UnreadBadge({ count, accentColor }: { count: number; accentColor: string }) {
  if (count === 0) return null;
  return (
    <span 
      className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white"
      style={{ backgroundColor: accentColor }}
    >
      {count}
    </span>
  );
}

function ThreadListItem({
  thread,
  isActive,
  onClick,
  accentColor,
  accentBg,
  accentLight
}: {
  thread: MessageThread;
  isActive: boolean;
  onClick: () => void;
  accentColor: string;
  accentBg: string;
  accentLight: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex w-full items-start gap-3 border-b border-[#e2e8f0] px-4 py-3.5 text-left transition-colors",
        isActive ? "" : "hover:bg-[#f8fafc]"
      )}
      style={isActive ? { backgroundColor: accentBg } : {}}
    >
      {/* Avatar */}
      <div className="relative h-9 w-9 flex-shrink-0">
        <div 
          className="flex h-full w-full items-center justify-center rounded-full text-[13px] font-bold overflow-hidden"
          style={{ backgroundColor: accentLight, color: accentColor }}
        >
          {thread.user.avatar_url ? (
            <Image 
              src={thread.user.avatar_url} 
              alt="" 
              width={36} 
              height={36} 
              className="h-full w-full object-cover" 
              unoptimized
            />
          ) : (
            <RoleIcon role={thread.user.role} className="h-4 w-4" fallback={thread.user.full_name?.charAt(0) || "?"} />
          )}
        </div>
        {thread.user.is_online && (
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 z-10" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-1">
          <p className="truncate text-[13px] font-bold text-[#0f172a]">{thread.user.full_name}</p>
          <span className="flex-shrink-0 text-[11px] text-[#94a3b8]">{formatTimestamp(thread.lastMessage.created_at)}</span>
        </div>
        <p className="text-[11px] text-[#64748b] flex items-center gap-2">
          {capitalizeRole(thread.user.role)}
        </p>
        <div className="mt-0.5 flex items-center gap-1">
          <p
            className={clsx(
              "truncate text-[12px]",
              thread.unreadCount > 0 ? "font-semibold text-[#334155]" : "text-[#94a3b8]"
            )}
          >
            {thread.lastMessage.content}
          </p>
          <UnreadBadge count={thread.unreadCount} accentColor={accentColor} />
        </div>
      </div>
    </button>
  );
}

function ContactListItem({
  contact,
  onClick,
  accentColor,
  accentLight
}: {
  contact: MessageContact;
  onClick: () => void;
  accentColor: string;
  accentLight: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 border-b border-[#e2e8f0] px-4 py-3.5 text-left transition-colors hover:bg-[#f8fafc]"
    >
      <div className="relative h-9 w-9 flex-shrink-0">
        <div 
          className="flex h-full w-full items-center justify-center rounded-full text-[13px] font-bold overflow-hidden"
          style={{ backgroundColor: accentLight, color: accentColor }}
        >
          {contact.avatar_url ? (
            <Image 
              src={contact.avatar_url} 
              alt="" 
              width={36} 
              height={36} 
              className="h-full w-full object-cover" 
              unoptimized
            />
          ) : (
            <RoleIcon role={contact.role} className="h-4 w-4" fallback={contact.full_name?.charAt(0) || "?"} />
          )}
        </div>
        {contact.is_online && (
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 z-10" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-[#0f172a]">{contact.full_name}</p>
        {contact.role === 'parent' && contact.student_name ? (
          <p className="text-[11px] text-[#64748b]">
            Parent of{' '}
            <span 
              className="font-bold px-1.5 py-0.5 rounded"
              style={{ color: accentColor, backgroundColor: accentLight }}
            >
              {contact.student_name}
            </span>
          </p>
        ) : (
          <p className="text-[11px] text-[#64748b]">{capitalizeRole(contact.role)}</p>
        )}
      </div>
    </button>
  );
}

function ChatBubble({ 
  message, 
  currentUserId, 
  onDelete, 
  accentColor 
}: { 
  message: ApiMessage; 
  currentUserId: string; 
  onDelete: (id: string) => void;
  accentColor: string;
}) {
  const isMe = message.sender_id === currentUserId;
  return (
    <div className={clsx("group flex relative", isMe ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-[72%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-sm relative",
          isMe
            ? "rounded-br-sm text-white"
            : "rounded-bl-sm bg-white text-[#0f172a] border border-[#e2e8f0]"
        )}
        style={isMe ? { backgroundColor: accentColor } : {}}
      >
        <p>{message.content}</p>
        <p
          className={clsx(
            "mt-1 text-[10px]",
            isMe ? "opacity-70" : "text-[#94a3b8]"
          )}
        >
          {formatTimestamp(message.created_at)}
        </p>

        {/* Delete button on hover (only for sender) */}
        {isMe && (
          <button
            onClick={() => onDelete(message.id)}
            className="absolute top-2 -left-10 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-red-500 hover:text-white text-gray-400"
            title="Delete message"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Container
// ---------------------------------------------------------------------------

type MessagesContainerProps = {
  accentColor: string;
  accentBg: string;
  accentLight: string;
  pageTitle: string;
  pageSubtitleEmpty: string;
  footerNote: string;
  showAiDraft?: boolean;
};

export function MessagesContainer({
  accentColor,
  accentBg,
  accentLight,
  pageTitle,
  pageSubtitleEmpty,
  footerNote,
  showAiDraft = false
}: MessagesContainerProps) {
  const { user } = useAuth();
  const { clearUnread, refresh: refreshUnread } = useUnreadMessages();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [contacts, setContacts] = useState<MessageContact[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<ApiMessage[]>([]);
  const [search, setSearch] = useState("");
  const [compose, setCompose] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Total unread across all threads
  const totalUnread = threads.reduce((sum, t) => sum + t.unreadCount, 0);

  const fetchData = useCallback(async () => {
    const userId = user?.userId;
    // Load from cache instantly
    const cachedThreads = userId ? cacheGet<MessageThread[]>(`inbox:${userId}`) : null;
    const cachedContacts = userId ? cacheGet<MessageContact[]>(`contacts:${userId}`) : null;
    if (cachedThreads) { setThreads(cachedThreads); setIsLoading(false); }
    if (cachedContacts) setContacts(cachedContacts);

    // Fetch fresh in background
    const [inboxRes, contactsRes] = await Promise.all([getInbox(), getContacts()]);
    if (inboxRes.ok) {
      setThreads(inboxRes.data);
      if (userId) cacheSet(`inbox:${userId}`, inboxRes.data, 60);
    }
    if (contactsRes.ok) {
      setContacts(contactsRes.data);
      if (userId) cacheSet(`contacts:${userId}`, contactsRes.data, 120);
    }
    setIsLoading(false);
  }, [user?.userId]);

  useEffect(() => {
    Promise.resolve().then(() => fetchData());
  }, [fetchData]);

  // Polling for real-time updates
  useEffect(() => {
    let pollCount = 0;
    const interval = setInterval(async () => {
      pollCount++;
      const inboxRes = await getInbox();
      if (inboxRes.ok) setThreads(inboxRes.data);

      if (activeThreadId) {
        const threadRes = await getThread(activeThreadId);
        if (threadRes.ok) setActiveMessages(threadRes.data);
      }

      if (pollCount % 3 === 0) {
        const contactsRes = await getContacts();
        if (contactsRes.ok) setContacts(contactsRes.data);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [activeThreadId]);

  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      const q = search.toLowerCase();
      return !q || t.user.full_name?.toLowerCase().includes(q);
    });
  }, [threads, search]);

  const groupedContacts = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = contacts.filter((c) => !q || c.full_name?.toLowerCase().includes(q));
    
    // Partition by role
    const groups: Record<string, MessageContact[]> = {};
    filtered.forEach(c => {
      const role = c.role || 'other';
      if (!groups[role]) groups[role] = [];
      groups[role].push(c);
    });

    // Define order and display names
    const roleOrder = ['admin', 'teacher', 'security', 'parent'];
    const roleLabels: Record<string, string> = {
      admin: 'Admin',
      teacher: 'Teachers',
      security: 'Security',
      parent: 'Parents'
    };

    return roleOrder
      .filter(role => groups[role] && groups[role].length > 0)
      .map(role => ({
        role,
        label: roleLabels[role] || capitalizeRole(role),
        items: groups[role]
      }));
  }, [contacts, search]);

  const activeThread = useMemo(() => {
    const t = threads.find((t) => t.user.id === activeThreadId);
    if (t) return t;
    return contacts.find((c) => c.id === activeThreadId);
  }, [threads, contacts, activeThreadId]);

  const activeUser = useMemo(() => {
    if (!activeThread) return null;
    return 'user' in activeThread ? activeThread.user : activeThread;
  }, [activeThread]);

  const openThread = async (userId: string) => {
    setActiveThreadId(userId);
    setShowContacts(false);
    const res = await getThread(userId);
    if (res.ok) {
      setActiveMessages(res.data);
      // Mark as read
      const unreadMsgs = res.data.filter(m => !m.is_read && m.receiver_id === user?.userId);
      if (unreadMsgs.length > 0) {
        clearUnread();
        setThreads(prev => prev.map(t => t.user.id === userId ? { ...t, unreadCount: 0 } : t));
        await Promise.all(unreadMsgs.map(m => markAsRead(m.id)));
        refreshUnread();
      }
    }
    setCompose("");
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSend = async () => {
    if (!compose.trim() || !activeThreadId) return;
    setIsSending(true);

    const res = await sendMessage({
      receiver_id: activeThreadId,
      content: compose.trim(),
    });

    if (res.ok) {
      const threadRes = await getThread(activeThreadId);
      if (threadRes.ok) setActiveMessages(threadRes.data);
      setCompose("");
      const inboxRes = await getInbox();
      if (inboxRes.ok) {
        setThreads(inboxRes.data);
        if (user?.userId) cacheSet(`inbox:${user.userId}`, inboxRes.data, 60);
      }
    }
    setIsSending(false);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Delete this message for everyone?")) return;
    const res = await deleteMessage(messageId);
    if (res.ok) {
      setActiveMessages(prev => prev.filter(m => m.id !== messageId));
      fetchData(); 
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAiDraft = async () => {
    if (!activeThread) return;
    
    // Try to get student ID from contact object or last message
    const studentId = ('user' in activeThread) 
      ? (activeThread.user.student_id || activeThread.lastMessage.student_id)
      : activeThread.student_id;

    if (!studentId) {
      alert("Could not identify the related student for this conversation.");
      return;
    }

    setIsAiLoading(true);
    const res = await generateAiDraft(studentId); 
    if (res.ok) {
      setCompose(res.data.draft);
    }
    setIsAiLoading(false);
  };

  return (
    <div className="flex w-full flex-col gap-[20px] pb-12 pr-2">
      <PageHeader
        title={pageTitle}
        onRefresh={fetchData}
        subtitle={
          totalUnread > 0
            ? `${totalUnread} unread message${totalUnread > 1 ? "s" : ""}`
            : pageSubtitleEmpty
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
          {/* Search + action */}
          <div className="border-b border-[#e2e8f0] p-4">
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={showContacts ? "Search contacts..." : "Search messages..."}
                  className="w-full rounded-lg border border-[#e2e8f0] py-2 pl-9 pr-3 text-[13px] outline-none focus:ring-1"
                  style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
                />
              </div>
              <button 
                onClick={() => setShowContacts(!showContacts)}
                className="px-3 py-2 rounded-lg text-[13px] font-bold transition-colors"
                style={{ 
                  backgroundColor: showContacts ? accentColor : accentBg, 
                  color: showContacts ? "#ffffff" : accentColor 
                }}
              >
                {showContacts ? "Back" : "New"}
              </button>
            </div>
          </div>

          {/* List area */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" style={{ color: accentColor }} />
              </div>
            ) : showContacts ? (
              groupedContacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-[#94a3b8]">
                  <p className="text-[13px]">No contacts found.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {groupedContacts.map((group) => (
                    <div key={group.role} className="flex flex-col">
                      <div className="sticky top-0 z-10 flex items-center gap-2 bg-[#f8fafc] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#64748b] border-y border-[#e2e8f0]">
                        <span className="flex-shrink-0">{group.label}</span>
                        <div className="h-[1px] flex-1 bg-[#e2e8f0]" />
                      </div>
                      {group.items.map((contact) => (
                        <ContactListItem
                          key={contact.id}
                          contact={contact}
                          onClick={() => openThread(contact.id)}
                          accentColor={accentColor}
                          accentLight={accentLight}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              )
            ) : filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-[#94a3b8]">
                <MessageSquare className="h-8 w-8 opacity-40" />
                <p className="text-[13px]">No conversations found.</p>
              </div>
            ) : (
              filteredThreads.map((thread) => (
                <ThreadListItem
                  key={thread.user.id}
                  thread={thread}
                  isActive={thread.user.id === activeThreadId}
                  onClick={() => openThread(thread.user.id)}
                  accentColor={accentColor}
                  accentBg={accentBg}
                  accentLight={accentLight}
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
                  className="mr-1 flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-bold md:hidden hover:bg-opacity-10"
                  style={{ color: accentColor, backgroundColor: accentBg }}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>

                <div className="relative h-10 w-10 flex-shrink-0">
                  <div 
                    className="flex h-full w-full items-center justify-center rounded-full text-[13px] font-bold overflow-hidden"
                    style={{ backgroundColor: accentLight, color: accentColor }}
                  >
                    {activeUser?.avatar_url ? (
                      <Image 
                        src={activeUser.avatar_url} 
                        alt="" 
                        width={40} 
                        height={40} 
                        className="h-full w-full object-cover" 
                        unoptimized
                      />
                    ) : (
                      activeUser?.full_name?.charAt(0) || "?"
                    )}
                  </div>
                  {activeUser?.is_online && (
                    <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 z-10" />
                  )}
                </div>

                <div>
                  <p className="text-[14px] font-bold text-[#0f172a]">
                    {activeUser?.full_name}
                  </p>
                  <p className="text-[11px] font-medium text-[#64748b]">{capitalizeRole(activeUser?.role || "")}</p>
                </div>

                {/* Status indicator */}
                <UserStatus 
                  isOnline={!!activeUser?.is_online} 
                  lastSeen={activeUser?.last_seen}
                  className="ml-auto rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1"
                />

              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto bg-[#f8fafc] px-5 py-4">
                <div className="flex flex-col gap-3">
                  {activeMessages.map((msg) => (
                    <ChatBubble 
                      key={msg.id} 
                      message={msg} 
                      currentUserId={user?.userId || ""} 
                      onDelete={handleDeleteMessage}
                      accentColor={accentColor}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Compose bar */}
              <div className="border-t border-[#e2e8f0] bg-white px-5 py-4">
                {/* AI Draft button */}
                {showAiDraft && (
                  <div className="mb-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleAiDraft}
                      disabled={isAiLoading}
                      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold transition-all hover:shadow-sm disabled:opacity-60"
                      style={{ 
                        borderColor: accentLight, 
                        backgroundColor: accentBg, 
                        color: accentColor 
                      }}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {isAiLoading ? "Generating…" : "Draft with AI"}
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-3">
                  <textarea
                    value={compose}
                    onChange={(e) => setCompose(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                    rows={2}
                    className="flex-1 resize-none rounded-xl border border-[#e2e8f0] px-4 py-2.5 text-[13px] leading-relaxed outline-none focus:ring-1"
                    style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!compose.trim() || isSending}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-300"
                    style={{ backgroundColor: accentColor }}
                  >
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>

                <p className="mt-1.5 text-[11px] text-[#94a3b8]">
                  {footerNote}
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
