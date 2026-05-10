'use client';

import { useEffect, type ReactNode } from 'react';
import { T } from '../lib/tokens';

export function Modal({ width = 420, onClose, children }: { width?: number; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(10, 27, 46, 0.45)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'epi-toast-in 0.15s ease-out' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: T.card, borderRadius: 16, padding: 28, width, maxWidth: 'calc(100vw - 32px)', boxShadow: T.shadowLg }}>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ icon = '∅', title, hint }: { icon?: string; title: string; hint?: string }) {
  return (
    <div style={{ padding: '56px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 36, marginBottom: 10, color: '#CBD5E1' }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: T.ink2 }}>{title}</div>
      {hint && <div style={{ fontSize: 12.5, marginTop: 4, color: T.muted }}>{hint}</div>}
    </div>
  );
}
