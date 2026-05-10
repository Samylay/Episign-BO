'use client';

import { useState } from 'react';
import { STUDENT_NAMES, PROMOTIONS } from '../lib/mock-data';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';
import { EmptyState } from './Modal';
import { T } from '../lib/tokens';
import { ClassBadge } from './CodeBadge';
import { AppHeader } from './AppHeader';

type StudentDir = {
  id: number;
  name: string;
  email: string;
  classLabel: string;
  promo: string;
  totalSessions: number;
  attended: number;
};

export function StudentsPage() {
  const [search, setSearch] = useState('');
  const [promoFilter, setPromoFilter] = useState('all');
  const [selected, setSelected] = useState<number | null>(null);

  const students: StudentDir[] = STUDENT_NAMES.map((name, i) => {
    const cls = PROMOTIONS[i % PROMOTIONS.length];
    const total = 12 + ((i * 3) % 6);
    const attended = total - (i % 4);
    return { id: i, name, email: name.toLowerCase().replace(' ', '.') + '@ecole.fr', classLabel: cls.label, promo: cls.promo, totalSessions: total, attended };
  });

  const filtered = students.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (promoFilter !== 'all' && !s.classLabel.startsWith(promoFilter)) return false;
    return true;
  });

  const promos = ['all', ...Array.from(new Set(students.map((s) => s.promo)))];

  if (selected !== null) {
    const st = students[selected];
    const pct = Math.round((st.attended / st.totalSessions) * 100);
    return (
      <div>
        <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: T.brand, fontSize: 13.5, cursor: 'pointer', padding: 0, marginBottom: 16, fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>‹</span> Retour
        </button>
        <div style={{ background: T.card, borderRadius: 16, boxShadow: T.shadowMd, padding: 28, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 22 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${T.tint}, ${T.chip})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: T.brand, letterSpacing: '0.02em' }}>
              {st.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: T.ink, margin: 0, letterSpacing: '-0.02em' }}>{st.name}</h2>
              <div style={{ fontSize: 13.5, color: T.ink3, marginTop: 2 }}>{st.email}</div>
              <div style={{ marginTop: 6 }}><ClassBadge label={st.classLabel} /></div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <MiniStat label="Taux de présence" value={`${pct}%`} color={pct >= 80 ? T.success : T.warn} />
            <MiniStat label="Sessions suivies" value={`${st.attended}/${st.totalSessions}`} color={T.ink} />
            <MiniStat label="Manquées" value={String(st.totalSessions - st.attended)} color={st.totalSessions - st.attended > 0 ? T.danger : T.muted} />
          </div>
        </div>
        <div style={{ background: T.card, borderRadius: 14, boxShadow: T.shadowMd, padding: 22 }}>
          <h3 style={{ fontSize: 14.5, fontWeight: 600, color: T.ink, margin: '0 0 14px' }}>Historique récent</h3>
          {[
            { code: 'IOS-402', session: 'Développement iOS — SwiftUI', date: '2026-05-05', am: true, pm: false },
            { code: 'ARCH-301', session: 'Architecture logicielle', date: '2026-05-04', am: true, pm: true },
            { code: 'UX-310', session: 'UX Design avancé', date: '2026-05-03', am: true, pm: true },
          ].map((h, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '11px 0', borderBottom: i === 2 ? 'none' : `1px solid ${T.hairlineSoft}`, gap: 12 }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em', color: T.brand, background: T.tint, padding: '3px 7px', borderRadius: 5 }}>{h.code}</span>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: T.ink }}>{h.session}</div>
              <div style={{ fontSize: 12, color: T.muted, width: 80, fontVariantNumeric: 'tabular-nums' }}>{h.date}</div>
              <StatusBadge status={h.am ? 'signed' : 'missing'} />
              <StatusBadge status={h.pm ? 'signed' : 'missing'} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <AppHeader
        title="Apprenants"
        subtitle={`${students.length} inscrits`}
        actions={
          <>
            <select value={promoFilter} onChange={(e) => setPromoFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 10, border: `1px solid ${T.hairline}`, fontSize: 13, fontFamily: 'inherit', color: T.ink2, background: T.card, cursor: 'pointer', boxShadow: T.shadowSm }}>
              <option value="all">Toutes promotions</option>
              {promos.filter((p) => p !== 'all').map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." style={{ padding: '9px 14px', borderRadius: 10, border: `1px solid ${T.hairline}`, fontSize: 13.5, width: 240, fontFamily: 'inherit', outline: 'none', background: T.card, boxShadow: T.shadowSm }} />
          </>
        }
      />

      <div style={{ background: T.card, borderRadius: 14, boxShadow: T.shadowMd, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <EmptyState icon="◉" title="Aucun apprenant" hint="Aucun résultat pour cette recherche." />
        ) : (
        <table className="epi-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.hairline}` }}>
              {['Apprenant', 'Email', 'Classe', 'Taux de présence', ''].map((h, i) => (
                <th key={i} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: T.ink3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((st) => (
              <tr key={st.id} className="epi-row epi-clickable" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') setSelected(st.id); }} style={{ borderBottom: `1px solid ${T.hairlineSoft}` }} onClick={() => setSelected(st.id)}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: T.ink }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, ${T.tint}, ${T.chip})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: T.brand }}>
                      {st.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    {st.name}
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: T.ink3, fontSize: 13 }}>{st.email}</td>
                <td style={{ padding: '12px 16px' }}><ClassBadge label={st.classLabel} /></td>
                <td style={{ padding: '12px 16px' }}><ProgressBar value={st.attended} max={st.totalSessions} /></td>
                <td style={{ padding: '12px 16px', color: T.muted }}>›</td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ padding: 16, background: T.bg, borderRadius: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: T.ink3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color, marginTop: 6, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{value}</div>
    </div>
  );
}
