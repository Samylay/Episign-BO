'use client';

import { createClient } from '@supabase/supabase-js';

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anon);

// ---- DB row types ----

export type DbTeacher = {
  id: string;
  auth_user_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  card_code: string;
};

export type DbAdmin = {
  id: string;
  auth_user_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
};

export type DbClass = {
  id: string;
  code: string;
  label: string;
  promo: string;
  filiere: string;
  group_number: number;
};

export type DbSessionStats = {
  id: string;
  code: string;
  course_name: string;
  teacher_id: string;
  teacher_first_name: string;
  teacher_last_name: string;
  teacher_email: string;
  teacher_card_code: string;
  room: string;
  starts_at: string;
  ends_at: string;
  slot: 'morning' | 'afternoon' | 'full';
  topic: string | null;
  created_at: string;
  classes: Array<{ id: string; label: string; code: string }>;
  enrolled: number;
  signed_am: number;
  signed_pm: number;
};

export type DbSessionStudent = {
  student_id: string;
  forge_login: string;
  first_name: string;
  last_name: string;
  email: string;
  card_code: string | null;
  class_label: string;
  am_status: string | null;
  pm_status: string | null;
  am_signed_at: string | null;
  pm_signed_at: string | null;
  am_justification: string | null;
  pm_justification: string | null;
};

export type DbAlertDetail = {
  id: string;
  type: string;
  detail: string | null;
  status: 'new' | 'resolved' | 'ignored';
  comment: string | null;
  created_at: string;
  session_id: string;
  session_name: string;
  session_code: string;
  student_id: string;
  student_name: string;
  class_label: string;
  time_label: string;
  date_label: string;
};

// ---- Auth helpers ----

export async function getAuthRole(userId: string): Promise<{ role: 'admin' | 'teacher'; profileId: string } | null> {
  const [{ data: admin }, { data: teacher }] = await Promise.all([
    supabase.from('admins').select('id').eq('auth_user_id', userId).maybeSingle(),
    supabase.from('teachers').select('id').eq('auth_user_id', userId).maybeSingle(),
  ]);
  if (admin) return { role: 'admin', profileId: admin.id };
  if (teacher) return { role: 'teacher', profileId: teacher.id };
  return null;
}

// ---- Data helpers ----

export async function fetchSessionsWithStats(teacherId?: string): Promise<DbSessionStats[]> {
  const { data, error } = await supabase.rpc('get_sessions_with_stats', {
    p_teacher_id: teacherId ?? null,
  });
  if (error) { console.error('fetchSessions:', error); return []; }
  return (data ?? []) as DbSessionStats[];
}

export async function fetchSessionStudents(sessionId: string): Promise<DbSessionStudent[]> {
  const { data, error } = await supabase.rpc('get_session_students', { p_session_id: sessionId });
  if (error) { console.error('fetchSessionStudents:', error); return []; }
  return (data ?? []) as DbSessionStudent[];
}

export async function fetchClasses(): Promise<DbClass[]> {
  const { data, error } = await supabase.from('classes').select('*').order('promo').order('filiere').order('group_number');
  if (error) { console.error('fetchClasses:', error); return []; }
  return (data ?? []) as DbClass[];
}

export async function fetchTeachers(): Promise<DbTeacher[]> {
  const { data, error } = await supabase.from('teachers').select('*').order('last_name');
  if (error) { console.error('fetchTeachers:', error); return []; }
  return (data ?? []) as DbTeacher[];
}

export type DbStudentStats = {
  id: string;
  forge_login: string;
  first_name: string;
  last_name: string;
  email: string;
  card_code: string | null;
  class_label: string;
  promo: string;
  total_sessions: number;
  attended: number;
};

export type DbStudentHistory = {
  session_id: string;
  session_code: string;
  course_name: string;
  slot: string;
  status: string;
  signed_at: string | null;
  starts_at: string;
};

export async function fetchStudentsWithStats(): Promise<DbStudentStats[]> {
  const { data, error } = await supabase.rpc('get_students_with_stats');
  if (error) { console.error('fetchStudents:', error); return []; }
  return (data ?? []) as DbStudentStats[];
}

export async function fetchStudentHistory(studentId: string): Promise<DbStudentHistory[]> {
  const { data, error } = await supabase.rpc('get_student_attendance_history', { p_student_id: studentId });
  if (error) { console.error('fetchStudentHistory:', error); return []; }
  return (data ?? []) as DbStudentHistory[];
}

export async function fetchAlertsWithDetails(): Promise<DbAlertDetail[]> {
  const { data, error } = await supabase
    .from('alerts_with_details')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchAlerts:', error); return []; }
  return (data ?? []) as DbAlertDetail[];
}

// ---- Conversion: DbSessionStats → Session (mock-data.ts compatible) ----

export type SessionStatus = 'in_progress' | 'upcoming' | 'completed';

export function dbSessionToSession(db: DbSessionStats): import('./mock-data').Session {
  const now    = new Date();
  const starts = new Date(db.starts_at);
  const ends   = new Date(db.ends_at);

  let status: SessionStatus;
  if (now >= starts && now <= ends) status = 'in_progress';
  else if (now < starts)            status = 'upcoming';
  else                              status = 'completed';

  const pad = (n: number) => n.toString().padStart(2, '0');
  const fmt = (d: Date)   => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  return {
    id:             db.id,
    code:           db.code,
    course:         db.course_name,
    teacher:        `${db.teacher_first_name} ${db.teacher_last_name}`,
    teacherId:      db.teacher_id,
    room:           db.room,
    date:           db.starts_at.split('T')[0],
    timeRange:      `${fmt(starts)} – ${fmt(ends)}`,
    slot:           db.slot,
    status,
    classLabel:     db.classes.map((c) => c.label).join(', ') || '—',
    enrolled:       Number(db.enrolled),
    signedAM:       Number(db.signed_am),
    signedPM:       Number(db.signed_pm),
    teacherCardCode: db.teacher_card_code,
    startsAt:       db.starts_at,
    endsAt:         db.ends_at,
  };
}
