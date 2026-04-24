import { AuthUser } from '../context/AuthContext';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

type ApiOk<T> = { ok: true; data: T };
type ApiErr = { ok: false; status: number; error: string; retry_after?: number };
type ApiResult<T> = ApiOk<T> | ApiErr;

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data: (json.data ?? json) as T };
    return { ok: false, status: res.status, error: json.error ?? json.message ?? 'UNKNOWN', retry_after: json.retry_after };
  } catch {
    return { ok: false, status: 0, error: 'NETWORK_ERROR' };
  }
}

export type LoginResponse = { role: string; user: AuthUser };
export type MeResponse = { user: AuthUser };
export type PendingUser = { id: string; email: string; full_name: string | null; created_at: string; requested_role?: string };

export function loginUser(body: { email: string; password: string }) {
  return request<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function logoutUser() {
  return request<{ message: string }>('/api/auth/logout', { method: 'POST' });
}

export function getMe() {
  return request<MeResponse>('/api/auth/me');
}

export function getPendingUsers() {
  return request<PendingUser[]>('/api/users/pending');
}

export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  is_suspended: boolean;
  created_at: string;
  avatar_url: string | null;
};

export function getAllUsers() {
  return request<UserProfile[]>('/api/users/all');
}

export function approvePendingUser(id: string, role: string) {
  return request<{ message: string }>(`/api/users/${id}/promote`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
}

export function rejectPendingUser(id: string) {
  return request<{ message: string }>(`/api/users/${id}`, {
    method: 'DELETE',
  });
}

export function forgotPassword(body: { email: string }) {
  return request<{ message: string }>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function resetPassword(body: { email: string; otp_code: string; new_password: string }) {
  return request<{ message: string }>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
