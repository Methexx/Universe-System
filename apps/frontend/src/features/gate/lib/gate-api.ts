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

export type GateStudentResult = {
  id: string;
  full_name: string;
  student_id_no: string;
  qr_code: string;
  date_of_birth: string;
  gender: string | null;
  photo_url: string | null;
  parent_name: string | null;
  parent_email: string | null;
  parent_mobile: string | null;
  is_active: boolean;
  class: {
    id: string;
    name: string;
    school_grade: { id: string; name: string };
    teacher: { id: string; full_name: string | null; email: string } | null;
  } | null;
};

export function getStudentByIdNo(student_id_no: string) {
  return request<GateStudentResult>(`/api/gate/student?id=${encodeURIComponent(student_id_no)}`);
}

export function searchStudents(query: string) {
  return request<GateStudentResult[]>(`/api/gate/search?q=${encodeURIComponent(query)}`);
}

export type ManualScanBody = {
  qr_code: string;
  direction: 'IN' | 'OUT';
  method: 'manual';
  manual_reason: string;
};

export type GateLogRow = {
  id: string;
  student_id_no: string;
  date: string;
  timeLabel: string;
  checkIn: string | null;
  checkOut: string | null;
  method: string;
};

export function getGateEvents(params?: { method?: string; date?: string }) {
  const qs = new URLSearchParams();
  if (params?.method) qs.set('method', params.method);
  if (params?.date)   qs.set('date',   params.date);
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return request<GateLogRow[]>(`/api/gate/events${query}`);
}

export type GateStats = {
  checkIns: number;
  manualEntries: number;
  qrScans: number;
  currentlyInside: number;
};

export function getGateStats() {
  return request<GateStats>('/api/gate/stats');
}

export function submitManualEntry(body: ManualScanBody) {
  return request<{ event: object; student: object }>('/api/gate/scan', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export type TimeseriesPoint = { name: string; uv: number };

export function getGateTimeseries(range: 'today' | 'week' | '30days') {
  return request<TimeseriesPoint[]>(`/api/gate/stats/timeseries?range=${range}`);
}
