'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { T } from '../lib/tokens';
import { supabase, fetchClasses, fetchTeachers, type DbClass, type DbTeacher } from '../lib/supabase';
import { useToast } from './Toast';
import { useAppState } from '../lib/state';

type Slot = 'morning' | 'afternoon' | 'full';

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

export function CreateSessionModal({ onClose, preselectedTeacherId }: { onClose: () => void; preselectedTeacherId?: string }) {
  const toast = useToast();
  const { refreshSessions } = useAppState();

  const [classes, setClasses]   = useState<DbClass[]>([]);
  const [teachers, setTeachers] = useState<DbTeacher[]>([]);

  const today = new Date().toISOString().split('T')[0];

  const [code,       setCode]       = useState('');
  const [courseName, setCourseName] = useState('');
  const [room,       setRoom]       = useState('');
  const [date,       setDate]       = useState(today);
  const [startTime,  setStartTime]  = useState('09:00');
  const [endTime,    setEndTime]    = useState('12:30');
  const [slot,       setSlot]       = useState<Slot>('morning');
  const [topic,      setTopic]      = useState('');
  const [teacherId,  setTeacherId]  = useState(preselectedTeacherId ?? '');
  const [classIds,   setClassIds]   = useState<string[]>([]);
  const [saving,     setSaving]     = useState(false);

  useEffect(() => {
    Promise.all([fetchClasses(), fetchTeachers()]).then(([cls, tch]) => {
      setClasses(cls);
      setTeachers(tch);
      if (!teacherId && tch.length > 0) setTeacherId(preselectedTeacherId ?? tch[0].id);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleClass = (id: string) => {
    setClassIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const valid = code.trim() && courseName.trim() && room.trim() && teacherId && classIds.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSaving(true);

    const startsAt = `${date}T${startTime}:00`;
    const endsAt   = `${date}T${endTime}:00`;

    const { data: session, error: sessErr } = await supabase
      .from('sessions')
      .insert({ code: code.trim(), course_name: courseName.trim(), teacher_id: teacherId, room: room.trim(), starts_at: startsAt, ends_at: endsAt, slot, topic: topic.trim() || null })
      .select('id')
      .single();

    if (sessErr || !session) {
      toast.push(`Erreur : ${sessErr?.message ?? 'unknown'}`, 'danger');
      setSaving(false);
      return;
    }

    const scRows = classIds.map((class_id) => ({ session_id: session.id, class_id }));
    const { error: scErr } = await supabase.from('session_classes').insert(scRows);
    if (scErr) {
      toast.push(`Session créée mais erreur sur les classes : ${scErr.message}`, 'warn');
    } else {
      toast.push(`Session ${code.trim()} créée avec succès`, 'success');
    }

    await refreshSessions();
    onClose();
  };

  const slotOptions: [Slot, string][] = [
    ['morning',   'Matin (AM)'],
    ['afternoon', 'Après-midi (PM)'],
    ['full',      'Journée complète'],
  ];

  return (
    <Modal width={600} onClose={onClose}>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: T.ink, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Nouvelle session
      </h3>

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
          <input style={inputStyle} value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="Développement iOS — SwiftUI" required />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Thème / Sujet du jour (optionnel)</label>
          <input style={inputStyle} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Introduction aux closures et au pattern MVVM" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0 12px' }}>
          <div style={{ ...fieldStyle, gridColumn: '1 / 2' }}>
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
          <div style={fieldStyle}>
            <label style={labelStyle}>Créneau</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={slot} onChange={(e) => setSlot(e.target.value as Slot)}>
              {slotOptions.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Formateur</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={teacherId} onChange={(e) => setTeacherId(e.target.value)} required>
            <option value="">— Sélectionner —</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.first_name} {t.last_name} — {t.email}</option>
            ))}
          </select>
          {teachers.length === 0 && (
            <p style={{ fontSize: 12, color: T.warn, marginTop: 4 }}>
              Aucun formateur trouvé. Créez d'abord des comptes formateurs dans Supabase.
            </p>
          )}
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
            {classes.length === 0 && <span style={{ fontSize: 13, color: T.muted }}>Chargement…</span>}
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
            {saving ? 'Création…' : 'Créer la session'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
