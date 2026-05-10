'use client';

import type { CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '../lib/state';
import { T } from '../lib/tokens';

export type TeacherPageId = 'sessions' | 'profile';

const styles = {
  sidebar: { width: 240, height: '100vh', background: T.brandInk, display: 'flex', flexDirection: 'column', color: '#E2E8F0', position: 'fixed', left: 0, top: 0, zIndex: 100 } as CSSProperties,
  logo: { padding: '22px 20px', fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 10, color: '#fff' } as CSSProperties,
  logoMark: { width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: T.brandInk } as CSSProperties,
  nav: { flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 2 } as CSSProperties,
  item: (active: boolean): CSSProperties => ({
    padding: '10px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 14,
    fontWeight: active ? 600 : 500,
    background: active ? 'rgba(255,255,255,0.14)' : 'transparent',
    color: active ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
    display: 'flex', alignItems: 'center', gap: 12,
    transition: 'background 0.12s, color 0.12s',
    border: 'none', width: '100%', textAlign: 'left', fontFamily: 'inherit',
  }),
  section: { fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', padding: '18px 12px 8px' } as CSSProperties,
};

const Icons = {
  sessions: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
  profile: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a8 8 0 0 1 16 0v1" /></svg>,
};

export function TeacherSidebar({ activePage, onNavigate }: { activePage: TeacherPageId; onNavigate: (p: TeacherPageId) => void }) {
  const { teachers, currentTeacherId } = useAppState();
  const router = useRouter();
  const teacher = teachers.find((t) => t.id === currentTeacherId);

  const items: { id: TeacherPageId; label: string; icon: React.ReactNode }[] = [
    { id: 'sessions', label: 'Mes sessions', icon: Icons.sessions },
    { id: 'profile', label: 'Mon profil', icon: Icons.profile },
  ];

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>
        <div style={styles.logoMark}>E</div>
        <span>Episign</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#fff', background: 'rgba(255,255,255,0.18)', padding: '2px 6px', borderRadius: 4 }}>COURS</span>
      </div>
      <nav style={styles.nav} aria-label="Navigation formateur">
        <div style={styles.section}>Cours</div>
        {items.map((item) => (
          <button key={item.id} style={styles.item(activePage === item.id)} onClick={() => onNavigate(item.id)} aria-current={activePage === item.id ? 'page' : undefined}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div style={{ padding: '14px 12px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 13 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
            {teacher ? teacher.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : '—'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, color: '#fff', fontSize: 13 }}>{teacher?.name ?? 'Formateur'}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Formateur</div>
          </div>
        </div>
        <button onClick={() => router.push('/login')} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: 12.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.12s, color 0.12s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
