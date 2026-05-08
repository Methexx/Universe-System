const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

type ApiOk<T> = { ok: true; data: T };
type ApiErr = { ok: false; status: number; error: string };
type ApiResult<T> = ApiOk<T> | ApiErr;

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${BASE}${path}`, { credentials: 'include', ...options });
    const json = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data: (json.data ?? json) as T };
    return { ok: false, status: res.status, error: json.error ?? json.message ?? 'UNKNOWN' };
  } catch {
    return { ok: false, status: 0, error: 'NETWORK_ERROR' };
  }
}

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type PolicyDocument = {
  id: string;
  file_name: string;
  display_name: string;
  is_processed: boolean;
  processing_status: ProcessingStatus;
  processing_error: string | null;
  chunk_count: number;
  created_at: string;
};

export async function listDocuments(): Promise<ApiResult<PolicyDocument[]>> {
  const res = await request<{ documents: PolicyDocument[] }>('/api/rag/documents');
  if (!res.ok) return res;
  return { ok: true, data: res.data.documents };
}

export async function uploadDocument(
  file: File
): Promise<ApiResult<{ id: string; display_name: string; is_processed: boolean; processing_status: ProcessingStatus }>> {
  const form = new FormData();
  form.append('file', file);
  return request('/api/rag/documents', { method: 'POST', body: form });
}

export async function deleteDocument(id: string): Promise<ApiResult<{ success: boolean }>> {
  return request(`/api/rag/documents/${id}`, { method: 'DELETE' });
}

export async function retryDocument(
  id: string
): Promise<ApiResult<{ id: string; processing_status: ProcessingStatus }>> {
  return request(`/api/rag/documents/${id}/retry`, { method: 'POST' });
}
