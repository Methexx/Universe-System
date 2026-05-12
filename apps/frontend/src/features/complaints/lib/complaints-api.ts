const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Complaint {
  id: string;
  category: string;
  description: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'rejected';
  reply_note: string | null;
  created_at: string;
  updated_at: string;
  assigned_at: string | null;
  parent: { id: string; full_name: string; avatar_url?: string | null } | null;
  assigned_to: { id: string; full_name: string } | null;
  student: { id: string; full_name: string } | null;
}

export async function getMyComplaints() {
  const res = await fetch(`${API_URL}/api/complaints/my`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) throw new Error(`Failed to fetch complaints: ${res.statusText}`);
  const json = await res.json();
  return json.data || [];
}

export async function getAllComplaints(params?: { status?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append('status', params.status);

  const res = await fetch(`${API_URL}/api/complaints/all?${searchParams}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) throw new Error(`Failed to fetch complaints: ${res.statusText}`);
  const json = await res.json();
  return json.data || [];
}

export async function createComplaint(payload: {
  category: string;
  description: string;
  student_id?: string | null;
}) {
  const res = await fetch(`${API_URL}/api/complaints`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create complaint');
  }
  const json = await res.json();
  return json.data || json;
}

export async function assignComplaint(
  id: string,
  payload: { assigned_to_id: string; reply_note?: string }
) {
  const res = await fetch(`${API_URL}/api/complaints/${id}/assign`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to assign complaint');
  }
  const json = await res.json();
  return json.data || json;
}

export async function updateComplaintStatus(
  id: string,
  payload: { status: string; reply_note?: string }
) {
  const res = await fetch(`${API_URL}/api/complaints/${id}/status`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update complaint status');
  }
  const json = await res.json();
  return json.data || json;
}
