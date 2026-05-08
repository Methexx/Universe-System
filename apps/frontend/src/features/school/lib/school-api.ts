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
  school_grade?: { id: string; name: string };
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
  parent_name: string | null;
  is_parent_linked: boolean;
  is_active: boolean;
  created_at: string;
  class?: {
    id: string;
    name: string;
    school_grade: { id: string; name: string };
    teacher?: { id: string; full_name: string | null } | null;
  } | null;
};

export type CreateStudentBody = {
  full_name: string;
  date_of_birth: string;
  gender?: string;
  class_id?: string;
  parent_email?: string;
  parent_mobile?: string;
  parent_name?: string;
  photo_url?: string;
};

export function getGradesWithClasses() {
  return request<GradeWithClasses[]>('/api/school/grades-with-classes');
}

export function getStudents() {
  return request<StudentRecord[]>('/api/school/students');
}

export function getClassStudents(classId: string) {
  return request<StudentRecord[]>(`/api/school/classes/${classId}/students`);
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

export type AdminTeacherRecord = {
  id: string;
  full_name: string | null;
  email: string;
  user_id_no: string | null;
  gender: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  is_active: boolean;
  is_suspended: boolean;
  classes_taught: {
    id: string;
    name: string;
    school_grade: { id: string; name: string };
  }[];
};

export function getTeachersAdmin() {
  return request<AdminTeacherRecord[]>('/api/users/teachers');
}

export function getNextStudentId() {
  return request<{ next_id: string }>('/api/school/students/next-id');
}

export async function uploadStudentPhoto(file: File): Promise<ApiResult<{ photo_url: string }>> {
  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const res = await fetch(`${BASE}/api/school/students/photo`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photo_url: dataUrl }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data: (json.data ?? json) as { photo_url: string } };
    return { ok: false, status: res.status, error: json.error ?? json.message ?? 'UNKNOWN' };
  } catch {
    return { ok: false, status: 0, error: 'NETWORK_ERROR' };
  }
}

export function updateStudent(id: string, body: Partial<CreateStudentBody> & { is_active?: boolean; class_id?: string | null }) {
  return request<StudentRecord>(`/api/school/students/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function suspendStudent(id: string) {
  return updateStudent(id, { is_active: false });
}

export function unsuspendStudent(id: string) {
  return updateStudent(id, { is_active: true });
}

export function deleteStudent(id: string) {
  return request<void>(`/api/school/students/${id}`, {
    method: 'DELETE',
  });
}

export type OverviewStats = {
  activeStudents: number;
  suspendedStudents: number;
  lockedAccounts: number;
  todayAttendance: number;
  yesterdayAttendance: number;
};

export function getOverviewStats(classId?: string) {
  const query = classId ? `?class_id=${encodeURIComponent(classId)}` : '';
  return request<OverviewStats>(`/api/school/overview/stats${query}`);
}

export type RecentActivity = {
  type: string;
  id: string;
  timestamp: string;
  title: string;
  details: string;
};

export function getRecentActivity() {
  return request<RecentActivity[]>('/api/school/overview/recent-activity');
}

export function createGrade(name: string) {
  return request<{ id: string; name: string }>('/api/school/grades', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export function deleteGrade(id: string) {
  return request<void>(`/api/school/grades/${id}`, { method: 'DELETE' });
}

export function createClass(body: { school_grade_id: string; name: string; teacher_id?: string | null }) {
  return request<ClassItem & { school_grade_id: string }>('/api/school/classes', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function deleteClass(id: string) {
  return request<void>(`/api/school/classes/${id}`, { method: 'DELETE' });
}

export function updateClass(id: string, body: { teacher_id?: string | null }) {
  return request<ClassItem>(`/api/school/classes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
