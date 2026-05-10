'use client';

import type { CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '../lib/state';
import { T } from '../lib/tokens';

export type PageId = 'dashboard' | 'sessions' | 'signatures' | 'alerts' | 'students' | 'exports';

const styles = {
  sidebar: { width: 240, height: '100vh', background: T.ink, display: 'flex', flexDirection: 'column', color: '#E2E8F0', position: 'fixed', left: 0, top: 0, zIndex: 100, borderRight: '1px solid rgba(255,255,255,0.04)' } as CSSProperties,
  logo: { padding: '22px 20px', fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10, color: '#fff' } as CSSProperties,
  logoMark: { width: 30, height: 30, borderRadius: 9, background: `linear-gradient(135deg, ${T.brand}, ${T.brandSoft})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', boxShadow: '0 2px 8px rgba(30, 79, 214, 0.4)' } as CSSProperties,
  nav: { flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 2 } as CSSProperties,
  item: (active: boolean): CSSProperties => ({
    padding: '10px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 14,
    fontWeight: active ? 600 : 500,
    background: active ? 'rgba(30, 79, 214, 0.18)' : 'transparent',
    color: active ? '#C9DBF7' : '#94A3B8',
    display: 'flex', alignItems: 'center', gap: 12,
    transition: 'background 0.12s, color 0.12s',
    border: 'none', width: '100%', textAlign: 'left', fontFamily: 'inherit',
  }),
  section: { fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', padding: '18px 12px 8px' } as CSSProperties,
  badge: { marginLeft: 'auto', background: T.danger, color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '1px 7px', minWidth: 18, textAlign: 'center' } as CSSProperties,
};

type NavItem = { id: PageId; label: string; icon: React.ReactNode; badge?: number };

const Icon = ({ d }: { d: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
);

const ICONS = {
  dashboard: <Icon d="M3 12l9-9 9 9M5 10v10h14V10" />,
  sessions: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
  signatures: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l5-5 4 4 9-9" /><path d="M14 7h7v7" /></svg>,
  alerts: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></svg>,
  students: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M16 11a4 4 0 1 0 0-8M21 21v-2a4 4 0 0 0-3-3.87" /></svg>,
  exports: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>,
};

export function Sidebar({ activePage, onNavigate }: { activePage: PageId; onNavigate: (p: PageId) => void }) {
  const { alerts } = useAppState();
  const router = useRouter();
  const newAlerts = alerts.filter((a) => a.status === 'new').length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Tableau de bord', icon: ICONS.dashboard },
    { id: 'sessions', label: 'Sessions', icon: ICONS.sessions },
    { id: 'signatures', label: 'Signatures', icon: ICONS.signatures },
    { id: 'alerts', label: 'Alertes', icon: ICONS.alerts, badge: newAlerts || undefined },
    { id: 'students', label: 'Apprenants', icon: ICONS.students },
    { id: 'exports', label: 'Exports', icon: ICONS.exports },
  ];

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>
        <div style={styles.logoMark}>E</div>
        <span>Episign</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#5B8DF0', background: 'rgba(91, 141, 240, 0.12)', padding: '2px 6px', borderRadius: 4 }}>BO</span>
      </div>
      <nav style={styles.nav} aria-label="Navigation principale">
        <div style={styles.section}>Navigation</div>
        {navItems.map((item) => (
          <button key={item.id} style={styles.item(activePage === item.id)} onClick={() => onNavigate(item.id)} aria-current={activePage === item.id ? 'page' : undefined}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, color: 'inherit' }}>{item.icon}</span>
            {item.label}
            {item.badge ? <span style={styles.badge}>{item.badge}</span> : null}
          </button>
        ))}
      </nav>
      <div style={{ padding: '14px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 13, color: '#64748B' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #334155, #475569)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#E2E8F0' }}>ML</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, color: '#E2E8F0', fontSize: 13 }}>M. Laurent</div>
            <div style={{ fontSize: 11, color: '#64748B' }}>Resp. pédagogique</div>
          </div>
        </div>
        <button onClick={() => router.push('/login')} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748B', fontSize: 12.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.12s, color 0.12s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#64748B'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
