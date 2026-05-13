'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { T } from '../lib/tokens';
import { supabase, fetchClasses, type DbClass } from '../lib/supabase';
import { parisDate, parisTime, parisInputToISO } from '../lib/paris-time';
import { useToast } from './Toast';
import { useAppState } from '../lib/state';

type Slot = 'morning' | 'afternoon' | 'full';

function deriveSlot(startTime: string, endTime: string): Slot {
  const startH = parseInt(startTime.split(':')[0], 10);
  const endH   = parseInt(endTime.split(':')[0], 10);
  const endM   = parseInt(endTime.split(':')[1], 10);
  if (startH >= 13) return 'afternoon';
  if (endH < 13 || (endH === 13 && endM === 0)) return 'morning';
  return 'full';
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: `1.5px solid ${T.hairline}`, background: '#fff',
  fontSize: 14, fontFamily: 'inherit', color: T.ink, boxSizing: 'border-box',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: T.ink2,
  letterSpacing: '0.06em', textTransform: 'uppercase',
  display: 'block', marginBottom: 6,
};

const fieldStyle: React.CSSProperties = { marginBottom: 18 };


export function EditSessionModal({ sessionId, onClose }: { sessionId: string; onClose: () => void }) {
  const toast = useToast();
  const { refreshSessions, role, dbTeachers: teachers } = useAppState();

  const [classes, setClasses] = useState<DbClass[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [code,       setCode]       = useState('');
  const [courseName, setCourseName] = useState('');
  const [room,       setRoom]       = useState('');
  const [date,       setDate]       = useState('');
  const [startTime,  setStartTime]  = useState('');
  const [endTime,    setEndTime]    = useState('');
  const [topic,      setTopic]      = useState('');
  const [teacherId,  setTeacherId]  = useState('');
  const [classIds,   setClassIds]   = useState<string[]>([]);
  const [saving,     setSaving]     = useState(false);

  useEffect(() => {
    Promise.all([
      fetchClasses(),
      supabase.from('sessions').select('*').eq('id', sessionId).single(),
      supabase.from('session_classes').select('class_id').eq('session_id', sessionId),
    ]).then(([cls, { data: sess }, { data: sc }]) => {
      setClasses(cls);
      if (sess) {
        setCode(sess.code ?? '');
        setCourseName(sess.course_name ?? '');
        setRoom(sess.room ?? '');
        setTopic(sess.topic ?? '');
        setTeacherId(sess.teacher_id ?? '');
        const starts = new Date(sess.starts_at);
        const ends   = new Date(sess.ends_at);
        setDate(parisDate(starts));
        setStartTime(parisTime(starts));
        setEndTime(parisTime(ends));
      }
      if (sc) setClassIds(sc.map((r: { class_id: string }) => r.class_id));
      setLoadingData(false);
    });
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleClass = (id: string) =>
    setClassIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const valid = code.trim() && courseName.trim() && room.trim() && teacherId && classIds.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSaving(true);

    const startsAt = parisInputToISO(date, startTime);
    const endsAt   = parisInputToISO(date, endTime);
    const slot     = deriveSlot(startTime, endTime);

    const { error: updErr } = await supabase
      .from('sessions')
      .update({ code: code.trim(), course_name: courseName.trim(), teacher_id: teacherId, room: room.trim(), starts_at: startsAt, ends_at: endsAt, slot, topic: topic.trim() || null })
      .eq('id', sessionId);

    if (updErr) {
      toast.push(`Erreur : ${updErr.message}`, 'danger');
      setSaving(false);
      return;
    }

    await supabase.from('session_classes').delete().eq('session_id', sessionId);
    const { error: scErr } = await supabase.from('session_classes').insert(classIds.map((class_id) => ({ session_id: sessionId, class_id })));
    if (scErr) toast.push(`Session mise à jour mais erreur sur les classes : ${scErr.message}`, 'warn');
    else toast.push(`Session ${code.trim()} mise à jour`, 'success');

    await refreshSessions();
    onClose();
  };

  return (
    <Modal width={600} onClose={onClose}>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: T.ink, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Modifier la session
      </h3>

      {loadingData ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: T.muted, fontSize: 14 }}>Chargement…</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Code de session</label>
              <input style={inputStyle} value={code} onChange={(e) => setCode(e.target.value)} placeholder="IOS-402" required />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Salle</label>
              <input style={inputStyle} value={room} onChange={(e) => setRoom(e.target.value)} placeholder="A201" required />
            </div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Nom de la formation</label>
            <input style={inputStyle} value={courseName} onChange={(e) => setCourseName(e.target.value)} required />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Thème / Sujet du jour (optionnel)</label>
            <input style={inputStyle} value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 12px' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Date</label>
              <input type="date" style={inputStyle} value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Début</label>
              <input type="time" style={inputStyle} value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Fin</label>
              <input type="time" style={inputStyle} value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            </div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Formateur</label>
            <select
              style={{ ...inputStyle, cursor: role === 'teacher' ? 'default' : 'pointer', opacity: role === 'teacher' ? 0.6 : 1 }}
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              disabled={role === 'teacher'}
              required
            >
              <option value="">— Sélectionner —</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.first_name} {t.last_name} — {t.email}</option>
              ))}
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Classes assignées</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {classes.map((c) => {
                const selected = classIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleClass(c.id)}
                    style={{
                      padding: '6px 12px', borderRadius: 8, fontSize: 13, fontFamily: 'inherit',
                      fontWeight: 600, cursor: 'pointer', border: '1.5px solid',
                      borderColor: selected ? T.brand : T.hairline,
                      background: selected ? '#EBF0FD' : '#fff',
                      color: selected ? T.brand : T.ink3,
                      transition: 'all 0.15s',
                    }}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
            {classIds.length === 0 && (
              <p style={{ fontSize: 12, color: T.warn, marginTop: 6 }}>Sélectionnez au moins une classe.</p>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 18px', borderRadius: 10, border: `1px solid ${T.hairline}`, background: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', color: T.ink3, fontWeight: 600 }}>
              Annuler
            </button>
            <button
              type="submit"
              disabled={!valid || saving}
              style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: valid && !saving ? T.brand : '#CBD5E1', fontSize: 14, fontWeight: 700, cursor: valid && !saving ? 'pointer' : 'default', fontFamily: 'inherit', color: '#fff' }}
            >
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
