const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

type ApiOk<T> = { ok: true; data: T };
type ApiErr = { ok: false; status: number; error: string; retry_after?: number; attempts_remaining?: number };
type ApiResult<T> = ApiOk<T> | ApiErr;

async function post<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data: (json.data ?? json) as T };
    return {
      ok: false,
      status: res.status,
      error: json.error ?? json.message ?? 'UNKNOWN',
      retry_after: json.retry_after,
      attempts_remaining: json.attempts_remaining,
    };
  } catch {
    return { ok: false, status: 0, error: 'NETWORK_ERROR' };
  }
}

export function registerUser(body: { full_name: string; email: string; password: string; role: string }) {
  return post<{ message: string }>('/api/auth/register', body);
}

export function verifyOtp(body: { email: string; otp_code: string }) {
  return post<{ role: string; user: { userId: string; email: string; role: string; full_name?: string | null } }>('/api/auth/verify-otp', body);
}

export function resendOtp(body: { email: string }) {
  return post<{ message: string }>('/api/auth/resend-otp', body);
}
