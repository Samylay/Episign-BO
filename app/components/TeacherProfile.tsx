'use client';

import { useAppState } from '../lib/state';
import { T } from '../lib/tokens';
import { ClassBadge } from './CodeBadge';
import { AppHeader } from './AppHeader';

export function TeacherProfilePage() {
  const { teachers, currentTeacherId, sessions } = useAppState();
  const teacher = teachers.find((t) => t.id === currentTeacherId);
  const mySessions = sessions.filter((s) => s.teacherId === currentTeacherId);
  const myClasses = Array.from(new Set(mySessions.map((s) => s.classLabel)));

  const upcoming = mySessions.filter((s) => s.status === 'upcoming').length;
  const live = mySessions.filter((s) => s.status === 'in_progress').length;
  const past = mySessions.filter((s) => s.status === 'completed').length;

  if (!teacher) return null;

  return (
    <div>
      <AppHeader title="Mon profil" />
      <div style={{ background: T.card, borderRadius: 16, padding: 28, boxShadow: T.shadowMd, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${T.brand}, ${T.brandSoft})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>
            {teacher.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: T.ink, margin: 0, letterSpacing: '-0.02em' }}>{teacher.name}</h2>
            <div style={{ fontSize: 13.5, color: T.ink3, marginTop: 4 }}>{teacher.email}</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Formateur · Episign</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 16 }}>
        <Stat label="Sessions à venir" value={String(upcoming)} color={T.brand} />
        <Stat label="En cours" value={String(live)} color={T.success} />
        <Stat label="Sessions passées" value={String(past)} color={T.ink3} />
      </div>

      <div style={{ background: T.card, borderRadius: 14, padding: 22, boxShadow: T.shadowMd }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 600, color: T.ink, margin: '0 0 12px' }}>Mes classes</h3>
        {myClasses.length === 0 ? (
          <div style={{ fontSize: 13, color: T.muted }}>Aucune classe assignée.</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {myClasses.map((c) => <ClassBadge key={c} label={c} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: T.card, borderRadius: 12, padding: '18px 22px', boxShadow: T.shadowMd }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: T.ink3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 700, color, marginTop: 6, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{value}</div>
    </div>
  );
}
