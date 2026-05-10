'use client';

import { useState } from 'react';
import { T } from '../lib/tokens';
import { useAppState } from '../lib/state';
import { Modal } from './Modal';

export function AppHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  const { alerts } = useAppState();
  const [open, setOpen] = useState(false);
  const newAlerts = alerts.filter((a) => a.status === 'new');

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: T.ink, margin: 0, letterSpacing: '-0.02em' }}>{title}</h1>
          {subtitle && <p style={{ fontSize: 13, color: T.ink3, margin: '4px 0 0' }}>{subtitle}</p>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {actions}
          <button
            onClick={() => setOpen(true)}
            aria-label={`Notifications (${newAlerts.length})`}
            style={{ position: 'relative', width: 38, height: 38, borderRadius: 10, border: `1px solid ${T.hairline}`, background: T.card, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: T.ink2, boxShadow: T.shadowSm }}
          >
            <BellIcon />
            {newAlerts.length > 0 && (
              <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: T.danger, border: `2px solid ${T.card}` }} />
            )}
          </button>
        </div>
      </div>

      {open && (
        <Modal width={420} onClose={() => setOpen(false)}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: T.ink, margin: '0 0 12px' }}>Notifications</h3>
          {newAlerts.length === 0 ? (
            <p style={{ fontSize: 13, color: T.ink3, margin: 0 }}>Aucune nouvelle notification.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {newAlerts.map((a) => (
                <div key={a.id} style={{ padding: '12px 14px', borderRadius: 8, background: T.dangerBg, border: `1px solid ${T.dangerBorder}` }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.ink }}>{a.student}</div>
                  <div style={{ fontSize: 12, color: T.ink3, marginTop: 2 }}>{a.detail}</div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{a.session} · {a.date} {a.time}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button onClick={() => setOpen(false)} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${T.hairline}`, background: T.card, fontSize: 13, cursor: 'pointer', color: T.ink3 }}>Fermer</button>
          </div>
        </Modal>
      )}
    </>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
