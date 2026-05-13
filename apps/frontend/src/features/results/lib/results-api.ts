const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

// ── Types ─────────────────────────────────────────────────────────────────────

export type Term = {
  id: string;
  label: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type ResultModule = {
  id: string;
  result_set_id: string;
  name: string;
  order_index: number;
  created_at: string;
};

export type StudentGrade = {
  id: string;
  result_set_id: string;
  module_id: string;
  student_id: string;
  score: number;
};

export type ResultSet = {
  id: string;
  class_id: string;
  teacher_id: string;
  term_id: string;
  term: Term;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
  modules: ResultModule[];
  grades: StudentGrade[];
};

export type SaveResultSetPayload = {
  modules: { name: string; order_index: number }[];
  grades: { student_id: string; module_name: string; score: number }[];
};

// ── Fetch helper ──────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const hasBody = init?.body !== undefined && init?.body !== null;
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: { ...(hasBody ? { 'Content-Type': 'application/json' } : {}), ...(init?.headers ?? {}) },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Request failed');
  return json.data as T;
}

// ── Term API ──────────────────────────────────────────────────────────────────

export function getTerms(): Promise<Term[]> {
  return apiFetch('/api/results/terms');
}

export function createTerm(label: string): Promise<Term> {
  return apiFetch('/api/results/terms', {
    method: 'POST',
    body: JSON.stringify({ label }),
  });
}

export function renameTerm(termId: string, label: string): Promise<Term> {
  return apiFetch(`/api/results/terms/${termId}`, {
    method: 'PATCH',
    body: JSON.stringify({ label }),
  });
}

export function deleteTerm(termId: string): Promise<void> {
  return apiFetch(`/api/results/terms/${termId}`, { method: 'DELETE' });
}

// ── Result set API ────────────────────────────────────────────────────────────

export function getOrCreateResultSet(classId: string, termId: string): Promise<ResultSet> {
  return apiFetch(`/api/results/class/${classId}?term_id=${termId}`);
}

export function saveResultSet(resultSetId: string, payload: SaveResultSetPayload): Promise<ResultSet> {
  return apiFetch(`/api/results/${resultSetId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function publishResultSet(resultSetId: string): Promise<ResultSet> {
  return apiFetch(`/api/results/${resultSetId}/publish`, { method: 'POST' });
}

export function unpublishResultSet(resultSetId: string): Promise<ResultSet> {
  return apiFetch(`/api/results/${resultSetId}/unpublish`, { method: 'POST' });
}
