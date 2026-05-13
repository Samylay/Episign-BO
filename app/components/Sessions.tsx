'use client';

import { useState, useEffect } from 'react';
import { type Session, type SessionStatus } from '../lib/mock-data';
import { useAppState } from '../lib/state';
import { fetchClasses, type DbClass } from '../lib/supabase';
import { ProgressBar } from './ProgressBar';
import { EmptyState } from './Modal';
import { T } from '../lib/tokens';
import { CodeBadge, ClassBadge, LiveBadge } from './CodeBadge';
import { AppHeader } from './AppHeader';
import { CreateSessionModal } from './CreateSessionModal';
import { EditSessionModal } from './EditSessionModal';
import { todayParis } from '../lib/paris-time';

const statusLabel: Record<SessionStatus, string> = { in_progress: 'En cours', upcoming: 'À venir', completed: 'Terminée' };
const statusColor: Record<SessionStatus, string> = { in_progress: T.success, upcoming: T.warn, completed: T.muted };

const TODAY = todayParis();

type RangeFilter = 'all' | 'day' | 'week' | 'month';
type StatusFilter = 'all' | SessionStatus;

function withinRange(date: string, range: RangeFilter): boolean {
  if (range === 'all') return true;
  const d = new Date(date);
  const t = new Date(TODAY);
  const diffDays = Math.abs((t.getTime() - d.getTime()) / 86400000);
  if (range === 'day') return date === TODAY;
  if (range === 'week') return diffDays <= 7;
  if (range === 'month') return diffDays <= 30;
  return true;
}

export function SessionsPage({ onViewSession }: { onViewSession: (s: Session) => void }) {
  const { sessions } = useAppState();
  const [range, setRange] = useState<RangeFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [promoFilter, setPromoFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editSessionId, setEditSessionId] = useState<string | null>(null);
  const [classes, setClasses] = useState<DbClass[]>([]);

  useEffect(() => { fetchClasses().then(setClasses); }, []);

  const filtered = sessions.filter((s) => {
    if (!withinRange(s.date, range)) return false;
    if (status !== 'all' && s.status !== status) return false;
    if (promoFilter !== 'all' && !s.classLabel.startsWith(promoFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!s.course.toLowerCase().includes(q) && !s.teacher.toLowerCase().includes(q) && !s.room.toLowerCase().includes(q) && !s.code.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const promos = Array.from(new Set(classes.map((c) => c.promo))).sort();

  const rangeOptions: [RangeFilter, string][] = [
    ['all', 'Tout'],
    ['day', 'Jour'],
    ['week', 'Semaine'],
    ['month', 'Mois'],
  ];

  const statusOptions: [StatusFilter, string][] = [
    ['all', 'Tous statuts'],
    ['in_progress', 'En cours'],
    ['upcoming', 'À venir'],
    ['completed', 'Terminées'],
  ];

  const selectStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, border: `1px solid ${T.hairline}`, fontSize: 13, fontFamily: 'inherit', color: T.ink2, background: T.card, cursor: 'pointer', boxShadow: T.shadowSm };

  return (
    <>
    {showCreate && <CreateSessionModal onClose={() => setShowCreate(false)} />}
    {editSessionId && <EditSessionModal sessionId={editSessionId} onClose={() => setEditSessionId(null)} />}
    <div>
      <AppHeader
        title="Sessions"
        subtitle={`${filtered.length} sur ${sessions.length} sessions`}
        actions={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher (code, formation, formateur, salle)..." style={{ padding: '9px 14px', borderRadius: 10, border: `1px solid ${T.hairline}`, fontSize: 13.5, width: 280, fontFamily: 'inherit', outline: 'none', background: T.card, boxShadow: T.shadowSm }} />
            <button onClick={() => setShowCreate(true)} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: T.brand, color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(30,79,214,0.25)' }}>+ Nouvelle session</button>
          </div>
        }
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', background: T.card, border: `1px solid ${T.hairline}`, borderRadius: 10, padding: 3, boxShadow: T.shadowSm }}>
          {rangeOptions.map(([k, l]) => (
            <button key={k} onClick={() => setRange(k)} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: range === k ? T.tint : 'transparent', color: range === k ? T.brand : T.ink3, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{l}</button>
          ))}
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} style={selectStyle}>
          {statusOptions.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <select value={promoFilter} onChange={(e) => setPromoFilter(e.target.value)} style={selectStyle}>
          <option value="all">Toutes promotions</option>
          {promos.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div style={{ background: T.card, borderRadius: 14, boxShadow: T.shadowMd, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <EmptyState icon="▦" title="Aucune session" hint="Aucune session ne correspond aux filtres sélectionnés." />
        ) : (
          <table className="epi-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.hairline}` }}>
                {['Code', 'Formation', 'Formateur', 'Classe', 'Salle', 'Date · Horaire', 'Statut', 'AM', 'PM', ''].map((h, i) => (
                  <th key={i} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: T.ink3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="epi-row epi-clickable" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') onViewSession(s); }} style={{ borderBottom: `1px solid ${T.hairlineSoft}` }} onClick={() => onViewSession(s)}>
                  <td style={{ padding: '14px 16px' }}><CodeBadge code={s.code} /></td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: T.ink, maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.course}</td>
                  <td style={{ padding: '14px 16px', color: T.ink2 }}>{s.teacher}</td>
                  <td style={{ padding: '14px 16px' }}><ClassBadge label={s.classLabel} /></td>
                  <td style={{ padding: '14px 16px', color: T.ink2 }}>{s.room}</td>
                  <td style={{ padding: '14px 16px', color: T.ink2, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                    <div>{s.date}</div>
                    <div style={{ fontSize: 11.5, color: T.muted, marginTop: 1 }}>{s.timeRange}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {s.status === 'in_progress' ? (
                      <LiveBadge />
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: statusColor[s.status] }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor[s.status] }} />
                        {statusLabel[s.status]}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px' }}><ProgressBar value={s.signedAM} max={s.enrolled} /></td>
                  <td style={{ padding: '14px 16px' }}><ProgressBar value={s.signedPM} max={s.enrolled} /></td>
                  <td style={{ padding: '14px 16px' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditSessionId(s.id); }}
                      style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${T.hairline}`, background: T.card, fontSize: 12, color: T.ink2, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
                    >
                      ✎
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
    </>
  );
}
