'use client';

import { useEffect, useState } from 'react';
import { fetchStudentsWithStats, fetchStudentHistory, type DbStudentStats, type DbStudentHistory } from '../lib/supabase';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';
import { EmptyState } from './Modal';
import { T } from '../lib/tokens';
import { ClassBadge } from './CodeBadge';
import { AppHeader } from './AppHeader';

export function StudentsPage() {
  const [students, setStudents] = useState<DbStudentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [promoFilter, setPromoFilter] = useState('all');
  const [selected, setSelected] = useState<DbStudentStats | null>(null);

  useEffect(() => {
    fetchStudentsWithStats().then((data) => {
      setStudents(data);
      setLoading(false);
    });
  }, []);

  const promos = ['all', ...Array.from(new Set(students.map((s) => s.promo).filter(Boolean)))];

  const filtered = students.filter((s) => {
    if (promoFilter !== 'all' && s.promo !== promoFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = `${s.first_name} ${s.last_name}`.toLowerCase();
      if (!name.includes(q) && !s.email.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  if (selected) {
    return <StudentDetail student={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div>
      <AppHeader
        title="Apprenants"
        subtitle={loading ? 'Chargement…' : `${students.length} inscrits`}
        actions={
          <>
            <select value={promoFilter} onChange={(e) => setPromoFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 10, border: `1px solid ${T.hairline}`, fontSize: 13, fontFamily: 'inherit', color: T.ink2, background: T.card, cursor: 'pointer', boxShadow: T.shadowSm }}>
              <option value="all">Toutes promotions</option>
              {promos.filter((p) => p !== 'all').map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher…" style={{ padding: '9px 14px', borderRadius: 10, border: `1px solid ${T.hairline}`, fontSize: 13.5, width: 240, fontFamily: 'inherit', outline: 'none', background: T.card, boxShadow: T.shadowSm }} />
          </>
        }
      />

      <div style={{ background: T.card, borderRadius: 14, boxShadow: T.shadowMd, overflow: 'hidden' }}>
        {loading ? (
          <EmptyState icon="⟳" title="Chargement…" />
        ) : filtered.length === 0 ? (
          <EmptyState icon="◉" title="Aucun apprenant" hint={search || promoFilter !== 'all' ? 'Aucun résultat pour ces filtres.' : 'Aucun apprenant inscrit pour le moment.'} />
        ) : (
          <table className="epi-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.hairline}` }}>
                {['Apprenant', 'Email', 'Classe', 'Code carte', 'Présence', ''].map((h, i) => (
                  <th key={i} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: T.ink3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((st) => {
                const pct = st.total_sessions > 0 ? Math.round((st.attended / st.total_sessions) * 100) : 0;
                const initials = `${st.first_name[0] ?? ''}${st.last_name[0] ?? ''}`.toUpperCase();
                return (
                  <tr key={st.id} className="epi-row epi-clickable" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') setSelected(st); }} style={{ borderBottom: `1px solid ${T.hairlineSoft}` }} onClick={() => setSelected(st)}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: T.ink }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, ${T.tint}, ${T.chip})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: T.brand, flexShrink: 0 }}>
                          {initials}
                        </div>
                        {st.first_name} {st.last_name}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: T.ink3, fontSize: 13 }}>{st.email}</td>
                    <td style={{ padding: '12px 16px' }}><ClassBadge label={st.class_label ?? '—'} /></td>
                    <td style={{ padding: '12px 16px' }}>
                      {st.card_code
                        ? <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: T.ink, letterSpacing: '0.1em' }}>{st.card_code}</span>
                        : <span style={{ fontSize: 12, color: T.warn, fontWeight: 600 }}>Non assigné</span>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <ProgressBar value={st.attended} max={st.total_sessions} />
                        <span style={{ fontSize: 12, color: pct >= 80 ? T.success : pct >= 60 ? T.warn : T.danger, fontWeight: 700, minWidth: 36 }}>{pct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: T.muted }}>›</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StudentDetail({ student, onBack }: { student: DbStudentStats; onBack: () => void }) {
  const [history, setHistory] = useState<DbStudentHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetchStudentHistory(student.id).then((data) => {
      setHistory(data);
      setLoadingHistory(false);
    });
  }, [student.id]);

  const pct = student.total_sessions > 0 ? Math.round((student.attended / student.total_sessions) * 100) : 0;
  const initials = `${student.first_name[0] ?? ''}${student.last_name[0] ?? ''}`.toUpperCase();

  return (
    <div>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.brand, fontSize: 13.5, cursor: 'pointer', padding: 0, marginBottom: 16, fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 16, lineHeight: 1 }}>‹</span> Retour
      </button>

      <div style={{ background: T.card, borderRadius: 16, boxShadow: T.shadowMd, padding: 28, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 22 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${T.tint}, ${T.chip})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: T.brand, letterSpacing: '0.02em', flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: T.ink, margin: 0, letterSpacing: '-0.02em' }}>{student.first_name} {student.last_name}</h2>
            <div style={{ fontSize: 13.5, color: T.ink3, marginTop: 2 }}>{student.email}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <ClassBadge label={student.class_label ?? '—'} />
              {student.card_code
                ? <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: T.ink2, background: T.chip, padding: '2px 8px', borderRadius: 6, letterSpacing: '0.1em' }}>🪪 {student.card_code}</span>
                : <span style={{ fontSize: 12, color: T.warn, fontWeight: 600, background: T.warnBg, padding: '2px 8px', borderRadius: 6 }}>Code non assigné</span>}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <MiniStat label="Taux de présence" value={`${pct}%`} color={pct >= 80 ? T.success : pct >= 60 ? T.warn : T.danger} />
          <MiniStat label="Sessions suivies" value={`${student.attended}/${student.total_sessions}`} color={T.ink} />
          <MiniStat label="Manquées" value={String(Number(student.total_sessions) - Number(student.attended))} color={Number(student.total_sessions) - Number(student.attended) > 0 ? T.danger : T.muted} />
        </div>
      </div>

      <div style={{ background: T.card, borderRadius: 14, boxShadow: T.shadowMd, padding: 22 }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 600, color: T.ink, margin: '0 0 14px' }}>Historique d'émargement</h3>
        {loadingHistory ? (
          <div style={{ color: T.muted, fontSize: 13, padding: '12px 0' }}>Chargement…</div>
        ) : history.length === 0 ? (
          <div style={{ color: T.muted, fontSize: 13, padding: '12px 0' }}>Aucun émargement enregistré.</div>
        ) : (
          history.map((h, i) => {
            const isSigned = h.status === 'present' || h.status === 'late';
            const date = h.starts_at.split('T')[0];
            return (
              <div key={`${h.session_id}-${h.slot}`} style={{ display: 'flex', alignItems: 'center', padding: '11px 0', borderBottom: i === history.length - 1 ? 'none' : `1px solid ${T.hairlineSoft}`, gap: 12 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em', color: T.brand, background: T.tint, padding: '3px 7px', borderRadius: 5, flexShrink: 0 }}>{h.session_code}</span>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.course_name}</div>
                <div style={{ fontSize: 12, color: T.muted, width: 80, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{date}</div>
                <span style={{ fontSize: 11, fontWeight: 600, color: T.ink3, width: 28, textAlign: 'center', flexShrink: 0 }}>{h.slot.toUpperCase()}</span>
                <StatusBadge status={isSigned ? 'signed' : h.status === 'absent_justified' ? 'justified' : 'missing'} />
              </div>
            );
          })
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
