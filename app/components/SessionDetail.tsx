'use client';

import { useState, useEffect } from 'react';
import { type Session, type StudentRow } from '../lib/mock-data';
import { supabase, fetchSessionStudents, type DbSessionStudent } from '../lib/supabase';
import { useAppState, cellKeyOf, type AuditEntry } from '../lib/state';
import { StatusBadge } from './StatusBadge';
import { Modal } from './Modal';
import { T } from '../lib/tokens';
import { CodeBadge, ClassBadge, LiveBadge } from './CodeBadge';
import { useToast } from './Toast';
import { EditSessionModal } from './EditSessionModal';

type Slot = 'am' | 'pm';

type RealStudent = DbSessionStudent & { rowIndex: number };

function dbToStudentRow(st: DbSessionStudent, i: number): StudentRow {
  return {
    id: i,
    name: `${st.first_name} ${st.last_name}`,
    email: st.email,
    signedAM: st.am_status === 'present' || st.am_status === 'late',
    signedPM: st.pm_status === 'present' || st.pm_status === 'late',
    classLabel: st.class_label,
  };
}

export function SessionDetailPage({ session, onBack }: { session: Session; onBack: () => void }) {
  const { invalidations, invalidate, justifications, justify, audit } = useAppState();
  const toast = useToast();

  const [dbStudents,    setDbStudents]    = useState<RealStudent[]>([]);
  const [loadingDb,     setLoadingDb]     = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [invalidateTarget, setInvalidateTarget] = useState<{ st: StudentRow; slot: Slot; dbId?: string } | null>(null);
  const [justifyTarget, setJustifyTarget] = useState<{ st: StudentRow; slot: Slot; dbId?: string } | null>(null);
  const [viewSignature, setViewSignature] = useState<{ st: StudentRow; slot: Slot } | null>(null);
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    setLoadingDb(true);
    fetchSessionStudents(session.id).then((rows) => {
      setDbStudents(rows.map((r, i) => ({ ...r, rowIndex: i })));
      setLoadingDb(false);
    });
  }, [session.id]);

  const students: StudentRow[] = dbStudents.map((s) => dbToStudentRow(s, s.rowIndex));

  const sessionAudit = audit.filter((a) => a.sessionId === session.id);

  const dbStatusOf = (st: StudentRow, slot: Slot): string | null => {
    const db = dbStudents[st.id];
    return slot === 'am' ? (db?.am_status ?? null) : (db?.pm_status ?? null);
  };

  const cellStatus = (st: StudentRow, slot: Slot): 'signed' | 'missing' | 'invalidated' | 'justified' => {
    const dbStatus = dbStatusOf(st, slot);
    if (dbStatus === 'absent_unjustified') return 'invalidated';
    if (dbStatus === 'absent_justified')   return 'justified';
    const k = cellKeyOf(session.id, st.id, slot);
    if (invalidations[k]) return 'invalidated';
    if (justifications[k]) return 'justified';
    return (slot === 'am' ? st.signedAM : st.signedPM) ? 'signed' : 'missing';
  };

  const filteredStudents = studentSearch
    ? students.filter((s) => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.email.toLowerCase().includes(studentSearch.toLowerCase()))
    : students;

  const signedAM = dbStudents.filter((s) => s.am_status === 'present' || s.am_status === 'late').length;
  const signedPM = dbStudents.filter((s) => s.pm_status === 'present' || s.pm_status === 'late').length;
  const enrolled = dbStudents.length;

  const amPct = enrolled > 0 ? Math.round((signedAM / enrolled) * 100) : 0;
  const pmPct = enrolled > 0 ? Math.round((signedPM / enrolled) * 100) : 0;

  return (
    <div>
      {showEdit && <EditSessionModal sessionId={session.id} onClose={() => setShowEdit(false)} />}

      <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.brand, fontSize: 13.5, cursor: 'pointer', padding: 0, marginBottom: 16, fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 16, lineHeight: 1 }}>‹</span> Retour aux sessions
      </button>

      <div style={{ background: T.card, borderRadius: 16, padding: 24, boxShadow: T.shadowMd, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <CodeBadge code={session.code} />
          {session.status === 'in_progress' && <LiveBadge />}
          <ClassBadge label={session.classLabel} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: T.ink, margin: 0, letterSpacing: '-0.02em' }}>{session.course}</h1>
            <p style={{ fontSize: 13.5, color: T.ink3, margin: '6px 0 0' }}>
              <strong style={{ color: T.ink2, fontWeight: 600 }}>{session.teacher}</strong> · {session.room} · {session.date} · {session.timeRange}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setShowEdit(true)}
              style={{ padding: '9px 16px', borderRadius: 10, border: `1px solid ${T.hairline}`, background: T.card, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: T.ink, display: 'flex', alignItems: 'center', gap: 6, boxShadow: T.shadowSm }}
            >
              ✎ Modifier
            </button>
            <button
              onClick={() => toast.push("Génération de la feuille d'émargement...", 'info')}
              style={{ padding: '9px 16px', borderRadius: 10, border: `1px solid ${T.hairline}`, background: T.card, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: T.ink, display: 'flex', alignItems: 'center', gap: 6, boxShadow: T.shadowSm }}
            >
              ⤓ Exporter PDF
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 16 }}>
        <StatCard label="Inscrits" value={loadingDb ? '…' : String(enrolled)} />
        <StatCard label="Signatures matin" value={loadingDb ? '…' : `${signedAM}/${enrolled}`} pct={amPct} />
        <StatCard label="Signatures après-midi" value={loadingDb ? '…' : `${signedPM}/${enrolled}`} pct={pmPct} />
      </div>

      <div style={{ background: T.card, borderRadius: 14, boxShadow: T.shadowMd, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 14.5, fontWeight: 600, color: T.ink, margin: 0 }}>Émargement</h3>
            <p style={{ fontSize: 11.5, color: T.muted, margin: '2px 0 0' }}>{filteredStudents.length} apprenants · cliquer sur un statut signé pour voir la signature</p>
          </div>
          <input
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            placeholder="Filtrer..."
            style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${T.hairline}`, fontSize: 13, width: 180, fontFamily: 'inherit', background: T.bg }}
          />
        </div>
        <table className="epi-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.hairline}` }}>
              {['Apprenant', 'Email', 'Matin', 'Après-midi', 'Actions'].map((h, i) => (
                <th key={i} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: T.ink3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((st) => {
              const amStatus = cellStatus(st, 'am');
              const pmStatus = cellStatus(st, 'pm');
              return (
                <tr key={st.id} className="epi-row" style={{ borderBottom: `1px solid ${T.hairlineSoft}` }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: T.ink }}>{st.name}</td>
                  <td style={{ padding: '12px 16px', color: T.ink3, fontSize: 13 }}>{st.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <SignatureCell status={amStatus} onView={() => setViewSignature({ st, slot: 'am' })} />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <SignatureCell status={pmStatus} onView={() => setViewSignature({ st, slot: 'pm' })} />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <RowActions
                      amStatus={amStatus}
                      pmStatus={pmStatus}
                      slot={session.slot}
                      onInvalidate={(slot) => setInvalidateTarget({ st, slot, dbId: dbStudents[st.id]?.student_id })}
                      onJustify={(slot) => setJustifyTarget({ st, slot, dbId: dbStudents[st.id]?.student_id })}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AuditLog entries={sessionAudit} />

      {invalidateTarget && (
        <ReasonModal
          title="Invalider la signature"
          description={<>Signature {invalidateTarget.slot === 'am' ? 'du matin' : "de l'après-midi"} de <strong>{invalidateTarget.st.name}</strong>. Cette action sera tracée dans le journal d'audit.</>}
          confirmLabel="Confirmer l'invalidation"
          confirmColor={T.danger}
          onConfirm={async (reason) => {
            if (invalidateTarget.dbId) {
              const { error } = await supabase.rpc('moderate_attendance', {
                p_session_id: session.id,
                p_student_id: invalidateTarget.dbId,
                p_slot: invalidateTarget.slot,
                p_action: 'invalidated',
                p_reason: reason,
              });
              if (error) { toast.push(`Erreur: ${error.message}`, 'danger'); return; }
              const rows = await fetchSessionStudents(session.id);
              setDbStudents(rows.map((r, i) => ({ ...r, rowIndex: i })));
            } else {
              invalidate({ studentId: invalidateTarget.st.id, studentName: invalidateTarget.st.name, sessionId: session.id, sessionLabel: session.course, slot: invalidateTarget.slot, reason });
            }
            toast.push(`Signature invalidée — ${invalidateTarget.st.name}`, 'warn');
            setInvalidateTarget(null);
          }}
          onClose={() => setInvalidateTarget(null)}
        />
      )}

      {justifyTarget && (
        <ReasonModal
          title="Justifier l'absence"
          description={<>Absence {justifyTarget.slot === 'am' ? 'du matin' : "de l'après-midi"} de <strong>{justifyTarget.st.name}</strong>. La justification sera tracée dans le journal d'audit.</>}
          confirmLabel="Enregistrer la justification"
          confirmColor={T.brand}
          onConfirm={async (reason) => {
            if (justifyTarget.dbId) {
              const { error } = await supabase.rpc('moderate_attendance', {
                p_session_id: session.id,
                p_student_id: justifyTarget.dbId,
                p_slot: justifyTarget.slot,
                p_action: 'justified',
                p_reason: reason,
              });
              if (error) { toast.push(`Erreur: ${error.message}`, 'danger'); return; }
              const rows = await fetchSessionStudents(session.id);
              setDbStudents(rows.map((r, i) => ({ ...r, rowIndex: i })));
            } else {
              justify({ studentId: justifyTarget.st.id, studentName: justifyTarget.st.name, sessionId: session.id, sessionLabel: session.course, slot: justifyTarget.slot, reason });
            }
            toast.push(`Absence justifiée — ${justifyTarget.st.name}`, 'success');
            setJustifyTarget(null);
          }}
          onClose={() => setJustifyTarget(null)}
        />
      )}

      {viewSignature && cellStatus(viewSignature.st, viewSignature.slot) === 'signed' && (
        <SignatureViewer
          studentName={viewSignature.st.name}
          slot={viewSignature.slot}
          session={session}
          onClose={() => setViewSignature(null)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, pct }: { label: string; value: string; pct?: number }) {
  return (
    <div style={{ background: T.card, borderRadius: 12, padding: '16px 20px', boxShadow: T.shadowMd }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: T.ink3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: T.ink, marginTop: 6, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{value}</div>
      {pct !== undefined && <div style={{ fontSize: 12, color: pct >= 90 ? T.success : T.warn, marginTop: 2, fontWeight: 600 }}>{pct}%</div>}
    </div>
  );
}

function SignatureCell({ status, onView }: { status: 'signed' | 'missing' | 'invalidated' | 'justified'; onView: () => void }) {
  if (status === 'signed') {
    return (
      <button onClick={onView} title="Voir la signature manuscrite" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}>
        <StatusBadge status="signed" />
      </button>
    );
  }
  return <StatusBadge status={status} />;
}

function RowActions({ amStatus, pmStatus, slot, onInvalidate, onJustify }: { amStatus: string; pmStatus: string; slot: Session['slot']; onInvalidate: (s: Slot) => void; onJustify: (s: Slot) => void }) {
  const hasAM = slot !== 'afternoon';
  const hasPM = slot !== 'morning';

  const btn = (label: string, color: string, border: string, onClick: () => void) => (
    <button onClick={onClick} style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${border}`, background: T.card, fontSize: 11.5, color, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>{label}</button>
  );

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {hasAM && amStatus === 'signed' && btn('Invalider AM', T.danger, T.dangerBorder, () => onInvalidate('am'))}
      {hasPM && pmStatus === 'signed' && btn('Invalider PM', T.danger, T.dangerBorder, () => onInvalidate('pm'))}
      {hasAM && amStatus === 'missing' && btn('Justifier AM', T.brand, '#C9DBF7', () => onJustify('am'))}
      {hasPM && pmStatus === 'missing' && btn('Justifier PM', T.brand, '#C9DBF7', () => onJustify('pm'))}
    </div>
  );
}

function ReasonModal({ title, description, confirmLabel, confirmColor, onConfirm, onClose }: { title: string; description: React.ReactNode; confirmLabel: string; confirmColor: string; onConfirm: (r: string) => void; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const valid = reason.trim().length > 0;
  return (
    <Modal width={460} onClose={onClose}>
      <h3 style={{ fontSize: 18, fontWeight: 600, color: T.ink, margin: '0 0 8px', letterSpacing: '-0.01em' }}>{title}</h3>
      <p style={{ fontSize: 13.5, color: T.ink3, margin: '0 0 20px', lineHeight: 1.5 }}>{description}</p>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: T.ink2, display: 'block', marginBottom: 6 }}>Motif (obligatoire)</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} autoFocus placeholder="Saisir le motif..." style={{ width: '100%', minHeight: 90, borderRadius: 10, border: `1px solid ${T.hairline}`, padding: 12, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', background: T.bg }} />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{ padding: '9px 16px', borderRadius: 10, border: `1px solid ${T.hairline}`, background: T.card, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', color: T.ink3, fontWeight: 600 }}>Annuler</button>
        <button onClick={() => valid && onConfirm(reason)} disabled={!valid} style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: valid ? confirmColor : '#CBD5E1', fontSize: 13, fontWeight: 600, cursor: valid ? 'pointer' : 'default', fontFamily: 'inherit', color: '#fff' }}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}

function SignatureViewer({ studentName, slot, session, onClose }: { studentName: string; slot: Slot; session: Session; onClose: () => void }) {
  const timestamp = `${session.date} · ${slot === 'am' ? '08:42' : '13:51'}:23 (heure serveur)`;
  return (
    <Modal width={500} onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <CodeBadge code={session.code} />
        <span style={{ fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{slot === 'am' ? 'Matin' : 'Après-midi'}</span>
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 600, color: T.ink, margin: '0 0 4px' }}>Signature manuscrite</h3>
      <p style={{ fontSize: 13, color: T.ink3, margin: '0 0 16px' }}>{studentName}</p>
      <div style={{ background: `linear-gradient(180deg, ${T.bg}, #fff)`, border: `1px dashed #CBD5E1`, borderRadius: 14, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, position: 'relative' }}>
        <svg width="240" height="100" viewBox="0 0 240 100" style={{ color: T.ink }} aria-hidden>
          <path d="M10 60 Q 30 20 55 55 T 100 55 Q 125 25 150 60 T 195 50 Q 215 35 230 55" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ position: 'absolute', top: 10, right: 12, fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Aperçu</span>
      </div>
      <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 16, rowGap: 8, fontSize: 13, margin: 0 }}>
        <dt style={{ color: T.ink3, fontWeight: 500 }}>Horodatage</dt>
        <dd style={{ color: T.ink, margin: 0, fontVariantNumeric: 'tabular-nums' }}>{timestamp}</dd>
        <dt style={{ color: T.ink3, fontWeight: 500 }}>Session</dt>
        <dd style={{ color: T.ink, margin: 0 }}>{session.course}</dd>
        <dt style={{ color: T.ink3, fontWeight: 500 }}>Salle · Horaire</dt>
        <dd style={{ color: T.ink, margin: 0 }}>{session.room} · {session.timeRange}</dd>
      </dl>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
        <button onClick={onClose} style={{ padding: '9px 16px', borderRadius: 10, border: `1px solid ${T.hairline}`, background: T.card, fontSize: 13, cursor: 'pointer', color: T.ink3, fontWeight: 600 }}>Fermer</button>
      </div>
    </Modal>
  );
}

function AuditLog({ entries }: { entries: AuditEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <div style={{ background: T.card, borderRadius: 14, padding: 22, boxShadow: T.shadowMd }}>
      <h3 style={{ fontSize: 14.5, fontWeight: 600, color: T.ink, margin: '0 0 4px' }}>Journal d'audit</h3>
      <p style={{ fontSize: 11.5, color: T.muted, margin: '0 0 14px' }}>Historique des actions de cette session</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {entries.map((e, i) => {
          const isInvalidate = e.kind === 'invalidate';
          return (
            <div key={e.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: i === entries.length - 1 ? 'none' : `1px solid ${T.hairlineSoft}` }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4, flexShrink: 0, marginTop: 2, letterSpacing: '0.04em', background: isInvalidate ? T.warnBg : T.tint, color: isInvalidate ? T.warn : T.brand }}>
                {isInvalidate ? 'Invalidation' : 'Justification'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: T.ink }}>
                  <strong>{e.studentName}</strong> <span style={{ color: T.ink3, fontWeight: 500 }}>· {e.slot === 'am' ? 'Matin' : 'Après-midi'}</span>
                </div>
                <div style={{ fontSize: 12, color: T.ink3, marginTop: 2, fontStyle: 'italic' }}>« {e.reason} »</div>
              </div>
              <div style={{ fontSize: 11, color: T.muted, flexShrink: 0, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                <div>{new Date(e.at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Paris' })}</div>
                <div style={{ marginTop: 2 }}>par {e.by}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
