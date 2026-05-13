const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface GetAnnouncementsParams {
  scope?: string;
  class_id?: string;
  page?: number;
  limit?: number;
}

export interface CreateAnnouncementPayload {
  title: string;
  content: string;
  scope: string;
  target: string;
  image_url?: string | null;
  class_id?: string | null;
}

export async function getAnnouncements(params: GetAnnouncementsParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.scope) searchParams.append('scope', params.scope);
  if (params.class_id) searchParams.append('class_id', params.class_id);
  searchParams.append('page', String(params.page || 1));
  searchParams.append('limit', String(params.limit || 10));

  const res = await fetch(`${API_URL}/api/announcements?${searchParams}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) throw new Error(`Failed to fetch announcements: ${res.statusText}`);
  const json = await res.json();
  return json.data || json;
}

export async function createAnnouncement(payload: CreateAnnouncementPayload) {
  const res = await fetch(`${API_URL}/api/announcements`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create announcement');
  }
  const json = await res.json();
  return json.data || json;
}

export async function deleteAnnouncement(id: string) {
  const res = await fetch(`${API_URL}/api/announcements/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) throw new Error(`Failed to delete announcement: ${res.statusText}`);
  return res.json();
}
