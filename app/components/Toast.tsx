'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { T } from '../lib/tokens';

type ToastTone = 'success' | 'info' | 'warn' | 'danger';
type Toast = { id: string; message: string; tone: ToastTone };

const ToastCtx = createContext<{ push: (message: string, tone?: ToastTone) => void } | null>(null);

const toneStyles: Record<ToastTone, { bg: string; color: string; border: string; icon: string }> = {
  success: { bg: T.successBg, color: T.success, border: T.successBorder, icon: '✓' },
  info: { bg: T.tint, color: T.brand, border: '#C9DBF7', icon: 'ℹ' },
  warn: { bg: T.warnBg, color: T.warn, border: T.warnBorder, icon: '!' },
  danger: { bg: T.dangerBg, color: T.danger, border: T.dangerBorder, icon: '✕' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div style={{ position: 'fixed', bottom: 20, right: 20, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 2000, pointerEvents: 'none' }}>
        {toasts.map((t) => {
          const s = toneStyles[t.tone];
          return (
            <div
              key={t.id}
              role="status"
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: T.card, border: `1px solid ${s.border}`,
                borderLeft: `3px solid ${s.color}`,
                padding: '12px 16px', borderRadius: 10,
                boxShadow: T.shadowMd, minWidth: 280, maxWidth: 420,
                animation: 'epi-toast-in 0.18s ease-out',
                pointerEvents: 'auto',
              }}
            >
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div style={{ fontSize: 13, color: T.ink, fontWeight: 500 }}>{t.message}</div>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const v = useContext(ToastCtx);
  if (!v) throw new Error('useToast must be used inside ToastProvider');
  return v;
}
