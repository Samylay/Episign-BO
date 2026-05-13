'use client';

import { useEffect, useState } from 'react';
import { useAppState } from '../lib/state';
import { supabase, fetchSessionStudents, type DbSessionStudent } from '../lib/supabase';
import { type Session } from '../lib/mock-data';
import { T } from '../lib/tokens';
import { CodeBadge, ClassBadge, LiveBadge } from './CodeBadge';
import { useToast } from './Toast';
import { StatusBadge } from './StatusBadge';

export function TeacherLivePage({ session, onBack }: { session: Session; onBack: () => void }) {
  const { sessions, signatureFeed, setSessionStatus, pushSignature, bumpSignatureAM } = useAppState();
  const toast = useToast();

  const live = sessions.find((s) => s.id === session.id) ?? session;
  const isLive     = live.status === 'in_progress';
  const isUpcoming = live.status === 'upcoming';

  // Real attendance data (for DB sessions)
  const [dbStudents, setDbStudents] = useState<DbSessionStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const loadStudents = async () => {
    setLoadingStudents(true);
    const data = await fetchSessionStudents(live.id);
    setDbStudents(data);
    setLoadingStudents(false);
  };

  useEffect(() => {
    loadStudents();
  }, [live.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Real-time subscription for attendance inserts
  useEffect(() => {
    if (!isLive) return;

    const channel = supabase
      .channel(`attendance:${live.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'attendance', filter: `session_id=eq.${live.id}` },
        (payload) => {
          const row = payload.new as { student_id: string; slot: string };
          const student = dbStudents.find((s) => s.student_id === row.student_id);
          const name = student ? `${student.first_name} ${student.last_name}` : 'Apprenant';
          pushSignature(live.id, name);
          bumpSignatureAM(live.id);
          loadStudents();
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [live.id, isLive, dbStudents]); // eslint-disable-line react-hooks/exhaustive-deps

  const signedCount   = dbStudents.filter((s) => s.am_status === 'present' || s.am_status === 'late').length;
  const enrolledCount = dbStudents.length;
  const missingCount  = enrolledCount - signedCount;

  const myFeed = signatureFeed.filter((e) => e.sessionId === live.id).slice(0, 12);

  const start = () => {
    setSessionStatus(live.id, 'in_progress');
    toast.push('Session démarrée', 'success');
  };


  const cardCode = live.teacherCardCode ?? '——————';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <button onClick={onBack} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: T.brand, fontSize: 13.5, cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 16, lineHeight: 1 }}>‹</span> Retour à mes sessions
      </button>

      {/* Session header */}
      <div style={{ background: T.card, borderRadius: 16, padding: 24, boxShadow: T.shadowMd }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <CodeBadge code={live.code} />
          {isLive && <LiveBadge />}
          {isUpcoming && <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.warn, background: T.warnBg, padding: '3px 8px', borderRadius: 999 }}>À venir</span>}
          <ClassBadge label={live.classLabel} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: T.ink, margin: 0, letterSpacing: '-0.02em' }}>{live.course}</h1>
            <p style={{ fontSize: 13.5, color: T.ink3, margin: '6px 0 0' }}>{live.room} · {live.date} · {live.timeRange}</p>
          </div>
          {isUpcoming && (
            <button onClick={start} style={{ padding: '11px 22px', borderRadius: 12, border: 'none', background: T.brand, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(30, 79, 214, 0.3)' }}>
              Démarrer la session
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 16 }}>
        {/* Teacher card code (replaces TOTP) */}
        <div style={{ background: T.card, borderRadius: 16, padding: 28, boxShadow: T.shadowMd, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 280, position: 'relative', overflow: 'hidden' }}>
          {!isLive && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(244,246,250,0.7)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
              <span style={{ fontSize: 13, color: T.ink3, fontWeight: 600 }}>{isUpcoming ? 'Démarrez la session pour voir le code' : 'Session terminée'}</span>
            </div>
          )}
          <div style={{ fontSize: 11.5, fontWeight: 700, color: T.ink3, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Votre code formateur</div>
          <div style={{ fontSize: 64, fontWeight: 800, color: T.ink, letterSpacing: '0.16em', fontFamily: "'SF Mono','JetBrains Mono','Menlo',monospace", fontVariantNumeric: 'tabular-nums', padding: '12px 24px', background: T.bg, borderRadius: 14, border: `1px solid ${T.hairline}` }}>
            {cardCode.length === 6 ? `${cardCode.slice(0, 3)} ${cardCode.slice(3)}` : cardCode}
          </div>
          <p style={{ fontSize: 12.5, color: T.muted, marginTop: 20, textAlign: 'center', maxWidth: 340, lineHeight: 1.55 }}>
            Les apprenants saisissent ce code dans l'application Episign lors de la signature de présence. Ce code est permanent et lié à votre compte.
          </p>
        </div>

        {/* Counter + feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: T.card, borderRadius: 16, padding: 24, boxShadow: T.shadowMd }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: T.ink3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Signatures reçues</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 48, fontWeight: 800, color: T.ink, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em', lineHeight: 1 }}>{signedCount}</span>
              <span style={{ fontSize: 22, fontWeight: 600, color: T.muted, fontVariantNumeric: 'tabular-nums' }}>/ {enrolledCount}</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: T.chip, marginTop: 14, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${enrolledCount > 0 ? (signedCount / enrolledCount) * 100 : 0}%`, background: T.success, transition: 'width 0.5s ease-out' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, color: T.ink3 }}>
              <span><strong style={{ color: T.success }}>{signedCount}</strong> signés</span>
              <span><strong style={{ color: T.danger }}>{missingCount}</strong> en attente</span>
            </div>
          </div>

          <div style={{ background: T.card, borderRadius: 16, padding: 20, boxShadow: T.shadowMd, flex: 1, minHeight: 120 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <h3 style={{ fontSize: 13.5, fontWeight: 600, color: T.ink, margin: 0 }}>Arrivées récentes</h3>
            </div>
            {myFeed.length === 0 ? (
              <div style={{ fontSize: 12.5, color: T.muted, textAlign: 'center', padding: '20px 0' }}>
                {isLive ? 'En attente des premières signatures…' : 'Aucune signature.'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {myFeed.map((e) => (
                  <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: T.successBg, animation: 'epi-toast-in 0.25s ease-out' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.success, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.ink, flex: 1 }}>{e.studentName}</span>
                    <span style={{ fontSize: 11, color: T.muted, fontVariantNumeric: 'tabular-nums' }}>{new Date(e.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Roster */}
      <div style={{ background: T.card, borderRadius: 14, boxShadow: T.shadowMd, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.hairline}` }}>
          <h3 style={{ fontSize: 14.5, fontWeight: 600, color: T.ink, margin: 0 }}>Liste d'émargement</h3>
          <p style={{ fontSize: 11.5, color: T.muted, margin: '2px 0 0' }}>
            {loadingStudents ? 'Chargement…' : `${enrolledCount} apprenants inscrits`}
          </p>
        </div>
        <table className="epi-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.hairline}` }}>
              {['Apprenant', 'Email', 'Classe', 'Statut'].map((h, i) => (
                <th key={i} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: T.ink3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dbStudents.map((st) => {
              const signed = st.am_status === 'present' || st.am_status === 'late';
              return (
                <tr key={st.student_id} style={{ borderBottom: `1px solid ${T.hairlineSoft}` }}>
                  <td style={{ padding: '11px 16px', fontWeight: 600, color: T.ink }}>{st.first_name} {st.last_name}</td>
                  <td style={{ padding: '11px 16px', color: T.ink3, fontSize: 13 }}>{st.email}</td>
                  <td style={{ padding: '11px 16px', color: T.ink3, fontSize: 13 }}>{st.class_label}</td>
                  <td style={{ padding: '11px 16px' }}><StatusBadge status={signed ? 'signed' : 'missing'} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
