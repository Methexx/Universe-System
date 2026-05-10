const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

type ApiOk<T> = { ok: true; data: T };
type ApiErr = { ok: false; status: number; error: string };
type ApiResult<T> = ApiOk<T> | ApiErr;

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const hasBody = options.body !== undefined && options.body !== null;
    const res = await fetch(`${BASE}${path}`, {
      credentials: 'include',
      headers: {
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
      ...options,
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data: (json.data ?? json) as T };
    return { ok: false, status: res.status, error: json.error ?? json.message ?? 'UNKNOWN' };
  } catch {
    return { ok: false, status: 0, error: 'NETWORK_ERROR' };
  }
}

export type MessageContact = {
  id: string;
  full_name: string | null;
  role: string;
  avatar_url: string | null;
  last_seen: string | null;
  student_name?: string;
  student_id?: string;
  class_name?: string;
  is_online?: boolean;
};

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  student_id: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
  sender: { full_name: string | null; role: string; avatar_url?: string | null; is_online?: boolean };
  receiver: { full_name: string | null; role: string; avatar_url?: string | null; is_online?: boolean };
  student?: { full_name: string | null };
};

export type MessageThread = {
  user: MessageContact;
  lastMessage: Message;
  unreadCount: number;
};

export function getContacts() {
  return request<MessageContact[]>('/api/messages/contacts');
}

export function getInbox() {
  return request<MessageThread[]>('/api/messages/inbox');
}

export function getThread(userId: string) {
  return request<Message[]>(`/api/messages/thread/${userId}`);
}

export function sendMessage(body: { receiver_id: string; content: string; student_id?: string }) {
  return request<{ message_id: string }>('/api/messages/send', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function markAsRead(id: string) {
  return request<{ success: true }>(`/api/messages/${id}/read`, {
    method: 'PUT',
  });
}

export function deleteMessage(id: string) {
  return request<{ success: true }>(`/api/messages/${id}`, {
    method: 'DELETE',
  });
}

export function capitalizeRole(role: string): string {
  if (!role) return "";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function generateAiDraft(studentId: string) {
  return request<{ draft: string }>('/api/messages/ai-draft', {
    method: 'POST',
    body: JSON.stringify({ student_id: studentId }),
  });
}

export function formatLastSeen(dateStr?: string | null): string {
  if (!dateStr || new Date(dateStr).getTime() < 100000) return "Offline";
  const date = new Date(dateStr);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 0) return "Online";
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const isToday = date.toDateString() === now.toDateString();
  const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  if (isToday) {
    return `Today at ${timeStr}`;
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isYesterday) {
    return `Yesterday at ${timeStr}`;
  }
  
  return `${date.toLocaleDateString()} ${timeStr}`;
}
