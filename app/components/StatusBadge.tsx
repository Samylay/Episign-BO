'use client';

import { T } from '../lib/tokens';

type Status = 'signed' | 'missing' | 'invalidated' | 'justified';

const config: Record<Status, { label: string; bg: string; color: string; border: string }> = {
  signed: { label: 'Signé', bg: T.successBg, color: T.success, border: T.successBorder },
  missing: { label: 'Absent', bg: T.dangerBg, color: T.danger, border: T.dangerBorder },
  invalidated: { label: 'Invalidé', bg: T.warnBg, color: T.warn, border: T.warnBorder },
  justified: { label: 'Justifié', bg: T.tint, color: T.brand, border: '#C9DBF7' },
};

export function StatusBadge({ status }: { status: Status }) {
  const c = config[status];
  return (
    <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: c.bg, color: c.color, border: '1px solid ' + c.border, display: 'inline-block' }}>
      {c.label}
    </span>
  );
}
