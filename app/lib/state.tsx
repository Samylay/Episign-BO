'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { MOCK_ALERTS, MOCK_SESSIONS, MOCK_TEACHERS, type Alert, type AlertStatus, type Session, type Teacher } from './mock-data';

export type AuditEntry = {
  id: string;
  studentId: number;
  studentName: string;
  sessionId: number;
  sessionLabel: string;
  slot: 'am' | 'pm';
  kind: 'invalidate' | 'justify';
  reason: string;
  at: string;
  by: string;
};

export type SignatureEvent = {
  id: string;
  sessionId: number;
  studentName: string;
  at: string;
};

export type Role = 'admin' | 'teacher';

type AppState = {
  // role
  role: Role;
  setRole: (r: Role) => void;
  currentTeacherId: string;
  setCurrentTeacherId: (id: string) => void;
  teachers: Teacher[];

  // sessions (mutable so DevTools can flip status)
  sessions: Session[];
  setSessionStatus: (id: number, status: Session['status']) => void;
  bumpSignatureAM: (id: number) => void;

  // alerts
  alerts: Alert[];
  setAlertStatus: (id: number, status: AlertStatus, comment: string) => void;
  pushAlert: (a: Omit<Alert, 'id' | 'status'>) => void;

  // moderation
  invalidations: Record<string, string>;
  invalidate: (params: { studentId: number; studentName: string; sessionId: number; sessionLabel: string; slot: 'am' | 'pm'; reason: string }) => void;
  justifications: Record<string, string>;
  justify: (params: { studentId: number; studentName: string; sessionId: number; sessionLabel: string; slot: 'am' | 'pm'; reason: string }) => void;
  audit: AuditEntry[];

  // live feed
  signatureFeed: SignatureEvent[];
  pushSignature: (sessionId: number, studentName: string) => void;

  // reset
  resetAll: () => void;
};

const Ctx = createContext<AppState | null>(null);

const cellKey = (sessionId: number, studentId: number, slot: 'am' | 'pm') => `${sessionId}:${studentId}:${slot}`;

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('admin');
  const [currentTeacherId, setCurrentTeacherId] = useState<string>('t-dupont');

  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [invalidations, setInvalidations] = useState<Record<string, string>>({});
  const [justifications, setJustifications] = useState<Record<string, string>>({});
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [signatureFeed, setSignatureFeed] = useState<SignatureEvent[]>([]);

  const pushAudit = (entry: Omit<AuditEntry, 'id' | 'at' | 'by'>) => {
    setAudit((prev) => [
      { ...entry, id: crypto.randomUUID(), at: new Date().toISOString(), by: 'M. Laurent' },
      ...prev,
    ]);
  };

  const value: AppState = {
    role,
    setRole,
    currentTeacherId,
    setCurrentTeacherId,
    teachers: MOCK_TEACHERS,

    sessions,
    setSessionStatus: (id, status) =>
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s))),
    bumpSignatureAM: (id) =>
      setSessions((prev) =>
        prev.map((s) => (s.id === id && s.signedAM < s.enrolled ? { ...s, signedAM: s.signedAM + 1 } : s)),
      ),

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
      setSessions(MOCK_SESSIONS);
      setAlerts(MOCK_ALERTS);
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
