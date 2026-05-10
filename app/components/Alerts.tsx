'use client';

import { useState } from 'react';
import { type AlertStatus } from '../lib/mock-data';
import { useAppState } from '../lib/state';
import { Modal, EmptyState } from './Modal';
import { T } from '../lib/tokens';
import { ClassBadge } from './CodeBadge';
import { AppHeader } from './AppHeader';
import { useToast } from './Toast';

const statusConfig: Record<AlertStatus, { label: string; bg: string; color: string }> = {
  new: { label: 'Nouvelle', bg: T.dangerBg, color: T.danger },
  resolved: { label: 'Résolue', bg: T.successBg, color: T.success },
  ignored: { label: 'Ignorée', bg: T.chip, color: T.muted },
};

export function AlertsPage() {
  const { alerts, setAlertStatus } = useAppState();
  const toast = useToast();
  const [filter, setFilter] = useState<'all' | AlertStatus>('all');
  const [commentModal, setCommentModal] = useState<{ id: number; action: AlertStatus } | null>(null);

  const filtered = filter === 'all' ? alerts : alerts.filter((a) => a.status === filter);
  const newCount = alerts.filter((a) => a.status === 'new').length;

  const filterOptions: [typeof filter, string][] = [
    ['all', 'Toutes'],
    ['new', 'Nouvelles'],
    ['resolved', 'Résolues'],
    ['ignored', 'Ignorées'],
  ];

  return (
    <div>
      <AppHeader
        title="Alertes"
        subtitle={`${newCount} en attente · Tentatives de signature hors horaire`}
        actions={
          <div style={{ display: 'inline-flex', background: T.card, border: `1px solid ${T.hairline}`, borderRadius: 10, padding: 3, boxShadow: T.shadowSm }}>
            {filterOptions.map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} style={{ padding: '6px 12px', borderRadius: 7, border: 'none', background: filter === k ? T.tint : 'transparent', color: filter === k ? T.brand : T.ink3, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{l}</button>
            ))}
          </div>
        }
      />

      {filtered.length === 0 ? (
        <div style={{ background: T.card, borderRadius: 14, boxShadow: T.shadowMd }}>
          <EmptyState icon="✓" title="Aucune alerte" hint={newCount === 0 ? 'Tout est en ordre.' : 'Aucune alerte ne correspond au filtre.'} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((a) => {
            const sc = statusConfig[a.status];
            return (
              <div key={a.id} style={{ background: T.card, borderRadius: 12, boxShadow: T.shadowMd, padding: '18px 22px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: T.warn, color: '#fff', padding: '3px 8px', borderRadius: 4, flexShrink: 0, marginTop: 2, letterSpacing: '0.04em' }}>Horaire</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: T.ink }}>{a.student}</span>
                    <ClassBadge label={a.classLabel} />
                    <span style={{ fontSize: 11.5, padding: '2px 8px', borderRadius: 999, background: sc.bg, color: sc.color, fontWeight: 600 }}>{sc.label}</span>
                  </div>
                  <div style={{ fontSize: 13, color: T.ink2, marginBottom: 2 }}>{a.detail}</div>
                  <div style={{ fontSize: 11.5, color: T.muted, fontVariantNumeric: 'tabular-nums' }}>{a.session} · {a.date} à {a.time}</div>
                  {a.comment && <div style={{ fontSize: 12, color: T.ink3, marginTop: 8, padding: '6px 10px', background: T.bg, borderRadius: 6, borderLeft: `2px solid ${T.muted}`, fontStyle: 'italic' }}>« {a.comment} »</div>}
                </div>
                {a.status === 'new' && (
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => setCommentModal({ id: a.id, action: 'resolved' })} style={{ padding: '6px 12px', borderRadius: 7, border: `1px solid ${T.successBorder}`, background: T.successBg, fontSize: 12, fontWeight: 600, color: T.success, cursor: 'pointer', fontFamily: 'inherit' }}>Résoudre</button>
                    <button onClick={() => setCommentModal({ id: a.id, action: 'ignored' })} style={{ padding: '6px 12px', borderRadius: 7, border: `1px solid ${T.hairline}`, background: T.card, fontSize: 12, fontWeight: 600, color: T.ink3, cursor: 'pointer', fontFamily: 'inherit' }}>Ignorer</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {commentModal && (
        <AlertCommentModal
          action={commentModal.action}
          onConfirm={(comment) => {
            setAlertStatus(commentModal.id, commentModal.action, comment);
            toast.push(commentModal.action === 'resolved' ? 'Alerte résolue' : 'Alerte ignorée', commentModal.action === 'resolved' ? 'success' : 'info');
            setCommentModal(null);
          }}
          onClose={() => setCommentModal(null)}
        />
      )}
    </div>
  );
}

function AlertCommentModal({ action, onConfirm, onClose }: { action: AlertStatus; onConfirm: (c: string) => void; onClose: () => void }) {
  const [comment, setComment] = useState('');
  const actionLabel = action === 'resolved' ? 'Résoudre' : 'Ignorer';
  return (
    <Modal width={420} onClose={onClose}>
      <h3 style={{ fontSize: 18, fontWeight: 600, color: T.ink, margin: '0 0 16px', letterSpacing: '-0.01em' }}>{actionLabel} l'alerte</h3>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} autoFocus placeholder="Commentaire (optionnel)..." style={{ width: '100%', minHeight: 80, borderRadius: 10, border: `1px solid ${T.hairline}`, padding: 12, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', marginBottom: 16, background: T.bg }} />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{ padding: '9px 16px', borderRadius: 10, border: `1px solid ${T.hairline}`, background: T.card, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', color: T.ink3, fontWeight: 600 }}>Annuler</button>
        <button onClick={() => onConfirm(comment)} style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: action === 'resolved' ? T.success : T.brand, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#fff' }}>{actionLabel}</button>
      </div>
    </Modal>
  );
}
