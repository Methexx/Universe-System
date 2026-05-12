const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

// ── Internal fetch helper ─────────────────────────────────────────────────────
async function request<T>(
  path: string,
  options: RequestInit & { body?: unknown } = {},
): Promise<T> {
  const { body, ...rest } = options;
  const hasBody = body !== undefined && body !== null;
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...rest.headers,
    },
    ...(hasBody ? { body: JSON.stringify(body) } : {}),
    ...rest,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message ?? json.error ?? `HTTP ${res.status}`);
  }
  // Backend wraps in { success, data } — unwrap
  return (json.data ?? json) as T;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type AttendanceSession = {
  id: string;
  class_id: string;
  teacher_id: string;
  date: string;
  created_at: string;
};

export type AttendanceMarkRecord = {
  id: string;
  student_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
  student: {
    id: string;
    full_name: string;
    student_id_no: string;
    photo_url: string | null;
  };
};

export type SessionWithRecords = {
  session: AttendanceSession | null;
  records: AttendanceMarkRecord[];
};

export type StudentAttendanceSummary = {
  student_id: string;
  full_name: string;
  student_id_no: string;
  photo_url: string | null;
  present: number;
  absent: number;
  late: number;
  total_sessions: number;
  rate: number;
};

// ── API functions ─────────────────────────────────────────────────────────────

/** Create a session for today (idempotent — returns existing if already created) */
export async function createAttendanceSession(
  class_id: string,
): Promise<{ session: AttendanceSession; alreadyExists: boolean }> {
  return request('/api/attendance/session', { method: 'POST', body: { class_id } });
}

/** Get session + attendance records for a class on a given date (defaults to today) */
export async function getAttendanceSession(
  class_id: string,
  date?: string,
): Promise<SessionWithRecords> {
  const params = new URLSearchParams({ class_id });
  if (date) params.set('date', date);
  return request(`/api/attendance/session?${params.toString()}`);
}

/** Batch-submit all marks for a session */
export async function submitAttendanceSession(
  session_id: string,
  marks: Array<{ student_id: string; status: string; remarks?: string }>,
): Promise<{ saved: number; date: string; class_id: string }> {
  return request('/api/attendance/session/submit', {
    method: 'POST',
    body: { session_id, marks },
  });
}

/** Get all dates that have sessions for a class in a given month/year */
export async function getSessionDates(
  class_id: string,
  year: number,
  month: number,
): Promise<string[]> {
  const params = new URLSearchParams({
    class_id,
    year: String(year),
    month: String(month),
  });
  return request(`/api/attendance/session/dates?${params.toString()}`);
}

/** Get per-student attendance summary for a class */
export async function getAttendanceSummary(
  class_id: string,
  range: 'month' | 'term' = 'month',
  month?: number,
  year?: number,
): Promise<StudentAttendanceSummary[]> {
  const params = new URLSearchParams({ class_id, range });
  if (month) params.set('month', String(month));
  if (year) params.set('year', String(year));
  return request(`/api/attendance/summary?${params.toString()}`);
}
