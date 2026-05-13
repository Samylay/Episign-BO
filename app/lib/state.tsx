'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type Alert, type AlertStatus, type Session, type Teacher } from './mock-data';
import { supabase, fetchSessionsWithStats, fetchTeachers as fetchDbTeachers, dbSessionToSession, type DbTeacher, getAuthRole } from './supabase';

export type AuditEntry = {
  id: string;
  studentId: number;
  studentName: string;
  sessionId: string;
  sessionLabel: string;
  slot: 'am' | 'pm';
  kind: 'invalidate' | 'justify';
  reason: string;
  at: string;
  by: string;
};

export type SignatureEvent = {
  id: string;
  sessionId: string;
  studentName: string;
  at: string;
};

export type Role = 'admin' | 'teacher';

type AppState = {
  // auth + role
  role: Role;
  setRole: (r: Role) => void;
  currentTeacherId: string;
  setCurrentTeacherId: (id: string) => void;
  teachers: Teacher[];
  dbTeachers: DbTeacher[];
  loading: boolean;

  // sessions (mutable so DevTools can flip status)
  sessions: Session[];
  setSessions: (s: Session[]) => void;
  setSessionStatus: (id: string, status: Session['status']) => void;
  bumpSignatureAM: (id: string) => void;
  refreshSessions: () => Promise<void>;

  // alerts
  alerts: Alert[];
  setAlertStatus: (id: number, status: AlertStatus, comment: string) => void;
  pushAlert: (a: Omit<Alert, 'id' | 'status'>) => void;

  // moderation (local overlay — also written to DB via moderate_attendance)
  invalidations: Record<string, string>;
  invalidate: (params: { studentId: number; studentName: string; sessionId: string; sessionLabel: string; slot: 'am' | 'pm'; reason: string }) => void;
  justifications: Record<string, string>;
  justify: (params: { studentId: number; studentName: string; sessionId: string; sessionLabel: string; slot: 'am' | 'pm'; reason: string }) => void;
  audit: AuditEntry[];

  // live feed
  signatureFeed: SignatureEvent[];
  pushSignature: (sessionId: string, studentName: string) => void;

  // reset
  resetAll: () => void;
};

const Ctx = createContext<AppState | null>(null);

const cellKey = (sessionId: string, studentId: number, slot: 'am' | 'pm') => `${sessionId}:${studentId}:${slot}`;

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('admin');
  const [currentTeacherId, setCurrentTeacherId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [invalidations, setInvalidations] = useState<Record<string, string>>({});
  const [justifications, setJustifications] = useState<Record<string, string>>({});
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [signatureFeed, setSignatureFeed] = useState<SignatureEvent[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [dbTeachers, setDbTeachers] = useState<DbTeacher[]>([]);

  const loadSessions = async (teacherId?: string) => {
    setLoading(true);
    const raw = await fetchSessionsWithStats(teacherId);
    if (raw.length > 0) setSessions(raw.map(dbSessionToSession));
    setLoading(false);
  };

  const loadTeachers = async () => {
    const rows = await fetchDbTeachers();
    if (rows.length > 0) {
      setDbTeachers(rows);
      setTeachers(rows.map((t) => ({ id: t.id, name: `${t.first_name} ${t.last_name}`, email: t.email })));
    }
  };

  // Listen to Supabase auth state; load real data when signed in
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const roleInfo = await getAuthRole(session.user.id);
        if (roleInfo) {
          setRole(roleInfo.role);
          if (roleInfo.role === 'teacher') {
            setCurrentTeacherId(roleInfo.profileId);
            await loadSessions(roleInfo.profileId);
          } else {
            setCurrentTeacherId('');
            await loadSessions();
          }
          await loadTeachers();
        }
      }
    });
    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshSessions = async () => {
    const tid = role === 'teacher' ? currentTeacherId : undefined;
    await loadSessions(tid || undefined);
  };

  const pushAudit = (entry: Omit<AuditEntry, 'id' | 'at' | 'by'>) => {
    setAudit((prev) => [
      { ...entry, id: crypto.randomUUID(), at: new Date().toISOString(), by: 'Admin' },
      ...prev,
    ]);
  };

  const value: AppState = {
    role,
    setRole,
    currentTeacherId,
    setCurrentTeacherId,
    teachers,
    dbTeachers,
    loading,

    sessions,
    setSessions,
    setSessionStatus: (id, status) =>
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s))),
    bumpSignatureAM: (id) =>
      setSessions((prev) =>
        prev.map((s) => (s.id === id && s.signedAM < s.enrolled ? { ...s, signedAM: s.signedAM + 1 } : s)),
      ),
    refreshSessions,

    alerts,
    setAlertStatus: (id, status, comment) =>
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status, comment } : a))),
    pushAlert: (a) =>
      setAlerts((prev) => [{ ...a, id: Date.now(), status: 'new' }, ...prev]),

    invalidations,
    invalidate: ({ studentId, studentName, sessionId, sessionLabel, slot, reason }) => {
      setInvalidations((prev) => ({ ...prev, [cellKey(sessionId, studentId, slot)]: reason }));
      pushAudit({ studentId, studentName, sessionId, sessionLabel, slot, kind: 'invalidate', reason });
    },
    justifications,
    justify: ({ studentId, studentName, sessionId, sessionLabel, slot, reason }) => {
      setJustifications((prev) => ({ ...prev, [cellKey(sessionId, studentId, slot)]: reason }));
      pushAudit({ studentId, studentName, sessionId, sessionLabel, slot, kind: 'justify', reason });
    },
    audit,

    signatureFeed,
    pushSignature: (sessionId, studentName) => {
      setSignatureFeed((prev) => [{ id: crypto.randomUUID(), sessionId, studentName, at: new Date().toISOString() }, ...prev]);
    },

    resetAll: () => {
      setSessions([]);
      setAlerts([]);
      setInvalidations({});
      setJustifications({});
      setAudit([]);
      setSignatureFeed([]);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAppState must be used inside AppStateProvider');
  return v;
}

export const cellKeyOf = cellKey;
