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

export type TeacherInfo = {
  id: string;
  full_name: string | null;
  email: string;
  user_id_no: string | null;
};

export type ClassItem = {
  id: string;
  name: string;
  teacher: TeacherInfo | null;
};

export type GradeWithClasses = {
  id: string;
  name: string;
  classes: ClassItem[];
};

export type StudentRecord = {
  id: string;
  full_name: string;
  student_id_no: string;
  date_of_birth: string;
  photo_url: string | null;
  gender: string | null;
  class_id: string | null;
  parent_email: string | null;
  parent_mobile: string | null;
  parent_id_no: string | null;
  is_parent_linked: boolean;
  is_active: boolean;
  created_at: string;
  class?: {
    id: string;
    name: string;
    school_grade: { id: string; name: string };
  } | null;
};

export type CreateStudentBody = {
  full_name: string;
  date_of_birth: string;
  gender?: string;
  class_id?: string;
  parent_email?: string;
  parent_mobile?: string;
  photo_url?: string;
};

export function getGradesWithClasses() {
  return request<GradeWithClasses[]>('/api/school/grades-with-classes');
}

export function getStudents() {
  return request<StudentRecord[]>('/api/school/students');
}

export function createStudent(body: CreateStudentBody) {
  return request<StudentRecord>('/api/school/students', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getTeachers() {
  return request<TeacherInfo[]>('/api/users/teachers');
}

export function getNextStudentId() {
  return request<{ next_id: string }>('/api/school/students/next-id');
}

export async function uploadStudentPhoto(file: File): Promise<ApiResult<{ photo_url: string }>> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE}/api/school/students/photo`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data: (json.data ?? json) as { photo_url: string } };
    return { ok: false, status: res.status, error: json.error ?? json.message ?? 'UNKNOWN' };
  } catch {
    return { ok: false, status: 0, error: 'NETWORK_ERROR' };
  }
}
