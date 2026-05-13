'use client';

/**
 * DEV-ONLY — temporary tooling for testing.
 * Remove this entire `app/dev/` directory + the import in `app/layout.tsx` when shipping.
 */

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppState, type Role } from '../lib/state';
const STUDENT_NAMES = ['Alice Martin', 'Hugo Bernard', 'Léa Thomas', 'Omar Diallo', 'Sofia Nguyen', 'Maxime Lefebvre', 'Camille Dupont', 'Rayan Benali', 'Eva Petit', 'Théo Rousseau', 'Jade Moreau', 'Lucas Simon', 'Inès Gérard', 'Adrien Faure', 'Manon Blanc', 'Kylian Henry', 'Pauline Robert', 'Noah Michel'];
import { T } from '../lib/tokens';

export function DevTools() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    role, setRole,
    teachers, currentTeacherId, setCurrentTeacherId,
    sessions, setSessionStatus, bumpSignatureAM, pushSignature,
    pushAlert, resetAll,
  } = useAppState();

  const [open, setOpen] = useState(false);

  // Keep role in sync with the URL segment
  useEffect(() => {
    if (pathname.startsWith('/teacher') && role !== 'teacher') setRole('teacher');
    if (pathname.startsWith('/admin') && role !== 'admin') setRole('admin');
  }, [pathname, role, setRole]);

  const switchRole = (r: Role) => {
    setRole(r);
    router.push(r === 'admin' ? '/admin' : '/teacher');
  };

  const liveSession = sessions.find((s) => s.status === 'in_progress' && (role === 'admin' || s.teacherId === currentTeacherId));
  const upcomingForMe = sessions.find((s) => s.status === 'upcoming' && s.teacherId === currentTeacherId);

  const simulateSignature = () => {
    if (!liveSession) return;
    const studentName = STUDENT_NAMES[Math.floor(Math.random() * STUDENT_NAMES.length)];
    bumpSignatureAM(liveSession.id);
    pushSignature(liveSession.id, studentName);
  };

  const simulateAlert = () => {
    const studentName = STUDENT_NAMES[Math.floor(Math.random() * STUDENT_NAMES.length)];
    const session = sessions[Math.floor(Math.random() * sessions.length)];
    pushAlert({
      type: 'time',
      student: studentName,
      session: session.course,
      classLabel: session.classLabel,
      date: session.date,
      time: '07:' + String(Math.floor(Math.random() * 60)).padStart(2, '0'),
      detail: 'Tentative de signature hors fenêtre temporelle (simulé)',
    });
  };

  const toggleSessionStatus = () => {
    const s = liveSession ?? upcomingForMe ?? sessions[0];
    if (!s) return;
    const next = s.status === 'in_progress' ? 'completed' : 'in_progress';
    setSessionStatus(s.id, next);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open DevTools"
        title="DevTools (DEV)"
        style={{
          position: 'fixed', bottom: 16, right: 16, zIndex: 5000,
          width: 44, height: 44, borderRadius: '50%',
          background: '#0F172A', color: '#fff',
          border: `2px solid ${T.brand}`, cursor: 'pointer',
          fontFamily: 'monospace', fontSize: 14, fontWeight: 700,
          boxShadow: '0 8px 24px rgba(10, 27, 46, 0.35)',
        }}
      >
        ⚙
      </button>
    );
  }

  const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '14px 16px' }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );

  const Btn = ({ children, onClick, disabled, primary }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; primary?: boolean }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '7px 12px', borderRadius: 7,
        border: '1px solid rgba(255,255,255,0.15)',
        background: primary ? T.brand : 'rgba(255,255,255,0.06)',
        color: '#fff', fontSize: 12, fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  );

  const selectStyle: React.CSSProperties = {
    padding: '7px 10px', borderRadius: 7,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.06)', color: '#fff',
    fontSize: 12, fontFamily: 'inherit', width: '100%',
  };

  return (
    <div
      role="dialog"
      aria-label="DevTools panel"
      style={{
        position: 'fixed', bottom: 16, right: 16, zIndex: 5000,
        width: 320, background: '#0F172A', color: '#E2E8F0',
        borderRadius: 14, border: `1px solid ${T.brand}`,
        boxShadow: '0 24px 48px rgba(10, 27, 46, 0.5)',
        fontSize: 13,
        animation: 'epi-toast-in 0.2s ease-out',
        maxHeight: 'calc(100vh - 32px)', overflow: 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>DevTools</span>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: '#FBBF24', background: 'rgba(251, 191, 36, 0.12)', padding: '2px 6px', borderRadius: 3 }}>DEV ONLY</span>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Close DevTools" style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 18, padding: 0, width: 24, height: 24 }}>×</button>
      </div>

      <Section label="Rôle">
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn primary={role === 'admin'} onClick={() => switchRole('admin')}>Admin</Btn>
          <Btn primary={role === 'teacher'} onClick={() => switchRole('teacher')}>Formateur</Btn>
        </div>
      </Section>

      {role === 'teacher' && (
        <Section label="Formateur courant">
          <select value={currentTeacherId} onChange={(e) => setCurrentTeacherId(e.target.value)} style={selectStyle}>
            {teachers.map((t) => <option key={t.id} value={t.id} style={{ color: T.ink }}>{t.name}</option>)}
          </select>
        </Section>
      )}

      <Section label="Simulation">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Btn onClick={simulateSignature} disabled={!liveSession}>+ Simuler une signature</Btn>
          <Btn onClick={simulateAlert}>+ Simuler une alerte</Btn>
          <Btn onClick={toggleSessionStatus}>↻ Toggle statut session</Btn>
        </div>
        {liveSession && (
          <div style={{ marginTop: 8, fontSize: 11, color: '#94A3B8' }}>
            Cible : <span style={{ color: '#fff', fontWeight: 600 }}>{liveSession.code}</span> — {liveSession.signedAM}/{liveSession.enrolled}
          </div>
        )}
      </Section>

      <Section label="État">
        <Btn onClick={resetAll}>Reset complet</Btn>
        <div style={{ marginTop: 8, fontSize: 10.5, color: '#64748B', lineHeight: 1.5 }}>
          Restaure sessions, alertes, invalidations, justifications, audit, feed.
        </div>
      </Section>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '10px 16px', fontSize: 10.5, color: '#475569' }}>
        À supprimer : <code style={{ color: '#94A3B8' }}>app/dev/</code>
      </div>
    </div>
  );
}
