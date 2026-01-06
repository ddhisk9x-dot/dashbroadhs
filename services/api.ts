import { Student, AIReport, StudyAction, User, Role } from '../types';

async function postJSON<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Request failed');
  return data as T;
}

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'include' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Request failed');
  return data as T;
}

export const api = {
  login: async (username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const data = await postJSON<{ success: boolean; user?: User; error?: string }>('/api/login', { username, password });
      return data;
    } catch (e: any) {
      return { success: false, error: e?.message || 'Đăng nhập thất bại' };
    }
  },

  logout: async (): Promise<void> => {
    await postJSON('/api/logout', {});
  },

  getAllStudents: async (): Promise<Student[]> => {
    const data = await getJSON<{ students: Student[] }>('/api/admin_get_students');
    return data.students ?? [];
  },

  saveAllStudents: async (students: Student[]): Promise<void> => {
    await postJSON('/api/admin_save_students', { students });
  },

  getStudentMe: async (): Promise<Student> => {
    const data = await getJSON<{ student: Student }>('/api/student_me');
    return data.student;
  },

  tickAction: async (actionId: string, date: string, completed: boolean): Promise<void> => {
    await postJSON('/api/student_tick', { actionId, date, completed });
  },

  saveReport: async (mhs: string, report: AIReport, actions: StudyAction[]): Promise<void> => {
    await postJSON('/api/admin_save_report', { mhs, aiReport: report, activeActions: actions });
  },

  generateReport: async (student: Student): Promise<AIReport> => {
    const data = await postJSON<{ report: AIReport }>('/api/ai_generate_report', { student });
    return data.report;
  }
};
