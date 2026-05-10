"use client";

import React, { useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  Search,
  Send,
  ChevronLeft,
  MessageSquare,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { getInbox, getContacts, getThread, sendMessage, markAsRead, MessageContact, MessageThread, Message as ApiMessage, deleteMessage, capitalizeRole } from "@/features/messages/lib/messages-api";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useUnreadMessages } from "@/features/messages/context/UnreadMessagesContext";
import { Loader2 } from "lucide-react";
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
  thread: MessageThread;
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
      <div className="relative h-9 w-9 flex-shrink-0">
        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#e0e7ff] text-[13px] font-bold text-[#4f46e5] overflow-hidden">
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
            thread.user.full_name?.charAt(0) || "?"
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
          {capitalizeRole(thread.user.role)} {thread.user.class_name ? `(${thread.user.class_name})` : ""}
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
          <UnreadBadge count={thread.unreadCount} />
        </div>
      </div>
    </button>
  );
}

function ContactListItem({
  contact,
  onClick,
}: {
  contact: MessageContact;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 border-b border-[#e2e8f0] px-4 py-3.5 text-left transition-colors hover:bg-[#f8fafc]"
    >
      <div className="relative h-9 w-9 flex-shrink-0">
        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#e0e7ff] text-[13px] font-bold text-[#4f46e5] overflow-hidden">
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
            contact.full_name?.charAt(0) || "?"
          )}
        </div>
        {contact.is_online && (
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 z-10" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-[#0f172a]">{contact.full_name}</p>
        <p className="text-[11px] text-[#64748b] flex items-center gap-2">
          {capitalizeRole(contact.role)} {contact.class_name ? `(${contact.class_name})` : ""}
        </p>
      </div>
    </button>
  );
}

function ChatBubble({ message, currentUserId, onDelete }: { message: ApiMessage; currentUserId: string; onDelete: (id: string) => void }) {
  const isMe = message.sender_id === currentUserId;
  return (
    <div className={clsx("group flex relative", isMe ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-[72%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-sm relative",
          isMe
            ? "rounded-br-sm bg-[#4f46e5] text-white"
            : "rounded-bl-sm bg-white text-[#0f172a] border border-[#e2e8f0]"
        )}
      >
        <p>{message.content}</p>
        <p
          className={clsx(
            "mt-1 text-[10px]",
            isMe ? "text-indigo-200" : "text-[#94a3b8]"
          )}
        >
          {formatTimestamp(message.created_at)}
        </p>

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
// Main page
// ---------------------------------------------------------------------------

export default function ParentMessagesPage() {
  const { user } = useAuth();
  const { clearUnread, refresh: refreshUnread } = useUnreadMessages();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [contacts, setContacts] = useState<MessageContact[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<ApiMessage[]>([]);
  const [search, setSearch] = useState("");
  const [compose, setCompose] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const totalUnread = threads.reduce((sum: number, t: MessageThread) => sum + t.unreadCount, 0);

  const fetchData = React.useCallback(async () => {
    const [inboxRes, contactsRes] = await Promise.all([getInbox(), getContacts()]);
    if (inboxRes.ok) setThreads(inboxRes.data);
    if (contactsRes.ok) setContacts(contactsRes.data);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    void (async () => { await fetchData(); })();
  }, [fetchData]);

  // Polling
  React.useEffect(() => {
    const interval = setInterval(async () => {
      const inboxRes = await getInbox();
      if (inboxRes.ok) setThreads(inboxRes.data);

      if (activeThreadId) {
        const threadRes = await getThread(activeThreadId);
        if (threadRes.ok) {
          setActiveMessages(threadRes.data);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeThreadId]);

  const filteredThreads = useMemo(() => {
    return threads.filter((t: MessageThread) => {
      const q = search.toLowerCase();
      return !q || t.user.full_name?.toLowerCase().includes(q);
    });
  }, [threads, search]);

  const filteredContacts = useMemo(() => {
    return contacts.filter((c: MessageContact) => {
      const q = search.toLowerCase();
      return !q || c.full_name?.toLowerCase().includes(q);
    });
  }, [contacts, search]);

  const activeThread = useMemo(() => {
    const t = threads.find((t: MessageThread) => t.user.id === activeThreadId);
    if (t) return t;
    return contacts.find((c: MessageContact) => c.id === activeThreadId);
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
      const unreadMsgs = res.data.filter((m: ApiMessage) => !m.is_read && m.receiver_id === user?.userId);
      if (unreadMsgs.length > 0) {
        clearUnread();
        setThreads((prev: MessageThread[]) => prev.map((t: MessageThread) => t.user.id === userId ? { ...t, unreadCount: 0 } : t));
        await Promise.all(unreadMsgs.map((m: ApiMessage) => markAsRead(m.id)));
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
      if (inboxRes.ok) setThreads(inboxRes.data);
    }
    setIsSending(false);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Delete this message?")) return;
    const res = await deleteMessage(messageId);
    if (res.ok) {
      setActiveMessages((prev: ApiMessage[]) => prev.filter((m: ApiMessage) => m.id !== messageId));
      fetchData(); 
    }
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
        title="Messages"
        onRefresh={fetchData}
        subtitle={
          totalUnread > 0
            ? `${totalUnread} unread message${totalUnread > 1 ? "s" : ""}`
            : "All caught up"
        }
      />

      <div className="flex h-[calc(100vh-220px)] min-h-[560px] overflow-hidden rounded-[24px] border border-[#e2e8f0] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div
          className={clsx(
            "flex w-full flex-col border-r border-[#e2e8f0] md:w-[320px] md:flex-shrink-0",
            activeThread ? "hidden md:flex" : "flex"
          )}
        >
          <div className="border-b border-[#e2e8f0] p-4">
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                  placeholder={showContacts ? "Search teachers..." : "Search messages..."}
                  className="w-full rounded-lg border border-[#e2e8f0] py-2 pl-9 pr-3 text-[13px] outline-none focus:border-indigo-400"
                />
              </div>
              <button 
                onClick={() => setShowContacts(!showContacts)}
                className={clsx(
                  "px-3 py-2 rounded-lg text-[13px] font-bold transition-colors",
                  showContacts ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600"
                )}
              >
                {showContacts ? "Back" : "New"}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              </div>
            ) : showContacts ? (
              filteredContacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-[#94a3b8]">
                  <p className="text-[13px]">No teachers found.</p>
                </div>
              ) : (
                filteredContacts.map((contact: MessageContact) => (
                  <ContactListItem
                    key={contact.id}
                    contact={contact}
                    onClick={() => openThread(contact.id)}
                  />
                ))
              )
            ) : filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-[#94a3b8]">
                <MessageSquare className="h-8 w-8 opacity-40" />
                <p className="text-[13px]">No conversations found.</p>
              </div>
            ) : (
              filteredThreads.map((thread: MessageThread) => (
                <ThreadListItem
                  key={thread.user.id}
                  thread={thread}
                  isActive={thread.user.id === activeThreadId}
                  onClick={() => openThread(thread.user.id)}
                />
              ))
            )}
          </div>
        </div>

        <div
          className={clsx(
            "flex flex-1 flex-col",
            !activeThread ? "hidden md:flex" : "flex"
          )}
        >
          {activeThread ? (
            <>
              <div className="flex items-center gap-3 border-b border-[#e2e8f0] px-5 py-3.5">
                <button
                  type="button"
                  onClick={() => setActiveThreadId(null)}
                  className="mr-1 flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-bold text-[#4f46e5] hover:bg-[#eef2ff] md:hidden"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>

                <div className="relative h-10 w-10 flex-shrink-0">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-[#e0e7ff] text-[13px] font-bold text-[#4f46e5] overflow-hidden">
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

                <UserStatus 
                  isOnline={!!activeUser?.is_online} 
                  lastSeen={activeUser?.last_seen}
                  className="ml-auto rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1"
                />
              </div>

              <div className="flex-1 overflow-y-auto bg-[#f8fafc] px-5 py-4">
                <div className="flex flex-col gap-3">
                  {activeMessages.map((msg: ApiMessage) => (
                    <ChatBubble key={msg.id} message={msg} currentUserId={user?.userId || ""} onDelete={handleDeleteMessage} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="border-t border-[#e2e8f0] bg-white px-5 py-4">
                <div className="flex items-end gap-3">
                  <textarea
                    value={compose}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCompose(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message to teacher..."
                    rows={2}
                    className="flex-1 resize-none rounded-xl border border-[#e2e8f0] px-4 py-2.5 text-[13px] leading-relaxed outline-none focus:border-indigo-400"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!compose.trim() || isSending}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#4f46e5] text-white hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-[#94a3b8]">
              <MessageSquare className="h-12 w-12 opacity-30" />
              <p className="text-[15px] font-semibold text-[#475569]">Select a teacher</p>
              <p className="text-[13px]">
                Start a conversation with your child&apos;s class teacher.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
